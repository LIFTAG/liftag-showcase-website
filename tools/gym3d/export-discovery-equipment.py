"""Build a small, distinct discovery collection from the supplied source GLBs.

blender --background --factory-startup --disable-autoexec --python this-file
-- source-directory output-directory poster-directory
Never modifies or saves the originals.
"""
import bpy, json, math, sys
from pathlib import Path
from mathutils import Vector
source, output, posters = map(Path, sys.argv[sys.argv.index('--') + 1:])
output.mkdir(parents=True, exist_ok=True)
posters.mkdir(parents=True, exist_ok=True)
assets = [
    ('all+fitness.glb', '3.004', 'plate-loaded-pulldown', 14000),
    ('all+fitness.glb', '3.002', 'plate-loaded-chest-press', 14000),
    ('all+fitness.glb', '1.003', 'adjustable-bench', 10000),
    ('all+cardio.glb', 'SP3D_002+-+Bicicleta+de+Academia+Gyn+Bike+Vray+read', 'indoor-bike', 16000),
]
report=[]
for filename,name,slug,budget in assets:
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=str(source/filename))
    obj=bpy.data.objects.get(name)
    if obj is None or obj.type!='MESH': raise RuntimeError(f'Missing {filename}/{name}')
    bpy.ops.object.select_all(action='DESELECT');obj.select_set(True);bpy.context.view_layer.objects.active=obj
    before=sum(len(p.vertices)-2 for p in obj.data.polygons)
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.mesh.remove_doubles(threshold=.00015);bpy.ops.object.mode_set(mode='OBJECT')
    count=sum(len(p.vertices)-2 for p in obj.data.polygons)
    if count>budget:
        mod=obj.modifiers.new('Web silhouette', 'DECIMATE');mod.ratio=budget/count;mod.use_collapse_triangulate=True
        bpy.ops.object.modifier_apply(modifier=mod.name)
    points=[obj.matrix_world@Vector(c) for c in obj.bound_box]
    low=Vector(tuple(min(v[i] for v in points) for i in range(3)))
    high=Vector(tuple(max(v[i] for v in points) for i in range(3)))
    obj.location-=Vector(((low.x+high.x)/2,(low.y+high.y)/2,low.z))
    used=set(p.material_index for p in obj.data.polygons)
    images=set()
    for i,mat in enumerate(obj.data.materials):
        if i not in used or not mat or not mat.use_nodes: continue
        shader=mat.node_tree.nodes.get('Principled BSDF')
        if shader:
            shader.inputs['Roughness'].default_value=max(.42,shader.inputs['Roughness'].default_value)
            shader.inputs['Metallic'].default_value=min(.45,shader.inputs['Metallic'].default_value)
        for node in mat.node_tree.nodes:
            if node.type=='TEX_IMAGE' and node.image: images.add(node.image)
    for image in images:
        if max(image.size)>256:
            ratio=256/max(image.size);image.scale(max(1,round(image.size[0]*ratio)),max(1,round(image.size[1]*ratio)));image.pack()
    obj.name=slug
    target=output/f'{slug}.glb'
    bpy.ops.export_scene.gltf(filepath=str(target),export_format='GLB',use_selection=True,export_apply=True,
        export_image_format='JPEG',export_jpeg_quality=72,export_draco_mesh_compression_enable=True,
        export_draco_mesh_compression_level=7,export_draco_position_quantization=14,
        export_draco_normal_quantization=10,export_draco_texcoord_quantization=10,
        export_animations=False,export_cameras=False,export_lights=False)
    report.append({'asset':target.name,'source':filename,'object':name,'source_triangles':before,
        'triangles':sum(len(p.vertices)-2 for p in obj.data.polygons),'bytes':target.stat().st_size})
    for other in list(bpy.data.objects):
        if other!=obj:bpy.data.objects.remove(other,do_unlink=True)
    scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.samples=16;scene.cycles.use_denoising=True
    scene.render.film_transparent=True;scene.render.resolution_x=500;scene.render.resolution_y=500;scene.render.resolution_percentage=100
    scene.world=bpy.data.worlds.new('Studio');scene.world.use_nodes=True
    scene.world.node_tree.nodes.get('Background').inputs[0].default_value=(.18,.21,.19,1)
    span=max(high-low);center=Vector((0,0,(high.z-low.z)/2))
    for label,offset,power in [('Key',(2,-3,4),1100),('Fill',(-3,-2,2),800),('Rim',(1,3,3),1000)]:
        light=bpy.data.lights.new(label,'AREA');light.energy=power*(span/2)**2;light.shape='DISK';light.size=span*1.4
        ob=bpy.data.objects.new(label,light);scene.collection.objects.link(ob);ob.location=center+Vector(offset)*span*.6
        ob.rotation_euler=(center-ob.location).to_track_quat('-Z','Y').to_euler()
    bpy.ops.object.camera_add();cam=bpy.context.object;scene.camera=cam;cam.data.type='ORTHO';cam.data.ortho_scale=span*1.35
    cam.location=center+Vector((2.4,-3.5,2.2))*span;cam.rotation_euler=(center-cam.location).to_track_quat('-Z','Y').to_euler()
    scene.render.filepath=str(posters/f'{slug}.png');bpy.ops.render.render(write_still=True)
    print(json.dumps(report[-1]),flush=True)
(output/'manifest.json').write_text(json.dumps(report,indent=2)+'\n')
