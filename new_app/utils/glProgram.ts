/**
 * Shader link that does not stall the main thread.
 *
 * WebGL compiles and links in the GPU process, but the first status query
 * (COMPILE_STATUS, LINK_STATUS, or even getUniformLocation) blocks the page
 * until the driver is done. For the raymarched sections that was a 100-300ms
 * hitch on a mid-range phone, landing exactly as the section scrolled in.
 *
 * With KHR_parallel_shader_compile, `status()` stays non-blocking: it returns
 * null while the driver is still working, so callers poll it once per frame
 * and finish their setup when it settles. Without the extension `status()`
 * answers immediately, which is the old synchronous behaviour.
 */
export interface ProgramLink {
  program: WebGLProgram
  /** null while still linking; true once usable; false if compile/link failed. */
  status: () => boolean | null
  /** Drops the program (and its shaders) whether or not it ever settled. */
  discard: () => void
}

export function beginProgramLink(
  gl: WebGLRenderingContext,
  vertexSource: string,
  fragmentSource: string,
  label = '[gl]',
): ProgramLink | null {
  const vs = gl.createShader(gl.VERTEX_SHADER)
  const fs = gl.createShader(gl.FRAGMENT_SHADER)
  const program = gl.createProgram()
  if (!vs || !fs || !program) {
    if (vs) gl.deleteShader(vs)
    if (fs) gl.deleteShader(fs)
    if (program) gl.deleteProgram(program)
    return null
  }

  gl.shaderSource(vs, vertexSource)
  gl.compileShader(vs)
  gl.shaderSource(fs, fragmentSource)
  gl.compileShader(fs)
  gl.attachShader(program, vs)
  gl.attachShader(program, fs)
  gl.linkProgram(program)

  const parallel = gl.getExtension('KHR_parallel_shader_compile') as
    { COMPLETION_STATUS_KHR: number } | null
  let settled: boolean | null = null
  let shadersLive = true

  const dropShaders = () => {
    if (!shadersLive) return
    shadersLive = false
    gl.deleteShader(vs)
    gl.deleteShader(fs)
  }

  return {
    program,
    status() {
      if (settled !== null) return settled
      if (parallel && !gl.getProgramParameter(program, parallel.COMPLETION_STATUS_KHR)) return null
      settled = Boolean(gl.getProgramParameter(program, gl.LINK_STATUS))
      if (!settled && import.meta.dev) {
        console.error(label, gl.getShaderInfoLog(vs), gl.getShaderInfoLog(fs), gl.getProgramInfoLog(program))
      }
      dropShaders()
      if (!settled) gl.deleteProgram(program)
      return settled
    },
    discard() {
      dropShaders()
      if (settled !== false) gl.deleteProgram(program)
      settled = false
    },
  }
}
