/* ═══════════════════════════════════════════════════════
   GALAXY ENGINE — Procedural WebGL Galaxy Background
   Three.js r128 — 3000+ particles, spiral math, bloom
   ═══════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const canvas = document.getElementById('galaxy-canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
  camera.position.z = 350;

  // ─── STATE ───
  const state = {
    scrollSpeed: 0,
    targetScrollSpeed: 0,
    mouseX: 0,
    mouseY: 0,
    targetMouseX: 0,
    targetMouseY: 0,
    baseRotationSpeed: 0.0003,
    time: 0,
    entryZoom: false,
    entryZoomProgress: 0,
  };

  // Expose state for app.js
  window.galaxyState = state;

  // ─── STAR PARTICLE SYSTEM ───
  const STAR_COUNT = 3500;
  const starGeometry = new THREE.BufferGeometry();
  const starPositions = new Float32Array(STAR_COUNT * 3);
  const starColors = new Float32Array(STAR_COUNT * 3);
  const starSizes = new Float32Array(STAR_COUNT);
  const starPhases = new Float32Array(STAR_COUNT); // for twinkling

  const colorPalette = [
    new THREE.Color(0.85, 0.75, 1.0),   // soft violet
    new THREE.Color(0.6, 0.85, 1.0),    // cyan-ish
    new THREE.Color(1.0, 1.0, 1.0),     // white
    new THREE.Color(0.7, 0.6, 1.0),     // purple
    new THREE.Color(0.4, 0.7, 1.0),     // electric blue
  ];

  for (let i = 0; i < STAR_COUNT; i++) {
    const i3 = i * 3;
    // Spiral galaxy distribution
    const arm = Math.floor(Math.random() * 3); // 3 spiral arms
    const armAngle = (arm / 3) * Math.PI * 2;
    const radius = Math.random() * 400 + 10;
    const spiralAngle = armAngle + (radius * 0.008) + (Math.random() - 0.5) * 0.8;
    const spread = (Math.random() - 0.5) * (radius * 0.35);

    starPositions[i3] = Math.cos(spiralAngle) * radius + spread * 0.5;
    starPositions[i3 + 1] = (Math.random() - 0.5) * 80 + spread * 0.3;
    starPositions[i3 + 2] = Math.sin(spiralAngle) * radius + spread * 0.5;

    const col = colorPalette[Math.floor(Math.random() * colorPalette.length)];
    starColors[i3] = col.r;
    starColors[i3 + 1] = col.g;
    starColors[i3 + 2] = col.b;

    starSizes[i] = Math.random() * 3.5 + 0.8;
    starPhases[i] = Math.random() * Math.PI * 2;
  }

  starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
  starGeometry.setAttribute('size', new THREE.BufferAttribute(starSizes, 1));

  // Custom shader material for glow + twinkling
  const starMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
    },
    vertexShader: `
      attribute float size;
      attribute vec3 color;
      uniform float uTime;
      uniform float uPixelRatio;
      varying vec3 vColor;
      varying float vAlpha;

      void main() {
        vColor = color;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        float dist = length(mvPosition.xyz);
        // Twinkle
        float twinkle = sin(uTime * 1.5 + position.x * 0.1 + position.z * 0.1) * 0.3 + 0.7;
        vAlpha = twinkle * smoothstep(800.0, 100.0, dist);
        gl_PointSize = size * uPixelRatio * (200.0 / dist) * twinkle;
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      varying float vAlpha;

      void main() {
        float d = length(gl_PointCoord - 0.5);
        if (d > 0.5) discard;
        float glow = 1.0 - smoothstep(0.0, 0.5, d);
        glow = pow(glow, 1.8);
        gl_FragColor = vec4(vColor, glow * vAlpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const stars = new THREE.Points(starGeometry, starMaterial);
  scene.add(stars);

  // ─── NEBULA FOG (gradient fog planes) ───
  const nebulaGroup = new THREE.Group();
  const nebulaCount = 12;
  for (let i = 0; i < nebulaCount; i++) {
    const size = Math.random() * 200 + 80;
    const nebGeo = new THREE.PlaneBufferGeometry(size, size);
    const hue = Math.random() > 0.5 ? 0.75 : 0.55; // purple or cyan
    const nebMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color().setHSL(hue, 0.6, 0.15),
      transparent: true,
      opacity: 0.04 + Math.random() * 0.04,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(nebGeo, nebMat);
    const angle = Math.random() * Math.PI * 2;
    const rad = Math.random() * 250;
    mesh.position.set(
      Math.cos(angle) * rad,
      (Math.random() - 0.5) * 60,
      Math.sin(angle) * rad
    );
    mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
    mesh.userData.pulsePhase = Math.random() * Math.PI * 2;
    mesh.userData.pulseSpeed = 0.3 + Math.random() * 0.4;
    nebulaGroup.add(mesh);
  }
  scene.add(nebulaGroup);

  // ─── SHOOTING STARS ───
  const MAX_SHOOTERS = 3;
  const shooters = [];

  function createShooter() {
    const geo = new THREE.BufferGeometry();
    const len = 30;
    const positions = new Float32Array(len * 3);
    const alphas = new Float32Array(len);
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));

    const mat = new THREE.ShaderMaterial({
      uniforms: {},
      vertexShader: `
        attribute float alpha;
        varying float vAlpha;
        void main() {
          vAlpha = alpha;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = 2.5;
        }
      `,
      fragmentShader: `
        varying float vAlpha;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          if (d > 0.5) discard;
          gl_FragColor = vec4(0.7, 0.85, 1.0, vAlpha * (1.0 - d * 2.0));
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const points = new THREE.Points(geo, mat);
    points.visible = false;
    scene.add(points);

    return {
      mesh: points,
      geo,
      active: false,
      progress: 0,
      origin: new THREE.Vector3(),
      direction: new THREE.Vector3(),
      speed: 0,
      life: 0,
    };
  }

  for (let i = 0; i < MAX_SHOOTERS; i++) {
    shooters.push(createShooter());
  }

  function launchShooter() {
    const s = shooters.find(sh => !sh.active);
    if (!s) return;
    s.active = true;
    s.progress = 0;
    s.life = 0.6 + Math.random() * 0.6;
    s.speed = 400 + Math.random() * 300;
    const theta = Math.random() * Math.PI * 2;
    const phi = (Math.random() - 0.5) * 0.6;
    s.origin.set(
      Math.cos(theta) * 300,
      (Math.random() - 0.5) * 100,
      Math.sin(theta) * 300
    );
    s.direction.set(
      -Math.cos(theta + 0.3),
      -0.2 + Math.random() * 0.4,
      -Math.sin(theta + 0.3)
    ).normalize();
    s.mesh.visible = true;
  }

  function updateShooters(dt) {
    for (const s of shooters) {
      if (!s.active) continue;
      s.progress += dt;
      if (s.progress > s.life) {
        s.active = false;
        s.mesh.visible = false;
        continue;
      }
      const positions = s.geo.attributes.position.array;
      const alphas = s.geo.attributes.alpha.array;
      const len = alphas.length;
      for (let i = 0; i < len; i++) {
        const t = s.progress - (i * 0.008);
        const p = Math.max(0, t);
        positions[i * 3] = s.origin.x + s.direction.x * s.speed * p;
        positions[i * 3 + 1] = s.origin.y + s.direction.y * s.speed * p;
        positions[i * 3 + 2] = s.origin.z + s.direction.z * s.speed * p;
        alphas[i] = Math.max(0, 1 - (i / len)) * Math.max(0, 1 - s.progress / s.life);
      }
      s.geo.attributes.position.needsUpdate = true;
      s.geo.attributes.alpha.needsUpdate = true;
    }
  }

  // Shooting star interval
  let shootInterval = setInterval(() => {
    if (Math.random() < 0.6) launchShooter();
  }, 2500);

  // ─── EVENT LISTENERS ───
  window.addEventListener('mousemove', (e) => {
    state.targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    state.targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  window.addEventListener('scroll', () => {
    state.targetScrollSpeed = 0.015;
    clearTimeout(state._scrollTimeout);
    state._scrollTimeout = setTimeout(() => {
      state.targetScrollSpeed = 0;
    }, 150);
  });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    starMaterial.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2);
  });

  // ─── ANIMATION LOOP ───
  let lastTime = performance.now();

  function animate() {
    requestAnimationFrame(animate);

    const now = performance.now();
    const dt = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;
    state.time += dt;

    // Smooth inertia
    state.scrollSpeed += (state.targetScrollSpeed - state.scrollSpeed) * 0.06;
    state.mouseX += (state.targetMouseX - state.mouseX) * 0.04;
    state.mouseY += (state.targetMouseY - state.mouseY) * 0.04;

    // Rotation
    const rotSpeed = state.baseRotationSpeed + state.scrollSpeed;
    stars.rotation.y += rotSpeed;
    nebulaGroup.rotation.y += rotSpeed * 0.6;

    // Parallax
    stars.rotation.x += (state.mouseY * 0.15 - stars.rotation.x) * 0.02;
    const targetCamX = state.mouseX * 30;
    const targetCamY = state.mouseY * 20;
    camera.position.x += (targetCamX - camera.position.x) * 0.03;
    camera.position.y += (targetCamY - camera.position.y) * 0.03;

    // Entry zoom effect
    if (state.entryZoom) {
      state.entryZoomProgress += dt * 0.8;
      const zp = Math.min(state.entryZoomProgress, 1);
      camera.position.z = 350 - zp * 100;
      state.baseRotationSpeed = 0.0003 + zp * 0.003;
      if (zp >= 1) {
        state.entryZoom = false;
        // Ease back
        const easeBack = setInterval(() => {
          state.baseRotationSpeed += (0.0003 - state.baseRotationSpeed) * 0.05;
          camera.position.z += (350 - camera.position.z) * 0.03;
          if (Math.abs(state.baseRotationSpeed - 0.0003) < 0.00001) {
            state.baseRotationSpeed = 0.0003;
            clearInterval(easeBack);
          }
        }, 16);
      }
    }

    // Update shader time
    starMaterial.uniforms.uTime.value = state.time;

    // Nebula pulse
    nebulaGroup.children.forEach(mesh => {
      const pulse = Math.sin(state.time * mesh.userData.pulseSpeed + mesh.userData.pulsePhase) * 0.02 + 0.05;
      mesh.material.opacity = pulse;
    });

    // Shooting stars
    updateShooters(dt);

    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
  }

  animate();
})();
