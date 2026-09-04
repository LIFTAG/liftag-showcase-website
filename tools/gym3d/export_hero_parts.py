# Split the hero machine into named groups for the Act 0B assemble, plus a
# static fused mesh that omits the moving sled/footplate.
#
# Shipped hero-machine.glb is one welded mesh (five primitives). Islands are
# gone; a sled cannot be hidden inside it. This exporter keeps the same rest
# pose as export_hero.py (XY centre, base Z=0, Z −90°, LIFTAG materials,
# planar 2.5°, no collapse decimate) and emits:
#
#   hero-machine-parts.glb   named groups at identity rest
#   hero-machine-static.glb  fused body without sled/footplate
#   hero-parts.json          horn anchors + aabb diagnostics (Three.js space)
#
#   blender -b all+fitness.blend -P tools/gym3d/export_hero_parts.py
#
# Fails if the assembled parts aabb drifts more than 2 mm from the fused hero.
import bpy
import json
import math
import os
import sys
from collections import defaultdict
from mathutils import Vector

ROOT = os.environ.get(
    "LIFTAG_REPO",
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
)
OUTDIR = os.path.join(ROOT, "new_app", "public", "assets", "gym3d")
WORKDIR = os.path.join(ROOT, ".blend-work")
os.makedirs(OUTDIR, exist_ok=True)
os.makedirs(WORKDIR, exist_ok=True)

SRC = "3.003"
AABB_LIMIT_M = 0.002
GROUPS = ("frame", "pads", "footplate", "sled", "horns", "hardware")

# Optional island-id -> group overrides, applied after heuristic classify.
# Island ids are stable: sorted by (-verts, cx, cy, cz) after the rest pose.
FORCE: dict[int, str] = {}


def mk(name, base, rough, metal):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (*base, 1.0)
    b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    return m


def srgb(h):
    h = h.lstrip("#")
    r, g, b = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    f = lambda c: c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
    return (f(r), f(g), f(b))


M_FRAME = mk("LIFTAG_Frame", srgb("#0B0C0B"), 0.62, 0.0)
M_DETAIL = mk("LIFTAG_Detail", srgb("#070807"), 0.80, 0.0)
M_STEEL = mk("LIFTAG_Steel", srgb("#2B2F34"), 0.20, 1.0)
M_PAD = mk("LIFTAG_Pad", srgb("#060606"), 0.88, 0.0)
M_PLATE = mk("LIFTAG_Plate", srgb("#101214"), 0.44, 0.65)
NEW = [M_FRAME, M_DETAIL, M_STEEL, M_PAD, M_PLATE]
REMAP = {9: 0, 18: 1, 17: 2, 19: 3, 20: 4}


def tris(o):
    return sum(len(p.vertices) - 2 for p in o.data.polygons)


def gltf(v):
    return (round(v.x, 5), round(v.z, 5), round(-v.y, 5))


def deselect_all():
    for o in bpy.context.scene.objects:
        o.select_set(False)


def activate(ob):
    deselect_all()
    bpy.context.view_layer.objects.active = ob
    ob.select_set(True)
    ob.hide_set(False)


def apply_loc_rot_scale(ob):
    activate(ob)
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)


def planar_and_triangulate(ob):
    activate(ob)
    pl = ob.modifiers.new("planar", "DECIMATE")
    pl.decimate_type = "DISSOLVE"
    pl.angle_limit = math.radians(2.5)
    bpy.ops.object.modifier_apply(modifier="planar")
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.select_all(action="SELECT")
    bpy.ops.mesh.quads_convert_to_tris(quad_method="BEAUTY", ngon_method="BEAUTY")
    bpy.ops.object.mode_set(mode="OBJECT")


def remap_liftag(ob):
    me = ob.data
    idx = [REMAP.get(p.material_index, 0) for p in me.polygons]
    me.materials.clear()
    for m in NEW:
        me.materials.append(m)
    for p, i in zip(me.polygons, idx):
        p.material_index = i


def rest_pose(ob):
    pts = [ob.matrix_world @ Vector(c) for c in ob.bound_box]
    lo = Vector((min(p.x for p in pts), min(p.y for p in pts), min(p.z for p in pts)))
    hi = Vector((max(p.x for p in pts), max(p.y for p in pts), max(p.z for p in pts)))
    ctr = (lo + hi) / 2
    ob.location -= Vector((ctr.x, ctr.y, lo.z))
    apply_loc_rot_scale(ob)
    ob.rotation_euler = (0, 0, math.radians(-90))
    apply_loc_rot_scale(ob)


def vertex_aabb(ob):
    mw = ob.matrix_world
    xs, ys, zs = [], [], []
    for v in ob.data.vertices:
        p = mw @ v.co
        xs.append(p.x)
        ys.append(p.y)
        zs.append(p.z)
    lo = Vector((min(xs), min(ys), min(zs)))
    hi = Vector((max(xs), max(ys), max(zs)))
    return lo, hi


def combined_aabb(obs):
    lo = Vector((math.inf, math.inf, math.inf))
    hi = Vector((-math.inf, -math.inf, -math.inf))
    for ob in obs:
        a, b = vertex_aabb(ob)
        lo.x, lo.y, lo.z = min(lo.x, a.x), min(lo.y, a.y), min(lo.z, a.z)
        hi.x, hi.y, hi.z = max(hi.x, b.x), max(hi.y, b.y), max(hi.z, b.z)
    return lo, hi


def centroid(ob):
    acc = Vector((0.0, 0.0, 0.0))
    n = len(ob.data.vertices)
    if n == 0:
        return ob.matrix_world.translation.copy()
    for v in ob.data.vertices:
        acc += v.co
    return ob.matrix_world @ (acc / n)


def extents_local(ob):
    xs = [v.co.x for v in ob.data.vertices]
    ys = [v.co.y for v in ob.data.vertices]
    zs = [v.co.z for v in ob.data.vertices]
    return (
        max(xs) - min(xs),
        max(ys) - min(ys),
        max(zs) - min(zs),
    )


def majority_mat(ob):
    areas = defaultdict(float)
    for p in ob.data.polygons:
        areas[p.material_index] += p.area
    if not areas:
        return 0
    return max(areas, key=areas.get)


def find_islands(me):
    n = len(me.vertices)
    parent = list(range(n))
    rank = [0] * n

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    def union(a, b):
        ra, rb = find(a), find(b)
        if ra == rb:
            return
        if rank[ra] < rank[rb]:
            parent[ra] = rb
        elif rank[ra] > rank[rb]:
            parent[rb] = ra
        else:
            parent[rb] = ra
            rank[ra] += 1

    for e in me.edges:
        union(e.vertices[0], e.vertices[1])
    for p in me.polygons:
        v0 = p.vertices[0]
        for v in p.vertices[1:]:
            union(v0, v)

    groups = defaultdict(list)
    for i in range(n):
        groups[find(i)].append(i)
    return list(groups.values())


def extract_island(src_me, vert_ids, name):
    vset = set(vert_ids)
    old_to_new = {old: i for i, old in enumerate(vert_ids)}
    coords = [src_me.vertices[i].co.copy() for i in vert_ids]
    faces = []
    fmats = []
    for p in src_me.polygons:
        vs = p.vertices
        if all(v in vset for v in vs):
            faces.append([old_to_new[v] for v in vs])
            fmats.append(p.material_index)
    if not faces:
        return None
    me = bpy.data.meshes.new(name)
    me.from_pydata(coords, [], faces)
    me.update()
    for m in NEW:
        me.materials.append(m)
    for p, i in zip(me.polygons, fmats):
        p.material_index = i
    ob = bpy.data.objects.new(name, me)
    bpy.context.scene.collection.objects.link(ob)
    return ob


def rename(ob, name):
    ob.name = name
    if ob.data is not None:
        ob.data.name = name
    return ob


def join_objects(obs, name):
    obs = [o for o in obs if o is not None]
    if not obs:
        return None
    if len(obs) == 1:
        return rename(obs[0], name)
    for o in bpy.context.scene.objects:
        o.select_set(False)
    for o in obs:
        o.hide_set(False)
        o.select_set(True)
    bpy.context.view_layer.objects.active = obs[0]
    ctx = {
        "active_object": obs[0],
        "object": obs[0],
        "selected_objects": obs,
        "selected_editable_objects": obs,
    }
    with bpy.context.temp_override(**ctx):
        bpy.ops.object.join()
    return rename(obs[0], name)


def make_empty(name, loc):
    e = bpy.data.objects.new(name, None)
    e.empty_display_type = "PLAIN_AXES"
    e.empty_display_size = 0.08
    e.location = loc
    bpy.context.scene.collection.objects.link(e)
    return e


def is_real_part(ob):
    """Bolts are <50 verts of frame/detail. Pads, the footplate and steel
    pins stay independent even when the CAD island is a 40-vert box."""
    n = len(ob.data.vertices)
    if n >= 50:
        return True
    return majority_mat(ob) in (2, 3, 4)


def shard_name(group, ob):
    """Split the welded 'frame' so the first falling object is never half a machine."""
    c = centroid(ob)
    lo, hi = vertex_aabb(ob)
    if group == "frame":
        if lo.z < 0.12 and (hi.z - lo.z) < 0.50:
            return "frame.baseL" if c.x < 0 else "frame.baseR"
        if c.z > 1.18:
            return "frame.beam"
        if c.y < -0.20:
            return "frame.seat"
        if c.x < -0.22:
            return "frame.railL"
        if c.x > 0.22:
            return "frame.railR"
        return "frame.core"
    if group == "sled":
        return "sled.L" if c.x < 0 else "sled.R"
    if group == "horns":
        return "horns.L" if c.x < 0 else "horns.R"
    if group == "hardware":
        if c.z > 1.15:
            return "hardware.top"
        return "hardware.L" if c.x < 0 else "hardware.R"
    return group


def classify(ob, ctx):
    maj = majority_mat(ob)
    c = centroid(ob)
    dx, dy, dz = extents_local(ob)
    verts = len(ob.data.vertices)

    if maj == 3:
        return "pads"
    if maj == 4:
        return "footplate"
    if maj == 2:
        # Sideways steel is a loading pin. Long-in-Y steel is a rail and
        # stays with the sled rather than collecting plates.
        if dx >= dy * 0.85 and abs(c.x) > 0.10:
            return "horns"
        if abs(c.x) > 0.25:
            return "horns"
        if c.y > 0.12 and c.z < 1.15:
            return "sled"
        return "hardware"
    if maj == 1:
        return "hardware" if verts < 800 else "frame"
    # Top beam and upright caps are frame (placard hangs from z≈1.35).
    # The moving carriage lives in the front half, below that beam.
    if c.y > 0.12 and c.z < 1.15:
        return "sled"
    return "frame"


def export_glb(path, objects):
    deselect_all()
    for o in objects:
        o.hide_set(False)
        o.select_set(True)
    bpy.context.view_layer.objects.active = objects[0]
    bpy.ops.export_scene.gltf(
        filepath=path,
        export_format="GLB",
        use_selection=True,
        export_apply=True,
        export_yup=True,
        export_texcoords=False,
        export_normals=True,
        export_materials="EXPORT",
        export_cameras=False,
        export_lights=False,
        export_draco_mesh_compression_enable=True,
        export_draco_mesh_compression_level=7,
        export_draco_position_quantization=13,
        export_draco_normal_quantization=9,
    )


def main():
    src = bpy.data.objects.get(SRC)
    if not src:
        print("MISS", SRC)
        sys.exit(1)

    ob = src.copy()
    ob.data = src.data.copy()
    ob.name = "HeroMachineParts"
    bpy.context.scene.collection.objects.link(ob)
    apply_loc_rot_scale(ob)
    remap_liftag(ob)
    print("TRIS_BEFORE", tris(ob))
    planar_and_triangulate(ob)
    print("TRIS_AFTER_PLANAR", tris(ob))
    rest_pose(ob)

    fused = ob.copy()
    fused.data = ob.data.copy()
    fused.name = "HeroFusedRef"
    bpy.context.scene.collection.objects.link(fused)
    fused_lo, fused_hi = vertex_aabb(fused)
    print("FUSED_BBOX_MIN", [round(v, 4) for v in fused_lo], "MAX", [round(v, 4) for v in fused_hi])

    raw = []
    for i, verts in enumerate(find_islands(ob.data)):
        child = extract_island(ob.data, verts, f"island.{i:03d}")
        if child:
            raw.append(child)
    bpy.data.objects.remove(ob, do_unlink=True)
    print("ISLANDS", len(raw))

    raw.sort(key=lambda o: (-len(o.data.vertices), *tuple(centroid(o))))
    id_by_name = {}
    island_report = []
    for i, child in enumerate(raw):
        lo, hi = vertex_aabb(child)
        c = centroid(child)
        rec = {
            "id": i,
            "name": child.name,
            "verts": len(child.data.vertices),
            "tris": tris(child),
            "mat": int(majority_mat(child)),
            "centroid": [round(c.x, 4), round(c.y, 4), round(c.z, 4)],
            "aabb_min": [round(lo.x, 4), round(lo.y, 4), round(lo.z, 4)],
            "aabb_max": [round(hi.x, 4), round(hi.y, 4), round(hi.z, 4)],
        }
        island_report.append(rec)
        id_by_name[child.name] = i
        print(
            "ISLAND",
            f"{i:03d}",
            "v=%5d" % rec["verts"],
            "t=%5d" % rec["tris"],
            "mat",
            rec["mat"],
            "c",
            rec["centroid"],
        )

    reals = [o for o in raw if is_real_part(o)]
    bolts = [o for o in raw if not is_real_part(o)]
    print("REAL", len(reals), "BOLTS", len(bolts))
    if not reals:
        print("NO_REAL_PARTS")
        sys.exit(1)

    pad_candidates = [o for o in reals if majority_mat(o) == 3]
    foot_candidates = [o for o in reals if majority_mat(o) == 4]
    pad_y = centroid(pad_candidates[0]).y if pad_candidates else -0.6
    foot_y = centroid(foot_candidates[0]).y if foot_candidates else 0.6
    lo_all, hi_all = combined_aabb(reals)
    ctx = {
        "pad_y": pad_y,
        "foot_y": foot_y,
        "len_y": hi_all.y - lo_all.y,
    }

    labels = {}
    for i, child in enumerate(reals):
        raw_id = id_by_name.get(child.name, -1)
        group = FORCE.get(raw_id) or classify(child, ctx)
        if group not in GROUPS:
            group = "frame"
        labels[child] = group
        dx, dy, dz = extents_local(child)
        c = centroid(child)
        print(
            "ASSIGN",
            f"{raw_id:03d}",
            group.ljust(10),
            "v=%5d" % len(child.data.vertices),
            "mat",
            majority_mat(child),
            "d",
            [round(dx, 3), round(dy, 3), round(dz, 3)],
            "c",
            [round(c.x, 3), round(c.y, 3), round(c.z, 3)],
        )

    buckets = defaultdict(list)
    for b in bolts:
        bc = centroid(b)
        best = min(reals, key=lambda r: (centroid(r) - bc).length_squared)
        buckets[best].append(b)

    assignment = {g: [] for g in GROUPS}
    for parent, group in labels.items():
        kids = buckets.get(parent, [])
        joined = join_objects([parent] + kids, parent.name) if kids else parent
        assignment[group].append(joined)

    left_anchor = Vector((-0.40, 0.77, 0.27))
    right_anchor = Vector((0.38, 0.80, 0.27))
    horn_reals = [o for o, g in labels.items() if g == "horns"]

    def biggest_side(obs, pred):
        side = [o for o in obs if o.name in bpy.data.objects and pred(centroid(o))]
        if not side:
            return None
        return max(side, key=lambda o: len(o.data.vertices))

    lh = biggest_side(horn_reals, lambda c: c.x < 0)
    rh = biggest_side(horn_reals, lambda c: c.x >= 0)
    if lh:
        left_anchor = centroid(lh)
    if rh:
        right_anchor = centroid(rh)

    shard_obs = {}
    for g in GROUPS:
        members = assignment[g]
        if not members:
            print("GROUP_EMPTY", g)
            continue
        buckets = defaultdict(list)
        for ob in members:
            buckets[shard_name(g, ob)].append(ob)
        for name, shard_members in buckets.items():
            shard_obs[name] = join_objects(shard_members, name)
            glo, ghi = vertex_aabb(shard_obs[name])
            print(
                "SHARD",
                name.ljust(14),
                "n",
                len(shard_members),
                "tris",
                tris(shard_obs[name]),
                "aabb",
                [round(v, 3) for v in glo],
                [round(v, 3) for v in ghi],
            )

    if not any(n.startswith("frame.") for n in shard_obs) or "pads" not in shard_obs:
        print("MISSING_REQUIRED_SHARD", sorted(shard_obs))
        sys.exit(1)

    parts_lo, parts_hi = combined_aabb(list(shard_obs.values()))
    drift = max(
        abs(parts_lo.x - fused_lo.x),
        abs(parts_lo.y - fused_lo.y),
        abs(parts_lo.z - fused_lo.z),
        abs(parts_hi.x - fused_hi.x),
        abs(parts_hi.y - fused_hi.y),
        abs(parts_hi.z - fused_hi.z),
    )
    print("PARTS_BBOX_MIN", [round(v, 4) for v in parts_lo], "MAX", [round(v, 4) for v in parts_hi])
    print("AABB_DRIFT_MM", round(drift * 1000, 3))

    print("HORN_L", [round(v, 4) for v in left_anchor], "HORN_R", [round(v, 4) for v in right_anchor])
    horn_l = make_empty("horn.L", left_anchor)
    horn_r = make_empty("horn.R", right_anchor)

    root = make_empty("HeroParts", Vector((0.0, 0.0, 0.0)))
    for child in list(shard_obs.values()) + [horn_l, horn_r]:
        child.parent = root
        child.matrix_parent_inverse = root.matrix_world.inverted()

    plate_radius = 0.225
    plate_thick = 0.050

    report = {
        "islands_raw": len(island_report),
        "islands": island_report,
        "shards": {
            name: {
                "tris": tris(ob),
                "verts": len(ob.data.vertices),
            }
            for name, ob in shard_obs.items()
        },
        "aabb_fused": {"min": list(fused_lo), "max": list(fused_hi)},
        "aabb_parts": {"min": list(parts_lo), "max": list(parts_hi)},
        "aabb_delta_mm": drift * 1000,
        "horn_l": list(left_anchor),
        "horn_r": list(right_anchor),
        "plate": {"radius": plate_radius, "thickness": plate_thick, "kind": "donut"},
        "sled_unsettled": not any(n.startswith("sled") for n in shard_obs),
    }
    with open(os.path.join(WORKDIR, "hero-parts.json"), "w") as f:
        json.dump(report, f, indent=2)

    slim = {
        "version": 1,
        "groups": sorted(shard_obs),
        "aabb": {"min": list(gltf(parts_lo)), "max": list(gltf(parts_hi))},
        "horns": {
            "axis": [1, 0, 0],
            "left": list(gltf(left_anchor)),
            "right": list(gltf(right_anchor)),
        },
        "plate": {
            "radius": round(plate_radius, 4),
            "thickness": round(plate_thick, 4),
            "countDesktop": 2,
            "countPhone": 2,
        },
        "aabbDeltaMm": round(drift * 1000, 3),
        "sledUnsettled": not any(n.startswith("sled") for n in shard_obs),
    }
    with open(os.path.join(OUTDIR, "hero-parts.json"), "w") as f:
        json.dump(slim, f, indent=2)

    if drift > AABB_LIMIT_M:
        print("AABB_DRIFT_FAIL", drift)
        sys.exit(1)

    bpy.data.objects.remove(fused, do_unlink=True)
    keep_set = {root, horn_l, horn_r, *shard_obs.values()}
    for o in list(bpy.context.scene.objects):
        if o not in keep_set:
            bpy.data.objects.remove(o, do_unlink=True)

    parts_path = os.path.join(OUTDIR, "hero-machine-parts.glb")
    export_glb(parts_path, [root, *shard_obs.values(), horn_l, horn_r])
    print("EXPORTED_PARTS", parts_path, "bytes", os.path.getsize(parts_path))

    static_members = [
        ob for name, ob in shard_obs.items()
        if not name.startswith("sled") and name != "footplate"
    ]
    if not static_members:
        print("STATIC_EMPTY")
        sys.exit(1)
    static = join_objects(static_members, "HeroMachineStatic")
    static_path = os.path.join(OUTDIR, "hero-machine-static.glb")
    export_glb(static_path, [static])
    print("EXPORTED_STATIC", static_path, "bytes", os.path.getsize(static_path), "tris", tris(static))
    print(
        "EXPORTED",
        "parts=%d" % os.path.getsize(parts_path),
        "static=%d" % os.path.getsize(static_path),
        "delta_mm=%.3f" % (drift * 1000),
    )


if __name__ == "__main__":
    main()
