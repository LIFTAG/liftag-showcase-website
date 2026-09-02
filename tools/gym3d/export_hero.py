# Isolate the hero machine from the purchased pack, strip it back to LIFTAG
# materials, and emit a Draco-compressed web GLB.
#
# Hero: "3.003" - a plate-loaded seated leg press. Chosen over the pec deck
# because the athlete's training position looks straight down the machine at a
# clear frame face, so a QR placard can sit where it is genuinely scannable from
# the seat rather than above and behind the head.
#
#   blender -b all+fitness.blend -P tools/gym3d/export_hero.py -- [ratio]
#
# `ratio` is the collapse-decimate ratio; pass 1.0 to keep the planar pass only.
import bpy, os, bmesh, sys, math
from mathutils import Vector

ROOT = os.environ.get("LIFTAG_REPO", os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
OUTDIR = os.path.join(ROOT, "new_app", "public", "assets", "gym3d")
os.makedirs(OUTDIR, exist_ok=True)

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
RATIO = float(argv[0]) if argv else 1.0

SRC = "3.003"

# ---- LIFTAG material set (matte powder-coat first, selective steel) --------
def mk(name, base, rough, metal):
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (*base, 1.0)
    b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    return m

def srgb(h):
    h = h.lstrip("#"); r, g, b = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    f = lambda c: c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
    return (f(r), f(g), f(b))

M_FRAME  = mk("LIFTAG_Frame",  srgb("#0B0C0B"), 0.62, 0.0)   # powder-coated tube
M_DETAIL = mk("LIFTAG_Detail", srgb("#070807"), 0.80, 0.0)   # end caps, collars, feet
M_STEEL  = mk("LIFTAG_Steel",  srgb("#2B2F34"), 0.20, 1.0)   # weight horns, exposed rod
M_PAD    = mk("LIFTAG_Pad",    srgb("#060606"), 0.88, 0.0)   # seat and back upholstery
M_PLATE  = mk("LIFTAG_Plate",  srgb("#101214"), 0.44, 0.65)  # footplate
NEW = [M_FRAME, M_DETAIL, M_STEEL, M_PAD, M_PLATE]

# pack slot index -> index into NEW.  Slot roles were established by rendering
# the mesh with one flat colour per slot (see docs/gym-scan-hero/README.md).
REMAP = {9: 0, 18: 1, 17: 2, 19: 3, 20: 4}

src = bpy.data.objects[SRC]
ob = src.copy(); ob.data = src.data.copy(); ob.name = "HeroMachine"
bpy.context.scene.collection.objects.link(ob)
for o in bpy.context.scene.objects: o.select_set(False)
bpy.context.view_layer.objects.active = ob; ob.select_set(True)
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

me = ob.data

# ---- remap to LIFTAG materials --------------------------------------------
# Every pack material is dropped, so any manufacturer logo that lived in a
# texture map leaves with it; the export carries no UVs at all.
idx = [REMAP.get(p.material_index, 0) for p in me.polygons]
me.materials.clear()
for m in NEW: me.materials.append(m)
for p, i in zip(me.polygons, idx): p.material_index = i

def tris(o):
    return sum(len(p.vertices) - 2 for p in o.data.polygons)
print("TRIS_BEFORE", tris(ob))

# ---- decimate: planar pass on flat CAD faces, then collapse to budget ------
pl = ob.modifiers.new("planar", "DECIMATE"); pl.decimate_type = 'DISSOLVE'; pl.angle_limit = math.radians(2.5)
bpy.ops.object.modifier_apply(modifier="planar")
bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='SELECT')
bpy.ops.mesh.quads_convert_to_tris(quad_method='BEAUTY', ngon_method='BEAUTY')
bpy.ops.object.mode_set(mode='OBJECT')
print("TRIS_AFTER_PLANAR", tris(ob))

if RATIO < 1.0:
    dc = ob.modifiers.new("collapse", "DECIMATE"); dc.decimate_type = 'COLLAPSE'; dc.ratio = RATIO
    bpy.ops.object.modifier_apply(modifier="collapse")
    print("TRIS_AFTER_COLLAPSE", tris(ob))

# ---- normalise transform ---------------------------------------------------
# Centre in XY, base at Z=0, then swing the machine's forward axis (the
# direction the seated athlete faces, world -X in the pack) onto Blender +Y so
# glTF's Y-up conversion lands it on -Z: seat at +Z, footplate and front frame
# at -Z, so the scene camera can dolly down the machine axis into the seat.
pts = [ob.matrix_world @ Vector(c) for c in ob.bound_box]
lo = Vector((min(p.x for p in pts), min(p.y for p in pts), min(p.z for p in pts)))
hi = Vector((max(p.x for p in pts), max(p.y for p in pts), max(p.z for p in pts)))
ctr = (lo + hi) / 2
ob.location -= Vector((ctr.x, ctr.y, lo.z))
bpy.ops.object.transform_apply(location=True)
ob.rotation_euler = (0, 0, math.radians(-90))
bpy.ops.object.transform_apply(rotation=True)

pts = [ob.matrix_world @ Vector(c) for c in ob.bound_box]
lo = Vector((min(p.x for p in pts), min(p.y for p in pts), min(p.z for p in pts)))
hi = Vector((max(p.x for p in pts), max(p.y for p in pts), max(p.z for p in pts)))
print("BBOX_MIN", [round(v, 3) for v in lo], "BBOX_MAX", [round(v, 3) for v in hi])
print("SIZE", [round(hi[i] - lo[i], 3) for i in range(3)])

# ---- diagnostics: the placard shelf ---------------------------------------
# Blender (x, y, z) exports as glTF (x, z, -y).  The front crossbeam and the
# gap above the footplate are what the placard mount has to straddle, so print
# both in scene coordinates.
def gltf(v): return (v.x, v.z, -v.y)
beam = [v.co for v in me.vertices if v.co.z > hi.z - 0.10]
if beam:
    zs = [gltf(v)[2] for v in beam]
    print("CROSSBEAM  y=%.3f  z=%.3f..%.3f  x=%.3f..%.3f" % (
        max(v.z for v in beam), min(zs), max(zs),
        min(v.x for v in beam), max(v.x for v in beam)))
gap = [v.co for v in me.vertices if 1.05 < v.co.z < 1.32]
if gap:
    zs = [gltf(v)[2] for v in gap]
    print("EYE_BAND   z=%.3f..%.3f  n=%d" % (min(zs), max(zs), len(gap)))

for o in list(bpy.context.scene.objects):
    if o is not ob: bpy.data.objects.remove(o, do_unlink=True)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.export_scene.gltf(
    filepath=os.path.join(OUTDIR, "hero-machine.glb"),
    export_format='GLB', use_selection=True,
    export_apply=True, export_yup=True,
    export_texcoords=False, export_normals=True,
    export_materials='EXPORT',
    export_draco_mesh_compression_enable=True,
    export_draco_mesh_compression_level=7,
    export_draco_position_quantization=13,
    export_draco_normal_quantization=9,
)
print("EXPORTED")
