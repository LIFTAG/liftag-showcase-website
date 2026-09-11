import * as THREE from "three";

/**
 * Screen-space rounded rectangle used by both discovery morphs: gym floor →
 * 3D phone, and 3D phone → review card. Half-extents and corner radius are
 * uniforms, so the silhouette can change aspect without stretching a mesh.
 */
export function createRoundedPlate(span: number, key: string) {
  const half = { value: new THREE.Vector2(span / 2, span / 2) };
  const radius = { value: 0 };
  const geometry = new THREE.PlaneGeometry(span, span);
  const material = new THREE.MeshPhysicalMaterial({
    color: 0x080b09,
    metalness: 0,
    roughness: 0.95,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uHalf = half;
    shader.uniforms.uRadius = radius;
    shader.vertexShader = "varying vec2 vClip;\n" + shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace(
      "#include <begin_vertex>",
      "#include <begin_vertex>\nvClip=position.xy;",
    );
    shader.fragmentShader =
      "varying vec2 vClip;uniform vec2 uHalf;uniform float uRadius;\n" +
      shader.fragmentShader;
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <dithering_fragment>",
      `#include <dithering_fragment>
       vec2 q=abs(vClip)-uHalf+vec2(uRadius);
       float dist=length(max(q,0.))+min(max(q.x,q.y),0.)-uRadius;
       float aa=max(fwidth(dist),8e-4);
       if(dist>aa)discard;
       gl_FragColor.a*=1.-smoothstep(0.,aa,dist);`,
    );
  };
  material.customProgramCacheKey = () => key;
  const mesh = new THREE.Mesh(geometry, material);
  mesh.visible = false;
  return { mesh, material, half, radius };
}
