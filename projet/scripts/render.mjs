// node scripts/render.mjs <Comp> <out.mp4> [f0 f1]  (full quality, with audio)
import fs from "node:fs";
import path from "node:path";
const tmp = path.resolve("tmp"); fs.mkdirSync(tmp, { recursive: true }); process.env.TEMP = process.env.TMP = tmp;
const { bundle } = await import("@remotion/bundler");
const { renderMedia, selectComposition } = await import("@remotion/renderer");
const [comp, out, f0, f1] = process.argv.slice(2);
const browserExecutable = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const chromiumOptions = { gl: "angle" };
const inputProps = { audio: true };
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts"), publicDir: path.resolve("public") });
const composition = await selectComposition({ serveUrl, id: comp, browserExecutable, chromiumOptions, inputProps });
const t0 = Date.now(); let last = -1;
await renderMedia({ composition, serveUrl, codec: "h264", crf: 17, audioCodec: "aac", audioBitrate: "192k", outputLocation: out, inputProps,
  frameRange: f0 ? [Number(f0), Number(f1)] : undefined, browserExecutable, chromiumOptions, concurrency: 1, timeoutInMilliseconds: 300000,
  onProgress: ({ renderedFrames }) => { if (renderedFrames % 50 === 0 && renderedFrames !== last) { last = renderedFrames; console.log("frames", renderedFrames, ((Date.now() - t0) / 1000).toFixed(0) + "s"); } } });
console.log("DONE in", ((Date.now() - t0) / 1000).toFixed(0), "s");
