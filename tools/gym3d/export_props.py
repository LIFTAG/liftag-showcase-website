import bpy, os, math
from mathutils import Vector
ROOT = os.environ.get("LIFTAG_REPO", os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
OUTDIR=os.path.join(ROOT,"new_app","public","assets","gym3d"); os.makedirs(OUTDIR,exist_ok=True)

# name -> (export node name, target tris)
PROPS = {
  "3.005":          ("LegPress",   3000),
  "3.006":          ("MultiStack", 3500),
  "3.002":          ("PlateRig",   2800),
  "1.003":          ("Bench",      1800),
  "1.001":          ("Preacher",   1800),
  "veluond (1).001":("PullTower",  3000),
  "3.007":          ("ChestPress", 2800),
}

def srgb(h):
    h=h.lstrip("#"); r,g,b=[int(h[i:i+2],16)/255 for i in (0,2,4)]
    f=lambda c: c/12.92 if c<=0.04045 else ((c+0.055)/1.055)**2.4
    return (f(r),f(g),f(b))
m=bpy.data.materials.new("LIFTAG_Prop"); m.use_nodes=True
b=m.node_tree.nodes["Principled BSDF"]
b.inputs["Base Color"].default_value=(*srgb("#090A09"),1.0)
b.inputs["Roughness"].default_value=0.72
b.inputs["Metallic"].default_value=0.0

def tris(o): return sum(len(p.vertices)-2 for p in o.data.polygons)
made=[]
for src_name,(node,target) in PROPS.items():
    src=bpy.data.objects.get(src_name)
    if not src: print("MISS",src_name); continue
    ob=src.copy(); ob.data=src.data.copy(); ob.name=node
    bpy.context.scene.collection.objects.link(ob)
    for o in bpy.context.scene.objects: o.select_set(False)
    bpy.context.view_layer.objects.active=ob; ob.select_set(True)
    bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
    ob.data.materials.clear(); ob.data.materials.append(m)
    for p in ob.data.polygons: p.material_index=0
    # CAD imports arrive as thousands of loose shells; collapse-decimate cannot
    # reduce an island below one triangle, so weld coincident verts first to
    # fuse them into continuous surfaces the decimator can actually work on.
    bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.mesh.remove_doubles(threshold=0.0008)
    bpy.ops.object.mode_set(mode='OBJECT')
    pl=ob.modifiers.new("pl","DECIMATE"); pl.decimate_type='DISSOLVE'; pl.angle_limit=math.radians(4)
    bpy.ops.object.modifier_apply(modifier="pl")
    bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.mesh.quads_convert_to_tris(quad_method='BEAUTY',ngon_method='BEAUTY')
    bpy.ops.object.mode_set(mode='OBJECT')
    # Collapse decimate stalls on CAD meshes full of loose islands, so drive it
    # in passes and stop as soon as a pass stops making progress.
    for _ in range(8):
        cur=tris(ob)
        if cur<=target: break
        dc=ob.modifiers.new("dc","DECIMATE"); dc.decimate_type='COLLAPSE'
        dc.ratio=max(target/cur*0.9,0.02); dc.use_collapse_triangulate=True
        bpy.ops.object.modifier_apply(modifier="dc")
        if tris(ob)>=cur*0.98: break
    pts=[ob.matrix_world@Vector(c) for c in ob.bound_box]
    lo=Vector((min(p.x for p in pts),min(p.y for p in pts),min(p.z for p in pts)))
    hi=Vector((max(p.x for p in pts),max(p.y for p in pts),max(p.z for p in pts)))
    ctr=(lo+hi)/2
    ob.location -= Vector((ctr.x,ctr.y,lo.z))
    bpy.ops.object.transform_apply(location=True)
    ob.rotation_euler=(0,0,math.radians(-90)); bpy.ops.object.transform_apply(rotation=True)
    made.append(ob); print("PROP",node,tris(ob),"size",[round(hi[i]-lo[i],2) for i in range(3)])

for o in list(bpy.context.scene.objects):
    if o not in made: bpy.data.objects.remove(o,do_unlink=True)
for o in bpy.context.scene.objects: o.select_set(True)
bpy.ops.export_scene.gltf(filepath=os.path.join(OUTDIR,"gym-props.glb"),
    export_format='GLB', use_selection=True, export_apply=True, export_yup=True,
    export_texcoords=False, export_normals=True, export_materials='EXPORT',
    export_draco_mesh_compression_enable=True, export_draco_mesh_compression_level=7,
    export_draco_position_quantization=12, export_draco_normal_quantization=8)
print("TOTAL_PROP_TRIS", sum(tris(o) for o in made))
print("EXPORTED")
