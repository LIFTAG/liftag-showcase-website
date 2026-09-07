"""Export the stacked tractor tires from the dumbbells pack as a web GLB.

blender --background --factory-startup --disable-autoexec --python this-file
-- source.glb output.glb
Never modifies or saves the original pack.
"""
import bpy, json, sys
from pathlib import Path
from mathutils import Vector, Euler

source, output = map(Path, sys.argv[sys.argv.index("--") + 1 :])
output.parent.mkdir(parents=True, exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=str(source))
obj = bpy.data.objects.get("GYM+EQUIPMENT")
if obj is None or obj.type != "MESH":
    raise RuntimeError("Missing GYM+EQUIPMENT")
bpy.ops.object.select_all(action="DESELECT")
obj.select_set(True)
bpy.context.view_layer.objects.active = obj
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
bpy.ops.object.mode_set(mode="EDIT")
bpy.ops.mesh.select_all(action="SELECT")
bpy.ops.mesh.remove_doubles(threshold=0.00015)
bpy.ops.object.mode_set(mode="OBJECT")
points = [obj.matrix_world @ Vector(c) for c in obj.bound_box]
low = Vector(tuple(min(v[i] for v in points) for i in range(3)))
high = Vector(tuple(max(v[i] for v in points) for i in range(3)))
size = high - low
# Stack stands along the longest axis. Rotate that onto +Z so the web
# stage can keep treating the tire as an XY disc with Z out the back.
axis = max(range(3), key=lambda i: size[i])
if axis == 0:
    obj.rotation_euler = Euler((0, 1.5707963267948966, 0), "XYZ")
elif axis == 1:
    obj.rotation_euler = Euler((-1.5707963267948966, 0, 0), "XYZ")
bpy.ops.object.transform_apply(location=False, rotation=True, scale=False)
points = [obj.matrix_world @ Vector(c) for c in obj.bound_box]
low = Vector(tuple(min(v[i] for v in points) for i in range(3)))
high = Vector(tuple(max(v[i] for v in points) for i in range(3)))
obj.location -= Vector(
    ((low.x + high.x) / 2, (low.y + high.y) / 2, (low.z + high.z) / 2)
)
bpy.ops.object.transform_apply(location=True, rotation=False, scale=False)
before = sum(len(p.vertices) - 2 for p in obj.data.polygons)
budget = 10000
if before > budget:
    mod = obj.modifiers.new("Web silhouette", "DECIMATE")
    mod.ratio = budget / before
    mod.use_collapse_triangulate = True
    bpy.ops.object.modifier_apply(modifier=mod.name)
images = set()
for mat in obj.data.materials:
    if not mat or not mat.use_nodes:
        continue
    shader = mat.node_tree.nodes.get("Principled BSDF")
    if shader:
        shader.inputs["Roughness"].default_value = max(
            0.55, shader.inputs["Roughness"].default_value
        )
        shader.inputs["Metallic"].default_value = min(
            0.08, shader.inputs["Metallic"].default_value
        )
    for node in mat.node_tree.nodes:
        if node.type == "TEX_IMAGE" and node.image:
            images.add(node.image)
for image in images:
    if max(image.size) > 256:
        ratio = 256 / max(image.size)
        image.scale(
            max(1, round(image.size[0] * ratio)),
            max(1, round(image.size[1] * ratio)),
        )
        image.pack()
obj.name = "discovery-tire"
for other in list(bpy.data.objects):
    if other != obj:
        bpy.data.objects.remove(other, do_unlink=True)
bpy.ops.object.select_all(action="DESELECT")
obj.select_set(True)
bpy.context.view_layer.objects.active = obj
bpy.ops.export_scene.gltf(
    filepath=str(output),
    export_format="GLB",
    use_selection=True,
    export_apply=True,
    export_image_format="JPEG",
    export_jpeg_quality=72,
    export_draco_mesh_compression_enable=True,
    export_draco_mesh_compression_level=7,
    export_draco_position_quantization=14,
    export_draco_normal_quantization=10,
    export_draco_texcoord_quantization=10,
    export_animations=False,
    export_cameras=False,
    export_lights=False,
)
size = Vector(obj.dimensions)
print(
    json.dumps(
        {
            "asset": output.name,
            "source": source.name,
            "object": "GYM+EQUIPMENT",
            "source_triangles": before,
            "triangles": sum(len(p.vertices) - 2 for p in obj.data.polygons),
            "bytes": output.stat().st_size,
            "dimensions": [round(size.x, 4), round(size.y, 4), round(size.z, 4)],
            "diameter": round(max(size.x, size.y), 4),
        }
    )
)
