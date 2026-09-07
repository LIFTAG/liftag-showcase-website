"""Read a supplied Blender collection and render named, isolated previews.

Run with Blender --background --factory-startup --disable-autoexec --python
this-file -- source.blend output-directory. Source files are never saved.
"""
import bpy
import json
import sys
from pathlib import Path
from mathutils import Vector

source, destination = sys.argv[sys.argv.index('--') + 1:]
output = Path(destination)
output.mkdir(parents=True, exist_ok=True)
bpy.ops.wm.open_mainfile(filepath=source, load_ui=False, use_scripts=False)
objects = [o for o in bpy.context.scene.objects if o.type == 'MESH']
report = []
for obj in objects:
    bounds = [obj.matrix_world @ Vector(corner) for corner in obj.bound_box]
    low = Vector(tuple(min(v[i] for v in bounds) for i in range(3)))
    high = Vector(tuple(max(v[i] for v in bounds) for i in range(3)))
    obj.data.calc_loop_triangles()
    report.append({'name': obj.name, 'triangles': len(obj.data.loop_triangles), 'size': list(high-low), 'center': list((low+high)/2), 'materials': [m.name for m in obj.data.materials if m]})
(output/'inventory.json').write_text(json.dumps(report, indent=2))
scene = bpy.context.scene
scene.render.engine = 'BLENDER_WORKBENCH'
scene.display.shading.light = 'STUDIO'
scene.display.shading.studiolight_rotate_z = 0.5
scene.display.shading.color_type = 'MATERIAL'
scene.display.shading.show_shadows = True
scene.display.shading.show_cavity = True
scene.display.shading.cavity_type = 'BOTH'
scene.display.shading.background_type = 'WORLD'
scene.world.color = (0.1, 0.1, 0.1)
scene.render.resolution_x = 400
scene.render.resolution_y = 400
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = 'PNG'
scene.render.film_transparent = False
cam_data = bpy.data.cameras.new('InspectionCamera')
cam_data.type = 'ORTHO'
cam = bpy.data.objects.new('InspectionCamera', cam_data)
scene.collection.objects.link(cam)
scene.camera = cam
for obj in objects: obj.hide_render = True
for i, (obj, data) in enumerate(zip(objects, report)):
    obj.hide_render = False
    center = Vector(data['center'])
    size = max(data['size'])
    direction = Vector((3.8,-6,3.4)).normalized()
    cam.location = center + direction * max(5, size*3)
    cam.rotation_euler = (center-cam.location).to_track_quat('-Z','Y').to_euler()
    cam_data.ortho_scale = max(.3, size*1.45)
    cam_data.clip_end = max(100, size*20)
    scene.render.filepath = str(output/f'{i:02d}.png')
    bpy.ops.render.render(write_still=True)
    obj.hide_render = True
    print(f'PREVIEW {i} {obj.name}', flush=True)
