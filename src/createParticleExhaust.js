
export function createParticleExhaust(THREE, parent, engineNozzles, pixelRatio = 1) {
  const PER_ENGINE = 360;
  const TOTAL = engineNozzles.length * PER_ENGINE;

  const positions = new Float32Array(TOTAL * 3);
  const colors = new Float32Array(TOTAL * 3);
  const sizes = new Float32Array(TOTAL);
  const alphas = new Float32Array(TOTAL);

  const BLUE = new THREE.Color("#8EDCFF");
  const YELLOW = new THREE.Color("#FFE45C");

  const clamp = (v, a = 0, b = 1) =>
    Math.max(a, Math.min(b, v));

  const smoothstep = (a, b, x) => {
    const t = clamp((x - a) / (b - a));
    return t * t * (3 - 2 * t);
  };

  // Prepare three engine directions in local spacecraft coordinates.
  const engines = engineNozzles.map((engine) => {
    const direction = engine.direction.clone().normalize();

    const helper = Math.abs(direction.y) < 0.9
      ? new THREE.Vector3(0, 1, 0)
      : new THREE.Vector3(1, 0, 0);

    const side = new THREE.Vector3()
      .crossVectors(direction, helper)
      .normalize();

    const up = new THREE.Vector3()
      .crossVectors(side, direction)
      .normalize();

    return {
      origin: engine.position.clone(),
      direction,
      side,
      up
    };
  });

  const particles = [];

  for (let i = 0; i < TOTAL; i++) {
    const engineIndex = Math.floor(i / PER_ENGINE);

    particles.push({
      engine: engineIndex,
      phase: Math.random(),
      angle: Math.random() * Math.PI * 2,
      spread: Math.sqrt(Math.random()),
      speed: 0.75 + Math.random() * 0.5,
      flicker: Math.random() * Math.PI * 2,
      edge: Math.random() < 0.28
    });

    sizes[i] = 2.0 + Math.random() * 1.8;
  }

  const geometry = new THREE.BufferGeometry();

  const positionAttr = new THREE.BufferAttribute(positions, 3);
  positionAttr.setUsage(THREE.DynamicDrawUsage);

  const colorAttr = new THREE.BufferAttribute(colors, 3);
  colorAttr.setUsage(THREE.DynamicDrawUsage);

  geometry.setAttribute("position", positionAttr);
  geometry.setAttribute("aColor", colorAttr);
  geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute("aAlpha", new THREE.BufferAttribute(alphas, 1));

  const material = new THREE.ShaderMaterial({
    uniforms: {
      uPixelRatio: { value: pixelRatio },
      uBase: { value: 1350 },
      uIntensity: { value: 1 }
    },

    vertexShader: `
      attribute vec3 aColor;
      attribute float aSize;
      attribute float aAlpha;

      uniform float uPixelRatio;
      uniform float uBase;
      uniform float uIntensity;

      varying vec3 vColor;
      varying float vAlpha;

      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        float depth = max(-mv.z, 1.0);

        gl_PointSize = clamp(
          aSize * uPixelRatio * uBase / depth,
          1.0,
          12.0
        );

        gl_Position = projectionMatrix * mv;
        vColor = aColor;
        vAlpha = aAlpha * uIntensity;
      }
    `,

    fragmentShader: `
      varying vec3 vColor;
      varying float vAlpha;

      void main() {
        float d = length(gl_PointCoord - vec2(0.5));

        if (d > 0.5) discard;

        float glow = 1.0 - smoothstep(0.08, 0.5, d);

        gl_FragColor = vec4(
          vColor * (1.0 + glow * 0.4),
          glow * vAlpha
        );
      }
    `,

    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    toneMapped: false
  });

  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;
  parent.add(points);

  let clock = 0;

  function update(deltaTime, intensity = 1) {
    clock += Math.min(deltaTime, 0.05);

    material.uniforms.uIntensity.value = intensity;

    for (let i = 0; i < TOTAL; i++) {
      const p = particles[i];
      const engine = engines[p.engine];

      // Smooth, continuous particle travel.
      const t = (p.phase + clock * 0.42 * p.speed) % 1;

      // A narrow flame at the nozzle expands gradually.
      const flicker =
        1 + Math.sin(clock * 7 + p.flicker) * 0.055;

      const trailLength = 330;
      const distance = t * trailLength;

      const flameWidth =
        (3 + Math.sin(Math.PI * t) * 32) *
        p.spread * flicker;

      const radialX = Math.cos(p.angle) * flameWidth;
      const radialY = Math.sin(p.angle) * flameWidth * 0.65;

      const i3 = i * 3;

      positions[i3] =
        engine.origin.x +
        engine.direction.x * distance +
        engine.side.x * radialX +
        engine.up.x * radialY;

      positions[i3 + 1] =
        engine.origin.y +
        engine.direction.y * distance +
        engine.side.y * radialX +
        engine.up.y * radialY;

      positions[i3 + 2] =
        engine.origin.z +
        engine.direction.z * distance +
        engine.side.z * radialX +
        engine.up.z * radialY;

      // Light blue core and edges, golden-yellow flame body.
      const blueAmount =
        (t < 0.16 || p.edge) ? 0 : 1;

      const mix = blueAmount === 0
        ? 0
        : smoothstep(0.16, 0.34, t);

      colors[i3] =
        BLUE.r * (1 - mix) + YELLOW.r * mix;

      colors[i3 + 1] =
        BLUE.g * (1 - mix) + YELLOW.g * mix;

      colors[i3 + 2] =
        BLUE.b * (1 - mix) + YELLOW.b * mix;

      // Fade particles smoothly at both ends.
      const fadeIn = smoothstep(0, 0.08, t);
      const fadeOut = 1 - smoothstep(0.78, 1, t);

      alphas[i] =
        Math.pow(Math.sin(Math.PI * t), 0.7) * 0.95;
    }

    positionAttr.needsUpdate = true;
    colorAttr.needsUpdate = true;
    geometry.attributes.aSize.needsUpdate = true;
    geometry.attributes.aAlpha.needsUpdate = true;
  }

  function dispose() {
    parent.remove(points);
    geometry.dispose();
    material.dispose();
  }

  return { update, dispose, points };
}

