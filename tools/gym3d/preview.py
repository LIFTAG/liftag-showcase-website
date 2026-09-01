import bpy, os, math
from mathutils import Vector

ROOT = "/Users/adrian/liftag_repos/liftag_showcase_website"
OUT = os.path.join(ROOT, ".blend-work", "previews")
os.makedirs(OUT, exist_ok=True)

sc = bpy.context.scene
sc.render.engine = 'BLENDER_WORKBENCH'
sc.render.resolution_x = 420
sc.render.resolution_y = 420
sc.render.film_transparent = False
sh = sc.display.shading
sh.light = 'STUDIO'
sh.color_type = 'SINGLE'
sh.single_color = (0.55, 0.55, 0.55)
sh.show_cavity = True
sh.show_shadows = True

cam_data = bpy.data.cameras.new("PrevCam")
cam_data.type = 'ORTHO'
cam = bpy.data.objects.new("PrevCam", cam_data)
sc.collection.objects.link(cam)
sc.camera = cam

meshes = [o for o in bpy.data.objects if o.type == 'MESH' and len(o.data.polygons) > 0]
for o in bpy.data.objects:
    o.hide_render = True

DIR = Vector((1.0, -1.25, 0.5)).normalized()

for ob in meshes:
    ob.hide_render = False
    # world-space bbox
    pts = [ob.matrix_world @ Vector(c) for c in ob.bound_box]
    lo = Vector((min(p.x for p in pts), min(p.y for p in pts), min(p.z for p in pts)))
    hi = Vector((max(p.x for p in pts), max(p.y for p in pts), max(p.z for p in pts)))
    ctr = (lo + hi) / 2.0
    radius = max((hi - lo).length / 2.0, 0.05)
    cam.location = ctr + DIR * (radius * 6.0)
    cam.rotation_euler = (ctr - cam.location).to_track_quat('-Z', 'Y').to_euler()
    cam_data.ortho_scale = radius * 2.3
    sc.render.filepath = os.path.join(OUT, ob.name.replace(" ", "_") + ".png")
    bpy.ops.render.render(write_still=True)
    ob.hide_render = True
    print("RENDERED", ob.name)
print("DONE")
