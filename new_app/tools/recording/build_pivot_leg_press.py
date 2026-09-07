"""Build the compact Pivot Leg Press recording assets.

Run from the repository root:
  blender --background --factory-startup --python new_app/tools/recording/build_pivot_leg_press.py

The exported mannequin uses one skinned, articulated animation cycle, which
keeps the web asset small while preserving exact foot contact. The preview
film is rendered from the same scene and timing as the GLB.
"""

from pathlib import Path
import bpy
import json
import math
import os
import shutil
import subprocess
import tempfile
from mathutils import Vector, Matrix

ROOT = Path(__file__).resolve().parents[3]
OUT = ROOT / "new_app/public/assets/gym3d/recording"
OUT.mkdir(parents=True, exist_ok=True)
FPS = 30
DURATION = 4.8
END = round(FPS * DURATION)


def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def uv_sphere_vertices(center, radii, rings=8, segments=12):
    verts, faces = [], []
    for r in range(rings + 1):
        phi = math.pi * r / rings
        for s in range(segments):
            th = 2 * math.pi * s / segments
            verts.append((center[0] + radii[0] * math.sin(phi) * math.cos(th),
                          center[1] + radii[1] * math.cos(phi),
                          center[2] + radii[2] * math.sin(phi) * math.sin(th)))
    for r in range(rings):
        for s in range(segments):
            a = r * segments + s
            b = r * segments + (s + 1) % segments
            c = (r + 1) * segments + (s + 1) % segments
            d = (r + 1) * segments + s
            faces.append((a, b, c, d))
    return verts, faces


def capsule_vertices(a, b, radius, rings=7, segments=10):
    a, b = Vector(a), Vector(b)
    axis = (b - a).normalized()
    side = axis.cross(Vector((1, 0, 0)))
    if side.length < .1:
        side = axis.cross(Vector((0, 0, 1)))
    side.normalize(); up = side.cross(axis).normalized()
    verts, faces = [], []
    for r in range(rings + 1):
        t = r / rings
        center = a.lerp(b, t)
        taper = .84 + .16 * math.sin(math.pi * t)
        for s in range(segments):
            th = 2 * math.pi * s / segments
            p = center + radius * taper * (math.cos(th) * side + math.sin(th) * up)
            verts.append(tuple(p))
    for r in range(rings):
        for s in range(segments):
            a0 = r * segments + s; b0 = r * segments + (s + 1) % segments
            c0 = (r + 1) * segments + (s + 1) % segments; d0 = (r + 1) * segments + s
            faces.append((a0, b0, c0, d0))
    faces += [tuple(range(segments - 1, -1, -1)), tuple(rings * segments + s for s in range(segments))]
    return verts, faces


def pose(extended):
    # Exact contact plane on the footplate. Hip and shoulders stay planted;
    # only the knee opens as the carriage travels up/back on its rails.
    hip_y, hip_z = .53, .42
    foot_y = .86 + .11 * extended
    foot_z = -.28 - .086 * extended
    # Fixed .46 m femur and tibia. Solve the two-circle intersection and pick
    # the forward knee, preserving anatomy instead of stretching the limbs.
    dy, dz = foot_y - hip_y, foot_z - hip_z
    d = math.sqrt(dy*dy + dz*dz); half = d * .5
    h = math.sqrt(max(.46*.46 - half*half, 0))
    mid_y, mid_z = (hip_y+foot_y)*.5, (hip_z+foot_z)*.5
    knee_y = mid_y + h * (-dz/d)
    knee_z = mid_z + h * (dy/d)
    return {
        "pelvis": (0, hip_y, hip_z), "chest": (0, 1.00, .50),
        "neck": (0, 1.23, .54), "head": (0, 1.41, .56),
        "kneeL": (-.19, knee_y, knee_z), "kneeR": (.19, knee_y, knee_z),
        "ankleL": (-.20, foot_y, foot_z), "ankleR": (.20, foot_y, foot_z),
        "shoulderL": (-.24, 1.10, .51), "shoulderR": (.24, 1.10, .51),
        "elbowL": (-.32, .88, .57), "elbowR": (.32, .88, .57),
        "handL": (-.33, .68, .49), "handR": (.33, .68, .49),
    }


def mannequin_geometry(p):
    # Authoring measurements above use the site's Three.js Y-up coordinates.
    # Blender is Z-up; glTF export converts these world-space Blender values
    # back to the original web convention.
    p = {key: (value[0], -value[2], value[1]) for key, value in p.items()}
    v, f, weights = [], [], []
    def add(part, bone):
        pv, pf = part; off = len(v); v.extend(pv); weights.extend([bone]*len(pv)); f.extend(tuple(i + off for i in face) for face in pf)
    add(uv_sphere_vertices(p["pelvis"], (.20, .14, .17)), "torso")
    add(uv_sphere_vertices(p["chest"], (.245, .145, .27)), "torso")
    add(uv_sphere_vertices(p["head"], (.105, .115, .155), 10, 14), "head")
    add(capsule_vertices(p["pelvis"], p["chest"], .17, 8, 12), "torso")
    add(capsule_vertices(p["neck"], p["head"], .075, 7, 10), "head")
    for side in ("L", "R"):
        x = -1 if side == "L" else 1
        hip = (x * .17, p["pelvis"][1], p["pelvis"][2])
        add(capsule_vertices(hip, p["knee" + side], .10, 9, 12), "thigh"+side)
        add(capsule_vertices(p["knee" + side], p["ankle" + side], .078, 9, 12), "shin"+side)
        toe = (p["ankle" + side][0], p["ankle" + side][1] + .015, p["ankle" + side][2] - .105)
        add(capsule_vertices(p["ankle" + side], toe, .078, 7, 12), "foot"+side)
        add(capsule_vertices(p["shoulder" + side], p["elbow" + side], .066, 8, 10), "upperArm"+side)
        add(capsule_vertices(p["elbow" + side], p["hand" + side], .054, 8, 10), "forearm"+side)
        add(uv_sphere_vertices(p["hand" + side], (.06, .052, .08), 7, 10), "forearm"+side)
    return v, f, weights


def segments(p):
    p = {key: Vector((value[0], -value[2], value[1])) for key, value in p.items()}
    out={"torso":(p["pelvis"],p["chest"]),"head":(p["neck"],p["head"])}
    for side in ("L","R"):
        x=-.17 if side=="L" else .17; hip=Vector((x,-.42,.53))
        toe=p["ankle"+side]+Vector((0,.105,.015))
        out.update({"thigh"+side:(hip,p["knee"+side]),"shin"+side:(p["knee"+side],p["ankle"+side]),"foot"+side:(p["ankle"+side],toe),
                    "upperArm"+side:(p["shoulder"+side],p["elbow"+side]),"forearm"+side:(p["elbow"+side],p["hand"+side])})
    return out


def bone_matrix(a,b):
    direction=(b-a).normalized(); q=Vector((0,1,0)).rotation_difference(direction)
    return Matrix.Translation(a) @ q.to_matrix().to_4x4()


def make_mannequin():
    vb, faces, weights = mannequin_geometry(pose(0))
    mesh = bpy.data.meshes.new("MannequinSculpture")
    mesh.from_pydata(vb, [], faces); mesh.update()
    obj = bpy.data.objects.new("Mannequin", mesh)
    bpy.context.collection.objects.link(obj)
    for poly in mesh.polygons: poly.use_smooth = True
    mat = bpy.data.materials.new("GraphiteSculpture"); mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = (.018, .024, .032, 1)
    bsdf.inputs["Metallic"].default_value = .24; bsdf.inputs["Roughness"].default_value = .62
    obj.data.materials.append(mat)
    arm=bpy.data.armatures.new("MannequinRig"); rig=bpy.data.objects.new("MannequinRig",arm); bpy.context.collection.objects.link(rig)
    bpy.context.view_layer.objects.active=rig; rig.select_set(True); bpy.ops.object.mode_set(mode='EDIT')
    rest=segments(pose(0))
    for name,(a,b) in rest.items(): bone=arm.edit_bones.new(name); bone.head=a; bone.tail=b
    bpy.ops.object.mode_set(mode='OBJECT')
    for name in rest:
        group=obj.vertex_groups.new(name=name); group.add([i for i,w in enumerate(weights) if w==name],1,'REPLACE')
    obj.parent=rig; mod=obj.modifiers.new("MannequinSkin",'ARMATURE'); mod.object=rig
    for frame,amount in ((0,0),(12,0),(72,1),(84,1),(144,0)):
        target=segments(pose(amount))
        for name,(a,b) in target.items():
            pb=rig.pose.bones[name]; pb.rotation_mode='QUATERNION'; pb.matrix=bone_matrix(a,b)
            pb.keyframe_insert("location",frame=frame); pb.keyframe_insert("rotation_quaternion",frame=frame)
    rig.animation_data.action.name="PivotLegPressCycle"
    return obj,rig


def setup_scene(man):
    scene = bpy.context.scene
    scene.frame_start = 0; scene.frame_end = END; scene.render.fps = FPS
    scene.render.engine = 'BLENDER_EEVEE'
    scene.render.resolution_x = 720; scene.render.resolution_y = 405; scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = 'PNG'; scene.render.film_transparent = False
    scene.world = bpy.data.worlds.new("RecordingWorld")
    scene.world.use_nodes = True
    world_bg = scene.world.node_tree.nodes.get("Background")
    world_bg.inputs["Color"].default_value = (.001, .002, .004, 1)
    world_bg.inputs["Strength"].default_value = .035
    # Existing exact machine is render reference only and excluded from GLB.
    bpy.ops.import_scene.gltf(filepath=str(ROOT / "new_app/public/assets/gym3d/hero-machine-static.glb"))
    static_objects=set(bpy.context.scene.objects)
    bpy.ops.import_scene.gltf(filepath=str(ROOT / "new_app/public/assets/gym3d/hero-machine-parts.glb"))
    machine = bpy.data.objects.get("HeroParts")
    if machine: machine.name = "ReferenceHeroCarriage"
    carriage_names={"footplate","sled.L","sled.R"}
    for part in set(bpy.context.scene.objects)-static_objects:
        if part.type == 'MESH' and part.name not in carriage_names: part.hide_render=True
    for part in [o for o in bpy.context.scene.objects if o.type == 'MESH' and o != man]:
        for m in part.data.materials:
            m.diffuse_color = (.025, .03, .038, 1); m.roughness = .55; m.metallic = .25
    # Match the athlete's exact ankle travel. These nodes retain glTF-local
    # Y-up coordinates beneath the importer root, so write the site's rail
    # vector directly rather than converting it a second time.
    carriage_delta = Vector((0, .11, -.086))
    for node_name in ("footplate", "sled.L", "sled.R"):
        node = bpy.data.objects.get(node_name)
        if not node: continue
        rest = node.location.copy()
        for frame, amount in ((0,0),(12,0),(72,1),(84,1),(144,0)):
            node.location = rest + carriage_delta * amount
            node.keyframe_insert("location", frame=frame)
    floor_mat = bpy.data.materials.new("RubberFloor"); floor_mat.use_nodes=True
    floor_bsdf=floor_mat.node_tree.nodes.get("Principled BSDF"); floor_bsdf.inputs["Base Color"].default_value=(.006,.008,.012,1); floor_bsdf.inputs["Roughness"].default_value=.9
    bpy.ops.mesh.primitive_plane_add(size=12, location=(0, -.005, 0)); floor=bpy.context.object; floor.name="RenderFloor"; floor.data.materials.append(floor_mat)
    cam_data=bpy.data.cameras.new("RecordingCamera"); cam=bpy.data.objects.new("RecordingCamera",cam_data); bpy.context.collection.objects.link(cam)
    cam.location=(-4.85,-.76,1.34); target=Vector((0,-.03,.76)); cam.rotation_euler=(target-Vector(cam.location)).to_track_quat('-Z','Y').to_euler(); cam.data.lens=56; scene.camera=cam
    def area(name, loc, energy, size, color):
        d=bpy.data.lights.new(name,'AREA'); d.energy=energy; d.shape='RECTANGLE'; d.size=size; d.color=color
        o=bpy.data.objects.new(name,d); bpy.context.collection.objects.link(o); o.location=loc; o.rotation_euler=((target-Vector(loc)).to_track_quat('-Z','Y').to_euler())
    area("Key",(-2.2,-2.1,3.2),310,2.8,(1,.94,.84)); area("LimeRim",(2.0,1.8,2.2),45,2.0,(.62,1,.18)); area("Softbox",(.4,-2.8,3.6),175,3.2,(.68,.72,.80))


def export(man,rig):
    root=bpy.data.objects.new("RecordingRig",None); bpy.context.collection.objects.link(root); rig.parent=root
    bpy.ops.object.select_all(action='DESELECT'); root.select_set(True); man.select_set(True); rig.select_set(True)
    bpy.context.view_layer.objects.active=root
    bpy.ops.export_scene.gltf(filepath=str(OUT/"pivot-leg-press-mannequin.glb"), export_format='GLB', use_selection=True,
        export_animations=True, export_frame_range=True, export_apply=False, export_yup=True)
    meta={"version":1,"durationSeconds":DURATION,"fps":FPS,"clip":"PivotLegPressCycle","root":"RecordingRig",
          "cycle":{"bentHold":[0,0.4],"press":[0.4,2.4],"extendedHold":[2.4,2.8],"return":[2.8,4.8]},
          "carriage":{"node":"LiftagPressCarriage","axis":[0,0.788,-0.616],"displacementMeters":0.14,
                      "samples":[[0,0],[.0833,0],[.5,1],[.5833,1],[1,0]]},
          "world":{"position":[0,0,0],"rotation":[0,0,0,1],"scale":[1,1,1]},
          "media":{"posterWidth":720,"posterHeight":405,"videoWidth":720,"videoHeight":406,"poster":"pivot-leg-press-poster.webp","videoMp4":"pivot-leg-press-demo.mp4","videoWebm":"pivot-leg-press-demo.webm"}}
    (OUT/"pivot-leg-press-motion.json").write_text(json.dumps(meta,indent=2)+"\n")


def render():
    scene=bpy.context.scene
    # The action spans 0..144 (4.8 seconds); encoded playback samples 0..143.
    scene.frame_end = END - 1
    frames = Path(tempfile.mkdtemp(prefix="liftag-pivot-leg-press-"))
    scene.render.filepath=str(frames/"frame_")
    scene.render.image_settings.file_format='PNG'; bpy.ops.render.render(animation=True)
    scene.frame_set(73); scene.render.image_settings.file_format='WEBP'; scene.render.image_settings.quality=78
    scene.render.filepath=str(OUT/"pivot-leg-press-poster.webp"); bpy.ops.render.render(write_still=True)
    common=[shutil.which("ffmpeg") or "ffmpeg","-y","-framerate",str(FPS),"-i",str(frames/"frame_%04d.png"),"-vf","pad=720:406:0:0:black","-an"]
    subprocess.run(common+["-c:v","libx264","-preset","slow","-crf","28","-pix_fmt","yuv420p","-movflags","+faststart",str(OUT/"pivot-leg-press-demo.mp4")],check=True)
    subprocess.run(common+["-c:v","libvpx-vp9","-deadline","good","-cpu-used","2","-crf","38","-b:v","0","-pix_fmt","yuv420p",str(OUT/"pivot-leg-press-demo.webm")],check=True)
    shutil.rmtree(frames)


reset(); mannequin,mannequin_rig=make_mannequin(); setup_scene(mannequin); export(mannequin,mannequin_rig)
if os.environ.get("LIFTAG_RECORDING_PREVIEW"):
    bpy.context.scene.frame_set(72); bpy.context.scene.render.filepath=str(Path(tempfile.gettempdir())/"pivot-leg-press-preview.png"); bpy.ops.render.render(write_still=True)
else:
    render()
