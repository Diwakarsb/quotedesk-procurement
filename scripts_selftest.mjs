/**
 * Self-test: proves the chain works on YOUR machine before you record.
 *   node scripts_selftest.mjs            → checks keys + runs extraction on V5
 *   node scripts_selftest.mjs --all      → all five vendor documents
 *
 * V5 (handwritten) is the default because it is the hardest case: if the model
 * reads 42 as 4.2, everything downstream is wrong and you need to know now.
 */
import fs from "node:fs";
import path from "node:path";

const env = {};
try {
  for (const line of fs.readFileSync(".env.local", "utf8").split("\n")) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].trim();
  }
} catch { console.error("✗ No .env.local found. Copy .env.local.example → .env.local and add a key.\n"); process.exit(1); }

const order = (env.PROVIDER_ORDER || "gemini,eden").split(",").map(s => s.trim());
console.log("Provider order:", order.join(" → "));
console.log("  GEMINI_API_KEY:", env.GEMINI_API_KEY ? `set (${env.GEMINI_API_KEY.slice(0,6)}…)` : "MISSING");
console.log("  EDENAI_API_KEY:", env.EDENAI_API_KEY ? `set (${env.EDENAI_API_KEY.slice(0,12)}…)` : "MISSING");

// Probe the API directly before touching the app: separates "bad key" from
// "retired model" from "server not running".
if (env.GEMINI_API_KEY) {
  process.stdout.write("\nProbing Gemini … ");
  try {
    const r = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models?key=" + env.GEMINI_API_KEY);
    if (r.status === 401 || r.status === 403) {
      console.log("REJECTED (HTTP " + r.status + ")");
      console.log("  The key was not accepted. Get one at https://aistudio.google.com/apikey");
      process.exit(1);
    }
    const d = await r.json();
    const names = (d.models || [])
      .filter(m => (m.supportedGenerationMethods || []).includes("generateContent"))
      .map(m => m.name.replace("models/", ""));
    const flash = names.filter(n => /flash/i.test(n) && !/thinking|8b/i.test(n)).slice(0, 6);
    console.log("ok — key accepted");
    console.log("  Models available to you:", flash.length ? flash.join(", ") : names.slice(0,6).join(", "));
    if (env.GEMINI_MODEL && !names.includes(env.GEMINI_MODEL)) {
      console.log(`  ⚠ GEMINI_MODEL='${env.GEMINI_MODEL}' is NOT in that list.`);
      console.log("     Clear it in .env.local to auto-select, or set one of the above.");
    }
  } catch (e) {
    console.log("could not reach the API:", e.message);
  }
}

const files = process.argv.includes("--all")
  ? fs.readdirSync("public/vendor-responses")
  : ["V5_Ashoka_Boards_handwritten_ratesheet.jpg"];

const rfx = JSON.parse(fs.readFileSync("data/rfx.json", "utf8"));
const truth = JSON.parse(fs.readFileSync("data/ground_truth.json", "utf8"));

// Find the dev server. Next picks 3001+ when 3000 is taken, so probe a range
// instead of assuming. PORT=xxxx overrides.
const PORTS = process.env.PORT ? [Number(process.env.PORT)] : [3000,3001,3002,3003,3004];
let BASE = null;
process.stdout.write("\nLooking for the dev server … ");
for (const p of PORTS) {
  try {
    const r = await fetch(`http://localhost:${p}/api/extract`, { method:"POST" });
    if (r.status === 400 || r.status === 500) { BASE = `http://localhost:${p}`; break; }
  } catch {}
}
if (!BASE) {
  console.log("not found on ports " + PORTS.join(", "));
  console.log("\n  Open a SECOND terminal tab (Cmd+T) and run:  npm run dev");
  console.log("  Leave it running, then run this script in the first tab.\n");
  process.exit(1);
}
console.log("found at " + BASE + "\n");

for (const f of files) {
  const p = path.join("public/vendor-responses", f);
  const buf = fs.readFileSync(p);
  const fd = new FormData();
  fd.append("file", new Blob([buf]), f);
  process.stdout.write(`→ ${f} … `);
  const t0 = Date.now();
  try {
    const r = await fetch(BASE + "/api/extract", { method: "POST", body: fd });
    const d = await r.json();
    if (!d.ok) { console.log("FAILED\n   ", d.error, "\n"); continue; }
    const x = d.result;
    const quoted = (x.lines || []).filter(l => l.rate_value != null).length;
    const unread = (x.lines || []).filter(l => l.status === "illegible").length;
    const grades = (x.grade_level_rates || []).length;
    console.log(`ok  ${((Date.now()-t0)/1000).toFixed(1)}s  [${x._provider}]`);
    console.log(`    vendor: ${x.vendor_name}`);
    console.log(`    uom: ${x.stated_uom}  currency: ${x.stated_currency}`);
    console.log(`    lines with a rate: ${quoted}   illegible: ${unread}   grade-level rates: ${grades}`);
    if (grades) x.grade_level_rates.forEach(g =>
      console.log(`      · ${g.grade} = ${g.rate_value} ${g.rate_uom}`));
    if ((x.unresolved_items||[]).length)
      console.log(`    unresolved: ${x.unresolved_items.map(u=>u.what).slice(0,3).join("; ")}`);
    // grade-fan check — the failure that matters most
    if (grades && quoted > grades)
      console.log("    ⚠ MODEL FANNED GRADE RATES ACROSS LINES — tighten rule 5 in schema.ts");
  } catch (e) {
    console.log("FAILED\n   ", e.message);
    if (/ECONNREFUSED|fetch failed/i.test(e.message))
      console.log("    Lost the dev server — check the tab running npm run dev.\n");
  }
  console.log();
}
