// Shader warm-up, cut into tasks.
//
// `renderer.compileAsync(scene, camera)` waits for the GPU in parallel, but it
// first assembles the source of every program in the scene synchronously -
// for these scenes, tens of milliseconds in a single task per light state.
// The first draw after it is another single task: every texture and buffer
// upload plus each program's first use. Both stages boot while something else
// is moving on screen, so both halves are cut into one task per subtree here.
//
// Program keys depend on the light list, so a subtree is only compiled on its
// own if it has no lights in it: compiled against the whole scene as
// `targetScene`, it then sees exactly the lights a whole-scene compile would.
import type { Camera, Light, Mesh, Object3D, Scene, WebGLRenderer } from 'three'
import { yieldToMain } from './yieldToMain.ts'

/**
 * The largest light-free subtrees under `root` that hold meshes, descending
 * into any node that holds a light and into every node in `split` (groups that
 * would otherwise be one slice holding nearly the whole scene).
 */
export function warmSlices(root: Object3D, split: ReadonlySet<Object3D> = new Set()): Object3D[] {
  const out: Object3D[] = []
  for (const child of root.children) {
    let lights = false
    let meshes = false
    child.traverse((node) => {
      if ((node as Light).isLight) lights = true
      else if ((node as Mesh).isMesh) meshes = true
    })
    if (!meshes) continue
    if (lights || split.has(child)) out.push(...warmSlices(child, split))
    else out.push(child)
  }
  return out
}

/**
 * compileAsync per slice with a task boundary between slices, then once for
 * the whole scene: those are cache hits by then, and it binds anything no
 * slice reached. False if `cancelled()` turned true on the way.
 */
export async function compileSliced(
  renderer: WebGLRenderer,
  scene: Scene,
  camera: Camera,
  slices: readonly Object3D[],
  cancelled: () => boolean,
): Promise<boolean> {
  for (const slice of slices) {
    await renderer.compileAsync(slice, camera, scene)
    if (cancelled()) return false
    await yieldToMain()
    if (cancelled()) return false
  }
  await renderer.compileAsync(scene, camera)
  return !cancelled()
}

/**
 * Draw the scene once per slice with every other slice hidden, a task
 * boundary between draws, then once whole. Each slice's uploads and program
 * first-use land in its own task; the light list - so every program key - is
 * the same as in the whole draw. The caller owns the render target.
 */
export async function renderSliced(
  renderer: WebGLRenderer,
  scene: Scene,
  camera: Camera,
  slices: readonly Object3D[],
  cancelled: () => boolean,
): Promise<boolean> {
  for (const slice of slices) {
    if (!slice.visible) continue
    const hidden = slices.filter(other => other !== slice && other.visible)
    for (const other of hidden) other.visible = false
    try {
      renderer.render(scene, camera)
    }
    finally {
      for (const other of hidden) other.visible = true
    }
    await yieldToMain()
    if (cancelled()) return false
  }
  renderer.render(scene, camera)
  return !cancelled()
}
