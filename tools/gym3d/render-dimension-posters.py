"""Render the same optimized gym assets used by the Another Dimension experience.

Run with Blender --background --factory-startup --python this-file.py.
Only derived PNGs go to the supplied output directory (default /tmp).
"""
import bpy
import math
import os
from pathlib import Path
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[2]
OUT = Path(os.environ.get('LIFTAG_POSTER_DIR', '/tmp/liftag-dimension'))
OUT.mkdir(parents=True, exist_ok=True)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

def coord(p):
    return Vector((p[0], -p[2], p[1]))

def material(name, color, rough=.6, metal=.0):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    node = mat.node_tree.nodes.get('Principled BSDF')
    node.inputs['Base Color'].default_value = (*color, 1)
    node.inputs['Roughness'].default_value = rough
    node.inputs['Metallic'].default_value = metal
    return mat

def box(name, size, position, mat):
    bpy.ops.mesh.primitive_cube_add(size=1, location=coord(position))
    ob = bpy.context.object
    ob.name = name
    ob.dimensions = (size[0], size[2], size[1])
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    ob.data.materials.append(mat)
    return ob

hero_before = set(bpy.data.objects)
bpy.ops.import_scene.gltf(filepath=str(ROOT/'new_app/public/assets/gym3d/hero-machine.glb'))
hero = [o for o in bpy.data.objects if o not in hero_before]
for obj in hero:
    if obj.type != 'MESH': continue
    for slot in obj.material_slots:
        node = slot.material.node_tree.nodes.get('Principled BSDF')
        steel = 'Steel' in slot.material.name
        pad = 'Pad' in slot.material.name
        node.inputs['Base Color'].default_value = (*((.35,.4,.36) if steel else (.022,.029,.024) if pad else (.055,.070,.055)),1)
        node.inputs['Roughness'].default_value = .22 if steel else .8 if pad else .55
        node.inputs['Metallic'].default_value = .9 if steel else .12

bpy.ops.import_scene.gltf(filepath=str(ROOT/'new_app/public/assets/gym3d/gym-props.glb'))
positions = {'ChestPress':(-2.6,0,-2.4),'MultiStack':(2.5,0,-2.8),'Bench':(-2.6,0,.5),'PullTower':(-4.5,0,-4.8),'Preacher':(.1,0,-4.9),'PlateRig':(4.5,0,-4.3),'LegPress':(4.7,0,.4)}
prop_mat = material('Dimension equipment',(.055,.070,.055),.55,.12)
for name, pos in positions.items():
    ob = bpy.data.objects.get(name)
    if ob:
        ob.location = coord(pos)
        ob.data.materials.clear()
        ob.data.materials.append(prop_mat)

floor_mat=material('Rubber',(.10,.105,.092),.92)
nodes=floor_mat.node_tree.nodes
noise=nodes.new('ShaderNodeTexNoise'); noise.inputs['Scale'].default_value=180
bump=nodes.new('ShaderNodeBump'); bump.inputs['Strength'].default_value=.19; bump.inputs['Distance'].default_value=.025
floor_mat.node_tree.links.new(noise.outputs['Fac'],bump.inputs['Height'])
floor_mat.node_tree.links.new(bump.outputs['Normal'],nodes.get('Principled BSDF').inputs['Normal'])
box('Floor',(13,.09,11),(0,-.065,-1.6),floor_mat)
wall_mat=material('Wall',(.032,.044,.033),.94)
wall=box('Back wall',(14,4.8,.14),(0,2.3,-6.9),wall_mat)
window_mat=material('Windows',(.7,.72,.57))
node=window_mat.node_tree.nodes.get('Principled BSDF')
node.inputs['Emission Color'].default_value=(.85,.87,.7,1)
node.inputs['Emission Strength'].default_value=1.4
windows=[]
for col in range(7):
    for row in range(2): windows.append(box('Window',(.9,1.05,.02),(-6+col*1.03,2.1+row*1.16,-6.8),window_mat))

tag_mat=material('LIFTAG tag',(1,1,1),.45)
tex=tag_mat.node_tree.nodes.new('ShaderNodeTexImage')
tex.image=bpy.data.images.load(str(ROOT/'new_app/public/assets/gym3d/qr-sticker.webp'))
tag_mat.node_tree.links.new(tex.outputs['Color'],tag_mat.node_tree.nodes.get('Principled BSDF').inputs['Base Color'])
bpy.ops.mesh.primitive_plane_add(size=1,location=coord((0,1.255,-.345)))
tag=bpy.context.object; tag.name='LIFTAG QR'; tag.rotation_euler=(math.pi/2+.1,0,0); tag.scale=(.147,.155,1); tag.data.materials.append(tag_mat)

def area(name,pos,target,power,size,color):
    light=bpy.data.lights.new(name,'AREA'); light.energy=power; light.shape='DISK'; light.size=size; light.color=color
    ob=bpy.data.objects.new(name,light); bpy.context.scene.collection.objects.link(ob); ob.location=coord(pos)
    ob.rotation_euler=(coord(target)-ob.location).to_track_quat('-Z','Y').to_euler()
area('Daylight',(4.5,6,-1.5),(0,0,0),3000,2.5,(1,.94,.80))
area('Fill',(-3,3,4),(0,1,0),950,5,(.80,.88,1))
area('Room',(0,6,-4),(0,0,-2),800,5,(.9,1,.87))
scene=bpy.context.scene
scene.world.color=(.025,.03,.028)
scene.render.engine='CYCLES'; scene.cycles.samples=32; scene.cycles.use_denoising=True
scene.view_settings.view_transform='AgX'
bpy.ops.object.camera_add()
cam=bpy.context.object; scene.camera=cam
shots=[
 ('hero-desktop',(3.5,2.35,3.8),(-1.1,.8,0),36,1440,960),
 ('hero-mobile',(2.9,2.1,3.8),(0,1.65,0),43,720,1080),
 ('tag',(.23,1.4,.22),(-.13,1.23,-.372),36,1000,1000),
 ('floor',(4.5,7.9,6.2),(1.45,0,-1.1),43,1280,960),
]
for name,eye,target,fov,width,height in shots:
    cam.location=coord(eye); cam.rotation_euler=(coord(target)-cam.location).to_track_quat('-Z','Y').to_euler()
    cam.data.type='PERSP'; cam.data.sensor_fit='VERTICAL'; cam.data.angle_y=math.radians(fov)
    scene.render.resolution_x=width; scene.render.resolution_y=height; scene.render.resolution_percentage=100
    scene.render.filepath=str(OUT/f'{name}.png')
    for prop_name in positions:
        prop=bpy.data.objects.get(prop_name)
        if prop: prop.hide_render=name=='hero-mobile'
    if name=='floor':
        wall.hide_render=True
        for ob in windows: ob.hide_render=True
    bpy.ops.render.render(write_still=True)
