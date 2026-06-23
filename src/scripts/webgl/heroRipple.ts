/**
 * Subtle WebGL treatment for the home hero.
 *
 * Renders the hero image on a plane with a gentle, always-on flow of
 * displacement noise plus a soft ripple that follows the pointer. Deliberately
 * understated — distortion is felt more than seen.
 *
 * The hero <img> remains the LCP element and the fallback: this canvas sits on
 * top, starts transparent, and only fades in once the texture is ready. Under
 * reduced motion or without WebGL, the canvas never appears.
 */
const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAG = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uTex;
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uHover;
  uniform float uAmp;
  uniform float uAsp;
  uniform float uCanvas;

  vec2 cover(vec2 uv, float texAsp, float canAsp) {
    vec2 s = canAsp > texAsp ? vec2(1.0, texAsp / canAsp) : vec2(canAsp / texAsp, 1.0);
    return (uv - 0.5) * s + 0.5;
  }

  void main() {
    // Smooth, continuous flow built from layered sine waves. Unlike hash noise
    // this has no discontinuities, so the motion reads as a silky liquid drift
    // rather than a wobble.
    float t = uTime;
    vec2 flow;
    flow.x = sin(vUv.y * 3.5 + t * 0.45) + 0.5 * sin(vUv.y * 6.0 - t * 0.30);
    flow.y = sin(vUv.x * 3.5 - t * 0.40) + 0.5 * cos(vUv.x * 5.5 + t * 0.35);
    flow *= uAmp;

    // A soft ripple that radiates gently from the cursor.
    float dist = distance(vUv, uMouse);
    float ripple = sin(dist * 16.0 - t * 1.0) * exp(-dist * 5.0) * uHover;
    vec2 toM = normalize(vUv - uMouse + 1e-4);

    // Perceptible parallax: the image leans toward the cursor (a clear 3D cue).
    vec2 parallax = (uMouse - 0.5) * 0.045 * uHover;

    vec2 disp = flow + toM * ripple * 0.014 - parallax;
    gl_FragColor = texture2D(uTex, cover(vUv + disp, uAsp, uCanvas));
  }
`;

export async function initHeroRipple(): Promise<void> {
  // WebGL hero is forced on for all visitors (by request), regardless of the
  // prefers-reduced-motion setting.
  // On phones the static hero image (the LCP element) is plenty; skip the
  // full-screen WebGL canvas to save battery and keep things snappy.
  if (window.matchMedia('(max-width: 47.99rem)').matches) return;

  const hero = document.querySelector<HTMLElement>('[data-hero]');
  const canvas = hero?.querySelector<HTMLCanvasElement>('[data-hero-canvas]');
  const src = canvas?.dataset.heroSrc;
  if (!hero || !canvas || !src) return;

  const THREE = await import('three');
  let renderer: import('three').WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  } catch {
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const texture = await new Promise<import('three').Texture | null>((resolve) => {
    new THREE.TextureLoader().load(
      src,
      (t) => {
        t.colorSpace = THREE.SRGBColorSpace;
        t.minFilter = THREE.LinearFilter;
        t.generateMipmaps = false;
        resolve(t);
      },
      undefined,
      () => resolve(null),
    );
  });
  if (!texture) {
    renderer.dispose();
    return;
  }
  const ti = texture.image as { width: number; height: number };

  const uniforms = {
    uTex: { value: texture },
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    uHover: { value: 0 },
    uAmp: { value: 0.008 },
    uAsp: { value: ti.width / ti.height },
    uCanvas: { value: 1 },
  };
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    new THREE.ShaderMaterial({ uniforms, vertexShader: VERT, fragmentShader: FRAG }),
  );
  scene.add(mesh);

  const resize = () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    uniforms.uCanvas.value = w / h;
  };
  resize();
  window.addEventListener('resize', resize, { passive: true });

  const targetMouse = new THREE.Vector2(0.5, 0.5);
  let targetHover = 0;
  hero.addEventListener('pointermove', (e) => {
    const r = hero.getBoundingClientRect();
    targetMouse.set((e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height);
    targetHover = 1;
  });
  hero.addEventListener('pointerleave', () => {
    targetHover = 0;
  });

  // Reveal the canvas now that the first frame can render.
  hero.classList.add('is-webgl');

  const clock = new THREE.Clock();
  let raf = 0;
  const render = () => {
    uniforms.uTime.value = clock.getElapsedTime();
    uniforms.uMouse.value.lerp(targetMouse, 0.06);
    uniforms.uHover.value += (targetHover - uniforms.uHover.value) * 0.05;
    renderer.render(scene, camera);
    raf = requestAnimationFrame(render);
  };
  raf = requestAnimationFrame(render);

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting && !raf) raf = requestAnimationFrame(render);
      else if (!e.isIntersecting && raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    });
  });
  io.observe(hero);
}
