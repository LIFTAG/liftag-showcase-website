"""Inspect a supplied GLB without changing it; render its original materials."""
import bpy, sys, json, math
from pathlib import Path
from mathutils import Vector

arguments = sys.argv[sys.argv.index('--') + 1:]
source, output = arguments[:2]
transparent = '--transparent' in arguments
out = Path(output)
out.mkdir(parents=True, exist_ok=True)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
bpy.ops.import_scene.gltf(filepath=source)
objects = [o for o in bpy.context.scene.objects if o.type == 'MESH']
corners = [o.matrix_world @ Vector(c) for o in objects for c in o.bound_box]
lo = Vector(tuple(min(c[i] for c in corners) for i in range(3)))
hi = Vector(tuple(max(c[i] for c in corners) for i in range(3)))
center = (hi+lo)*.5
size = max(hi-lo)
report = {'source':Path(source).name, 'bounds':list(hi-lo), 'objects':len(objects),
          'triangles':sum(sum(len(p.vertices)-2 for p in o.data.polygons) for o in objects),
          'materials':[m.name for m in bpy.data.materials],
          'textures':[{'name':i.name,'size':list(i.size)} for i in bpy.data.images]}
(out/'source-report.json').write_text(json.dumps(report,indent=2))
scene=bpy.context.scene
scene.render.engine='CYCLES'
scene.render.film_transparent=transparent
scene.cycles.samples=20
scene.cycles.use_denoising=True
scene.render.resolution_x=900; scene.render.resolution_y=900
scene.render.resolution_percentage=100
scene.world.color=(.09,.09,.09)
scene.view_settings.view_transform='AgX'
for name,offset,power in [('Key',(2,-3,4),1800),('Fill',(-3,-2,2),1200),('Rim',(1,3,3),1600)]:
    light=bpy.data.lights.new(name,'AREA'); light.energy=power*(size/2)**2; light.shape='DISK'; light.size=size*1.5
    ob=bpy.data.objects.new(name,light); scene.collection.objects.link(ob); ob.location=center+Vector(offset)*size*.65
    ob.rotation_euler=(center-ob.location).to_track_quat('-Z','Y').to_euler()
bpy.ops.object.camera_add()
camera=bpy.context.object; scene.camera=camera
camera.data.type='ORTHO'; camera.data.ortho_scale=size*1.35
for name,offset in [('front',(2.4,-3.5,2.2)),('back',(-2.4,3.5,2.2))]:
    camera.location=center+Vector(offset)*size
    camera.rotation_euler=(center-camera.location).to_track_quat('-Z','Y').to_euler()
    scene.render.filepath=str(out/(name+'.png'))
    bpy.ops.render.render(write_still=True)
print(json.dumps(report))
