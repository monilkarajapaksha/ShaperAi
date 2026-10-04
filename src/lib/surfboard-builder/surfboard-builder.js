// @ts-nocheck
/*
 * Ported from design-reference/surfboard-builder.js (Board Builder).
 * Changes vs. the original: three.js resolves through the npm package (bundled by Vite)
 * instead of an injected unpkg import map, and the design-tool export telemetry is removed.
 * Everything else — presets, parameters, geometry, blueprints, save flow, API — is unchanged.
 */
/*
 * <surfboard-builder> — embeddable 3D surfboard configurator.
 * Drop-in: <script src="surfboard-builder.js"></script> then <surfboard-builder></surfboard-builder>.
 * Self-contained: injects the three.js import map (if the page has none), the 3D stage and all styles.
 * API reference: "Embed Guide.dc.html".
 */
(() => {
if (customElements.get('surfboard-builder')) return;
if (!document.querySelector('link[data-sb-font]')) {
  const l = document.createElement('link');
  l.rel = 'stylesheet'; l.dataset.sbFont = '';
  l.href = 'https://fonts.googleapis.com/css2?family=Archivo:wght@400;600;800&display=swap';
  document.head.appendChild(l);
}

// ---- 3D stage (bundled) ----
if (!customElements.get('three-d-stage')) {
// @ds-adherence-ignore -- omelette starter scaffold (raw elements/hex/px by design)
// Copied omelette starter. Re-running copy_starter_component with this kind overwrites this file with the latest version (page content is unaffected).
/* BEGIN USAGE */
/**
 * <three-d-stage> — 3D object viewer + exporter shell (three.js).
 *
 * The stage owns the whole scene: WebGL renderer, neutral studio lighting
 * with a soft ground shadow, orbit controls (drag to orbit, wheel to zoom,
 * right-drag to pan), a camera auto-framed to the object's bounds, resize
 * handling, and a download toolbar that exports the current object as
 * OBJ + MTL or GLB (binary glTF). FBX cannot be exported in the browser;
 * GLB is the interchange format every modern 3D tool imports.
 *
 * three.js loads through the page's import map. Include this EXACT pinned
 * map in <head>, before any module runs — versions and integrity hashes
 * stay together (same map the "3D object" skill mandates):
 *
 *   <script type="importmap">
 *   {
 *     "imports": {
 *       "three": "https://unpkg.com/three@0.184.0/build/three.module.js",
 *       "three/addons/controls/OrbitControls.js": "https://unpkg.com/three@0.184.0/examples/jsm/controls/OrbitControls.js",
 *       "three/addons/exporters/OBJExporter.js": "https://unpkg.com/three@0.184.0/examples/jsm/exporters/OBJExporter.js",
 *       "three/addons/exporters/GLTFExporter.js": "https://unpkg.com/three@0.184.0/examples/jsm/exporters/GLTFExporter.js"
 *     },
 *     "integrity": {
 *       "https://unpkg.com/three@0.184.0/build/three.module.js": "sha384-8FCZ1eVO6it4+pbec2aDtnTrwjWXZLJRC+MAGCIPDgsYnUrl/E0A2YlF8ioMKI/J",
 *       "https://unpkg.com/three@0.184.0/build/three.core.js": "sha384-dw2ooPewaEIrAgl6oFDBmmBWCE9oW9LxRGcfwZ0hLvEprzo202wXl7vCYHRlSnOT",
 *       "https://unpkg.com/three@0.184.0/examples/jsm/controls/OrbitControls.js": "sha384-4rziNxOBZKQ69i+w+f89KJ55TCYquwchVbByQwmaOeIOXdOU2PLDn3kOfXHwIJC9",
 *       "https://unpkg.com/three@0.184.0/examples/jsm/exporters/OBJExporter.js": "sha384-nbwtoZENJD3Vq+ACK0CuGQdPMuDWHkamC2KJD70EV5nfg6jQjfppKOea07YJN+N3",
 *       "https://unpkg.com/three@0.184.0/examples/jsm/exporters/GLTFExporter.js": "sha384-VofkvpG6HERhFCYbsUOHeNXBCqID2nfqkQqnVzE1jc/oPcz+qJ13ADdXH08hE+cQ"
 *     }
 *   }
 *   </script>
 *
 * Usage:
 *   <style>three-d-stage:not(:defined){visibility:hidden}</style>
 *   <three-d-stage name="rocket"></three-d-stage>
 *   <script src="three-d-stage.js"></script>
 *   <script type="module">
 *     const stage = document.querySelector('three-d-stage');
 *     const { THREE } = await stage.ready;
 *     const model = new THREE.Group();
 *     // …build the model out of named meshes with named materials —
 *     // the names become the o / usemtl entries in the exported OBJ…
 *     stage.setObject(model);
 *   </script>
 *
 * Attributes:
 *   name       — export file basename (default "model")
 *   background — CSS color behind the scene (default a warm paper tone)
 *   autorotate — when present, a slow turntable until the user interacts
 *
 * Model in real-world meters, centered on the origin, y-up — exports
 * inherit the scene's units and orientation. The stage fills its own box;
 * size it with ordinary CSS (default 100vw/100vh page hero).
 *
 * Default setup: neutral studio lighting (hemisphere + key + fill), a
 * soft ground shadow, and NO environment map — so high metalness has
 * nothing to reflect and renders near-black. Cap metalness around
 * 0.3–0.4 and carry a metal look with a brighter base color. The copied
 * file is yours: adjust the lights, shadow, or background in _boot()
 * when the object needs a different look.
 */
/* END USAGE */

(() => {
  const stylesheet = `
    :host {
      position: relative;
      display: block;
      width: 100%;
      height: 100vh;
      background: var(--stage-bg, #f0eee6);
      overflow: hidden;
    }
    canvas { display: block; outline: none; }
    .toolbar {
      position: absolute;
      right: 16px;
      bottom: 16px;
      display: flex;
      gap: 8px;
      font-family: inherit;
    }
    .toolbar button {
      appearance: none;
      border: 1px solid var(--color-divider, rgba(20, 20, 19, 0.4));
      border-radius: 0;
      background: var(--color-bg, #fff);
      color: var(--color-text, #1a1915);
      font-family: inherit;
      font-size: 13px;
      font-weight: 800;
      line-height: 1;
      padding: 9px 12px;
      cursor: default;
    }
    .toolbar button:hover { background: var(--color-accent, #ec3013); color: var(--color-bg, #fff); border-color: var(--color-accent, #ec3013); }
    .toolbar button:active { background: var(--color-accent-700, #ae1800); }
    .toolbar button:focus-visible { outline: 2px solid var(--color-accent, #ec3013); outline-offset: 2px; }
    .toolbar button[disabled] { opacity: 0.5; pointer-events: none; }
    .note {
      position: absolute;
      left: 16px;
      bottom: 16px;
      max-width: 60%;
      font-size: 12px;
      line-height: 1.5;
      font-family: inherit;
      color: var(--color-neutral-700, rgba(26, 25, 21, 0.55));
      user-select: none;
    }
    .err {
      position: absolute;
      inset: 0;
      display: none;
      align-items: center;
      justify-content: center;
      padding: 24px;
      font: 500 14px/1.6 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #8a2f20;
      text-align: center;
      white-space: pre-line;
    }
  `;

  function download(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }

  function notifyExport() {}

  class ThreeDStage extends HTMLElement {
    constructor() {
      super();
      const root = this.attachShadow({ mode: 'open' });
      const style = document.createElement('style');
      style.textContent = stylesheet;
      root.appendChild(style);
      this._err = document.createElement('div');
      this._err.className = 'err';
      root.appendChild(this._err);
      const note = document.createElement('div');
      note.className = 'note';
      note.textContent = 'Drag to orbit · scroll to zoom · right-drag to pan';
      root.appendChild(note);
      this._toolbar = document.createElement('div');
      this._toolbar.className = 'toolbar';
      this._objBtn = document.createElement('button');
      this._objBtn.type = 'button';
      this._objBtn.textContent = 'Download OBJ + MTL';
      this._objBtn.addEventListener('click', () => this._runExport('obj'));
      this._glbBtn = document.createElement('button');
      this._glbBtn.type = 'button';
      this._glbBtn.textContent = 'Download GLB';
      this._glbBtn.addEventListener('click', () => this._runExport('glb'));
      this._toolbar.appendChild(this._objBtn);
      this._toolbar.appendChild(this._glbBtn);
      root.appendChild(this._toolbar);
      this._setButtonsEnabled(false);
      /** Resolves with { THREE } once the scene is live — build the model
       *  in `await stage.ready` so nothing races the library load. */
      this.ready = new Promise((resolve, reject) => {
        this._readyResolve = resolve;
        this._readyReject = reject;
      });
    }

    connectedCallback() {
      if (this._booted) {
        // Re-attached after a removal — resume what disconnected stopped.
        if (this._renderer) {
          this._renderer.setAnimationLoop(this._loop);
          this._ro && this._ro.observe(this);
        }
        return;
      }
      this._booted = true;
      this._boot().catch((err) => {
        this._err.style.display = 'flex';
        this._err.textContent =
          'three.js failed to load.\n' +
          'Check that the pinned <script type="importmap"> from the usage ' +
          'notes is in <head> before any module script.\n\n' +
          String(err && err.message ? err.message : err);
        this._readyReject(err);
      });
    }

    async _boot() {
      const bg = this.getAttribute('background');
      if (bg) this.style.setProperty('--stage-bg', bg);
      const [THREE, controlsMod] = await Promise.all([
        import('three'),
        import('three/addons/controls/OrbitControls.js'),
      ]);
      this._THREE = THREE;
      // preserveDrawingBuffer keeps the last frame readable after
      // compositing (toDataURL / drawImage) — it's what lets the
      // screenshot tools capture the scene instead of a blank canvas.
      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        preserveDrawingBuffer: true,
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      this._renderer = renderer;
      this.shadowRoot.insertBefore(renderer.domElement, this._err);

      const scene = new THREE.Scene();
      this._scene = scene;

      const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 500);
      camera.position.set(3, 2.2, 4);
      this._camera = camera;

      const controls = new controlsMod.OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      this._controls = controls;

      // Neutral studio: soft sky/ground wash, a shadow-casting key light,
      // and a dim fill from behind so silhouettes never go black.
      scene.add(new THREE.HemisphereLight(0xffffff, 0xd8d2c4, 1.0));
      const key = new THREE.DirectionalLight(0xffffff, 2.2);
      key.position.set(4, 7, 5);
      key.castShadow = true;
      key.shadow.mapSize.set(2048, 2048);
      key.shadow.bias = -0.0002;
      this._key = key;
      scene.add(key);
      const fill = new THREE.DirectionalLight(0xfff4e6, 0.5);
      fill.position.set(-5, 3, -4);
      scene.add(fill);

      const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(200, 200),
        new THREE.ShadowMaterial({ opacity: 0.18 })
      );
      ground.rotation.x = -Math.PI / 2;
      ground.receiveShadow = true;
      this._ground = ground;
      scene.add(ground);

      this._autorotate = this.hasAttribute('autorotate');
      controls.autoRotate = this._autorotate;
      controls.autoRotateSpeed = 1.2;
      controls.addEventListener('start', () => {
        controls.autoRotate = false;
      });

      const fit = () => {
        const w = this.clientWidth || 1;
        const h = this.clientHeight || 1;
        renderer.setSize(w, h);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      };
      fit();
      this._ro = new ResizeObserver(fit);
      this._loop = () => {
        controls.update();
        renderer.render(scene, camera);
      };
      // Detached while three.js was fetching? Stay idle — the
      // connectedCallback resume starts the loop and observer on
      // reattach.
      if (this.isConnected) {
        this._ro.observe(this);
        renderer.setAnimationLoop(this._loop);
      }

      this._readyResolve({ THREE });
    }

    disconnectedCallback() {
      // Stop rendering and observing while detached; connectedCallback
      // resumes both. (The renderer itself is kept — a move within the
      // document must not rebuild the scene.)
      if (this._renderer) this._renderer.setAnimationLoop(null);
      if (this._ro) this._ro.disconnect();
    }

    /** Show (and own) the object. Replaces any previous object, enables
     *  shadows on every mesh, rests it on the ground plane, and frames
     *  the camera to its bounds. */
    setObject(object, opts = {}) {
      const THREE = this._THREE;
      if (!THREE) throw new Error('three-d-stage: not ready — await stage.ready first');
      if (this._object) this._scene.remove(this._object);
      this._object = object;
      object.traverse((o) => {
        if (o.isMesh) {
          o.castShadow = true;
          o.receiveShadow = true;
        }
      });
      const box = new THREE.Box3().setFromObject(object);
      if (!box.isEmpty()) {
        // Rest the object on the ground without moving its origin.
        this._ground.position.y = box.min.y;
        const sphere = box.getBoundingSphere(new THREE.Sphere());
        if (!opts.keepView) {
        const dist =
          (sphere.radius / Math.tan((this._camera.fov * Math.PI) / 360)) * 1.35;
        const dir = new THREE.Vector3(1, 0.55, 1.25).normalize();
        this._camera.position
          .copy(sphere.center)
          .add(dir.multiplyScalar(dist));
        this._camera.near = Math.max(dist / 100, 0.01);
        this._camera.far = dist * 100;
        this._camera.updateProjectionMatrix();
        this._controls.target.copy(sphere.center);
        this._controls.update();
        }
        const span = sphere.radius * 3;
        this._key.shadow.camera.left = -span;
        this._key.shadow.camera.right = span;
        this._key.shadow.camera.top = span;
        this._key.shadow.camera.bottom = -span;
        this._key.shadow.camera.updateProjectionMatrix();
      }
      this._scene.add(object);
      this._setButtonsEnabled(true);
    }

    get _basename() {
      return (this.getAttribute('name') || 'model').replace(/[^\w.-]+/g, '_');
    }

    _setButtonsEnabled(on) {
      this._objBtn.disabled = !on;
      this._glbBtn.disabled = !on;
    }

    /** Every mesh and material needs a unique name for o/usemtl lines —
     *  fill in stable fallbacks, and return the unique material list. */
    _nameParts() {
      const mats = [];
      const seen = new Set();
      let meshI = 0;
      let matI = 0;
      this._object.traverse((o) => {
        if (!o.isMesh) return;
        if (!o.name) o.name = 'part_' + meshI;
        meshI += 1;
        const list = Array.isArray(o.material) ? o.material : [o.material];
        for (const m of list) {
          if (!m || mats.includes(m)) continue;
          if (!m.name) {
            m.name = 'mat_' + matI;
            matI += 1;
          }
          while (seen.has(m.name)) {
            m.name = m.name + '_' + matI;
            matI += 1;
          }
          seen.add(m.name);
          mats.push(m);
        }
      });
      return mats;
    }

    /** One export attempt, reported to the host however it settles.
     *  Rethrows so a failure stays visible on the guest console exactly as
     *  before. The no-object early return is not an attempt (the toolbar is
     *  disabled until the model loads) and reports nothing. */
    async _runExport(format) {
      if (!this._object) return;
      try {
        await (format === 'obj' ? this._exportObj() : this._exportGlb());
        notifyExport(format, true);
      } catch (err) {
        notifyExport(format, false);
        throw err;
      }
    }

    async _exportObj() {
      if (!this._object) return;
      const mod = await import('three/addons/exporters/OBJExporter.js');
      const mats = this._nameParts();
      const base = this._basename;
      const obj =
        'mtllib ' + base + '.mtl\n' + new mod.OBJExporter().parse(this._object);
      let mtl = '# Exported by three-d-stage\n';
      for (const m of mats) {
        const c = m.color || { r: 0.8, g: 0.8, b: 0.8 };
        const rough = typeof m.roughness === 'number' ? m.roughness : 0.5;
        const opacity = typeof m.opacity === 'number' ? m.opacity : 1;
        mtl += 'newmtl ' + m.name + '\n';
        mtl +=
          'Kd ' + c.r.toFixed(4) + ' ' + c.g.toFixed(4) + ' ' + c.b.toFixed(4) + '\n';
        mtl += 'Ks 0.2000 0.2000 0.2000\n';
        mtl += 'Ns ' + Math.round((1 - rough) * 200) + '\n';
        mtl += 'd ' + opacity.toFixed(4) + '\n\n';
      }
      download(new Blob([obj], { type: 'text/plain' }), base + '.obj');
      download(new Blob([mtl], { type: 'text/plain' }), base + '.mtl');
    }

    async _exportGlb() {
      if (!this._object) return;
      const mod = await import('three/addons/exporters/GLTFExporter.js');
      this._nameParts();
      const base = this._basename;
      const buf = await new mod.GLTFExporter().parseAsync(this._object, {
        binary: true,
      });
      download(
        new Blob([buf], { type: 'model/gltf-binary' }),
        base + '.glb'
      );
    }
  }

  customElements.define('three-d-stage', ThreeDStage);
})();

}

const CSS = "/* Modernist — design-system tokens and component classes. This file is the source of truth for the system's look; retune it here and see readme.md. */\n\n:host {\n  --color-bg: #f3f2f2;\n  --color-surface: #eae9e9;\n  --color-text: #201e1d;\n  --color-accent: #ec3013;\n  --color-accent-2: #e15b47;\n  --color-divider: color-mix(in srgb, #201e1d 40%, transparent);\n\n  /* Tonal ramps — generated in OKLCH on one shared lightness scale, so the\n     same step of any role matches the others in visual value. */\n  --color-neutral-100: #f8f4f4;\n  --color-neutral-200: #eae7e7;\n  --color-neutral-300: #d7d3d3;\n  --color-neutral-400: #bab6b6;\n  --color-neutral-500: #9b9797;\n  --color-neutral-600: #7d7979;\n  --color-neutral-700: #605d5d;\n  --color-neutral-800: #444141;\n  --color-neutral-900: #2d2b2b;\n\n  --color-accent-100: #fff2ef;\n  --color-accent-200: #ffe0d9;\n  --color-accent-300: #ffc4b8;\n  --color-accent-400: #ff9783;\n  --color-accent-500: #ff563c;\n  --color-accent-600: #dd2b0f;\n  --color-accent-700: #ae1800;\n  --color-accent-800: #7c1405;\n  --color-accent-900: #4d170e;\n\n  --color-accent-2-100: #fff2ef;\n  --color-accent-2-200: #ffe0da;\n  --color-accent-2-300: #ffc4b9;\n  --color-accent-2-400: #ff9784;\n  --color-accent-2-500: #ef6853;\n  --color-accent-2-600: #c94b39;\n  --color-accent-2-700: #9e3526;\n  --color-accent-2-800: #71261b;\n  --color-accent-2-900: #471d16;\n\n  --font-heading: \"Archivo\", system-ui, sans-serif;\n  --font-heading-weight: 800;\n  --font-body: \"Archivo\", system-ui, sans-serif;\n\n  --space-1: 4.0px;\n  --space-2: 8.0px;\n  --space-3: 12.0px;\n  --space-4: 16.0px;\n  --space-6: 24.0px;\n  --space-8: 32.0px;\n\n  --radius-sm: 0px;\n  --radius-md: 0px;\n  --radius-lg: 0px;\n\n  /* Elevation — derived from the ground: soft ink-tinted shadows on a\n     light theme, a hairline edge + ambient darkness on a dark one. */\n  --shadow-sm: 0 1px 2px color-mix(in srgb, #2d2b2b 14%, transparent);\n  --shadow-md: 0 3px 10px color-mix(in srgb, #2d2b2b 16%, transparent);\n  --shadow-lg: 0 12px 32px color-mix(in srgb, #2d2b2b 22%, transparent);\n}\n.sb {\n  background: var(--color-bg);\n  color: var(--color-text);\n  font-family: var(--font-body);\n}\nh1, h2, h3, h4 { font-family: var(--font-heading); font-weight: var(--font-heading-weight); }\n\n.grayscale{filter:grayscale(1) contrast(1.08)}\n\n/* ══════════════════════════════════════════════════════════════════════════\n   Components — built with the tokens above. Plain CSS\n   on plain HTML: no JavaScript, no build step. Each class is documented in\n   readme.md and demonstrated in foundations/ and components/.\n   ══════════════════════════════════════════════════════════════════════ */\n\n*, *::before, *::after { box-sizing: border-box; }\n.sb { margin: 0; font-size: 15px; line-height: 1.55; font-weight: 400; }\nh1, h2, h3, h4, h5, h6 {\n  font-family: var(--font-heading); font-weight: var(--font-heading-weight);\n  line-height: 1.12; letter-spacing: -0.015em; margin: 0 0 var(--space-2);\n}\nh1 { font-size: 42px; }\nh2 { font-size: 32px; }\nh3 { font-size: 25px; }\nh4 { font-size: 20px; }\nh5 { font-size: 16px; }\nh6 { font-size: 13px; }\nh6 { letter-spacing: 0.08em; text-transform: uppercase; }\np { margin: 0 0 var(--space-3); }\na { color: var(--color-accent); text-underline-offset: 3px; }\nimg { display: block; max-width: 100%; }\nfigure { margin: 0; }\nfigcaption {\n  font-size: 11px; margin-top: var(--space-1);\n  color: color-mix(in srgb, var(--color-text) 55%, transparent);\n}\n.text-muted { color: color-mix(in srgb, var(--color-text) 55%, transparent); }\n:focus { outline: none; }\n:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 2px; }\n::selection { background: color-mix(in srgb, var(--color-accent) 30%, transparent); }\n\n/* — rules — */\n.hr {\n  height: 2px; border: 0; margin: var(--space-4) 0;\n  background: var(--color-divider);\n}\n\n/* — buttons — */\n.btn {\n  display: inline-flex; align-items: center; justify-content: center; gap: 6px;\n  cursor: pointer; text-decoration: none;\n  font-family: var(--font-heading); font-weight: var(--font-heading-weight);\n  font-size: 14px; line-height: 1.2; color: var(--color-text); /* matches the .input's 14px —\n     the pair sits side by side in sign-up rows */\n  background: transparent; border: 1px solid transparent;\n  padding: var(--space-2) calc(var(--space-3) * 1.2);\n  border-radius: var(--radius-md);\n}\n.btn svg { display: block; }\n.btn:disabled { opacity: 0.45; cursor: not-allowed; }\n.btn-primary { background: var(--color-accent); color: var(--color-bg); }\n.btn-primary:hover { background: var(--color-accent-600); }\n.btn-primary:active { background: var(--color-accent-700); }\n.btn-secondary { border-color: var(--color-divider); }\n.btn-secondary:hover { background: color-mix(in srgb, var(--color-text) 7%, transparent); }\n.btn-secondary:active { background: color-mix(in srgb, var(--color-text) 14%, transparent); }\n.btn-ghost { color: var(--color-accent); padding-inline: var(--space-1); }\n.btn-ghost:hover { background: color-mix(in srgb, var(--color-accent) 10%, transparent); }\n.btn-ghost:active { background: color-mix(in srgb, var(--color-accent) 18%, transparent); }\n.btn-icon { width: 36px; height: 36px; padding: 0; }\n.btn-block { width: 100%; margin-top: var(--space-2); justify-content: flex-start; text-align: left; }\n\n/* — forms — */\n.field > label {\n  display: block; font-size: 12px; margin-bottom: 5px;\n  color: color-mix(in srgb, var(--color-text) 70%, transparent);\n}\n.input {\n  width: 100%; min-height: 36px; padding: 6px 10px; font: inherit;\n  font-size: 14px; color: var(--color-text); caret-color: var(--color-accent);\n  background: var(--color-surface);\n  border: 1px solid var(--color-divider); border-radius: var(--radius-md);\n}\n.input:hover { border-color: color-mix(in srgb, var(--color-text) 45%, transparent); }\n.input:focus-visible { border-color: var(--color-accent); outline-offset: 0; }\ntextarea.input { min-height: 90px; resize: vertical; }\n.radio { display: inline-flex; align-items: center; gap: 8px; cursor: pointer; font-size: 14px; }\n.radio input, .seg-opt input {\n  position: absolute; opacity: 0; width: 0; height: 0; pointer-events: none;\n}\n.radio .dot {\n  width: 16px; height: 16px; flex: none; border-radius: 50%;\n  border: 1.5px solid var(--color-divider);\n}\n.radio:hover .dot { border-color: var(--color-accent); }\n.radio input:checked + .dot {\n  border-color: var(--color-accent); background: var(--color-accent);\n  box-shadow: inset 0 0 0 4px var(--color-bg);\n}\n.radio input:focus-visible + .dot { outline: 2px solid var(--color-accent); outline-offset: 2px; }\n.seg {\n  display: inline-flex; overflow: hidden;\n  border: 1px solid var(--color-divider); border-radius: var(--radius-md);\n}\n.seg-opt {\n  display: inline-flex; align-items: center; gap: 6px;\n  padding: 7px 12px; font-size: 13px; cursor: pointer;\n}\n.seg-opt + .seg-opt { border-left: 1px solid var(--color-divider); }\n.seg-opt:has(input:checked) { background: var(--color-accent); color: var(--color-bg); }\n.seg-opt:not(:has(input:checked)):hover { background: color-mix(in srgb, var(--color-text) 7%, transparent); }\n.seg-opt:has(input:focus-visible) { outline: 2px solid var(--color-accent); outline-offset: -2px; }\n\n/* — cards — */\n.card {\n  display: flex; flex-direction: column; gap: var(--space-2);\n  padding: var(--space-3); border-radius: var(--radius-md); background: var(--color-surface);\n}\n.card-kicker { font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--color-accent); }\n.card-title {\n  font-family: var(--font-heading); font-weight: var(--font-heading-weight);\n  font-size: 17px; line-height: 1.2;\n}\n.card-body { margin: 0; font-size: 13px; opacity: 0.8; flex: 1; }\n.card-meta {\n  display: flex; align-items: center; gap: 6px; font-size: 11px;\n  color: color-mix(in srgb, var(--color-text) 50%, transparent);\n}\n.elev-sm { box-shadow: var(--shadow-sm); }\n.elev-md { box-shadow: var(--shadow-md); }\n.elev-lg { box-shadow: var(--shadow-lg); }\n\n/* — tags — */\n.tag {\n  display: inline-flex; align-items: center; font-size: 11px;\n  letter-spacing: 0.02em; padding: 3px 10px;\n  border-radius: calc(var(--radius-md) * 0.75);\n}\n.tag-accent { background: var(--color-accent-100); color: var(--color-accent-800); }\n.tag-accent-2 { background: var(--color-accent-2-100); color: var(--color-accent-2-800); }\n.tag-neutral { background: var(--color-neutral-100); color: var(--color-neutral-800); }\n.tag-outline { border: 1px solid var(--color-accent); color: var(--color-accent); }\n\n/* — navigation — */\n.nav {\n  display: flex; align-items: center; gap: var(--space-4);\n  padding: var(--space-3) var(--space-4);\n  border-bottom: 2px solid var(--color-divider);\n}\n.nav-brand {\n  font-family: var(--font-heading); font-weight: var(--font-heading-weight);\n  font-size: 18px; margin-right: auto;\n}\n.nav a { color: inherit; text-decoration: none; font-size: 14px; }\n.nav a:hover, .nav a[aria-current='page'] { color: var(--color-accent); }\n\n/* — tables — */\n.table { width: 100%; border-collapse: collapse; font-size: 14px; }\n.table th {\n  text-align: left; font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase;\n  color: color-mix(in srgb, var(--color-text) 60%, transparent);\n  padding: var(--space-2); border-bottom: 2px solid var(--color-divider);\n}\n.table td {\n  padding: var(--space-2);\n  border-bottom: 1px solid var(--color-divider);\n}\n.table tbody tr:hover { background: color-mix(in srgb, var(--color-text) 4%, transparent); }\n\n/* — dialog — */\n.dialog-backdrop {\n  position: fixed; inset: 0; display: grid; place-items: center;\n  padding: var(--space-4);\n  background: color-mix(in srgb, var(--color-neutral-900) 50%, transparent);\n}\n.dialog {\n  width: min(440px, 100%); display: flex; flex-direction: column; gap: var(--space-3);\n  padding: var(--space-4); border-radius: var(--radius-lg);\n  background: var(--color-surface); box-shadow: var(--shadow-lg);\n}\n.dialog-title {\n  font-family: var(--font-heading); font-weight: var(--font-heading-weight);\n  font-size: 20px;\n}\n.dialog-body { font-size: 14px; opacity: 0.85; }\n.dialog-actions { display: flex; justify-content: flex-end; gap: var(--space-2); margin-top: var(--space-2); }\n\n\n\n  three-d-stage:not(:defined){visibility:hidden}\n  a{color:var(--color-accent)} a:hover{color:var(--color-accent-600)}\n  .nav{gap:var(--space-6);flex-wrap:wrap}\n  .nav-brand{display:flex;align-items:baseline;gap:var(--space-3)}\n  .nav-brand small{font-weight:400;font-size:13px;color:var(--color-neutral-700)}\n  .sum{display:flex;align-items:baseline;gap:var(--space-4);font-variant-numeric:tabular-nums}\n  .sum .dims{font-weight:800;font-size:18px;letter-spacing:-0.01em}\n  .sum .vol{font-weight:800;font-size:18px;color:var(--color-accent)}\n  .sum .lbl{font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--color-neutral-700)}\n  main{display:grid;grid-template-columns:360px minmax(0,1fr);min-height:0}\n  aside{overflow-y:auto;border-right:2px solid var(--color-divider);min-height:0}\n  .grp{padding:var(--space-4);border-bottom:2px solid var(--color-divider);display:flex;flex-direction:column;gap:var(--space-3)}\n  .grp h6{margin:0;color:var(--color-neutral-800)}\n  .types{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));border-top:1px solid var(--color-divider);border-left:1px solid var(--color-divider)}\n  .type{appearance:none;font:inherit;text-align:left;background:transparent;color:var(--color-text);border:0;border-right:1px solid var(--color-divider);border-bottom:1px solid var(--color-divider);padding:10px 10px 9px;cursor:pointer;display:flex;flex-direction:column;gap:2px;min-height:56px}\n  .type b{font-weight:800;font-size:13px;line-height:1.15}\n  .type span{font-size:11px;color:var(--color-neutral-700);font-variant-numeric:tabular-nums}\n  .type:hover{background:color-mix(in srgb,var(--color-text) 7%,transparent)}\n  .type[aria-pressed=\"true\"]{background:var(--color-accent);color:var(--color-bg)}\n  .type[aria-pressed=\"true\"] span{color:var(--color-accent-100)}\n  .type:active{background:var(--color-accent-700);color:var(--color-bg)}\n  .ctl{display:flex;flex-direction:column;gap:2px}\n  .ctl .row{display:flex;justify-content:space-between;align-items:baseline;gap:var(--space-2);font-size:13px}\n  .ctl .row output{font-weight:800;font-variant-numeric:tabular-nums}\n  .ctl[hidden]{display:none}\n  input[type=range]{-webkit-appearance:none;appearance:none;width:100%;height:20px;background:transparent;margin:0;cursor:pointer;--p:50%}\n  input[type=range]::-webkit-slider-runnable-track{height:2px;background:linear-gradient(to right,var(--color-accent) var(--p),var(--color-divider) var(--p))}\n  input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:12px;height:12px;margin-top:-5px;background:var(--color-text);border:0;border-radius:0}\n  input[type=range]:hover::-webkit-slider-thumb{background:var(--color-accent)}\n  input[type=range]:active::-webkit-slider-thumb{background:var(--color-accent-700)}\n  input[type=range]::-moz-range-track{height:2px;background:var(--color-divider)}\n  input[type=range]::-moz-range-progress{height:2px;background:var(--color-accent)}\n  input[type=range]::-moz-range-thumb{width:12px;height:12px;background:var(--color-text);border:0;border-radius:0}\n  input[type=range]:focus-visible{outline:2px solid var(--color-accent);outline-offset:2px}\n  .seg{display:flex;width:100%}\n  .seg .seg-opt{flex:1;justify-content:flex-start;padding:7px 10px}\n  .seg-opt input{position:absolute;opacity:0}\n  select.input{appearance:none;cursor:pointer;background-image:linear-gradient(45deg,transparent 50%,var(--color-text) 50%),linear-gradient(135deg,var(--color-text) 50%,transparent 50%);background-position:calc(100% - 16px) 50%,calc(100% - 11px) 50%;background-size:5px 5px;background-repeat:no-repeat}\n  .sws{display:flex;gap:6px;flex-wrap:wrap}\n  .sw{width:28px;height:28px;border:1px solid var(--color-divider);cursor:pointer;padding:0}\n  .sw:hover{outline:2px solid var(--color-accent-300);outline-offset:1px}\n  .sw[aria-pressed=\"true\"]{outline:2px solid var(--color-text);outline-offset:2px}\n  .sw:focus-visible{outline:2px solid var(--color-accent);outline-offset:2px}\n  .two{display:grid;grid-template-columns:1fr 1fr;gap:var(--space-3)}\n  .view{display:grid;grid-template-rows:minmax(0,1fr) clamp(200px,30vh,280px);min-height:0;min-width:0}\n  three-d-stage{height:100%;width:100%}\n  .bp{display:grid;grid-template-columns:1.35fr 1.35fr 1fr;border-top:2px solid var(--color-divider);min-height:0;background:var(--color-bg)}\n  .bp > div{display:flex;flex-direction:column;min-width:0;min-height:0;padding:var(--space-3) var(--space-4) var(--space-2)}\n  .bp > div + div{border-left:2px solid var(--color-divider)}\n  .bp h6{margin:0 0 var(--space-1);display:flex;justify-content:space-between;gap:8px;color:var(--color-neutral-800)}\n  .bp h6 em{font-style:normal;font-weight:400;letter-spacing:.04em;text-transform:none;color:var(--color-neutral-700)}\n  .bp svg{flex:1;min-height:0;width:100%;display:block;font-family:var(--font-body)}\n  @container sb (max-width: 1280px){\n    main{grid-template-columns:320px minmax(0,1fr)}\n    .view{grid-template-rows:minmax(0,1fr) clamp(300px,42vh,400px)}\n    .bp{grid-template-columns:1.4fr 1fr;grid-template-rows:1fr 1fr}\n    .bp > div:nth-child(2){grid-column:1 / -1;grid-row:2;border-left:0;border-top:2px solid var(--color-divider)}\n    .bp > div:nth-child(3){grid-row:1;grid-column:2}\n  }\n  @container sb (max-width: 720px){\n    .sb{overflow:auto;display:block}\n    main{grid-template-columns:1fr}\n    aside{border-right:0;overflow:visible;order:2}\n    .view{grid-template-rows:420px auto}\n    .bp{grid-template-columns:1fr;grid-template-rows:none}\n    .bp > div{grid-column:auto !important;grid-row:auto !important}\n    .bp > div{height:220px}\n    .bp > div + div{border-left:0;border-top:2px solid var(--color-divider)}\n  }\n\n:host{display:block;position:relative;height:640px;container:sb/inline-size;font-family:var(--font-body);color:var(--color-text);text-align:left;line-height:1.55;font-size:15px}\n.sb{height:100%;display:grid;grid-template-rows:auto minmax(0,1fr);overflow:hidden;background:var(--color-bg)}\n.actions{display:flex;align-items:center;gap:var(--space-3);flex-wrap:nowrap}\n.actions .btn{white-space:nowrap}\n.nav{row-gap:var(--space-2)}\n@container sb (max-width: 1100px){.nav{gap:var(--space-4)}.sum .lbl{display:none}}\n.status{font-size:12px;color:var(--color-neutral-700);font-variant-numeric:tabular-nums}\n.status[data-state=\"saved\"]{color:var(--color-text);font-weight:600}\n.status[data-state=\"error\"]{color:var(--color-accent-700);font-weight:600}\n:host([hide~=\"header\"]) .nav{display:none}\n:host([hide~=\"controls\"]) main{grid-template-columns:minmax(0,1fr)}\n:host([hide~=\"controls\"]) aside{display:none}\n:host([hide~=\"presets\"]) .grp-types{display:none}\n:host([hide~=\"blueprints\"]) .view{grid-template-rows:minmax(0,1fr)}\n:host([hide~=\"blueprints\"]) .bp{display:none}\n:host([hide~=\"save\"]) #save, :host([hide~=\"save\"]) .status{display:none}\n:host([hide~=\"units\"]) .units{display:none}\n:host([hide~=\"reset\"]) #reset{display:none}\n";
const MARKUP = "<header class=\"nav\">\n  <div class=\"nav-brand\">Board Builder <small id=\"type-name\">Shortboard</small></div>\n  <div class=\"sum\">\n    <span class=\"lbl\">Dims</span><span class=\"dims\" id=\"sum-dims\">—</span>\n    <span class=\"lbl\">Volume</span><span class=\"vol\" id=\"sum-vol\">—</span>\n  </div>\n  <div class=\"seg units\" style=\"width:auto\" role=\"radiogroup\" aria-label=\"Units\">\n    <label class=\"seg-opt\"><input type=\"radio\" name=\"units\" value=\"imperial\" checked>Ft / in</label>\n    <label class=\"seg-opt\"><input type=\"radio\" name=\"units\" value=\"metric\">Metric</label>\n  </div>\n  <div class=\"actions\">\n    <button class=\"btn btn-secondary\" id=\"reset\" type=\"button\">Reset to preset</button>\n    <span class=\"status\" id=\"status\" role=\"status\" aria-live=\"polite\"></span>\n    <button class=\"btn btn-primary\" id=\"save\" type=\"button\">Save design</button>\n  </div>\n</header>\n<main>\n  <aside id=\"controls\">\n    <section class=\"grp grp-types\"><h6>Board type</h6><div class=\"types\" id=\"types\"></div></section>\n  </aside>\n  <div class=\"view\">\n    <three-d-stage name=\"surfboard\" background=\"#eae9e9\"></three-d-stage>\n    <div class=\"bp\">\n      <div><h6>Outline <em>Plan view · nose right</em></h6><svg id=\"bp-outline\"></svg></div>\n      <div><h6>Rocker <em>Side view · true scale</em></h6><svg id=\"bp-rocker\"></svg></div>\n      <div><h6>Sections <em>Cross-section</em></h6><svg id=\"bp-section\"></svg></div>\n    </div>\n  </div>\n</main>";

function createBuilder(host, root, stage, THREE) {
  const IN = 0.0254;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const $ = (s) => root.querySelector(s);

  // ---------- presets (inches where dimensional) ----------
  const INCH_KEYS = ['L','W','T','NW','TW','WP','NR','TR','TD','conc','dconc','vee','chan','FD'];
  const BASE = { TD: 3, dconc: 0, chan: 0, cant: 5, toe: 1.5, stringer: true, plug: true, nthin: 0.4, tthin: 0.55, finish: 'gloss' };
  const TYPES = [
    ['shortboard','Shortboard',{L:70,W:19,T:2.4375,NW:11.5,TW:14.25,WP:-1,NB:.62,NR:5,TR:2.3,tail:'squash',rail:.4,hard:.6,dome:.55,conc:.15,dconc:.08,vee:.06,fins:'thruster',FD:4.5,cant:6,toe:2,nthin:.36,tthin:.5}],
    ['fish','Fish',{L:66,W:21,T:2.5,NW:14,TW:16,WP:1,NB:.5,NR:3.6,TR:1.6,tail:'swallow',TD:4.5,rail:.45,hard:.5,dome:.45,conc:.1,vee:.06,fins:'twin',FD:4.8,cant:4}],
    ['hybrid','Hybrid / Fun',{L:84,W:21.5,T:2.75,NW:15.5,TW:15,WP:0,NB:.5,NR:4.5,TR:2.2,tail:'squash',rail:.45,hard:.45,dome:.55,conc:.12,dconc:.05,vee:.05,fins:'thruster',FD:4.6,toe:2}],
    ['longboard','Longboard',{L:110,W:22.75,T:3,NW:18,TW:15,WP:0,NB:.42,NR:4.8,TR:2.6,tail:'square',rail:.5,hard:.25,dome:.5,conc:.15,vee:.1,fins:'single',FD:9,cant:0,toe:0,nthin:.45}],
    ['minimal','Mini-mal',{L:90,W:22,T:2.875,NW:17,TW:14.5,WP:0,NB:.45,NR:4.6,TR:2.4,tail:'round',rail:.45,hard:.35,dome:.5,conc:.1,vee:.06,fins:'twoplus1',FD:7,cant:4}],
    ['gun','Gun / Step-up',{L:88,W:19.5,T:2.875,NW:11,TW:12,WP:1.5,NB:.82,NR:5.4,TR:2.8,tail:'pin',rail:.4,hard:.6,dome:.6,conc:.08,vee:.12,fins:'thruster',FD:4.8,nthin:.34,tthin:.45}],
    ['groveler','Groveler',{L:64,W:20.5,T:2.5,NW:14,TW:15.5,WP:.5,NB:.45,NR:3.5,TR:1.5,tail:'squash',rail:.45,hard:.55,dome:.5,conc:.18,dconc:.1,vee:.04,fins:'quad',FD:4.2,cant:6,toe:2}],
    ['egg','Egg',{L:76,W:21.5,T:2.75,NW:15.5,TW:15,WP:0,NB:.42,NR:4,TR:2,tail:'round',rail:.5,hard:.2,dome:.6,conc:.06,vee:.04,fins:'twoplus1',FD:6.5,cant:4}],
    ['softtop','Soft-top',{L:96,W:23,T:3.25,NW:18,TW:16.5,WP:0,NB:.4,NR:4,TR:1.8,tail:'square',rail:.5,hard:.1,dome:.3,conc:0,vee:0,fins:'thruster',FD:4.5,stringer:false,nthin:.5,tthin:.6,finish:'foam'}],
    ['sup','SUP',{L:126,W:32,T:4.5,NW:25,TW:24,WP:0,NB:.38,NR:5,TR:1.5,tail:'square',rail:.5,hard:.4,dome:.25,conc:0,vee:.15,fins:'twoplus1',FD:9,cant:3,toe:1,stringer:false,nthin:.5,tthin:.6,finish:'satin'}],
    ['bodyboard','Bodyboard',{L:42,W:21.5,T:2.5,NW:19.3,TW:17.5,WP:0,NB:.35,NR:1.2,TR:.4,tail:'crescent',TD:2.5,rail:.4,hard:.75,dome:.1,conc:0,vee:0,chan:.12,fins:'none',FD:4,stringer:false,nthin:.85,tthin:.8,finish:'foam'}],
    ['skim','Skimboard',{L:48,W:20.5,T:.55,NW:16.5,TW:15.5,WP:-1,NB:.45,NR:1.4,TR:.6,tail:'round',rail:.5,hard:.3,dome:0,conc:0,vee:0,fins:'none',FD:4,stringer:false,plug:false,nthin:.8,tthin:.8}],
  ];
  const TAILS = {
    squash:   { name:'Squash',      e:.8,  b:.8,  xs:(t)=>0.03*t**4 },
    square:   { name:'Square',      e:.88, b:.9,  xs:(t)=>0.004*t**10 },
    swallow:  { name:'Swallow',     e:.9,  b:.85, xs:(t,D)=>D*(1-t), depth:true },
    diamond:  { name:'Diamond',     e:.6,  b:.8,  xs:(t,D)=>D*t, depth:true },
    crescent: { name:'Crescent',    e:.85, b:.8,  xs:(t,D)=>D*(1-t*t), depth:true },
    round:    { name:'Round',       e:0,   b:.5 },
    roundpin: { name:'Rounded pin', e:0,   b:.62 },
    pin:      { name:'Pin',         e:0,   b:.85 },
  };
  const FINSETS = { none:['None',0], single:['Single',9], twin:['Twin keel',5], thruster:['Thruster',4.5], quad:['Quad',4.3], twoplus1:['2 + 1',7.5], five:['5-fin',4.5] };
  const RAILS = [['.5','50/50'],['.4','60/40'],['.3','70/30'],['.2','80/20']];
  const FINISHES = [['gloss','Gloss'],['satin','Satin'],['foam','Foam deck']];
  const BOARD_COLORS = [['#f4f2ee','Clear white'],['#d8c7a6','Sand'],['#ec3013','Signal red'],['#9b9797','Concrete'],['#9fb8ad','Sea glass'],['#28465a','Deep water'],['#201e1d','Ink']];
  const FIN_COLORS = [['#3a3634','Smoke'],['#e8e4dc','Clear'],['#ec3013','Signal red'],['#201e1d','Ink'],['#d8c7a6','Sand']];

  function preset(id) {
    const t = TYPES.find(x => x[0] === id);
    const p = { ...BASE, ...t[2] };
    for (const k of INCH_KEYS) p[k] = (p[k] || 0) * IN;
    p.nround = (1 - p.NB) / 0.8; delete p.NB;
    return p;
  }

  const STORE = host.getAttribute('storage-key');
  let saved = null;
  if (STORE) { try { saved = JSON.parse(localStorage.getItem(STORE) || 'null'); } catch (e) {} }
  const attrType = host.getAttribute('type');
  let typeId = saved?.typeId || (TYPES.some(t => t[0] === attrType) ? attrType : 'shortboard');
  let P = saved?.P ? { ...preset(typeId), ...saved.P } : preset(typeId);
  let colors = saved?.colors || { deck: '#f4f2ee', bottom: '#f4f2ee', fins: '#3a3634' };
  let units = saved?.units || (host.getAttribute('units') === 'metric' ? 'metric' : 'imperial');
  const persist = () => { if (!STORE) return; try { localStorage.setItem(STORE, JSON.stringify({ typeId, P, colors, units })); } catch (e) {} };

  // ---------- formatting ----------
  const FR = { 1:'⅛', 2:'¼', 3:'⅜', 4:'½', 5:'⅝', 6:'¾', 7:'⅞' };
  function inchFrac(m, den) {
    let v = m / IN; const sign = v < 0 ? '−' : ''; v = Math.abs(v);
    const n = Math.round(v * den), w = Math.floor(n / den), r = n % den;
    let s = w ? String(w) : '';
    if (r) { if (den === 16 && r % 2) s += (s ? ' ' : '') + r + '/16'; else s += FR[den === 16 ? r / 2 : r]; }
    return sign + (s || '0') + '"';
  }
  const F = {
    len: m => units === 'imperial' ? (() => { const i = Math.round(m / IN); return `${Math.floor(i / 12)}'${i % 12}"`; })() : `${(m * 100).toFixed(0)} cm`,
    in8: m => units === 'imperial' ? inchFrac(m, 8) : `${(m * 100).toFixed(1)} cm`,
    in16: m => units === 'imperial' ? inchFrac(m, 16) : `${(m * 100).toFixed(1)} cm`,
    dec: m => units === 'imperial' ? `${(m / IN).toFixed(2)}"` : `${(m * 100).toFixed(1)} cm`,
    small: m => m <= 1e-5 ? 'Off' : units === 'imperial' ? `${(m / IN).toFixed(2)}"` : `${(m * 1000).toFixed(1)} mm`,
    wp: m => Math.abs(m) < IN / 16 ? 'Centered' : `${units === 'imperial' ? inchFrac(Math.abs(m), 8) : (Math.abs(m) * 100).toFixed(1) + ' cm'} ${m > 0 ? 'fwd' : 'back'}`,
    pct: v => `${Math.round(v * 100)}%`,
    deg: v => `${v.toFixed(1)}°`,
    nose: v => `${v < .35 ? 'Pointed' : v < .65 ? 'Medium' : 'Round'} · ${Math.round(v * 100)}`,
    edge: v => `${v < .35 ? 'Soft' : v < .7 ? 'Medium' : 'Hard'} · ${Math.round(v * 100)}`,
    dome: v => `${v < .25 ? 'Flat' : v < .6 ? 'Moderate' : 'Domed'} · ${Math.round(v * 100)}`,
  };

  // ---------- geometry ----------
  const N = 150, M = 160, H = M / 2;
  const COS = [], SIN = [];
  for (let j = 0; j < M; j++) { const f = 2 * Math.PI * j / M; COS.push(Math.abs(Math.cos(f)) < 1e-9 ? 0 : Math.cos(f)); SIN.push(Math.abs(Math.sin(f)) < 1e-9 ? 0 : Math.sin(f)); }

  function model(P) {
    const L = P.L, W2 = P.W / 2;
    const wpx = clamp(L / 2 + P.WP, 0.25 * L, 0.75 * L);
    const rn = clamp(P.NW / P.W, 0.05, 0.97), rt = clamp(P.TW / P.W, 0.05, 0.97);
    const bn = 1 - 0.8 * P.nround;
    const ts = TAILS[P.tail], bt = ts.b, e = ts.e * rt;
    const s1n = clamp((L - 0.305 - wpx) / (L - wpx), 0.1, 0.95);
    const an = clamp(Math.log(1 - rn ** (1 / bn)) / Math.log(s1n), 1.3, 14);
    const kt = 1 - (e > 0 ? e ** (1 / bt) : 0);
    const s1t = clamp((wpx - 0.305) / wpx, 0.1, 0.95);
    const at = clamp(Math.log(Math.max(1e-4, (1 - rt ** (1 / bt)) / kt)) / Math.log(s1t), 1.3, 14);
    const hw = x => {
      if (x >= wpx) { const s = clamp((x - wpx) / (L - wpx), 0, 1); return W2 * Math.pow(Math.max(0, 1 - s ** an), bn); }
      const s = clamp((wpx - x) / wpx, 0, 1); return W2 * Math.pow(Math.max(0, 1 - kt * s ** at), bt);
    };
    const xsF = t => ts.xs ? ts.xs(t, P.TD) : 0;
    const xc = 0.5 * (wpx + L / 2);
    const thick = x => P.T * (x >= xc ? 1 - (1 - P.nthin) * ((x - xc) / (L - xc)) ** 2.2 : 1 - (1 - P.tthin) * ((xc - x) / xc) ** 2.2);
    const xf = 0.42 * L;
    const rocker = x => x >= xf ? P.NR * ((x - xf) / (L - xf)) ** 2.4 : P.TR * ((xf - x) / xf) ** 2;
    const nUp = lerp(3.6, 1.7, P.dome);
    const nLo = x => Math.min(16, lerp(3, 10, P.hard) * (1 + 0.5 * clamp((0.3 * L - x) / (0.3 * L), 0, 1)));
    const a = P.rail;
    const sect = x => { const h = hw(x); const T = thick(x) * Math.sqrt(Math.min(1, h / 0.05)); const yb = rocker(x); return { x, h, T, yb, Tl: a * T, Tu: (1 - a) * T, yA: yb + a * T, nl: nLo(x) }; };
    const contour = (t, S) => {
      const x = S.x; let d = 0;
      if (P.conc) d += P.conc * (1 - t * t) * sstep(0.02 * L, 0.12 * L, x) * (1 - sstep(0.62 * L, 0.86 * L, x));
      if (P.dconc) d += P.dconc * Math.sin(Math.PI * t) ** 2 * sstep(0.02 * L, 0.1 * L, x) * (1 - sstep(0.35 * L, 0.55 * L, x));
      if (P.vee) d -= P.vee * (1 - t) * (1 - sstep(0.05 * L, 0.5 * L, x));
      if (P.chan && t > 0.3 && t < 0.85) { const f = ((t - 0.3) / 0.275) % 1; d += P.chan * Math.pow(Math.sin(Math.PI * f), 0.35) * sstep(0.005 * L, 0.04 * L, x) * (1 - sstep(0.28 * L, 0.4 * L, x)); }
      return d * Math.min(1, S.h / 0.08);
    };
    const deckY = (x, z) => { const S = sect(x); const t = S.h > 1e-6 ? clamp(Math.abs(z) / S.h, 0, 1) : 0; return S.yA + S.Tu * (1 - t ** nUp) ** (1 / nUp); };
    const bottomY = (x, z) => { const S = sect(x); const t = S.h > 1e-6 ? clamp(Math.abs(z) / S.h, 0, 1) : 0; return S.yA - S.Tl * (1 - t ** S.nl) ** (1 / S.nl) + contour(t, S); };
    return { L, wpx, hw, xsF, sect, contour, nUp, deckY, bottomY, rocker };
  }

  function buildSurface(P, m) {
    const pos = new Float32Array(N * M * 3);
    for (let i = 0; i < N; i++) {
      const u = 0.5 - 0.5 * Math.cos(Math.PI * i / (N - 1));
      for (let j = 0; j < M; j++) {
        const c = COS[j], s = SIN[j], ac = Math.abs(c);
        const xs = m.xsF(ac), x = xs + u * (m.L - xs), S = m.sect(x);
        let y, z;
        if (j <= H) { const n = m.nUp; z = S.h * Math.sign(c) * ac ** (2 / n); y = S.yA + S.Tu * Math.abs(s) ** (2 / n); }
        else { const n = S.nl, tz = ac ** (2 / n); z = S.h * Math.sign(c) * tz; y = S.yA - S.Tl * Math.abs(s) ** (2 / n) + m.contour(tz, S); }
        const k = (i * M + j) * 3; pos[k] = x; pos[k + 1] = y; pos[k + 2] = z;
      }
    }
    const deckI = [], botI = [];
    for (let i = 0; i < N - 1; i++) for (let j = 0; j < M; j++) {
      const j1 = (j + 1) % M, A = i * M + j, B = (i + 1) * M + j, C = (i + 1) * M + j1, D = i * M + j1;
      (j < H ? deckI : botI).push(A, B, C, A, C, D);
    }
    const full = new THREE.BufferGeometry();
    full.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    full.setIndex([...deckI, ...botI]);
    full.computeVertexNormals();
    const nrm = full.getAttribute('normal').array;
    full.dispose();
    const sub = (idx) => {
      const map = new Map(), p = [], n = [], out = [];
      for (const v of idx) { let r = map.get(v); if (r === undefined) { r = map.size; map.set(v, r); p.push(pos[v*3], pos[v*3+1], pos[v*3+2]); n.push(nrm[v*3], nrm[v*3+1], nrm[v*3+2]); } out.push(r); }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
      g.setAttribute('normal', new THREE.Float32BufferAttribute(n, 3));
      g.setIndex(out); return g;
    };
    // tail block (only when the tail has a finite end)
    let cap = null, capW = 0;
    for (let j = 0; j <= H; j++) capW = Math.max(capW, Math.abs(pos[j * 3 + 2]));
    if (capW > 0.003) {
      const p = [], idx = [];
      for (let j = 0; j <= H; j++) { const lj = (M - j) % M; p.push(pos[j*3], pos[j*3+1], pos[j*3+2], pos[lj*3], pos[lj*3+1], pos[lj*3+2]); }
      for (let j = 0; j < H; j++) { const U0 = 2*j, L0 = 2*j+1, U1 = 2*j+2, L1 = 2*j+3; idx.push(U0, U1, L1, U0, L1, L0); }
      cap = new THREE.BufferGeometry();
      cap.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
      cap.setIndex(idx); cap.computeVertexNormals();
    }
    // volume
    let V = 0, prevA = 0, prevX = 0;
    for (let i = 0; i < N; i++) {
      let A = 0, xm = 0;
      for (let j = 0; j < M; j++) { const k = (i*M+j)*3, k2 = (i*M+(j+1)%M)*3; A += pos[k+2]*pos[k2+1] - pos[k2+2]*pos[k+1]; xm += pos[k]; }
      A = Math.abs(A) / 2; xm /= M;
      if (i) V += 0.5 * (A + prevA) * (xm - prevX);
      prevA = A; prevX = xm;
    }
    return { pos, deck: sub(deckI), bottom: sub(botI), cap, volume: V * 1000 };
  }

  function finShape(D, B, R) {
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    s.bezierCurveTo(-0.04 * B, -0.5 * D, -0.5 * R, -0.96 * D, -R, -D);
    s.bezierCurveTo(-R + 0.02 * B, -0.8 * D, -0.78 * B, -0.25 * D, -B, 0);
    s.closePath();
    return s;
  }
  function finLayout(P, m) {
    const D = P.FD, out = [], set = P.fins;
    const side = (x, inset, d, bR, rR, tag) => { for (const sg of [1, -1]) out.push({ name: `fin_${tag}_${sg > 0 ? 'left' : 'right'}`, x, z: sg * Math.max(0.02, m.hw(x) - inset), D: d, B: d * bR, R: d * rR, yaw: sg * P.toe * Math.PI / 180, cant: -sg * P.cant * Math.PI / 180 }); };
    const center = (x, d, bR, rR) => out.push({ name: 'fin_center', x, z: 0, D: d, B: d * bR, R: d * rR, yaw: 0, cant: 0 });
    const cx = 0.07 * P.L + 0.02;
    if (set === 'single') center(cx, D, 0.8, 0.75);
    if (set === 'twin') side(0.25, 0.038, D, 1.3, 0.8, 'keel');
    if (set === 'thruster' || set === 'five') { side(0.28, 0.03, D, 0.95, 1.0, 'front'); center(0.09, D, 0.95, 1.0); }
    if (set === 'quad') side(0.28, 0.03, D, 0.95, 1.0, 'front');
    if (set === 'quad' || set === 'five') side(0.155, 0.065, D * 0.88, 0.95, 0.95, 'rear');
    if (set === 'twoplus1') { center(cx, D, 0.8, 0.75); side(0.3, 0.03, D * 0.5, 0.95, 1.0, 'side'); }
    for (const f of out) f.y = m.bottomY(f.x, f.z) + 0.003;
    return out;
  }

  // ---------- materials ----------
  const ROUGH = { gloss: [0.22, 0.22], satin: [0.55, 0.5], foam: [0.95, 0.45] };
  const mats = {
    deck: new THREE.MeshStandardMaterial({ name: 'deck', metalness: 0 }),
    bottom: new THREE.MeshStandardMaterial({ name: 'bottom', metalness: 0 }),
    fins: new THREE.MeshStandardMaterial({ name: 'fins', metalness: 0, roughness: 0.3 }),
    stringer: new THREE.MeshStandardMaterial({ name: 'stringer_wood', color: '#a8814f', roughness: 0.6, metalness: 0 }),
    plug: new THREE.MeshStandardMaterial({ name: 'leash_plug', color: '#201e1d', roughness: 0.5, metalness: 0 }),
    pin: new THREE.MeshStandardMaterial({ name: 'leash_pin', color: '#bab6b6', roughness: 0.35, metalness: 0.3 }),
  };
  function applyMaterials() {
    mats.deck.color.set(colors.deck); mats.bottom.color.set(colors.bottom); mats.fins.color.set(colors.fins);
    const [rd, rb] = ROUGH[P.finish] || ROUGH.gloss; mats.deck.roughness = rd; mats.bottom.roughness = rb;
  }

  function ribbon(m, x0, x1, top) {
    const n = 220, p = [], idx = [];
    for (let i = 0; i <= n; i++) {
      const x = lerp(x0, x1, i / n), h = m.hw(x), w = Math.min(0.0024, h * 0.3);
      for (const z of [w, -w]) p.push(x, top ? m.deckY(x, z) + 0.0007 : m.bottomY(x, z) - 0.0007, z);
      if (i < n) { const a = 2 * i, b = 2 * i + 2, c = 2 * i + 3, d = 2 * i + 1; top ? idx.push(a, b, c, a, c, d) : idx.push(a, c, b, a, d, c); }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
    g.setIndex(idx); g.computeVertexNormals(); return g;
  }

  let current = null, lastBuild = null;
  function rebuild(reframe) {
    const m = model(P), surf = buildSurface(P, m), fins = finLayout(P, m);
    applyMaterials();
    const g = new THREE.Group(); g.name = 'surfboard_' + typeId;
    const add = (geo, mat, name) => { const me = new THREE.Mesh(geo, mat); me.name = name; g.add(me); return me; };
    add(surf.deck, mats.deck, 'deck'); add(surf.bottom, mats.bottom, 'bottom');
    if (surf.cap) add(surf.cap, mats.deck, 'tail_block');
    const x0 = m.xsF(0) + 0.004, x1 = m.L - 0.012;
    if (P.stringer) { add(ribbon(m, x0, x1, true), mats.stringer, 'stringer_deck'); add(ribbon(m, x0, x1, false), mats.stringer, 'stringer_bottom'); }
    if (P.plug) {
      const px = m.xsF(0) + 0.06, py = m.deckY(px, 0);
      const cup = add(new THREE.CylinderGeometry(0.013, 0.013, 0.006, 40), mats.plug, 'leash_plug'); cup.position.set(px, py - 0.0018, 0);
      const pin = add(new THREE.BoxGeometry(0.003, 0.004, 0.02), mats.pin, 'leash_pin'); pin.position.set(px, py - 0.0005, 0);
    }
    for (const f of fins) {
      const th = Math.max(0.003, 0.0065 * Math.sqrt(f.D / 0.115)), bev = 0.0012;
      const geo = new THREE.ExtrudeGeometry(finShape(f.D, f.B, f.R), { depth: Math.max(0.001, th - 2 * bev), bevelEnabled: true, bevelThickness: bev, bevelSize: 0.001, bevelSegments: 2, curveSegments: 24 });
      geo.translate(0, 0, -(th - 2 * bev) / 2);
      const me = add(geo, mats.fins, f.name);
      me.rotation.set(f.cant, f.yaw, 0, 'YXZ');
      me.position.set(f.x + f.B / 2 * Math.cos(f.yaw), f.y, f.z - f.B / 2 * Math.sin(f.yaw));
    }
    if (current) current.traverse(o => o.isMesh && o.geometry.dispose());
    stage.setObject(g, { keepView: !reframe });
    if (reframe) {
      const c = new THREE.Vector3(m.L / 2, P.T, 0), cam = stage._camera, asp = Math.max(0.6, cam.aspect);
      const dist = (m.L * 0.62) / Math.tan(cam.fov * Math.PI / 360) / Math.min(asp, 1.8) * 1.05;
      cam.position.copy(c).add(new THREE.Vector3(0.28, 0.5, 1).normalize().multiplyScalar(dist));
      cam.near = dist / 100; cam.far = dist * 100; cam.updateProjectionMatrix();
      stage._controls.target.copy(c); stage._controls.update();
    }
    stage.setAttribute('name', `${typeId}_${F.len(P.L).replace(/[^\w]+/g, '-')}`);
    current = g; lastBuild = { m, surf, fins };
    drawAll();
    persist();
    afterBuild();
  }

  // ---------- blueprints ----------
  const INK = 'var(--color-text)', MUTED = 'var(--color-neutral-600)', ACC = 'var(--color-accent)', FILL = 'var(--color-surface)';
  const V3 = (pos, i, j) => { const k = (i * M + j) * 3; return [pos[k], pos[k + 1], pos[k + 2]]; };
  const pth = pts => 'M' + pts.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('L');
  const txt = (x, y, s, anchor = 'start', color = INK, weight = 400) => `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" font-size="11" font-weight="${weight}" fill="${color}" text-anchor="${anchor}" style="font-variant-numeric:tabular-nums">${s}</text>`;
  const dimH = (x0, x1, y, label) => `<path d="M${x0} ${y}H${x1}M${x0} ${y-4}V${y+4}M${x1} ${y-4}V${y+4}" stroke="${INK}" stroke-width="1"/>` +
    `<rect x="${(x0+x1)/2-30}" y="${y-8}" width="60" height="15" fill="var(--color-bg)"/>` + txt((x0+x1)/2, y+4, label, 'middle', INK, 800);
  function sizeSvg(svg) { const w = svg.clientWidth || 300, h = svg.clientHeight || 180; svg.setAttribute('viewBox', `0 0 ${w} ${h}`); return [w, h]; }

  function drawOutline() {
    const { m, surf, fins } = lastBuild, pos = surf.pos, svg = $('#bp-outline');
    const [w, h] = sizeSvg(svg);
    const s = Math.min((w - 40) / m.L, (h - 56) / P.W), ox = (w - m.L * s) / 2, oy = 12 + P.W / 2 * s;
    const X = x => ox + x * s, Y = z => oy - z * s;
    const pts = [];
    for (let i = 0; i < N; i++) { const v = V3(pos, i, 0); pts.push([X(v[0]), Y(v[2])]); }
    for (let i = N - 1; i >= 0; i--) { const v = V3(pos, i, H); pts.push([X(v[0]), Y(v[2])]); }
    for (let j = H; j >= 0; j--) { const v = V3(pos, 0, j); pts.push([X(v[0]), Y(v[2])]); }
    let o = `<path d="${pth(pts)}Z" fill="${FILL}" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>`;
    if (P.stringer) o += `<path d="M${X(m.xsF(0))} ${oy}H${X(m.L)}" stroke="${MUTED}" stroke-width="1"/>`;
    const mark = (x, lbl) => { const hh = m.hw(x); o += `<path d="M${X(x)} ${Y(hh)}V${Y(-hh)}" stroke="${MUTED}" stroke-width="1" stroke-dasharray="3 3"/>` + txt(X(x), Y(-hh) + 13, lbl + ' ' + F.in8(2 * hh), 'middle', MUTED); };
    mark(0.305, 'Tail'); mark(m.L - 0.305, 'Nose');
    const hw0 = m.hw(m.wpx);
    o += `<path d="M${X(m.wpx)} ${Y(hw0)}V${Y(-hw0)}" stroke="${ACC}" stroke-width="1.5"/>` + txt(X(m.wpx) + 5, oy - 4, F.in8(2 * hw0), 'start', ACC, 800);
    for (const f of fins) { const c = Math.cos(f.yaw), sn = Math.sin(f.yaw); o += `<path d="M${X(f.x - f.B/2*c)} ${Y(f.z + f.B/2*sn)}L${X(f.x + f.B/2*c)} ${Y(f.z - f.B/2*sn)}" stroke="${INK}" stroke-width="3"/>`; }
    if (P.plug) o += `<circle cx="${X(m.xsF(0) + 0.06)}" cy="${oy}" r="${Math.max(2, 0.013 * s)}" fill="${INK}"/>`;
    o += dimH(X(0), X(m.L), h - 12, F.len(m.L));
    svg.innerHTML = o;
  }

  function drawRocker() {
    const { m, surf, fins } = lastBuild, pos = surf.pos, svg = $('#bp-rocker');
    const [w, h] = sizeSvg(svg);
    let yMax = 0, yMin = 0;
    for (let i = 0; i < N; i++) { yMax = Math.max(yMax, V3(pos, i, H / 2)[1]); }
    for (const f of fins) yMin = Math.min(yMin, f.y - f.D);
    const s = Math.min((w - 40) / m.L, (h - 48) / (yMax - yMin)), ox = (w - m.L * s) / 2, oy = 16 + yMax * s;
    const X = x => ox + x * s, Y = y => oy - y * s;
    const deck = [], bot = [], rail = [];
    for (let i = 0; i < N; i++) { const d = V3(pos, i, H / 2), b = V3(pos, i, H + H / 2), r = V3(pos, i, 0); deck.push([X(d[0]), Y(d[1])]); bot.push([X(b[0]), Y(b[1])]); rail.push([X(r[0]), Y(r[1])]); }
    let o = `<path d="M${X(-0.02)} ${Y(0)}H${X(m.L + 0.02)}" stroke="${MUTED}" stroke-width="1" stroke-dasharray="3 3"/>`;
    for (const f of fins) {
      if (f.z < 0) continue;
      const pts = finShape(f.D, f.B, f.R).getPoints(8).map(p => [X(f.x + f.B / 2 + p.x), Y(f.y + p.y * Math.cos(f.cant))]);
      o += `<path d="${pth(pts)}Z" fill="${f.z ? 'var(--color-neutral-300)' : 'var(--color-neutral-400)'}" stroke="${INK}" stroke-width="1"/>`;
    }
    o += `<path d="${pth(deck)}L${pth(bot.slice().reverse()).slice(1)}Z" fill="${FILL}" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>`;
    o += `<path d="${pth(rail)}" fill="none" stroke="${ACC}" stroke-width="1" stroke-dasharray="4 3"/>`;
    const nb = bot[N - 1], tb = bot[0];
    o += `<path d="M${nb[0]} ${Y(0)}V${nb[1]}" stroke="${INK}" stroke-width="1"/>` + txt(nb[0] - 5, (Y(0) + nb[1]) / 2 + 4, 'Nose ' + F.dec(P.NR), 'end', INK, 800);
    o += `<path d="M${tb[0]} ${Y(0)}V${tb[1]}" stroke="${INK}" stroke-width="1"/>` + txt(tb[0], deck[0][1] - 6, 'Tail ' + F.dec(P.TR), 'start', INK, 800);
    o += txt(w - 8, h - 8, 'Rail line', 'end', ACC) + txt(8, h - 8, `Thickness ${F.in16(P.T)}`, 'start', MUTED);
    svg.innerHTML = o;
  }

  function drawSection() {
    const { m, surf } = lastBuild, pos = surf.pos, svg = $('#bp-section');
    const [w, h] = sizeSvg(svg);
    const rowAt = x => { let best = 0, bd = 1e9; for (let i = 0; i < N; i++) { const d = Math.abs(V3(pos, i, H / 2)[0] - x); if (d < bd) { bd = d; best = i; } } return best; };
    const iw = rowAt(m.wpx), it = rowAt(0.305);
    const T = P.T * 1.15;
    const s = Math.min((w - 30) / P.W, (h - 44) / T), cx = w / 2, oy = 14 + (h - 44) / 2 + P.T * s / 2;
    const loop = i => { const yb = V3(pos, i, H + H / 2)[1] + (P.vee > 0 ? 0 : 0), base = m.rocker(V3(pos, i, H / 2)[0]); const pts = []; for (let j = 0; j < M; j++) { const v = V3(pos, i, j); pts.push([cx + v[2] * s, oy - (v[1] - base) * s]); } return pth(pts) + 'Z'; };
    let o = `<path d="M${cx} 6V${h - 30}" stroke="${MUTED}" stroke-width="1" stroke-dasharray="2 3"/>`;
    o += `<path d="${loop(it)}" fill="none" stroke="${ACC}" stroke-width="1.5" stroke-dasharray="4 3"/>`;
    o += `<path d="${loop(iw)}" fill="${FILL}" fill-opacity="0.6" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>`;
    const hw0 = m.hw(m.wpx);
    o += dimH(cx - hw0 * s, cx + hw0 * s, h - 12, F.in8(2 * hw0));
    o += txt(8, 16, 'Wide point', 'start', INK, 800) + txt(8, 30, '12" from tail', 'start', ACC, 800);
    svg.innerHTML = o;
  }

  function drawAll() {
    if (!lastBuild) return;
    drawOutline(); drawRocker(); drawSection();
    $('#sum-dims').textContent = `${F.len(P.L)} × ${F.in8(P.W)} × ${F.in16(P.T)}`;
    $('#sum-vol').textContent = `${lastBuild.surf.volume.toFixed(1)} L`;
    $('#type-name').textContent = TYPES.find(t => t[0] === typeId)[1];
  }
  new ResizeObserver(() => drawAll()).observe($('.bp'));

  // ---------- controls ----------
  let pending = false, wantFrame = false;
  function schedule(reframe) {
    wantFrame = wantFrame || reframe;
    const done = new Promise(r => waiters.push(r));
    if (!pending) { pending = true; const run = () => { pending = false; const r = wantFrame; wantFrame = false; rebuild(r); }; document.hidden ? setTimeout(run, 0) : requestAnimationFrame(run); }
    return done;
  }

  const GROUPS = [
    ['Dimensions', [['range','L','Length',30*IN,150*IN,IN,'len'],['range','W','Width',12*IN,34*IN,IN/8,'in8'],['range','T','Thickness',0.4*IN,6*IN,IN/16,'in16']]],
    ['Outline', [['range','NW','Nose width · 12" down',6*IN,32*IN,IN/8,'in8'],['range','TW','Tail width · 12" up',6*IN,32*IN,IN/8,'in8'],['range','WP','Wide point',-6*IN,6*IN,IN/8,'wp'],['range','nround','Nose tip',0,1,0.01,'nose']]],
    ['Tail', [['select','tail','Tail shape',Object.entries(TAILS).map(([k,v])=>[k,v.name])],['range','TD','Notch / point depth',0.5*IN,6*IN,IN/8,'in8',()=>TAILS[P.tail].depth]]],
    ['Rocker', [['range','NR','Nose rocker',0,8*IN,IN/16,'dec'],['range','TR','Tail rocker',0,4*IN,IN/16,'dec']]],
    ['Foil', [['range','nthin','Nose thickness',0.2,1,0.01,'pct'],['range','tthin','Tail thickness',0.2,1,0.01,'pct']]],
    ['Rails & deck', [['seg','rail','Rail profile',RAILS],['range','hard','Rail edge',0,1,0.01,'edge'],['range','dome','Deck dome',0,1,0.01,'dome']]],
    ['Bottom contours', [['range','conc','Single concave',0,0.375*IN,IN/64,'small'],['range','dconc','Double concave',0,0.25*IN,IN/64,'small'],['range','vee','Vee off tail',0,0.375*IN,IN/64,'small'],['range','chan','Channels',0,0.25*IN,IN/64,'small']]],
    ['Fins', [['select','fins','Setup',Object.entries(FINSETS).map(([k,v])=>[k,v[0]])],['range','FD','Fin depth',2.5*IN,11*IN,IN/8,'in8',()=>P.fins!=='none'],['range','cant','Cant',0,10,0.5,'deg',()=>P.fins!=='none'],['range','toe','Toe',0,5,0.25,'deg',()=>P.fins!=='none']]],
    ['Construction', [['seg','stringer','Stringer',[['1','On'],['0','Off']]],['seg','plug','Leash plug',[['1','On'],['0','Off']]],['seg','finish','Finish',FINISHES]]],
    ['Colors', [['color','deck','Deck',BOARD_COLORS],['color','bottom','Bottom',BOARD_COLORS],['color','fins','Fins',FIN_COLORS,()=>P.fins!=='none']]],
  ];
  const refreshers = [];
  const aside = $('#controls');
  const typesEl = $('#types');
  for (const [id, name, p] of TYPES) {
    const b = document.createElement('button'); b.className = 'type'; b.type = 'button';
    b.innerHTML = `<b>${name}</b><span></span>`;
    b.onclick = () => { typeId = id; P = preset(id); refreshAll(); schedule(true); };
    typesEl.appendChild(b);
    refreshers.push(() => { b.setAttribute('aria-pressed', String(id === typeId)); b.querySelector('span').textContent = F.len(p.L * IN); });
  }
  let uid = 0;
  for (const [title, items] of GROUPS) {
    const sec = document.createElement('section'); sec.className = 'grp';
    sec.innerHTML = `<h6>${title}</h6>`;
    for (const it of items) {
      const [kind, key, label] = it; const wrap = document.createElement('div'); wrap.className = 'ctl';
      const show = kind === 'range' ? it[7] : it[4];
      if (kind === 'range') {
        const [, , , min, max, step, fmt] = it;
        wrap.innerHTML = `<div class="row"><label for="c${uid}">${label}</label><output></output></div><input id="c${uid++}" type="range" min="${min}" max="${max}" step="${step}">`;
        const inp = wrap.querySelector('input'), out = wrap.querySelector('output');
        const paint = () => { inp.style.setProperty('--p', ((inp.value - min) / (max - min) * 100) + '%'); out.textContent = F[fmt](+inp.value); };
        inp.addEventListener('input', () => { P[key] = +inp.value; paint(); schedule(false); });
        refreshers.push(() => { inp.value = P[key]; paint(); });
      } else if (kind === 'select') {
        wrap.innerHTML = `<div class="row"><label for="c${uid}">${label}</label></div><select class="input" id="c${uid++}">${it[3].map(([v, n]) => `<option value="${v}">${n}</option>`).join('')}</select>`;
        const sel = wrap.querySelector('select');
        sel.addEventListener('change', () => { P[key] = sel.value; if (key === 'fins' && FINSETS[sel.value][1]) P.FD = FINSETS[sel.value][1] * IN; refreshAll(); schedule(false); });
        refreshers.push(() => { sel.value = P[key]; });
      } else if (kind === 'seg') {
        const nm = 'g' + uid++;
        wrap.innerHTML = `<div class="row"><span>${label}</span></div><div class="seg" role="radiogroup" aria-label="${label}">${it[3].map(([v, n]) => `<label class="seg-opt"><input type="radio" name="${nm}" value="${v}">${n}</label>`).join('')}</div>`;
        const radios = [...wrap.querySelectorAll('input')];
        const toVal = v => key === 'rail' ? +v : (key === 'stringer' || key === 'plug') ? v === '1' : v;
        const fromVal = v => key === 'rail' ? String(v).replace(/^0/, '') : typeof v === 'boolean' ? (v ? '1' : '0') : v;
        radios.forEach(r => r.addEventListener('change', () => { P[key] = toVal(r.value); schedule(false); }));
        refreshers.push(() => { const cur = fromVal(P[key]); radios.forEach(r => r.checked = r.value === cur); });
      } else if (kind === 'color') {
        wrap.innerHTML = `<div class="row"><span>${label}</span><output></output></div><div class="sws">${it[3].map(([c, n]) => `<button type="button" class="sw" style="background:${c}" data-c="${c}" title="${n}" aria-label="${n}"></button>`).join('')}</div>`;
        const btns = [...wrap.querySelectorAll('.sw')], out = wrap.querySelector('output');
        btns.forEach(b => b.addEventListener('click', () => { colors[key] = b.dataset.c; applyMaterials(); persist(); refreshAll(); changed('ui'); }));
        refreshers.push(() => { btns.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.c === colors[key]))); const hit = it[3].find(c => c[0] === colors[key]); out.textContent = hit ? hit[1] : ''; });
      }
      if (show) refreshers.push(() => { wrap.hidden = !show(); });
      sec.appendChild(wrap);
    }
    aside.appendChild(sec);
  }
  function refreshAll() { refreshers.forEach(f => f()); }

  root.querySelectorAll('input[name=units]').forEach(r => { r.checked = r.value === units; r.addEventListener('change', () => { units = r.value; refreshAll(); drawAll(); persist(); changed('ui'); }); });
  $('#reset').onclick = () => { P = preset(typeId); refreshAll(); schedule(true); };

  // ---------- public API ----------
  let src = 'ui', booted = false, waiters = [], emitT = 0, lastSrc = 'ui';
  const LEN_UNITS = { in: IN, cm: 0.01, mm: 0.001, m: 1 };
  const PUB = {
    length: ['L', 'len'], width: ['W', 'len'], thickness: ['T', 'len'],
    noseWidth: ['NW', 'len'], tailWidth: ['TW', 'len'], widePoint: ['WP', 'len'], noseTip: ['nround', 'num'],
    tailShape: ['tail', 'enum'], tailDepth: ['TD', 'len'],
    noseRocker: ['NR', 'len'], tailRocker: ['TR', 'len'],
    noseThickness: ['nthin', 'num'], tailThickness: ['tthin', 'num'],
    railProfile: ['rail', 'rail'], railEdge: ['hard', 'num'], deckDome: ['dome', 'num'],
    singleConcave: ['conc', 'len'], doubleConcave: ['dconc', 'len'], vee: ['vee', 'len'], channels: ['chan', 'len'],
    fins: ['fins', 'enum'], finDepth: ['FD', 'len'], finCant: ['cant', 'deg'], finToe: ['toe', 'deg'],
    stringer: ['stringer', 'bool'], leashPlug: ['plug', 'bool'], finish: ['finish', 'enum'],
  };
  const ENUMS = { tail: Object.keys(TAILS), fins: Object.keys(FINSETS), finish: FINISHES.map(f => f[0]) };
  const SPEC = {};
  for (const [group, items] of GROUPS) for (const it of items) SPEC[it[1]] = { group, kind: it[0], label: it[2], it };
  const railName = a => `${Math.round((1 - a) * 100)}/${Math.round(a * 100)}`;
  const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

  function getDesign(opts = {}) {
    const lu = LEN_UNITS[opts.lengthUnit] ? opts.lengthUnit : 'in', f = LEN_UNITS[lu];
    const r = v => +(v / f).toFixed(lu === 'mm' ? 1 : 3);
    const params = {};
    for (const [k, [ik, kind]] of Object.entries(PUB)) {
      const v = P[ik];
      params[k] = kind === 'len' ? r(v) : kind === 'rail' ? railName(v) : (kind === 'num' || kind === 'deg') ? +(+v).toFixed(3) : v;
    }
    const m = lastBuild.m;
    return {
      version: 1, type: typeId, typeName: TYPES.find(t => t[0] === typeId)[1], lengthUnit: lu, units,
      params, colors: { ...colors },
      computed: {
        volumeLiters: +lastBuild.surf.volume.toFixed(2),
        dimensions: `${F.len(P.L)} × ${F.in8(P.W)} × ${F.in16(P.T)}`,
        widePointWidth: r(2 * m.hw(m.wpx)),
        noseWidthMeasured: r(2 * m.hw(m.L - 0.305)),
        tailWidthMeasured: r(2 * m.hw(0.305)),
        finCount: lastBuild.fins.length,
      },
    };
  }
  function coerce(k, val, f) {
    const [ik, kind] = PUB[k];
    if (kind === 'enum') return ENUMS[ik].includes(val) ? val : undefined;
    if (kind === 'bool') return typeof val === 'string' ? !/^(0|false|off|no)$/i.test(val) : !!val;
    if (kind === 'rail') { const a = typeof val === 'string' && val.includes('/') ? +val.split('/')[1] / 100 : +val; return isFinite(a) ? clamp(a, 0.2, 0.5) : undefined; }
    let v = +val; if (!isFinite(v)) return undefined;
    if (kind === 'len') v *= f;
    const s = SPEC[ik]; if (s && s.kind === 'range') v = clamp(v, s.it[3], s.it[4]);
    return v;
  }
  function applyParams(obj, opts = {}) {
    const f = LEN_UNITS[opts.lengthUnit] || IN, applied = [], ignored = [];
    for (const [k, val] of Object.entries(obj || {})) {
      if (!PUB[k]) { ignored.push(k); continue; }
      const v = coerce(k, val, f);
      if (v === undefined) { ignored.push(k); continue; }
      P[PUB[k][0]] = v; applied.push(k);
    }
    if (applied.includes('fins') && !applied.includes('finDepth') && FINSETS[P.fins][1]) P.FD = FINSETS[P.fins][1] * IN;
    return { applied, ignored };
  }
  function applyColors(c = {}) { for (const k of ['deck', 'bottom', 'fins']) if (typeof c[k] === 'string' && HEX.test(c[k])) colors[k] = c[k].toLowerCase(); }
  function checkType(id) { if (!TYPES.some(t => t[0] === id)) throw new Error(`Unknown board type "${id}". Use one of: ${TYPES.map(t => t[0]).join(', ')}`); }

  const statusEl = $('#status'), saveBtn = $('#save');
  function setStatus(state, text) { statusEl.dataset.state = state; statusEl.textContent = text; }
  function changed(s) {
    lastSrc = s;
    if (statusEl.dataset.state !== 'saving') setStatus('dirty', 'Unsaved changes');
    clearTimeout(emitT);
    emitT = setTimeout(() => host._emit('board-change', { source: lastSrc, design: getDesign() }), 120);
  }
  function afterBuild() { const w = waiters; waiters = []; w.forEach(f => f()); if (booted) changed(src); src = 'ui'; }

  async function save() {
    const design = getDesign();
    const ev = new CustomEvent('board-save', { detail: { design }, cancelable: true, bubbles: true, composed: true });
    host.dispatchEvent(ev);
    if (ev.defaultPrevented) return { ok: false, cancelled: true };
    setStatus('saving', 'Saving…'); saveBtn.disabled = true;
    try {
      let result;
      const url = host.getAttribute('save-url');
      if (typeof host.saveHandler === 'function') result = await host.saveHandler(design);
      else if (url) {
        const res = await fetch(url, { method: host.getAttribute('save-method') || 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(design), credentials: host.hasAttribute('save-credentials') ? 'include' : 'same-origin' });
        if (!res.ok) throw new Error(`server responded ${res.status}`);
        const t = await res.text(); try { result = JSON.parse(t); } catch (e) { result = t || null; }
      }
      else if (bridge.active) result = await bridge.requestSave(design);
      else if (STORE) { persist(); result = { storedLocally: true }; }
      else throw new Error('no save endpoint configured');
      setStatus('saved', 'Saved ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      host._emit('board-saved', { design, result });
      return { ok: true, result, design };
    } catch (err) {
      const msg = String(err && err.message || err);
      setStatus('error', 'Save failed: ' + msg);
      host._emit('board-save-error', { design, error: msg });
      return { ok: false, error: msg };
    } finally { saveBtn.disabled = false; }
  }
  saveBtn.onclick = () => save();

  const bridge = { active: false, origin: '*', pending: new Map(), n: 0 };
  const BRIDGE_METHODS = ['getDesign', 'getSchema', 'getTypes', 'setParams', 'setType', 'setDesign', 'setColors', 'setUnits', 'reset', 'save', 'download', 'exportModel', 'resetView'];
  bridge.requestSave = design => new Promise((resolve, reject) => {
    const id = ++bridge.n;
    bridge.pending.set(id, { resolve, reject });
    host._bridgePost({ event: 'board-save-request', saveId: id, detail: { design } });
    setTimeout(() => { if (bridge.pending.delete(id)) reject(new Error('host page did not respond')); }, 20000);
  });

  const api = {
    getDesign,
    getTypes: () => TYPES.map(([id, name, p]) => ({ id, name, lengthIn: p.L, widthIn: p.W, thicknessIn: p.T })),
    getSchema() {
      const params = [];
      for (const [key, [ik, kind]] of Object.entries(PUB)) {
        const s = SPEC[ik];
        const e = { key, label: s ? s.label : key, group: s ? s.group : '', type: { len: 'length', num: 'number', deg: 'angle', enum: 'enum', bool: 'boolean', rail: 'railProfile' }[kind] };
        if (s && s.kind === 'range') { const d = kind === 'len' ? IN : 1; e.min = +(s.it[3] / d).toFixed(4); e.max = +(s.it[4] / d).toFixed(4); e.step = +(s.it[5] / d).toFixed(4); e.unit = kind === 'len' ? 'in' : kind === 'deg' ? 'deg' : '0–1'; }
        if (kind === 'enum') e.options = ENUMS[ik];
        if (kind === 'rail') { e.options = RAILS.map(r => railName(+r[0])); e.accepts = '"upper/lower" string, or lower share 0.2–0.5'; }
        params.push(e);
      }
      return { lengthUnits: Object.keys(LEN_UNITS), defaultLengthUnit: 'in', params, colors: { deck: BOARD_COLORS.map(c => c[0]), bottom: BOARD_COLORS.map(c => c[0]), fins: FIN_COLORS.map(c => c[0]), accepts: 'any #rgb / #rrggbb' }, types: api.getTypes() };
    },
    async setParams(obj, opts = {}) { const r = applyParams(obj, opts); src = 'api'; refreshAll(); await schedule(false); return { ...r, design: getDesign(opts) }; },
    async setType(id, opts = {}) {
      checkType(id); typeId = id; P = preset(id);
      if (opts.params) applyParams(opts.params, opts);
      if (opts.colors) applyColors(opts.colors);
      src = 'api'; refreshAll(); await schedule(true); return getDesign(opts);
    },
    async setDesign(d = {}) {
      if (d.type) { checkType(d.type); typeId = d.type; P = preset(d.type); }
      if (d.units) { units = d.units === 'metric' ? 'metric' : 'imperial'; root.querySelectorAll('input[name=units]').forEach(r => r.checked = r.value === units); }
      const r = d.params ? applyParams(d.params, { lengthUnit: d.lengthUnit }) : { applied: [], ignored: [] };
      if (d.colors) applyColors(d.colors);
      src = 'api'; refreshAll(); await schedule(!!d.type);
      return { ...r, design: getDesign({ lengthUnit: d.lengthUnit }) };
    },
    setColors(c) { applyColors(c); applyMaterials(); refreshAll(); persist(); changed('api'); return { ...colors }; },
    setUnits(u) { units = u === 'metric' ? 'metric' : 'imperial'; root.querySelectorAll('input[name=units]').forEach(r => r.checked = r.value === units); refreshAll(); drawAll(); persist(); changed('api'); return units; },
    async reset() { P = preset(typeId); src = 'api'; refreshAll(); await schedule(true); return getDesign(); },
    async resetView() { await schedule(true); return true; },
    save,
    async download(format = 'glb') { await stage._runExport(format === 'obj' ? 'obj' : 'glb'); return true; },
    async exportModel(format = 'glb') {
      const obj = stage._object;
      if (format === 'obj') { const { OBJExporter } = await import('three/addons/exporters/OBJExporter.js'); return new Blob([new OBJExporter().parse(obj)], { type: 'text/plain' }); }
      const { GLTFExporter } = await import('three/addons/exporters/GLTFExporter.js');
      const buf = await new GLTFExporter().parseAsync(obj, { binary: true });
      return new Blob([buf], { type: 'model/gltf-binary' });
    },
    startBridge() {
      if (window.parent === window || bridge.active) return false;
      bridge.active = true;
      bridge.origin = host.getAttribute('bridge-origin') || '*';
      host._bridgePost = msg => window.parent.postMessage({ surfboard: 1, ...msg }, bridge.origin);
      window.addEventListener('message', async e => {
        const d = e.data;
        if (!d || d.surfboard !== 1 || e.source !== window.parent) return;
        if (bridge.origin !== '*' && e.origin !== bridge.origin) return;
        if (d.saveId != null) {
          const p = bridge.pending.get(d.saveId);
          if (p) { bridge.pending.delete(d.saveId); d.ok === false ? p.reject(new Error(d.error || 'rejected by host page')) : p.resolve(d.result ?? null); }
          return;
        }
        if (!d.method) return;
        const reply = x => e.source.postMessage({ surfboard: 1, id: d.id, ...x }, !e.origin || e.origin === 'null' ? '*' : e.origin);
        if (!BRIDGE_METHODS.includes(d.method)) return reply({ error: `unknown method "${d.method}"` });
        try { reply({ result: await api[d.method](...(d.args || [])) }); } catch (err) { reply({ error: String(err && err.message || err) }); }
      });
      return true;
    },
  };

  refreshAll();
  rebuild(true);
  booted = true;
  return api;
}

class SurfboardBuilder extends HTMLElement {
  constructor() {
    super();
    this.ready = new Promise((res, rej) => { this._res = res; this._rej = rej; });
    this.saveHandler = null;
  }
  connectedCallback() {
    if (this._booted) return;
    this._booted = true;
    this._boot().catch(err => { console.error('[surfboard-builder]', err); this._rej(err); });
  }
  async _boot() {
    const root = this.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = CSS;
    root.appendChild(style);
    const wrap = document.createElement('div');
    wrap.className = 'sb';
    wrap.innerHTML = MARKUP;
    root.appendChild(wrap);
    await customElements.whenDefined('three-d-stage');
    const stage = root.querySelector('three-d-stage');
    const { THREE } = await stage.ready;
    this._api = createBuilder(this, root, stage, THREE);
    if (this.hasAttribute('message-bridge')) this._api.startBridge();
    this._res(this);
    this._emit('board-ready', { design: this._api.getDesign() });
  }
  _emit(name, detail) {
    this.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }));
    if (this._bridgePost) this._bridgePost({ event: name, detail });
  }
}
for (const m of ['getDesign', 'getSchema', 'getTypes', 'setParams', 'setType', 'setDesign', 'setColors', 'setUnits', 'reset', 'save', 'download', 'exportModel', 'resetView']) {
  SurfboardBuilder.prototype[m] = async function (...args) { await this.ready; return this._api[m](...args); };
}
customElements.define('surfboard-builder', SurfboardBuilder);
})();
