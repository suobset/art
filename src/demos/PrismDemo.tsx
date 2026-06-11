import { useEffect, useRef, useState } from 'react'
import { ImmersiveDemo } from '../components/ImmersiveDemo'
import { Parameter } from '../components/Parameter'
import type { DemoComponentProps } from '../lib/demoTypes'

type ShaderName = 'aurora' | 'fluid' | 'cathedral' | 'glassmind'

const VERT = `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`

const FRAG_COMMON = `
precision highp float;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_pointer;
uniform float u_amount;
uniform float u_complexity;
`

const FRAGMENTS: Record<ShaderName, string> = {
  aurora: `${FRAG_COMMON}
float hash(vec2 p) {
  p = fract(p * vec2(123.34, 345.45));
  p += dot(p, p + 34.345);
  return fract(p.x * p.y);
}
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 6; i++) {
    v += a * noise(p);
    p = p * 2.0 + vec2(0.7, 0.4);
    a *= 0.5;
  }
  return v;
}
void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);
  vec2 q = uv;
  q.y += u_time * 0.04;
  float n = fbm(q * (2.0 + u_complexity * 4.0));
  float ribbon = fbm(vec2(uv.x * 3.0 + n * 2.0, uv.y * 1.4 + u_time * 0.05));
  float glow = exp(-pow(uv.y - sin(uv.x * 2.0 + u_time * 0.2) * 0.18, 2.0) * (10.0 - u_amount * 8.0));
  vec3 cool = vec3(0.05, 0.4, 0.55);
  vec3 warm = vec3(0.9, 0.3, 0.8);
  vec3 acc = vec3(0.6, 1.0, 0.6);
  vec3 color = mix(cool, warm, ribbon);
  color = mix(color, acc, glow * 0.6);
  color += 0.06 * vec3(noise(uv * 200.0));
  vec2 pp = (u_pointer - 0.5) * 2.0;
  float halo = exp(-length(uv - pp) * (12.0 - u_amount * 6.0));
  color += halo * vec3(1.0, 0.95, 0.85) * 0.5;
  gl_FragColor = vec4(color, 1.0);
}
`,
  fluid: `${FRAG_COMMON}
mat2 rot(float a) { return mat2(cos(a), -sin(a), sin(a), cos(a)); }
void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);
  float t = u_time * 0.18;
  vec2 p = uv;
  float v = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 8; i++) {
    p = rot(0.5 + float(i)) * p * (1.4 + u_complexity * 0.3);
    v += amp * sin(p.x * (3.0 + sin(t + float(i))) + t);
    v += amp * cos(p.y * (3.0 + cos(t + float(i)) * 1.2) - t * 0.8);
    amp *= 0.62;
  }
  vec2 pp = (u_pointer - 0.5) * 2.0;
  float touch = exp(-length(uv - pp) * 6.0) * (1.5 + u_amount * 4.0);
  v += touch;
  float h = 0.55 + 0.45 * sin(v * 1.2 + t);
  vec3 a = vec3(0.05, 0.05, 0.18);
  vec3 b = vec3(0.95, 0.5, 0.18);
  vec3 c = vec3(0.95, 0.9, 0.6);
  vec3 color = mix(a, b, smoothstep(0.0, 0.5, h));
  color = mix(color, c, smoothstep(0.5, 1.0, h));
  color += 0.04 * vec3(sin(uv.x * 80.0), cos(uv.y * 90.0), sin((uv.x + uv.y) * 40.0));
  gl_FragColor = vec4(color, 1.0);
}
`,
  cathedral: `${FRAG_COMMON}
float sdSphere(vec3 p, float r) { return length(p) - r; }
float sdGyroid(vec3 p, float s) {
  p *= s;
  return abs(dot(sin(p), cos(p.zxy))) / s - 0.05;
}
float map(vec3 p) {
  float g = sdGyroid(p, 4.0 + u_complexity * 5.0);
  float s = sdSphere(p, 1.8);
  return max(s, g);
}
vec3 normal(vec3 p) {
  vec2 e = vec2(0.001, 0.0);
  return normalize(vec3(
    map(p + e.xyy) - map(p - e.xyy),
    map(p + e.yxy) - map(p - e.yxy),
    map(p + e.yyx) - map(p - e.yyx)
  ));
}
void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);
  vec3 ro = vec3(0.0, 0.0, 4.0);
  vec3 rd = normalize(vec3(uv, -1.2));
  float a = u_time * 0.1 + (u_pointer.x - 0.5) * 3.14;
  float b = (u_pointer.y - 0.5) * 1.5;
  mat3 rotY = mat3(cos(a), 0.0, sin(a), 0.0, 1.0, 0.0, -sin(a), 0.0, cos(a));
  mat3 rotX = mat3(1.0, 0.0, 0.0, 0.0, cos(b), -sin(b), 0.0, sin(b), cos(b));
  ro = rotY * rotX * ro;
  rd = rotY * rotX * rd;
  float t = 0.0;
  float glow = 0.0;
  vec3 hit = ro;
  bool found = false;
  for (int i = 0; i < 64; i++) {
    hit = ro + rd * t;
    float d = map(hit);
    glow += 0.012 / (0.01 + d * d);
    if (d < 0.001) { found = true; break; }
    if (t > 8.0) break;
    t += d * 0.8;
  }
  vec3 color = vec3(0.02, 0.0, 0.06);
  if (found) {
    vec3 n = normal(hit);
    vec3 light = normalize(vec3(0.6, 0.8, 0.5));
    float diff = max(dot(n, light), 0.0);
    vec3 base = mix(vec3(0.95, 0.6, 0.25), vec3(0.2, 0.65, 0.95), n.y * 0.5 + 0.5);
    color = base * (0.15 + diff * 0.95);
    color += pow(max(dot(reflect(rd, n), light), 0.0), 32.0) * vec3(1.0);
  }
  color += glow * 0.018 * vec3(0.9, 0.7, 1.0) * (1.0 + u_amount * 2.0);
  gl_FragColor = vec4(color, 1.0);
}
`,
  glassmind: `${FRAG_COMMON}
vec3 palette(float t) {
  return 0.5 + 0.5 * cos(6.28318 * (vec3(0.0, 0.33, 0.66) + t));
}
void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);
  vec2 z = uv * (2.4 + u_complexity * 2.5);
  vec2 c = vec2(0.355534 - 0.337292 * sin(u_time * 0.08 + u_pointer.x * 3.14),
                0.337292 * cos(u_time * 0.05 + u_pointer.y * 3.14));
  float n = 0.0;
  for (int i = 0; i < 80; i++) {
    z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
    if (dot(z, z) > 8.0) break;
    n += 1.0;
  }
  float t = n / 80.0;
  vec3 color = palette(t * 1.4 + u_time * 0.04);
  color *= 0.6 + 0.6 * smoothstep(0.04, 1.0, t);
  color += smoothstep(0.92, 1.0, t) * vec3(1.0, 0.95, 0.7) * u_amount;
  gl_FragColor = vec4(color, 1.0);
}
`,
}

function compileShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    return null
  }
  return shader
}

function createProgram(gl: WebGLRenderingContext, fragmentSource: string) {
  const vs = compileShader(gl, gl.VERTEX_SHADER, VERT)
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource)
  if (!vs || !fs) return null
  const program = gl.createProgram()
  if (!program) return null
  gl.attachShader(program, vs)
  gl.attachShader(program, fs)
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program))
    gl.deleteProgram(program)
    return null
  }
  return program
}

export function PrismDemo({ reducedMotion }: DemoComponentProps) {
  const [shader, setShader] = useState<ShaderName>('aurora')
  const [amount, setAmount] = useState(0.6)
  const [complexity, setComplexity] = useState(0.5)
  const [timeScale, setTimeScale] = useState(1)
  const [status, setStatus] = useState<string>('Compiling fragment shader…')

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const animationRef = useRef<number>(0)
  const glRef = useRef<WebGLRenderingContext | null>(null)
  const programRef = useRef<WebGLProgram | null>(null)
  const uniformsRef = useRef<Record<string, WebGLUniformLocation | null>>({})
  const pointerRef = useRef<{ x: number; y: number }>({ x: 0.5, y: 0.5 })
  const timeRef = useRef<number>(0)
  const lastFrameRef = useRef<number>(0)

  const amountRef = useRef(amount)
  const complexityRef = useRef(complexity)
  const timeScaleRef = useRef(timeScale)
  const reducedRef = useRef(reducedMotion)
  useEffect(() => { amountRef.current = amount }, [amount])
  useEffect(() => { complexityRef.current = complexity }, [complexity])
  useEffect(() => { timeScaleRef.current = timeScale }, [timeScale])
  useEffect(() => { reducedRef.current = reducedMotion }, [reducedMotion])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const gl = canvas.getContext('webgl', { antialias: true, premultipliedAlpha: false }) ||
               canvas.getContext('experimental-webgl') as WebGLRenderingContext | null
    if (!gl) {
      setStatus('WebGL is not available in this browser. The piece needs a graphics context.')
      return
    }
    glRef.current = gl

    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1,
    ]), gl.STATIC_DRAW)

    return () => {
      if (animationRef.current) window.cancelAnimationFrame(animationRef.current)
      const program = programRef.current
      if (program) gl.deleteProgram(program)
      gl.deleteBuffer(buffer)
    }
  }, [])

  useEffect(() => {
    const gl = glRef.current
    const canvas = canvasRef.current
    if (!gl || !canvas) return

    if (programRef.current) {
      gl.deleteProgram(programRef.current)
      programRef.current = null
    }

    const program = createProgram(gl, FRAGMENTS[shader])
    if (!program) {
      setStatus(`Could not compile the ${shader} shader. Check your browser console.`)
      return
    }
    programRef.current = program
    gl.useProgram(program)

    const positionAttribute = gl.getAttribLocation(program, 'a_position')
    gl.enableVertexAttribArray(positionAttribute)
    gl.vertexAttribPointer(positionAttribute, 2, gl.FLOAT, false, 0, 0)

    uniformsRef.current = {
      u_resolution: gl.getUniformLocation(program, 'u_resolution'),
      u_time: gl.getUniformLocation(program, 'u_time'),
      u_pointer: gl.getUniformLocation(program, 'u_pointer'),
      u_amount: gl.getUniformLocation(program, 'u_amount'),
      u_complexity: gl.getUniformLocation(program, 'u_complexity'),
    }

    setStatus(`Running ${shader}.frag — every pixel is computed by the GPU once per frame.`)

    if (animationRef.current) window.cancelAnimationFrame(animationRef.current)
    lastFrameRef.current = performance.now()
    const loop = (now: number) => {
      const dt = (now - lastFrameRef.current) / 1000
      lastFrameRef.current = now
      timeRef.current += dt * (reducedRef.current ? 0.25 : timeScaleRef.current)

      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      const cssWidth = canvas.clientWidth
      const cssHeight = canvas.clientHeight
      const targetW = Math.floor(cssWidth * ratio)
      const targetH = Math.floor(cssHeight * ratio)
      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW
        canvas.height = targetH
      }
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.uniform2f(uniformsRef.current.u_resolution!, canvas.width, canvas.height)
      gl.uniform1f(uniformsRef.current.u_time!, timeRef.current)
      gl.uniform2f(uniformsRef.current.u_pointer!, pointerRef.current.x, pointerRef.current.y)
      gl.uniform1f(uniformsRef.current.u_amount!, amountRef.current)
      gl.uniform1f(uniformsRef.current.u_complexity!, complexityRef.current)

      gl.drawArrays(gl.TRIANGLES, 0, 6)
      animationRef.current = window.requestAnimationFrame(loop)
    }
    animationRef.current = window.requestAnimationFrame(loop)
  }, [shader])

  return (
    <ImmersiveDemo
      caption={`shader ${shader} · time scale ${timeScale.toFixed(2)} · complexity ${complexity.toFixed(2)}`}
      controls={
        <>
          <Parameter label="shader">
            <select value={shader} onChange={(event) => setShader(event.target.value as ShaderName)} className="w-full rounded-[0.8rem] border border-[var(--rule-strong)] bg-black/10 px-3 py-2 text-[var(--text)]">
              {(Object.keys(FRAGMENTS) as ShaderName[]).map((option) => (
                <option key={option} value={option} className="bg-[#120f15]">{option}</option>
              ))}
            </select>
          </Parameter>
          <Parameter label="intensity" value={amount.toFixed(2)}>
            <input type="range" min="0" max="1" step="0.01" value={amount} onChange={(event) => setAmount(Number(event.target.value))} />
          </Parameter>
          <Parameter label="complexity" value={complexity.toFixed(2)}>
            <input type="range" min="0" max="1" step="0.01" value={complexity} onChange={(event) => setComplexity(Number(event.target.value))} />
          </Parameter>
          <Parameter label="time scale" value={timeScale.toFixed(2)}>
            <input type="range" min="0" max="3" step="0.01" value={timeScale} onChange={(event) => setTimeScale(Number(event.target.value))} />
          </Parameter>
          <p className="text-sm text-[var(--soft)] sm:col-span-2 lg:col-span-3 xl:col-span-4">{status} Move the cursor over the surface to feed the pointer uniform into the shader — many shaders are listening.</p>
        </>
      }
    >
      <div
        className="relative h-full w-full"
        onPointerMove={(event) => {
          const bounds = event.currentTarget.getBoundingClientRect()
          pointerRef.current = {
            x: (event.clientX - bounds.left) / bounds.width,
            y: 1 - (event.clientY - bounds.top) / bounds.height,
          }
        }}
        onPointerLeave={() => {
          pointerRef.current = { x: 0.5, y: 0.5 }
        }}
      >
        <canvas ref={canvasRef} className="h-full w-full" />
      </div>
    </ImmersiveDemo>
  )
}
