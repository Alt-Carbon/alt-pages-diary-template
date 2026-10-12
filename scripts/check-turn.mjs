// Watch the notebook turn: headless Chrome over CDP opens the dev server, clicks the Reading tab,
// saves frames of the turn and of Prev, then a phone layout. Usage: node scripts/check-turn.mjs [url] [outdir]
// The browser extension tab cannot do this: it is hidden, so animation frames never run there.
import { spawn } from "node:child_process";
import { writeFileSync, mkdirSync } from "node:fs";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const url = process.argv[2] || "http://localhost:4323/";
const out = process.argv[3] || "frames"; mkdirSync(out, { recursive: true });
const port = 9333;
setTimeout(() => { try { chrome.kill(); } catch {} console.log("watchdog"); process.exit(2); }, 50000);
const chrome = spawn(CHROME, [`--headless=new`, `--remote-debugging-port=${port}`, `--window-size=1440,900`, `--user-data-dir=/tmp/claude-diary-chrome`, `--no-first-run`, "about:blank"], { stdio: "ignore" });
let targets = null;
for (let i = 0; i < 30 && !targets; i++) { await new Promise(r => setTimeout(r, 400)); targets = await fetch(`http://127.0.0.1:${port}/json`).then(r => r.json()).catch(() => null); }
const ws = new WebSocket(targets.find(t => t.type === "page").webSocketDebuggerUrl);
await new Promise(r => ws.onopen = r);
let id = 0; const pending = {};
ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && pending[m.id]) { pending[m.id](m); delete pending[m.id]; } };
const send = (method, params = {}) => new Promise(res => { const i = ++id; pending[i] = res; ws.send(JSON.stringify({ id: i, method, params })); });
const evaluate = async (expr) => (await send("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true })).result?.result?.value;
const shot = async (name) => { const r = await send("Page.captureScreenshot", { format: "jpeg", quality: 70 }); writeFileSync(`${out}/${name}.jpg`, Buffer.from(r.result.data, "base64")); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
await send("Page.enable"); await send("Runtime.enable");
await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
await send("Page.navigate", { url });
await sleep(3500);
await shot("00-home");
console.log("leaves:", await evaluate("[...document.querySelectorAll('#pages .page')].map(p=>p.id.replace('page-','')).join(' ')"));
// click the Reading tab with a real-looking mouse event (detail 1 = animate)
const box = await evaluate("JSON.stringify(document.querySelector('#tabs button[data-id=reading]').getBoundingClientRect())");
const b = JSON.parse(box); const x = b.x + b.width / 2, y = b.y + b.height / 2;
await send("Input.dispatchMouseEvent", { type: "mousePressed", x, y, button: "left", clickCount: 1 });
await send("Input.dispatchMouseEvent", { type: "mouseReleased", x, y, button: "left", clickCount: 1 });
for (let i = 1; i <= 6; i++) { await sleep(220); await shot(`turn-${i}`); }
await sleep(1200); await shot("07-reading-landed");
console.log("after click:", await evaluate("location.hash + ' busy=' + document.getElementById('book').getAttribute('aria-busy') + ' shown=' + [...document.querySelectorAll('.page.show')].map(p=>p.id).join(',')"));
// back one leaf with the Prev button
const pb = JSON.parse(await evaluate("JSON.stringify(document.querySelector('.page.show [data-prev]').getBoundingClientRect())"));
await send("Input.dispatchMouseEvent", { type: "mousePressed", x: pb.x + 10, y: pb.y + 8, button: "left", clickCount: 1 });
await send("Input.dispatchMouseEvent", { type: "mouseReleased", x: pb.x + 10, y: pb.y + 8, button: "left", clickCount: 1 });
await sleep(350); await shot("08-prev-mid"); await sleep(900); await shot("09-prev-landed");
console.log("after prev:", await evaluate("location.hash + ' shown=' + [...document.querySelectorAll('.page.show')].map(p=>p.id).join(',')"));
// phone
await send("Emulation.setDeviceMetricsOverride", { width: 600, height: 1100, deviceScaleFactor: 1, mobile: true });
await send("Page.navigate", { url: url + "#now" }); await sleep(2500); await shot("10-phone-now");
console.log("phone leaves:", await evaluate("[...document.querySelectorAll('#pages .page')].length + ' shown=' + [...document.querySelectorAll('.page.show')].map(p=>p.id).join(',')"));
chrome.kill(); process.exit(0);
