import { createFileRoute } from "@tanstack/react-router";
import { stringHash } from "facehash";

const DEFAULT_BACKGROUND = "#d1d5db";

type FaceTemplate = {
    viewBox: string;
    width: number;
    height: number;
    content: (foreground: string) => string;
};

const FACE_TEMPLATES: readonly FaceTemplate[] = [
    {
        viewBox: "0 0 63 15",
        width: 63,
        height: 15,
        content: (foreground) => `
            <g class="facehash-eye">
                <circle cx="55.2" cy="7.2" r="7.2" fill="${foreground}" />
            </g>
            <g class="facehash-eye">
                <circle cx="7.2" cy="7.2" r="7.2" fill="${foreground}" />
            </g>
        `,
    },
    {
        viewBox: "0 0 71 23",
        width: 71,
        height: 23,
        content: (foreground) => `
            <g class="facehash-eye" fill="${foreground}">
                <rect x="8" y="0" width="7" height="23" rx="3.5" />
                <rect x="0" y="8" width="23" height="7" rx="3.5" />
            </g>
            <g class="facehash-eye" fill="${foreground}">
                <rect x="55.2" y="0" width="7" height="23" rx="3.5" />
                <rect x="47.3" y="8" width="23" height="7" rx="3.5" />
            </g>
        `,
    },
    {
        viewBox: "0 0 82 8",
        width: 82,
        height: 8,
        content: (foreground) => `
            <g class="facehash-eye" fill="${foreground}">
                <rect x="0.07" y="0.16" width="6.9" height="6.9" rx="3.5" />
                <rect x="7.9" y="0.16" width="20.7" height="6.9" rx="3.5" />
            </g>
            <g class="facehash-eye" fill="${foreground}">
                <rect x="74.7" y="0.16" width="6.9" height="6.9" rx="3.5" />
                <rect x="53.1" y="0.16" width="20.7" height="6.9" rx="3.5" />
            </g>
        `,
    },
    {
        viewBox: "0 0 63 9",
        width: 63,
        height: 9,
        content: (foreground) => `
            <g class="facehash-eye">
                <path
                    fill="${foreground}"
                    d="M0 5.1c0-.1 0-.2 0-.3.1-.5.3-1 .7-1.3.1 0 .1-.1.2-.1C2.4 2.2 6 0 10.5 0S18.6 2.2 20.2 3.3c.1 0 .1.1.1.1.4.3.7.9.7 1.3v.3c0 1 0 1.4 0 1.7-.2 1.3-1.2 1.9-2.5 1.6-.2 0-.7-.3-1.8-.8C15 6.7 12.8 6 10.5 6s-4.5.7-6.3 1.5c-1 .5-1.5.7-1.8.8-1.3.3-2.3-.3-2.5-1.6v-1.7z"
                />
            </g>
            <g class="facehash-eye">
                <path
                    fill="${foreground}"
                    d="M42 5.1c0-.1 0-.2 0-.3.1-.5.3-1 .7-1.3.1 0 .1-.1.2-.1C44.4 2.2 48 0 52.5 0S60.6 2.2 62.2 3.3c.1 0 .1.1.1.1.4.3.7.9.7 1.3v.3c0 1 0 1.4 0 1.7-.2 1.3-1.2 1.9-2.5 1.6-.2 0-.7-.3-1.8-.8C57 6.7 54.8 6 52.5 6s-4.5.7-6.3 1.5c-1 .5-1.5.7-1.8.8-1.3.3-2.3-.3-2.5-1.6v-1.7z"
                />
            </g>
        `,
    },
];

const HEX_COLOR_PATTERN =
    /^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

function parseSize(value: string | null) {
    const size = Number.parseInt(value ?? "64", 10);

    return Number.isNaN(size) ? 64 : Math.min(Math.max(size, 16), 512);
}

function normalizeColor(value: string | null) {
    if (!value || !HEX_COLOR_PATTERN.test(value)) {
        return DEFAULT_BACKGROUND;
    }

    return value;
}

function getForegroundColor(background: string) {
    let hex = background.slice(1);

    if (hex.length === 3 || hex.length === 4) {
        hex = hex
            .slice(0, 3)
            .split("")
            .map((character) => character + character)
            .join("");
    } else {
        hex = hex.slice(0, 6);
    }

    const red = Number.parseInt(hex.slice(0, 2), 16);
    const green = Number.parseInt(hex.slice(2, 4), 16);
    const blue = Number.parseInt(hex.slice(4, 6), 16);

    const luminance =
        (red * 0.2126 + green * 0.7152 + blue * 0.0722) / 255;

    return luminance > 0.55 ? "#24272f" : "#ffffff";
}

function escapeXml(value: string) {
    return value.replace(/[<>&'"]/g, (character) => {
        const entities: Record<string, string> = {
            "<": "&lt;",
            ">": "&gt;",
            "&": "&amp;",
            "'": "&apos;",
            '"': "&quot;",
        };

        return entities[character] ?? character;
    });
}

function createFacehashSvg({
    name,
    size,
    background,
}: {
    name: string;
    size: number;
    background: string;
}) {
    const hash = stringHash(name);
    const template =
        FACE_TEMPLATES[hash % FACE_TEMPLATES.length] ?? FACE_TEMPLATES[0]!;

    const foreground = getForegroundColor(background);
    const initial = escapeXml(Array.from(name)[0]?.toUpperCase() ?? "");

    const faceWidth = 60;
    const faceHeight = faceWidth * (template.height / template.width);
    const faceX = 20;
    const faceY = 29;

    const blinkSeed = hash * 31;
    const blinkDelay = (blinkSeed % 40) / 10;
    const blinkDuration = 2 + (blinkSeed % 40) / 10;

    return `
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="${size}"
            height="${size}"
            viewBox="0 0 100 100"
        >
            <style>
                @keyframes facehash-blink {
                    0%, 92%, 100% { transform: scaleY(1); }
                    96% { transform: scaleY(0.05); }
                }

                .facehash-eye {
                    animation: facehash-blink ${blinkDuration}s ease-in-out ${blinkDelay}s infinite;
                    transform-box: fill-box;
                    transform-origin: center;
                }
            </style>

            <rect width="100" height="100" rx="50" fill="${background}" />

            <svg
                x="${faceX}"
                y="${faceY}"
                width="${faceWidth}"
                height="${faceHeight}"
                viewBox="${template.viewBox}"
                preserveAspectRatio="xMidYMid meet"
            >
                ${template.content(foreground)}
            </svg>

            <text
                x="50"
                y="69"
                fill="${foreground}"
                font-family="Arial, system-ui, sans-serif"
                font-size="26"
                font-weight="400"
                text-anchor="middle"
                dominant-baseline="middle"
            >
                ${initial}
            </text>
        </svg>
    `.trim();
}

export const Route = createFileRoute("/api/avatar")({
    server: {
        handlers: {
            GET: ({ request }) => {
                const url = new URL(request.url);
                const name = url.searchParams.get("name")?.trim();

                if (!name) {
                    return new Response("Missing name", { status: 400 });
                }

                const svg = createFacehashSvg({
                    name,
                    size: parseSize(url.searchParams.get("size")),
                    background: normalizeColor(url.searchParams.get("color")),
                });

                return new Response(svg, {
                    headers: {
                        "Content-Type": "image/svg+xml; charset=utf-8",
                        "Cache-Control": import.meta.env.DEV
                            ? "no-store"
                            : "public, max-age=31536000, immutable",
                    },
                });
            },
        },
    },
});
