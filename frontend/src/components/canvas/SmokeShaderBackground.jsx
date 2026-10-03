import { useEffect, useRef } from 'react'

/**
 * SmokeShaderBackground
 * High-performance WebGL Canvas rendering undulating monochromatic smoke/fog
 * (Obsidian Black, Deep Slate, Mid Grey, Light Silver Mist, and White Highlights).
 * Inspired by shadergradient (ruucm/shadergradient).
 */
export default function SmokeShaderBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext('webgl', { antialias: true, alpha: false })
    if (!gl) return

    // Vertex shader: Fullscreen Quad
    const vsSource = `
      attribute vec2 a_position;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `

    // Fragment shader: Fluid FBM Domain Warping Monochromatic Smoke
    const fsSource = `
      precision mediump float;
      uniform vec2 u_resolution;
      uniform float u_time;
      uniform vec2 u_mouse;

      // Simplex-inspired 2D noise
      vec2 hash(vec2 p) {
        p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
        return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(mix(dot(hash(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0)),
                       dot(hash(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
                   mix(dot(hash(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)),
                       dot(hash(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x), u.y);
      }

      float fbm(vec2 p) {
        float v = 0.0;
        float a = 0.5;
        vec2 shift = vec2(100.0);
        mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
        for (int i = 0; i < 4; ++i) {
          v += a * noise(p);
          p = rot * p * 2.0 + shift;
          a *= 0.5;
        }
        return v;
      }

      void main() {
        vec2 st = gl_FragCoord.xy / u_resolution.xy;
        st.x *= u_resolution.x / u_resolution.y;

        float t = u_time * 0.12;
        vec2 mouseOffset = (u_mouse - 0.5) * 0.15;

        // Domain warping for organic liquid smoke flow
        vec2 q = vec2(0.0);
        q.x = fbm(st + vec2(0.0, 0.0) + mouseOffset + t * 0.4);
        q.y = fbm(st + vec2(5.2, 1.3) - mouseOffset + t * 0.3);

        vec2 r = vec2(0.0);
        r.x = fbm(st + 4.0 * q + vec2(1.7, 9.2) + 0.15 * t);
        r.y = fbm(st + 4.0 * q + vec2(8.3, 2.8) + 0.126 * t);

        float f = fbm(st + 4.0 * r);

        // Monochromatic Obsidian -> Charcoal -> Mid Grey -> Silver -> White Highlights
        vec3 colorBlack = vec3(0.031, 0.031, 0.047);   // #08080C (Obsidian Base)
        vec3 colorSlate = vec3(0.071, 0.071, 0.094);   // #121218 (Deep Slate)
        vec3 colorGrey  = vec3(0.141, 0.141, 0.180);   // #24242E (Dark Smoke)
        vec3 colorMist  = vec3(0.35, 0.35, 0.42);      // #59596B (Light Silver Mist)
        vec3 colorWhite = vec3(0.85, 0.85, 0.92);      // White Highlights

        // Smooth multi-step gradient interpolation
        vec3 col = mix(colorBlack, colorSlate, clamp((f * f) * 3.5, 0.0, 1.0));
        col = mix(col, colorGrey, clamp(length(q) * 1.2, 0.0, 1.0));
        col = mix(col, colorMist, clamp(length(r.x) * 0.9, 0.0, 1.0));
        col = mix(col, colorWhite, clamp(pow(f, 3.2) * 1.6, 0.0, 1.0));

        // Subtle electric blue tint in deeper folds
        col += vec3(0.01, 0.03, 0.08) * length(q);

        // Vignette effect to darken edges
        vec2 uv = gl_FragCoord.xy / u_resolution.xy;
        float vignette = uv.x * uv.y * (1.0 - uv.x) * (1.0 - uv.y);
        col *= clamp(16.0 * vignette * 0.85 + 0.15, 0.0, 1.0);

        gl_FragColor = vec4(col, 1.0);
      }
    `

    // Compile helper
    function createShader(gl, type, source) {
      const shader = gl.createShader(type)
      gl.shaderSource(shader, source)
      gl.compileShader(shader)
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader))
        gl.deleteShader(shader)
        return null
      }
      return shader
    }

    const vs = createShader(gl, gl.VERTEX_SHADER, vsSource)
    const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource)
    const program = gl.createProgram()
    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)

    const positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    )

    const posLoc = gl.getAttribLocation(program, 'a_position')
    const resLoc = gl.getUniformLocation(program, 'u_resolution')
    const timeLoc = gl.getUniformLocation(program, 'u_time')
    const mouseLoc = gl.getUniformLocation(program, 'u_mouse')

    let animationFrameId
    let startTime = performance.now()
    let mouse = { x: 0.5, y: 0.5 }

    const handleResize = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5) // Cap for performance
      canvas.width = width * dpr
      canvas.height = height * dpr
      gl.viewport(0, 0, canvas.width, canvas.height)
    }

    const handleMouseMove = (e) => {
      mouse.x = e.clientX / window.innerWidth
      mouse.y = 1.0 - e.clientY / window.innerHeight
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    window.addEventListener('mousemove', handleMouseMove)

    const render = () => {
      const elapsed = (performance.now() - startTime) * 0.001
      gl.useProgram(program)

      gl.enableVertexAttribArray(posLoc)
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
      gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0)

      gl.uniform2f(resLoc, canvas.width, canvas.height)
      gl.uniform1f(timeLoc, elapsed)
      gl.uniform2f(mouseLoc, mouse.x, mouse.y)

      gl.drawArrays(gl.TRIANGLES, 0, 6)
      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(animationFrameId)
      if (gl) {
        gl.deleteProgram(program)
        gl.deleteShader(vs)
        gl.deleteShader(fs)
        gl.deleteBuffer(positionBuffer)
      }
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 w-full h-full opacity-80"
      style={{ willChange: 'transform' }}
    />
  )
}
