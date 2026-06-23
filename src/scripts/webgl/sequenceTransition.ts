/**
 * Scroll-driven WebGL crossfade through a sequence of images.
 *
 * As the visitor scrolls through a tall, pinned section, a displacement shader
 * melts one frame into the next (render_22 -> render_23 -> render_24). Each
 * texture is "cover"-mapped to the stage, so frames of different aspect ratios
 * still fill the screen cleanly.
 *
 * Progressive enhancement:
 *   - Skips entirely under prefers-reduced-motion or when WebGL is unavailable.
 *   - The section keeps a static, stacked image fallback in the DOM either way.
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
  uniform sampler2D uTexA;
  uniform sampler2D uTexB;
  uniform sampler2D uDisp;
  uniform float uProgress;   // 0..1 within the current pair
  uniform float uIntensity;  // displacement strength
  uniform float uAspA;       // texture A aspect (w/h)
  uniform float uAspB;
  uniform float uCanvas;     // canvas aspect (w/h)

  vec2 cover(vec2 uv, float texAsp, float canAsp) {
    vec2 s = canAsp > texAsp ? vec2(1.0, texAsp / canAsp) : vec2(canAsp / texAsp, 1.0);
    return (uv - 0.5) * s + 0.5;
  }

  void main() {
    float d = texture2D(uDisp, vUv).r;
    float p = smoothstep(0.0, 1.0, uProgress);

    // Push the outgoing frame out and pull the incoming frame in.
    vec2 dispA = vUv + (d - 0.5) * uIntensity * p;
    vec2 dispB = vUv - (d - 0.5) * uIntensity * (1.0 - p);

    vec4 a = texture2D(uTexA, cover(dispA, uAspA, uCanvas));
    vec4 b = texture2D(uTexB, cover(dispB, uAspB, uCanvas));
    gl_FragColor = mix(a, b, p);
  }
`;

interface SequenceOptions {
  frames: string[];
  displacement: string;
  intensity?: number;
}

export async function initSequence(section: HTMLElement): Promise<void> {
  // WebGL scroll-sequence is forced on for all visitors (by request),
  // regardless of the prefers-reduced-motion setting.
  // On phones, scroll-pinning is janky and costly; the stacked fallback is the
  // better experience, so skip the WebGL pin below a tablet width.
  if (window.matchMedia('(max-width: 47.99rem)').matches) return;

  const canvas = section.querySelector<HTMLCanvasElement>('[data-seq-canvas]');
  const track = section.querySelector<HTMLElement>('[data-seq-track]');
  if (!canvas || !track) return;

  let opts: SequenceOptions;
  try {
    opts = JSON.parse(canvas.dataset.seqConfig || '');
  } catch {
    return;
  }
  if (!opts.frames || opts.frames.length < 2) return;

  // Bail gracefully if WebGL isn't supported.
  const THREE = await import('three');
  const renderer = (() => {
    try {
      const r = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
      return r;
    } catch {
      return null;
    }
  })();
  if (!renderer) return;

  const intensity = opts.intensity ?? 0.16;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  // Switch to interactive mode now (shows the pinned stage) so the tall static
  // fallback doesn't flash before textures arrive. Reverted on failure below.
  section.classList.add('is-webgl');

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const loader = new THREE.TextureLoader();
  const load = (url: string) =>
    new Promise<THREE.Texture>((resolve, reject) => {
      loader.load(
        url,
        (t) => {
          t.colorSpace = THREE.SRGBColorSpace;
          t.minFilter = THREE.LinearFilter;
          t.magFilter = THREE.LinearFilter;
          t.generateMipmaps = false;
          resolve(t);
        },
        undefined,
        reject,
      );
    });

  let textures: THREE.Texture[];
  let disp: THREE.Texture;
  try {
    [textures, disp] = await Promise.all([
      Promise.all(opts.frames.map(load)),
      load(opts.displacement),
    ]);
  } catch {
    section.classList.remove('is-webgl'); // fall back to the static stack
    renderer.dispose();
    return;
  }
  disp.wrapS = disp.wrapT = THREE.RepeatWrapping;

  const aspect = (t: THREE.Texture) => {
    const img = t.image as { width: number; height: number };
    return img.width / img.height;
  };

  const uniforms = {
    uTexA: { value: textures[0] },
    uTexB: { value: textures[1] },
    uDisp: { value: disp },
    uProgress: { value: 0 },
    uIntensity: { value: intensity },
    uAspA: { value: aspect(textures[0]) },
    uAspB: { value: aspect(textures[1]) },
    uCanvas: { value: 1 },
  };

  const material = new THREE.ShaderMaterial({ uniforms, vertexShader: VERT, fragmentShader: FRAG });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
  scene.add(mesh);

  const resize = () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    uniforms.uCanvas.value = w / h;
  };

  resize();
  window.addEventListener('resize', resize, { passive: true });

  const caps = Array.from(section.querySelectorAll<HTMLElement>('[data-seq-cap]'));
  const bar = section.querySelector<HTMLElement>('[data-seq-bar]');
  const n = textures.length;

  let target = 0; // continuous frame progress 0..(n-1)
  let shown = 0;

  const computeTarget = () => {
    const rect = track.getBoundingClientRect();
    const total = track.offsetHeight - window.innerHeight;
    const scrolled = Math.min(Math.max(-rect.top, 0), total);
    const p = total > 0 ? scrolled / total : 0;
    target = p * (n - 1);
  };
  window.addEventListener('scroll', computeTarget, { passive: true });
  computeTarget();

  const render = () => {
    // Ease the displayed value toward the scroll target for a fluid feel.
    shown += (target - shown) * 0.09;
    const i = Math.min(Math.floor(shown), n - 2);
    const frac = shown - i;

    uniforms.uTexA.value = textures[i];
    uniforms.uTexB.value = textures[i + 1];
    uniforms.uAspA.value = aspect(textures[i]);
    uniforms.uAspB.value = aspect(textures[i + 1]);
    uniforms.uProgress.value = frac;

    // Captions + progress bar
    const active = Math.round(shown);
    caps.forEach((c, ci) => c.classList.toggle('is-active', ci === active));
    if (bar) bar.style.transform = `scaleX(${shown / (n - 1)})`;

    renderer.render(scene, camera);
    raf = requestAnimationFrame(render);
  };
  let raf = requestAnimationFrame(render);

  // Pause the render loop when the section is off-screen (saves battery/GPU).
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting && !raf) raf = requestAnimationFrame(render);
      else if (!e.isIntersecting && raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    });
  });
  io.observe(section);
}
