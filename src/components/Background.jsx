import { Renderer, Program, Mesh, Triangle } from 'ogl';
import { useEffect, useRef } from 'react';

function hexToVec4(hex) {
  let hexStr = hex.replace('#', '');
  let r = 0,
    g = 0,
    b = 0,
    a = 1;
  if (hexStr.length === 6) {
    r = parseInt(hexStr.slice(0, 2), 16) / 255;
    g = parseInt(hexStr.slice(2, 4), 16) / 255;
    b = parseInt(hexStr.slice(4, 6), 16) / 255;
  } else if (hexStr.length === 8) {
    r = parseInt(hexStr.slice(0, 2), 16) / 255;
    g = parseInt(hexStr.slice(2, 4), 16) / 255;
    b = parseInt(hexStr.slice(4, 6), 16) / 255;
    a = parseInt(hexStr.slice(6, 8), 16) / 255;
  }
  return [r, g, b, a];
}

const vertexShader = `
attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0, 1);
}
`;

const fragmentShader = `
precision highp float;

#define PI 3.14159265359

uniform float iTime;
uniform vec3 iResolution;
uniform float uSpinRotation;
uniform float uSpinSpeed;
uniform vec2 uOffset;
uniform vec4 uColor1;
uniform vec4 uColor2;
uniform vec4 uColor3;
uniform float uContrast;
uniform float uLighting;
uniform float uSpinAmount;
uniform float uPixelFilter;
uniform float uSpinEase;
uniform bool uIsRotate;
uniform vec2 uMouse;

varying vec2 vUv;

vec4 effect(vec2 screenSize, vec2 screen_coords) {
    float pixel_size = length(screenSize.xy) / uPixelFilter;
    vec2 uv = (floor(screen_coords.xy * (1.0 / pixel_size)) * pixel_size - 0.5 * screenSize.xy) / length(screenSize.xy) - uOffset;
    float uv_len = length(uv);
    
    float speed = (uSpinRotation * uSpinEase * 0.2);
    if(uIsRotate){
       speed = iTime * speed;
    }
    speed += 302.2;
    
    float mouseInfluence = (uMouse.x * 2.0 - 1.0);
    speed += mouseInfluence * 0.1;
    
    float new_pixel_angle = atan(uv.y, uv.x) + speed - uSpinEase * 20.0 * (uSpinAmount * uv_len + (1.0 - uSpinAmount));
    vec2 mid = (screenSize.xy / length(screenSize.xy)) / 2.0;
    uv = (vec2(uv_len * cos(new_pixel_angle) + mid.x, uv_len * sin(new_pixel_angle) + mid.y) - mid);
    
    uv *= 30.0;
    float baseSpeed = iTime * uSpinSpeed;
    speed = baseSpeed + mouseInfluence * 2.0;
    
    vec2 uv2 = vec2(uv.x + uv.y);
    
    for(int i = 0; i < 5; i++) {
        uv2 += sin(max(uv.x, uv.y)) + uv;
        uv += 0.5 * vec2(
            cos(5.1123314 + 0.353 * uv2.y + speed * 0.131121),
            sin(uv2.x - 0.113 * speed)
        );
        uv -= cos(uv.x + uv.y) - sin(uv.x * 0.711 - uv.y);
    }
    
    float contrast_mod = (0.25 * uContrast + 0.5 * uSpinAmount + 1.2);
    float paint_res = min(2.0, max(0.0, length(uv) * 0.035 * contrast_mod));
    float c1p = max(0.0, 1.0 - contrast_mod * abs(1.0 - paint_res));
    float c2p = max(0.0, 1.0 - contrast_mod * abs(paint_res));
    float c3p = 1.0 - min(1.0, c1p + c2p);
    float light = (uLighting - 0.2) * max(c1p * 5.0 - 4.0, 0.0) + uLighting * max(c2p * 5.0 - 4.0, 0.0);
    
    return (0.3 / uContrast) * uColor1 + (1.0 - 0.3 / uContrast) * (uColor1 * c1p + uColor2 * c2p + vec4(c3p * uColor3.rgb, c3p * uColor1.a)) + light;
}

void main() {
    vec2 uv = vUv * iResolution.xy;
    gl_FragColor = effect(iResolution.xy, uv);
}
`;

export default function Balatro({
  spinRotation = -2.0,
  spinSpeed = 9.0,
  offset = [0.0, 0.0],
  color1 = '#DE443B',
  color2 = '#006BB4',
  color3 = '#162325',
  contrast = 3.5,
  lighting = 0.4,
  spinAmount = 0.3,
  pixelFilter = 745.0,
  spinEase = 1,
  isRotate = false,
  mouseInteraction = true,
  title = 'HireX',
  subtitle = 'Find your next opportunity with confidence.'
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const renderer = new Renderer();
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 1);

    let program;

    function resize() {
      renderer.setSize(container.offsetWidth, container.offsetHeight);
      if (program) {
        program.uniforms.iResolution.value = [gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height];
      }
    }
    window.addEventListener('resize', resize);
    resize();

    const geometry = new Triangle(gl);
    program = new Program(gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      uniforms: {
        iTime: { value: 0 },
        iResolution: {
          value: [gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height]
        },
        uSpinRotation: { value: spinRotation },
        uSpinSpeed: { value: spinSpeed },
        uOffset: { value: offset },
        uColor1: { value: hexToVec4(color1) },
        uColor2: { value: hexToVec4(color2) },
        uColor3: { value: hexToVec4(color3) },
        uContrast: { value: contrast },
        uLighting: { value: lighting },
        uSpinAmount: { value: spinAmount },
        uPixelFilter: { value: pixelFilter },
        uSpinEase: { value: spinEase },
        uIsRotate: { value: isRotate },
        uMouse: { value: [0.5, 0.5] }
      }
    });

    const mesh = new Mesh(gl, { geometry, program });
    let animationFrameId;

    function update(time) {
      animationFrameId = requestAnimationFrame(update);
      program.uniforms.iTime.value = time * 0.001;
      renderer.render({ scene: mesh });
    }
    animationFrameId = requestAnimationFrame(update);
    container.appendChild(gl.canvas);

    function handleMouseMove(e) {
      if (!mouseInteraction) return;
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = 1.0 - (e.clientY - rect.top) / rect.height;
      program.uniforms.uMouse.value = [x, y];
    }
    container.addEventListener('mousemove', handleMouseMove);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeChild(gl.canvas);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, [
    spinRotation,
    spinSpeed,
    offset,
    color1,
    color2,
    color3,
    contrast,
    lighting,
    spinAmount,
    pixelFilter,
    spinEase,
    isRotate,
    mouseInteraction,
    containerRef
  ]);

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div ref={containerRef} className="absolute inset-0" />

      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
        <div className="relative flex flex-col items-center justify-center px-8 text-center">
          <div className="absolute h-[22rem] w-[22rem] rounded-full bg-prpl/25 blur-3xl" />
          <div className="absolute h-[30rem] w-[30rem] rounded-full bg-white/10 blur-[120px]" />

          <span
            aria-hidden="true"
            className="absolute select-none font-splatink text-[clamp(5.5rem,14vw,11rem)] leading-none tracking-[0.02em] text-prpl/35 blur-2xl"
          >
            {title}
          </span>

          <span
            aria-hidden="true"
            className="absolute -translate-y-1 select-none font-splatink text-[clamp(5.5rem,14vw,11rem)] leading-none tracking-[0.02em] text-white/25 blur-md"
          >
            {title}
          </span>

          <h2
            className="relative font-splatink text-[clamp(5.5rem,14vw,11rem)] leading-none tracking-[0.02em] text-white [text-shadow:0_0_16px_rgba(255,255,255,0.32),0_10px_40px_rgba(8,10,20,0.45),0_0_65px_rgba(85,35,233,0.26)]"
          >
            {title}
          </h2>

          <p className="relative mt-5 max-w-md text-balance text-[0.95rem] font-medium tracking-[0.2em] text-white/72 uppercase [text-shadow:0_4px_22px_rgba(0,0,0,0.35)]">
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
}
