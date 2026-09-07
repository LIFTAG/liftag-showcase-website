"""Extract named equipment from the supplied GLB collections for the web.

Blender --background --factory-startup --disable-autoexec --python this-file
-- source-directory output-directory. Originals are never saved or overwritten.
"""
import bpy
import json
import sys
from pathlib import Path
from mathutils import Vector

source, destination = map(Path, sys.argv[sys.argv.index('--') + 1:])
destination.mkdir(parents=True, exist_ok=True)
selection = {
    'all+fitness.glb': [('4.002', 'cable-station', 24000), ('1.005', 'flat-bench', 20000)],
    'all+cardio.glb': [('SP3D+treadmill+esteira+academia+gyn+fitness+equipamento+equipme', 'treadmill', 24000)],
}
report = []
for filename, items in selection.items():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=str(source/filename))
    for name, slug, budget in items:
        obj = bpy.data.objects.get(name)
        if obj is None or obj.type != 'MESH': raise RuntimeError(f'Missing equipment: {filename}/{name}')
        bpy.ops.object.select_all(action='DESELECT')
        obj.select_set(True)
        bpy.context.view_layer.objects.active = obj
        before = sum(len(p.vertices)-2 for p in obj.data.polygons)
        if before > budget:
            mod = obj.modifiers.new('Web silhouette budget', 'DECIMATE')
            mod.ratio = budget/before
            mod.use_collapse_triangulate = True
            bpy.ops.object.modifier_apply(modifier=mod.name)
        points = [obj.matrix_world @ Vector(corner) for corner in obj.bound_box]
        low = Vector(tuple(min(v[i] for v in points) for i in range(3)))
        high = Vector(tuple(max(v[i] for v in points) for i in range(3)))
        obj.location -= Vector(((low.x+high.x)/2, (low.y+high.y)/2, low.z))
        images = set()
        for mat in obj.data.materials:
            if mat and mat.use_nodes:
                for node in mat.node_tree.nodes:
                    if node.type == 'TEX_IMAGE' and node.image: images.add(node.image)
        for image in images:
            if max(image.size) > 256:
                ratio = 256/max(image.size)
                image.scale(max(1, round(image.size[0]*ratio)), max(1, round(image.size[1]*ratio)))
                image.pack()
        obj.name = slug
        output = destination/f'{slug}.glb'
        bpy.ops.export_scene.gltf(filepath=str(output), export_format='GLB', use_selection=True,
            export_apply=True, export_image_format='JPEG', export_jpeg_quality=72,
            export_draco_mesh_compression_enable=True, export_draco_mesh_compression_level=6,
            export_draco_position_quantization=14, export_draco_normal_quantization=10,
            export_draco_texcoord_quantization=12, export_animations=False, export_cameras=False, export_lights=False)
        row = {'asset': output.name, 'source': filename, 'object': name,
               'source_triangles': before, 'triangles': sum(len(p.vertices)-2 for p in obj.data.polygons),
               'bytes': output.stat().st_size, 'textures': len(images)}
        report.append(row)
        print(json.dumps(row), flush=True)
(destination/'equipment-manifest.json').write_text(json.dumps(report, indent=2)+'\n')
