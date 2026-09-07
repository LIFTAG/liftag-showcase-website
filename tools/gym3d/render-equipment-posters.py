"""Fallbacks from the same web models; no source models are modified."""
import bpy, math, sys
from pathlib import Path
from mathutils import Vector
root=Path(__file__).resolve().parents[2]
out=Path(sys.argv[sys.argv.index('--')+1]); out.mkdir(parents=True,exist_ok=True)
assets=[('leg-press','hero-machine.glb',2.35,-1.55,1.15,.2),('flat-bench','equipment/flat-bench.glb',1.95,1.4,1.2,-.3),('cable-station','equipment/cable-station.glb',2.6,-1.55,-1.45,.1),('treadmill','equipment/treadmill.glb',2.4,1.4,-1.4,-.3)]
bpy.ops.wm.read_factory_settings(use_empty=True)
rigs=[]
for slug,path,span,x,z,rotation in assets:
    before=set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=str(root/'new_app/public/assets/gym3d'/path))
    meshes=[o for o in bpy.data.objects if o not in before and o.type=='MESH']
    corners=[o.matrix_world@Vector(c) for o in meshes for c in o.bound_box]
    low=Vector(tuple(min(p[i] for p in corners) for i in range(3)))
    high=Vector(tuple(max(p[i] for p in corners) for i in range(3)))
    center=(low+high)*.5; center.z=low.z
    scale=span/max(high-low)
    rig=bpy.data.objects.new(slug+'-rig',None); rig['slug']=slug; bpy.context.scene.collection.objects.link(rig)
    for obj in meshes:
        matrix=obj.matrix_world.copy(); obj.parent=rig; obj.matrix_world=matrix
        for mat in obj.data.materials:
            if mat and mat.use_nodes:
                node=mat.node_tree.nodes.get('Principled BSDF')
                if node:
                    node.inputs['Roughness'].default_value=max(.4,node.inputs['Roughness'].default_value)
    rig.scale=(scale,)*3; rig.location=-center*scale
    rigs.append((rig,x,z,rotation))
scene=bpy.context.scene
scene.render.engine='CYCLES'; scene.cycles.samples=20; scene.cycles.use_denoising=True
scene.render.film_transparent=True; scene.world=bpy.data.worlds.new('Studio'); scene.world.use_nodes=True
scene.world.node_tree.nodes.get('Background').inputs[0].default_value=(.18,.21,.19,1)
scene.view_settings.view_transform='AgX'
for name,pos,power in [('Key',(2,-5,6),1500),('Fill',(-4,-2,3),900),('Rim',(1,4,5),1300)]:
    light=bpy.data.lights.new(name,'AREA'); light.energy=power; light.shape='DISK'; light.size=5
    ob=bpy.data.objects.new(name,light); scene.collection.objects.link(ob); ob.location=pos
    ob.rotation_euler=(Vector((0,0,1))-ob.location).to_track_quat('-Z','Y').to_euler()
bpy.ops.object.camera_add(); camera=bpy.context.object; scene.camera=camera; camera.data.type='ORTHO'
scene.render.resolution_x=700;scene.render.resolution_y=700;scene.render.resolution_percentage=100
for rig,x,z,rotation in rigs:
    for r,*_ in rigs:
        for child in r.children: child.hide_render=(r!=rig)
    camera.location=(3.6,-5.2,2.5); target=Vector((0,0,1)); camera.rotation_euler=(target-camera.location).to_track_quat('-Z','Y').to_euler();camera.data.ortho_scale=3.5
    scene.render.filepath=str(out/(rig['slug']+'.png'));bpy.ops.render.render(write_still=True)
for rig,x,z,rotation in rigs:
    for child in rig.children:child.hide_render=False
    rig.location+=Vector((x,-z,0));rig.rotation_euler.z=rotation
camera.location=(7,-10,7.4);camera.rotation_euler=(Vector((0,0,.5))-camera.location).to_track_quat('-Z','Y').to_euler();camera.data.ortho_scale=8
scene.render.resolution_x=1100;scene.render.resolution_y=850
scene.render.filepath=str(out/'floor.png');bpy.ops.render.render(write_still=True)
