import bpy, os, json, sys

out = {"collections": [], "objects": []}

def tri_count(ob):
    me = ob.data
    n = 0
    try:
        for p in me.polygons:
            n += len(p.vertices) - 2
    except Exception:
        return -1
    return n

for c in bpy.data.collections:
    out["collections"].append({
        "name": c.name,
        "objects": len(c.objects),
        "all_objects": len(c.all_objects),
        "children": [ch.name for ch in c.children],
    })

for ob in bpy.data.objects:
    if ob.type != 'MESH':
        continue
    colls = [c.name for c in ob.users_collection]
    d = ob.dimensions
    out["objects"].append({
        "name": ob.name,
        "colls": colls,
        "tris": tri_count(ob),
        "verts": len(ob.data.vertices),
        "dim": [round(d.x,3), round(d.y,3), round(d.z,3)],
        "loc": [round(ob.location.x,2), round(ob.location.y,2), round(ob.location.z,2)],
        "mats": [m.name for m in ob.data.materials if m],
        "parent": ob.parent.name if ob.parent else None,
    })

out["counts"] = {
    "objects": len(bpy.data.objects),
    "meshes": len(bpy.data.meshes),
    "materials": len(bpy.data.materials),
    "images": len(bpy.data.images),
    "collections": len(bpy.data.collections),
}
p = os.path.join(os.path.dirname(bpy.data.filepath), ".blend-work", "inventory.json")
with open(os.path.join(os.environ.get("LIFTAG_REPO", os.getcwd()), ".blend-work", "inventory.json"),"w") as f:
    json.dump(out, f, indent=1)
print("WROTE", out["counts"])
