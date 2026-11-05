'use client';

import { useEffect, useRef } from 'react';

// Full-screen water surface (WebGL2): a ripple simulation on the GPU, refracting soft pool
// caustics over warm white. Mouse moves and clicks make ripples; scrolling rolls waves in from the
// edge and carries the surface with the page. Phones get a lighter version at 30 fps.
type Drop = [number, number, number, number];
declare global {
  interface Window {
    __adgvDrop?: (x: number, y: number, r?: number, s?: number) => void;
  }
}

const VS = '#version 300 es\nin vec2 p;out vec2 uv;void main(){uv=p*.5+.5;gl_Position=vec4(p,0.,1.);}';
const SIM = `#version 300 es
precision highp float;in vec2 uv;out vec4 o;uniform sampler2D s;uniform vec2 px;uniform float shift;uniform float aspect;uniform vec4 drops[8];uniform int nd;
void main(){vec2 u=uv-vec2(0.,shift);vec4 c=texture(s,u);
float avg=(texture(s,u+vec2(px.x,0.)).r+texture(s,u-vec2(px.x,0.)).r+texture(s,u+vec2(0.,px.y)).r+texture(s,u-vec2(0.,px.y)).r)*.25;
float v=(c.g+(avg-c.r)*2.)*.986;float h=(c.r+v)*.996;
for(int i=0;i<8;i++){if(i>=nd)break;vec2 d=uv-drops[i].xy;d.x*=aspect;float l=length(d);float r=drops[i].z;if(l<r){h+=(cos(l/r*3.14159)*.5+.5)*drops[i].w;}}
if(u.y<0.||u.y>1.){h=0.;v=0.;}o=vec4(h,v,0.,1.);}`;
const DRAW = `#version 300 es
precision highp float;in vec2 uv;out vec4 o;uniform sampler2D s;uniform vec2 px;uniform vec2 res;uniform float t;uniform float scroll;uniform float sim;uniform vec2 glow;
vec2 h2(vec2 p){p=vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3)));return -1.+2.*fract(sin(p)*43758.5453);}
float gn(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*f*(f*(f*6.-15.)+10.);return mix(mix(dot(h2(i),f),dot(h2(i+vec2(1,0)),f-vec2(1,0)),u.x),mix(dot(h2(i+vec2(0,1)),f-vec2(0,1)),dot(h2(i+vec2(1,1)),f-vec2(1,1)),u.x),u.y);}
float caus(vec2 p){float c=0.;vec2 q=p*1.7;for(int i=0;i<2;i++){vec2 w=vec2(gn(q*.8+vec2(t*.21,t*.13)),gn(q*.8+vec2(4.7,1.9)-vec2(t*.17,t*.23)));float n=gn(q+w*1.9+vec2(t*.07,-t*.05));float r=clamp(1.-abs(n)*3.6,0.,1.);c+=pow(r,10.)*(i==0?1.:.65);q=q*1.83+vec2(3.1,7.7);}return c;}
float amb(vec2 p){return gn(p*2.4+vec2(t*.28,t*.16))*.6+gn(p*5.3-vec2(t*.24,-t*.33))*.4;}
void main(){vec2 asp=vec2(res.x/res.y,1.);vec2 p=uv*asp;
float hx=0.,hy=0.,lap=0.;if(sim>.5){float h=texture(s,uv).r;float a=texture(s,uv+vec2(px.x,0.)).r,b=texture(s,uv-vec2(px.x,0.)).r,c=texture(s,uv+vec2(0.,px.y)).r,d=texture(s,uv-vec2(0.,px.y)).r;hx=a-b;hy=c-d;lap=(a+b+c+d)*.25-h;}
float e=.003;float a0=amb(p);float ax=amb(p+vec2(e,0.))-a0;float ay=amb(p+vec2(0.,e))-a0;
vec3 n=normalize(vec3(-hx*6.-ax*.9,-hy*6.-ay*.9,1.));
vec3 white=vec3(.973,.969,.961);vec3 warm=vec3(.99,.95,.84);
float g=smoothstep(.95,0.,length((uv-glow)*asp));vec3 col=mix(white,warm,g*.85);
vec2 q=p+n.xy*.09;q.y-=scroll*.42;float cc=caus(q);
col=mix(col,vec3(.9,.76,.36),clamp(cc*(.07+g*.12),0.,.2));
col+=vec3(1.,.93,.75)*clamp(-lap*45.,0.,1.)*.5;
vec3 L=normalize(vec3(-.4,.55,1.));float lit=dot(n,L)-L.z;col+=lit*vec3(.85,.82,.7)*.45;
vec3 H=normalize(L+vec3(0,0,1));col+=pow(max(dot(n,H),0.),220.)*.85;
col=mix(col,vec3(.08,.08,.08),clamp(-lit,0.,.4)*.3);
o=vec4(col,1.);}`;

export function Water() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const gl = canvas.getContext('webgl2', { antialias: false, alpha: false, depth: false, stencil: false, powerPreference: 'high-performance' });
    if (!gl) return;
    const LITE = window.matchMedia('(hover: none), (pointer: coarse), (max-width: 760px)').matches;
    const canFloat = !!(gl.getExtension('EXT_color_buffer_float') || gl.getExtension('EXT_color_buffer_half_float'));

    const shader = (type: number, src: string) => {
      const x = gl.createShader(type)!;
      gl.shaderSource(x, src);
      gl.compileShader(x);
      return gl.getShaderParameter(x, gl.COMPILE_STATUS) ? x : null;
    };
    const program = (fs: string) => {
      const v = shader(gl.VERTEX_SHADER, VS), f = shader(gl.FRAGMENT_SHADER, fs);
      if (!v || !f) return null;
      const pr = gl.createProgram()!;
      gl.attachShader(pr, v);
      gl.attachShader(pr, f);
      gl.bindAttribLocation(pr, 0, 'p');
      gl.linkProgram(pr);
      if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return null;
      const u: Record<string, WebGLUniformLocation | null> = {};
      const n = gl.getProgramParameter(pr, gl.ACTIVE_UNIFORMS) as number;
      for (let i = 0; i < n; i++) {
        const info = gl.getActiveUniform(pr, i)!;
        u[info.name.replace('[0]', '')] = gl.getUniformLocation(pr, info.name);
      }
      return { p: pr, u };
    };
    const simP = LITE ? null : program(SIM);
    const drawP = program(DRAW);
    if (!drawP) return;
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    let W = 0, H = 0, SW = 0, SH = 0, cur = 0, simOK = false;
    let tex: WebGLTexture[] = [], fbo: WebGLFramebuffer[] = [];
    const targets = () => {
      tex.forEach((t) => gl.deleteTexture(t));
      fbo.forEach((f) => gl.deleteFramebuffer(f));
      tex = [];
      fbo = [];
      simOK = false;
      if (!canFloat || !simP) return;
      for (let i = 0; i < 2; i++) {
        const t = gl.createTexture()!;
        gl.bindTexture(gl.TEXTURE_2D, t);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, SW, SH, 0, gl.RGBA, gl.HALF_FLOAT, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        const f = gl.createFramebuffer()!;
        gl.bindFramebuffer(gl.FRAMEBUFFER, f);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
        if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
          gl.bindFramebuffer(gl.FRAMEBUFFER, null);
          return;
        }
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
        tex.push(t);
        fbo.push(f);
      }
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      simOK = true;
    };
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.25), scale = LITE ? 0.4 : 0.55;
      W = Math.max(2, Math.round(window.innerWidth * dpr * scale));
      H = Math.max(2, Math.round(window.innerHeight * dpr * scale));
      canvas.width = W;
      canvas.height = H;
      SW = Math.min(300, Math.round(window.innerWidth / 4));
      SH = Math.max(2, Math.round((SW * window.innerHeight) / window.innerWidth));
      targets();
    };
    resize();
    window.addEventListener('resize', resize);

    const pending: Drop[] = [];
    const ptr = { x: -1, y: -1, px: -1, py: -1, moved: false };
    let velocity = 0, shiftPx = 0, lastY = window.scrollY, glow: [number, number] = [0.72, 0.5];
    window.__adgvDrop = (x, y, r = 0.05, s = -0.6) => pending.push([x, y, r, s]);
    const onMove = (e: PointerEvent) => {
      ptr.x = e.clientX;
      ptr.y = e.clientY;
      ptr.moved = true;
    };
    const onDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest('a,button,input,select,textarea')) return;
      pending.push([e.clientX, e.clientY, 0.06, -0.9]);
    };
    const onScroll = () => {
      const y = window.scrollY;
      velocity = y - lastY;
      shiftPx += y - lastY;
      lastY = y;
      const coin = document.querySelector('.hero-art');
      if (coin) {
        const r = coin.getBoundingClientRect();
        glow = r.bottom > 0 ? [(r.left + r.width / 2) / window.innerWidth, 1 - (r.top + r.height / 2) / window.innerHeight] : [0.72, -2];
      }
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    const dropArr = new Float32Array(32);
    let flowT = 0, last = performance.now(), frame = 0, raf = 0;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      frame++;
      if (LITE && frame % 2) return;
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      velocity *= 0.9;
      flowT += dt * (1 + Math.min(Math.abs(velocity), 80) * 0.06);
      if (simOK && simP) {
        const drops: Drop[] = [];
        if (ptr.moved && ptr.px >= 0) {
          const dx = ptr.x - ptr.px, dy = ptr.y - ptr.py, sp = Math.min(Math.hypot(dx, dy), 80);
          if (sp > 0.5) {
            const steps = Math.min(3, Math.ceil(sp / 25));
            for (let k = 1; k <= steps; k++) drops.push([(ptr.px + (dx * k) / steps) / window.innerWidth, 1 - (ptr.py + (dy * k) / steps) / window.innerHeight, 0.022, sp * 0.0016]);
          }
        }
        ptr.px = ptr.x;
        ptr.py = ptr.y;
        ptr.moved = false;
        while (pending.length && drops.length < 8) {
          const d = pending.shift()!;
          drops.push([d[0] / window.innerWidth, 1 - d[1] / window.innerHeight, d[2], d[3]]);
        }
        if (Math.random() < 0.025 && drops.length < 8) drops.push([Math.random(), Math.random(), 0.012 + Math.random() * 0.02, -(0.15 + Math.random() * 0.25)]);
        if (Math.abs(velocity) > 0.4) {
          const ey = velocity > 0 ? 0.02 : 0.98, str = -Math.min(Math.abs(velocity) * 0.006, 0.35);
          for (let q = 0; q < 3 && drops.length < 8; q++) drops.push([Math.random(), ey, 0.035 + Math.random() * 0.03, str * (0.6 + Math.random() * 0.4)]);
        }
        gl.useProgram(simP.p);
        gl.viewport(0, 0, SW, SH);
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo[1 - cur]);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, tex[cur]);
        gl.uniform1i(simP.u.s, 0);
        gl.uniform2f(simP.u.px, 1 / SW, 1 / SH);
        gl.uniform1f(simP.u.shift, (shiftPx / window.innerHeight) * 0.9);
        gl.uniform1f(simP.u.aspect, window.innerWidth / window.innerHeight);
        dropArr.fill(0);
        const nd = Math.min(drops.length, 8);
        for (let i = 0; i < nd; i++) dropArr.set(drops[i], i * 4);
        gl.uniform4fv(simP.u.drops, dropArr);
        gl.uniform1i(simP.u.nd, nd);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        cur = 1 - cur;
      }
      shiftPx = 0;
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, W, H);
      gl.useProgram(drawP.p);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, simOK ? tex[cur] : null);
      gl.uniform1i(drawP.u.s, 0);
      gl.uniform2f(drawP.u.px, 1 / Math.max(SW, 1), 1 / Math.max(SH, 1));
      gl.uniform2f(drawP.u.res, window.innerWidth, window.innerHeight);
      gl.uniform1f(drawP.u.t, flowT);
      gl.uniform1f(drawP.u.scroll, window.scrollY / window.innerHeight);
      gl.uniform1f(drawP.u.sim, simOK ? 1 : 0);
      gl.uniform2f(drawP.u.glow, glow[0], glow[1]);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    raf = requestAnimationFrame(loop);
    const coinDrops = window.setInterval(() => {
      const el = document.querySelector('#coinStage');
      if (!el) return;
      const r = el.getBoundingClientRect();
      if (r.bottom > 0 && r.top < window.innerHeight) pending.push([r.left + r.width / 2, r.top + r.height / 2, 0.05, -0.55]);
    }, 1400);

    return () => {
      cancelAnimationFrame(raf);
      window.clearInterval(coinDrops);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('scroll', onScroll);
      delete window.__adgvDrop;
    };
  }, []);

  return <canvas ref={ref} className="stage" aria-hidden="true" />;
}
