import { useTheme } from "next-themes";
import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";

import type { LifelineEventEffect } from "./types";

const FIREWORKS_DURATION_S = 7.5;
const CONFETTI_DURATION_S = 5;
const MAX_DPR = 1.5;
const NIGHTFALL_MS = 400;
const DEBUG = Boolean((import.meta as ImportMeta & { env?: { DEV?: boolean } }).env?.DEV);

type Palette = [number[], number[], number[]];

const PALETTES: Record<
	Exclude<LifelineEventEffect, "confetti">,
	Palette
> = {
	fireworks: [
		[0.9, 0.15, 0.25],
		[1, 1, 1],
		[0.25, 0.45, 0.95],
	],
	"fireworks-argentina": [
		[0.45, 0.75, 0.98],
		[1, 1, 1],
		[0.7, 0.87, 1],
	],
};

function debugLog(
	level: "debug" | "warn" | "error",
	message: string,
	details?: unknown,
) {
	if (!DEBUG && level === "debug") {
		return;
	}

	const logger = console[level];

	if (details === undefined) {
		logger(`[LifelineEffect] ${message}`);
		return;
	}

	logger(`[LifelineEffect] ${message}`, details);
}

const VERTEX_SHADER = `
attribute vec2 a_pos;
void main() {
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision highp float;

uniform vec2 u_res;
uniform float u_time;
uniform float u_dur;
uniform vec3 u_c0;
uniform vec3 u_c1;
uniform vec3 u_c2;

#define TAU 6.28318530718
#define N_FIREWORKS 10
#define N_PARTICLES 42

float hash(float n) {
  return fract(sin(n) * 43758.5453123);
}

vec3 palette(float m) {
  if (m < 0.5) return u_c0;
  if (m < 1.5) return u_c1;
  return u_c2;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;
  float t = u_time;
  float env = smoothstep(0.0, 0.5, t) * (1.0 - smoothstep(u_dur - 1.0, u_dur, t));
  vec3 col = vec3(0.0);

  for (int i = 0; i < N_FIREWORKS; i++) {
    float fi = float(i);
    float t0 = 0.35 + fi * (u_dur - 2.8) / float(N_FIREWORKS) + hash(fi * 7.31) * 0.3;
    float active = step(t0, t) * step(t, t0 + 1.8);
    float lt = clamp((t - t0) / 1.8, 0.0, 1.0);

    vec2 center = vec2((hash(fi * 3.7) - 0.5) * 1.6, -0.05 + hash(fi * 9.1) * 0.5);
    vec3 base = palette(mod(fi, 3.0));
    float fade = exp(-lt * 4.0) * min(1.0, lt * 6.0);

    for (int j = 0; j < N_PARTICLES; j++) {
      float fj = float(j);
      float angle = (fj / float(N_PARTICLES)) * TAU + hash(fi * 100.0 + fj) * 0.15;
      float speed = 0.16 + 0.22 * hash(fj * 7.77 + fi * 31.3);
      vec2 p = center + vec2(cos(angle), sin(angle)) * speed * sqrt(lt);
      p.y -= 0.09 * lt * lt;

      float d = max(length(uv - p), 0.004);
      float sparkle = 0.7 + 0.3 * sin(30.0 * lt + fj * 1.7);
      col += base * active * fade * sparkle * 0.0006 / (d * d);
    }
  }

  col = clamp(col * env, 0.0, 1.0);
  float spark = max(col.r, max(col.g, col.b));
  float scrim = 0.45 * env;
  gl_FragColor = vec4(col, max(spark, scrim));
}
`;

interface LifelineEffectsApi {
	launch: (effect: LifelineEventEffect) => void;
}

const LifelineEffectsContext =
	createContext<LifelineEffectsApi | null>(null);

export function useLifelineFireworks() {
	return useContext(LifelineEffectsContext);
}

function compileShader(
	gl: WebGLRenderingContext,
	type: number,
	source: string,
): WebGLShader | null {
	const shader = gl.createShader(type);

	if (!shader) {
		debugLog("error", "WebGL could not create a shader.");
		return null;
	}

	gl.shaderSource(shader, source);
	gl.compileShader(shader);

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		debugLog(
			"error",
			"Fireworks shader compilation failed.",
			gl.getShaderInfoLog(shader),
		);
		gl.deleteShader(shader);
		return null;
	}

	return shader;
}

function FireworksCanvas({
	palette,
	onDone,
}: {
	palette: Palette;
	onDone: () => void;
}) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const onDoneRef = useRef(onDone);
	onDoneRef.current = onDone;

	useEffect(() => {
		const canvas = canvasRef.current;

		if (!canvas) {
			debugLog("error", "Fireworks canvas ref is missing.");
			onDoneRef.current();
			return;
		}

		const context = canvas.getContext("webgl", {
			alpha: true,
			premultipliedAlpha: true,
			antialias: false,
		});

		if (!context) {
			debugLog(
				"error",
				"WebGL is unavailable; fireworks cannot start.",
			);
			onDoneRef.current();
			return;
		}

		const gl: WebGLRenderingContext = context;
		debugLog("debug", "WebGL fireworks context created.");

		const vertexShader = compileShader(
			gl,
			gl.VERTEX_SHADER,
			VERTEX_SHADER,
		);
		const fragmentShader = compileShader(
			gl,
			gl.FRAGMENT_SHADER,
			FRAGMENT_SHADER,
		);

		if (!vertexShader || !fragmentShader) {
			if (vertexShader) gl.deleteShader(vertexShader);
			if (fragmentShader) gl.deleteShader(fragmentShader);
			onDoneRef.current();
			return;
		}

		const program = gl.createProgram();

		if (!program) {
			debugLog("error", "WebGL could not create a program.");
			gl.deleteShader(vertexShader);
			gl.deleteShader(fragmentShader);
			onDoneRef.current();
			return;
		}

		gl.attachShader(program, vertexShader);
		gl.attachShader(program, fragmentShader);
		gl.linkProgram(program);

		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
			debugLog(
				"error",
				"Fireworks program linking failed.",
				gl.getProgramInfoLog(program),
			);
			gl.deleteProgram(program);
			gl.deleteShader(vertexShader);
			gl.deleteShader(fragmentShader);
			onDoneRef.current();
			return;
		}

		gl.useProgram(program);

		const buffer = gl.createBuffer();

		if (!buffer) {
			debugLog("error", "WebGL could not create a vertex buffer.");
			gl.deleteProgram(program);
			gl.deleteShader(vertexShader);
			gl.deleteShader(fragmentShader);
			onDoneRef.current();
			return;
		}

		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		gl.bufferData(
			gl.ARRAY_BUFFER,
			new Float32Array([-1, -1, 3, -1, -1, 3]),
			gl.STATIC_DRAW,
		);

		const positionLocation = gl.getAttribLocation(
			program,
			"a_pos",
		);

		if (positionLocation < 0) {
			debugLog(
				"error",
				"Fireworks shader attribute a_pos is missing.",
			);
			gl.deleteBuffer(buffer);
			gl.deleteProgram(program);
			gl.deleteShader(vertexShader);
			gl.deleteShader(fragmentShader);
			onDoneRef.current();
			return;
		}

		gl.enableVertexAttribArray(positionLocation);
		gl.vertexAttribPointer(
			positionLocation,
			2,
			gl.FLOAT,
			false,
			0,
			0,
		);

		const resolutionLocation =
			gl.getUniformLocation(program, "u_res");
		const timeLocation =
			gl.getUniformLocation(program, "u_time");
		const durationLocation =
			gl.getUniformLocation(program, "u_dur");
		const color0Location =
			gl.getUniformLocation(program, "u_c0");
		const color1Location =
			gl.getUniformLocation(program, "u_c1");
		const color2Location =
			gl.getUniformLocation(program, "u_c2");

		const [color0, color1, color2] = palette;

		gl.uniform3f(
			color0Location,
			color0[0] ?? 0,
			color0[1] ?? 0,
			color0[2] ?? 0,
		);
		gl.uniform3f(
			color1Location,
			color1[0] ?? 0,
			color1[1] ?? 0,
			color1[2] ?? 0,
		);
		gl.uniform3f(
			color2Location,
			color2[0] ?? 0,
			color2[1] ?? 0,
			color2[2] ?? 0,
		);

		const resize = () => {
			const dpr = Math.min(
				window.devicePixelRatio || 1,
				MAX_DPR,
			);
			canvas.width = Math.round(
				window.innerWidth * dpr,
			);
			canvas.height = Math.round(
				window.innerHeight * dpr,
			);
			gl.viewport(
				0,
				0,
				canvas.width,
				canvas.height,
			);
		};

		resize();
		window.addEventListener("resize", resize);

		let frame = 0;
		let finished = false;
		const startedAt = performance.now();

		const finish = () => {
			if (finished) return;
			finished = true;
			debugLog("debug", "Fireworks animation completed.");
			onDoneRef.current();
		};

		const renderFrame = (now: number) => {
			const elapsed = (now - startedAt) / 1000;

			if (elapsed >= FIREWORKS_DURATION_S) {
				finish();
				return;
			}

			gl.uniform2f(
				resolutionLocation,
				canvas.width,
				canvas.height,
			);
			gl.uniform1f(timeLocation, elapsed);
			gl.uniform1f(
				durationLocation,
				FIREWORKS_DURATION_S,
			);
			gl.clearColor(0, 0, 0, 0);
			gl.clear(gl.COLOR_BUFFER_BIT);
			gl.drawArrays(gl.TRIANGLES, 0, 3);

			frame = window.requestAnimationFrame(
				renderFrame,
			);
		};

		frame = window.requestAnimationFrame(renderFrame);

		return () => {
			finished = true;
			window.cancelAnimationFrame(frame);
			window.removeEventListener("resize", resize);
			gl.deleteBuffer(buffer);
			gl.deleteProgram(program);
			gl.deleteShader(vertexShader);
			gl.deleteShader(fragmentShader);
		};
	}, [palette]);

	return (
		<canvas
			ref={canvasRef}
			aria-hidden="true"
			className="pointer-events-none fixed inset-0 z-70 size-full"
		/>
	);
}

interface ConfettiParticle {
	x: number;
	y: number;
	vx: number;
	vy: number;
	size: number;
	rotation: number;
	spin: number;
	hue: number;
}

function ConfettiCanvas({
	onDone,
}: {
	onDone: () => void;
}) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const onDoneRef = useRef(onDone);
	onDoneRef.current = onDone;

	useEffect(() => {
		const canvas = canvasRef.current;

		if (!canvas) {
			debugLog("error", "Confetti canvas ref is missing.");
			onDoneRef.current();
			return;
		}

		const context = canvas.getContext("2d");

		if (!context) {
			debugLog(
				"error",
				"Canvas 2D is unavailable; confetti cannot start.",
			);
			onDoneRef.current();
			return;
		}

		const ctx: CanvasRenderingContext2D = context;
		let dpr = 1;

		const resize = () => {
			dpr = Math.min(
				window.devicePixelRatio || 1,
				MAX_DPR,
			);
			canvas.width = Math.round(
				window.innerWidth * dpr,
			);
			canvas.height = Math.round(
				window.innerHeight * dpr,
			);
			canvas.style.width = `${window.innerWidth}px`;
			canvas.style.height = `${window.innerHeight}px`;
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		};

		resize();
		window.addEventListener("resize", resize);

		const particles: ConfettiParticle[] =
			Array.from({ length: 160 }, (_, index) => {
				const side = index % 2 === 0 ? -1 : 1;

				return {
					x:
						side < 0
							? window.innerWidth * 0.2
							: window.innerWidth * 0.8,
					y: window.innerHeight,
					vx:
						side *
						(2 + Math.random() * 8),
					vy: -(8 + Math.random() * 12),
					size: 5 + Math.random() * 7,
					rotation:
						Math.random() * Math.PI * 2,
					spin:
						-0.2 + Math.random() * 0.4,
					hue:
						(index * 47 +
							Math.random() * 40) %
						360,
				};
			});

		debugLog("debug", "Confetti particles created.", {
			count: particles.length,
			width: window.innerWidth,
			height: window.innerHeight,
		});

		const startedAt = performance.now();
		let frame = 0;
		let finished = false;

		const finish = () => {
			if (finished) return;
			finished = true;
			debugLog("debug", "Confetti animation completed.");
			onDoneRef.current();
		};

		const renderFrame = (now: number) => {
			const elapsed =
				(now - startedAt) / 1000;

			if (elapsed >= CONFETTI_DURATION_S) {
				finish();
				return;
			}

			ctx.clearRect(
				0,
				0,
				window.innerWidth,
				window.innerHeight,
			);

			for (const particle of particles) {
				particle.vy += 0.24;
				particle.vx *= 0.995;
				particle.x += particle.vx;
				particle.y += particle.vy;
				particle.rotation += particle.spin;

				ctx.save();
				ctx.translate(
					particle.x,
					particle.y,
				);
				ctx.rotate(particle.rotation);
				ctx.fillStyle = `hsl(${particle.hue} 85% 58%)`;
				ctx.fillRect(
					-particle.size / 2,
					-particle.size / 3,
					particle.size,
					particle.size * 0.66,
				);
				ctx.restore();
			}

			frame = window.requestAnimationFrame(
				renderFrame,
			);
		};

		frame = window.requestAnimationFrame(renderFrame);

		return () => {
			finished = true;
			window.cancelAnimationFrame(frame);
			window.removeEventListener("resize", resize);
		};
	}, []);

	return (
		<canvas
			ref={canvasRef}
			aria-hidden="true"
			className="pointer-events-none fixed inset-0 z-70 size-full"
		/>
	);
}

export function LifelineFireworksProvider({
	children,
}: {
	children: ReactNode;
}) {
	const [playing, setPlaying] = useState(false);
	const [effect, setEffect] =
		useState<LifelineEventEffect>("fireworks");
	const { resolvedTheme, setTheme } = useTheme();

	const restoreThemeRef = useRef<string | null>(null);
	const nightfallRef = useRef<number | null>(null);
	const playingRef = useRef(false);

	useEffect(() => {
		debugLog("debug", "Effect provider mounted.");

		return () => {
			if (nightfallRef.current !== null) {
				window.clearTimeout(
					nightfallRef.current,
				);
			}
			debugLog("debug", "Effect provider unmounted.");
		};
	}, []);

	const launch = useCallback(
		(nextEffect: LifelineEventEffect) => {
			debugLog("debug", "Launch requested.", {
				effect: nextEffect,
				resolvedTheme,
			});

			if (playingRef.current) {
				debugLog(
					"warn",
					"Launch ignored because another effect is active.",
				);
				return;
			}

			if (
				window.matchMedia(
					"(prefers-reduced-motion: reduce)",
				).matches
			) {
				debugLog(
					"warn",
					"Launch skipped because reduced motion is enabled.",
				);
				return;
			}

			playingRef.current = true;
			setEffect(nextEffect);

			if (
				nextEffect !== "confetti" &&
				resolvedTheme === "light"
			) {
				restoreThemeRef.current = "light";
				setTheme("dark");

				if (nightfallRef.current !== null) {
					window.clearTimeout(
						nightfallRef.current,
					);
				}

				nightfallRef.current =
					window.setTimeout(() => {
						debugLog(
							"debug",
							"Nightfall delay finished.",
						);
						setPlaying(true);
					}, NIGHTFALL_MS);
				return;
			}

			restoreThemeRef.current = null;
			setPlaying(true);
		},
		[resolvedTheme, setTheme],
	);

	const done = useCallback(() => {
		debugLog("debug", "Effect cleanup started.", {
			effect,
		});
		playingRef.current = false;
		setPlaying(false);

		if (restoreThemeRef.current) {
			setTheme(restoreThemeRef.current);
			restoreThemeRef.current = null;
		}
	}, [effect, setTheme]);

	return (
		<LifelineEffectsContext.Provider value={{ launch }}>
			{children}

			{playing &&
				(effect === "confetti" ? (
					<ConfettiCanvas onDone={done} />
				) : (
					<FireworksCanvas
						palette={PALETTES[effect]}
						onDone={done}
					/>
				))}
		</LifelineEffectsContext.Provider>
	);
}