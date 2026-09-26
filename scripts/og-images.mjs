// Generates the social share cards (1200×630) and app icons from the site's own
// content, fonts and palette. Output is committed, like scripts/optimize-images.mjs:
//   public/og/site.jpg, public/og/<project id>.jpg
//   public/favicon.svg, favicon.ico, apple-touch-icon.png, icon-192.png,
//   icon-512.png, icon-maskable-512.png
// Run: npm run og
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { Resvg } from "@resvg/resvg-js";
import satori from "satori";
import sharp from "sharp";
import { copy, profile, stats } from "../src/content/profile.ts";
import { projectCategories, projects } from "../src/content/projects.ts";

const W = 1200;
const H = 630;
// Light palette from src/styles/tokens.css.
const C = { bg: "#f1efea", raised: "#e9e6df", sunken: "#e2dfd7", fg: "#121211", muted: "#5c5953", subtle: "#696660", line: "rgba(18,18,17,0.14)", accent: "#2234f0" };

const font = (pkg, file) => readFileSync(`node_modules/${pkg}/files/${file}`);
const fonts = [
  { name: "Inter Tight", data: font("@fontsource/inter-tight", "inter-tight-latin-500-normal.woff"), weight: 500, style: "normal" },
  { name: "Inter Tight", data: font("@fontsource/inter-tight", "inter-tight-latin-700-normal.woff"), weight: 700, style: "normal" },
  { name: "Instrument Serif", data: font("@fontsource/instrument-serif", "instrument-serif-latin-400-italic.woff"), weight: 400, style: "italic" },
  { name: "JetBrains Mono", data: font("@fontsource/jetbrains-mono", "jetbrains-mono-latin-500-normal.woff"), weight: 500, style: "normal" },
];

/** Minimal element factory for satori (it takes React-like objects). */
const h = (type, style, ...children) => ({ type, props: { style: { display: "flex", ...style }, children: children.flat().filter((c) => c !== false && c != null) } });
const img = (src, width, height, style = {}) => ({ type: "img", props: { src, width, height, style } });

const label = (text, style = {}) =>
  h("div", { fontFamily: "JetBrains Mono", fontWeight: 500, fontSize: 20, letterSpacing: "0.08em", textTransform: "uppercase", color: C.muted, ...style }, text);

const mark = (size = 34) =>
  h("div", { alignItems: "baseline", fontFamily: "Inter Tight", fontWeight: 700, fontSize: size, letterSpacing: "-0.04em", color: C.fg }, "ART", h("span", { fontFamily: "Instrument Serif", fontStyle: "italic", fontWeight: 400, color: C.accent }, "."));

async function render(tree, width = W, height = H) {
  const svg = await satori(tree, { width, height, fonts });
  return { svg, png: new Resvg(svg, { fitTo: { mode: "width", value: width } }).render().asPng() };
}

async function jpeg(tree, file) {
  const { png } = await render(tree);
  const out = await sharp(png).jpeg({ quality: 86, mozjpeg: true }).toFile(file);
  console.log(`${file.padEnd(40)} ${(out.size / 1024).toFixed(0)} KB`);
}

// ---- Site card
function siteCard() {
  const years = stats.find((s) => /year/i.test(s.label))?.value ?? profile.yearsExperience;
  const delivered = stats.find((s) => /project/i.test(s.label))?.value;
  return h(
    "div",
    { width: W, height: H, flexDirection: "column", justifyContent: "space-between", padding: "56px 64px", backgroundColor: C.bg, fontFamily: "Inter Tight", color: C.fg },
    // No domain printed on the cards, so they stay valid when SITE_URL changes.
    h("div", { justifyContent: "space-between", alignItems: "center" }, mark(), label("Portfolio")),
    h(
      "div",
      { flexDirection: "column" },
      h("div", { fontWeight: 700, fontSize: 118, lineHeight: 0.95, letterSpacing: "-0.055em" }, profile.name),
      h("div", { fontFamily: "Instrument Serif", fontStyle: "italic", fontSize: 104, lineHeight: 1.05, color: C.accent, marginTop: 6, paddingLeft: 96 }, profile.title),
    ),
    h(
      "div",
      { flexDirection: "column" },
      h("div", { height: 1, backgroundColor: C.line, marginBottom: 24 }),
      h(
        "div",
        { justifyContent: "space-between", alignItems: "center" },
        label([`${years} years`, delivered && `${delivered} projects`, "React · Next.js · Node.js"].filter(Boolean).join("  ·  "), { color: C.fg }),
        h(
          "div",
          { alignItems: "center", gap: 12 },
          h("div", { width: 12, height: 12, borderRadius: 12, backgroundColor: "#1f9d55" }),
          label(copy.heroBadge.replace(/ & Freelance$/, ""), { color: C.fg }),
        ),
      ),
    ),
  );
}

// ---- Project cards
const categoryLabel = (key) => projectCategories.find((c) => c.key === key)?.label ?? key;
const pad2 = (n) => String(n).padStart(2, "0");
const hostOf = (url) => new URL(url).hostname.replace(/^www\./, "");

async function screenshot(id, maxW, maxH) {
  const src = JSON.parse(readFileSync("legacy/content-extracted.json", "utf8")).projects.find((p) => p.id === id).image;
  const input = `legacy/public${src}`;
  const meta = await sharp(input).metadata();
  // Whole screenshot, never cropped: fit inside the box at its own aspect ratio.
  const scale = Math.min(maxW / meta.width, maxH / meta.height, 1);
  const w = Math.round(meta.width * scale);
  const hgt = Math.round(meta.height * scale);
  const buf = await sharp(input).resize({ width: w * 2 }).png().toBuffer();
  return { src: `data:image/png;base64,${buf.toString("base64")}`, w, h: hgt };
}

async function projectCard(p) {
  const n = projects.indexOf(p) + 1;
  const titleSize = p.title.length <= 10 ? 84 : p.title.length <= 16 ? 68 : 56;
  // Browser-style frame, as on the site.
  const BAR = 34;
  const PAD = 10;
  const shot = await screenshot(p.id, 600 - PAD * 2, 470 - BAR - PAD * 2);
  const frame = h(
    "div",
    { flexDirection: "column", borderRadius: 12, border: `1px solid ${C.line}`, backgroundColor: C.raised, boxShadow: "0 30px 60px -30px rgba(0,0,0,0.45)", overflow: "hidden" },
    h(
      "div",
      { height: BAR, alignItems: "center", gap: 7, padding: "0 12px", borderBottom: `1px solid ${C.line}` },
      ...[0, 1, 2].map(() => h("div", { width: 9, height: 9, borderRadius: 9, backgroundColor: "rgba(18,18,17,0.28)" })),
      h("div", { flex: 1, justifyContent: "center", marginLeft: 10, marginRight: 36, padding: "4px 10px", borderRadius: 20, backgroundColor: C.bg, fontFamily: "JetBrains Mono", fontSize: 13, letterSpacing: "0.06em", color: C.subtle }, hostOf(p.liveUrl).toUpperCase()),
    ),
    h("div", { padding: PAD, backgroundColor: C.sunken }, img(shot.src, shot.w, shot.h, { borderRadius: 4 })),
  );

  return h(
    "div",
    { width: W, height: H, padding: "56px 64px", backgroundColor: C.bg, fontFamily: "Inter Tight", color: C.fg, gap: 48 },
    h(
      "div",
      { flex: 1, flexDirection: "column", justifyContent: "space-between" },
      mark(30),
      h(
        "div",
        { flexDirection: "column" },
        h("div", { gap: 20 }, label(`Project ${pad2(n)} / ${pad2(projects.length)}`, { color: C.accent }), label(categoryLabel(p.category))),
        h("div", { fontWeight: 700, fontSize: titleSize, lineHeight: 1, letterSpacing: "-0.045em", marginTop: 22 }, p.title),
        h("div", { fontWeight: 500, fontSize: 26, lineHeight: 1.3, color: C.muted, marginTop: 22, lineClamp: 4 }, p.summary),
      ),
      label("Case study", { fontSize: 18, color: C.subtle }),
    ),
    h("div", { width: 600, alignItems: "center", justifyContent: "center" }, frame),
  );
}

// ---- Icons: "A" with the accent full stop, on ink.
function iconTree(size, { inset = 0, rounded = true } = {}) {
  const glyph = Math.round((size - inset * 2) * 0.62);
  return h(
    "div",
    { width: size, height: size, alignItems: "center", justifyContent: "center", backgroundColor: "#121211", borderRadius: rounded ? size * 0.22 : 0 },
    h(
      "div",
      { alignItems: "baseline", fontFamily: "Inter Tight", fontWeight: 700, fontSize: glyph, letterSpacing: "-0.04em", color: C.bg, lineHeight: 1, marginTop: glyph * 0.04 },
      "A",
      h("span", { fontFamily: "Instrument Serif", fontStyle: "italic", fontWeight: 400, color: "#8d98ff" }, "."),
    ),
  );
}

/** ICO container holding PNG images (supported by every current browser). */
function ico(pngs) {
  const header = Buffer.alloc(6 + 16 * pngs.length);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(pngs.length, 4);
  let offset = header.length;
  pngs.forEach(({ size, data }, i) => {
    const e = 6 + i * 16;
    header.writeUInt8(size >= 256 ? 0 : size, e);
    header.writeUInt8(size >= 256 ? 0 : size, e + 1);
    header.writeUInt16LE(1, e + 4);
    header.writeUInt16LE(32, e + 6);
    header.writeUInt32LE(data.length, e + 8);
    header.writeUInt32LE(offset, e + 12);
    offset += data.length;
  });
  return Buffer.concat([header, ...pngs.map((p) => p.data)]);
}

async function icons() {
  const png = async (size, opts) => (await render(iconTree(size, opts), size, size)).png;
  writeFileSync("public/favicon.svg", (await render(iconTree(64), 64, 64)).svg);
  writeFileSync("public/favicon.ico", ico([{ size: 16, data: await png(16) }, { size: 32, data: await png(32) }, { size: 48, data: await png(48) }]));
  // Apple and maskable icons are cropped by the platform, so they get a square tile.
  writeFileSync("public/apple-touch-icon.png", await png(180, { rounded: false }));
  writeFileSync("public/icon-192.png", await png(192));
  writeFileSync("public/icon-512.png", await png(512));
  writeFileSync("public/icon-maskable-512.png", await png(512, { rounded: false, inset: 80 }));
  console.log("icons: favicon.svg, favicon.ico (16/32/48), apple-touch-icon.png, icon-192/512.png, icon-maskable-512.png");
}

mkdirSync("public/og", { recursive: true });
await jpeg(siteCard(), "public/og/site.jpg");
for (const p of projects) await jpeg(await projectCard(p), `public/og/${p.id}.jpg`);
await icons();
