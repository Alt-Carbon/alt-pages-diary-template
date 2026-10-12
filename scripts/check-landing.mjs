// Pixel-diff frames around a page landing, in headless Chrome: is the left page jumping when a turn completes?
import { spawn } from "node:child_process";
import { writeFileSync, mkdirSync } from "node:fs";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const url = process.argv[2] || "http://localhost:4323/#writing", out = process.argv[3] || "/tmp/claude-landing"; mkdirSync(out, { recursive: true });
const port = 9334;
const chrome = spawn(CHROME, [`--headless=new`, `--remote-debugging-port=${port}`, `--window-size=1440,900`, `--user-data-dir=/tmp/claude-diary-chrome2`, `--no-first-run`, "about:blank"], { stdio: "ignore" });
setTimeout(() => { try { chrome.kill(); } catch {} console.log("watchdog"); process.exit(2); }, 50000);
await new Promise(r => setTimeout(r, 1500));
const targets = await fetch(`http://127.0.0.1:${port}/json`).then(r => r.json());
const ws = new WebSocket(targets.find(t => t.type === "page").webSocketDebuggerUrl);
await new Promise(r => ws.onopen = r);
let id = 0; const pending = {};
ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && pending[m.id]) { pending[m.id](m); delete pending[m.id]; } };
const send = (method, params = {}) => new Promise(res => { const i = ++id; pending[i] = res; ws.send(JSON.stringify({ id: i, method, params })); });
const evaluate = async (expr) => (await send("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true })).result?.result?.value;
const sleep = ms => new Promise(r => setTimeout(r, ms));
await send("Page.enable"); await send("Runtime.enable");
await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
await send("Page.navigate", { url }); await sleep(3000);
const nb = JSON.parse(await evaluate("JSON.stringify(document.querySelector('.page.show [data-next]').getBoundingClientRect())"));
const x = nb.x + 10, y = nb.y + 8;
const t0 = Date.now();
// In the page: while the leaf is in the air, compare where its back draws the page's first lines with
// where the real left page draws them once it has that content (same DOM, two layouts).
const probe = evaluate(`(async () => { const out = []; const t1 = performance.now();
  const r = el => { const b = el.getBoundingClientRect(); return [b.left, b.top, b.width, b.height]; };
  await new Promise(done => { const tick = () => {
    const sheet = document.querySelector('.sheet3d'); const lp = document.querySelector('#lp .pg');
    if (sheet && lp) { const strips = sheet.querySelectorAll('.strip'); const last = strips[strips.length - 1];
      const a = last && last.querySelector('.cut.back .pg > *'), b = lp.firstElementChild;
      if (a && b && a.className === b.className) out.push([Math.round(performance.now() - t1), r(a).map((v, i) => +(v - r(b)[i]).toFixed(2))]); }
    if (performance.now() - t1 < 1500) requestAnimationFrame(tick); else done(); }; requestAnimationFrame(tick); });
  return JSON.stringify(out.slice(-6)); })()`);
await send("Input.dispatchMouseEvent", { type: "mousePressed", x, y, button: "left", clickCount: 1 });
await send("Input.dispatchMouseEvent", { type: "mouseReleased", x, y, button: "left", clickCount: 1 });
// Frames as fast as they come, from just before the leaf lands until well after (the turn is 620ms).
const left = JSON.parse(await evaluate("JSON.stringify(document.getElementById('left').getBoundingClientRect())"));
const clip = { x: left.x, y: left.y, width: left.width, height: left.height, scale: 1 };
const frames = [];
while (Date.now() - t0 < 520) await sleep(5);
while (Date.now() - t0 < 1400) {
  const r = await send("Page.captureScreenshot", { format: "png", clip });
  frames.push([Date.now() - t0, r.result.data]);
}
// diff consecutive frames (each is the left page), in the page itself (canvas)
left.x = 0; left.y = 0;
for (let i = 1; i < frames.length; i++) {
  const expr = `(async () => { const load = d => new Promise(r => { const im = new Image(); im.onload = () => r(im); im.src = 'data:image/png;base64,' + d; });
    const [a, b] = await Promise.all([load(${JSON.stringify(frames[i-1][1])}), load(${JSON.stringify(frames[i][1])})]);
    const R = ${JSON.stringify(left)}; const c = document.createElement('canvas'); c.width = R.width; c.height = R.height; const g = c.getContext('2d');
    g.drawImage(a, R.x, R.y, R.width, R.height, 0, 0, R.width, R.height); const A = g.getImageData(0, 0, R.width, R.height).data;
    g.drawImage(b, R.x, R.y, R.width, R.height, 0, 0, R.width, R.height); const Bd = g.getImageData(0, 0, R.width, R.height).data;
    let n = 0, x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1; for (let p = 0; p < A.length; p += 4) { const d = Math.abs(A[p]-Bd[p]) + Math.abs(A[p+1]-Bd[p+1]) + Math.abs(A[p+2]-Bd[p+2]); if (d > 40) { n++; const px = (p/4) % R.width, py = Math.floor((p/4) / R.width); if (px < x0) x0 = px; if (px > x1) x1 = px; if (py < y0) y0 = py; if (py > y1) y1 = py; } }
    return JSON.stringify({ changed: n, box: n ? [x0, y0, x1, y1] : null }); })()`;
  console.log(`${frames[i-1][0]}ms → ${frames[i][0]}ms  left page diff:`, await evaluate(expr));
}
frames.forEach(([t, d]) => writeFileSync(`${out}/f-${t}.png`, Buffer.from(d, "base64")));
console.log("back-vs-page deltas [t, dx, dy, dw, dh] (last samples):", await probe);
console.log("state:", await evaluate("location.hash + ' shown=' + [...document.querySelectorAll('.page.show')].map(p=>p.id)"));
chrome.kill(); process.exit(0);
