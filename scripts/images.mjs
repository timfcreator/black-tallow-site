// npm run images
//
// Turns the PNG exports in src/assets/art/ into what the site publishes:
//   src/assets/img/    WebP images at the widths the pages ask for, and the link-preview PNG
//   src/assets/icons/  favicon.ico, apple-touch-icon.png, icon-192.png, icon-512.png (copied to the site root)
//   src/_data/images.json  the width and height of every output, so templates never guess them
//
// Run it after replacing any PNG in src/assets/art/, then commit the PNG and everything it wrote.
// The build itself does not run this, so GitHub Actions never needs to process images.

import sharp from "sharp";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const ART = join(root, "src/assets/art");
const IMG = join(root, "src/assets/img");
const ICONS = join(root, "src/assets/icons");
const DATA = join(root, "src/_data/images.json");
const BLACK = { r: 0, g: 0, b: 0, alpha: 1 };

// Each source PNG, the size it must be, and the widths to publish.
// lossless: the wordmark is flat white on transparent, so lossless is both smaller and exact.
const SOURCES = [
  { name: "hero-wide", size: [2400, 1200], widths: [1200, 2400] },
  { name: "hero-stacked", size: [1080, 1350], widths: [540, 1080] },
  { name: "wordmark", widths: [695], lossless: true },
];

mkdirSync(IMG, { recursive: true });
mkdirSync(ICONS, { recursive: true });
const out = {};
const problems = [];

async function checkSize(file, [w, h]) {
  const m = await sharp(file).metadata();
  if (m.width !== w || m.height !== h) problems.push(`${file} is ${m.width}x${m.height}, expected ${w}x${h}`);
}

for (const src of SOURCES) {
  const file = join(ART, `${src.name}.png`);
  if (!existsSync(file)) { problems.push(`missing ${file}`); continue; }
  if (src.size) await checkSize(file, src.size);
  out[src.name] = [];
  for (const w of src.widths) {
    const dest = join(IMG, `${src.name}-${w}.webp`);
    const info = await sharp(file)
      .resize({ width: w, kernel: "lanczos3", withoutEnlargement: true })
      .webp(src.lossless ? { lossless: true, effort: 6 } : { quality: 90, effort: 6, smartSubsample: true })
      .toFile(dest);
    out[src.name].push({ src: `/assets/img/${src.name}-${w}.webp`, width: info.width, height: info.height, bytes: info.size });
  }
}

// The link preview stays PNG: some link scrapers still refuse WebP. It is not loaded by any page.
{
  const file = join(ART, "og-image.png");
  if (existsSync(file)) {
    await checkSize(file, [1200, 630]);
    const info = await sharp(file).flatten({ background: BLACK })
      .png({ compressionLevel: 9, palette: true, quality: 90, effort: 10 })
      .toFile(join(IMG, "og-image.png"));
    out["og-image"] = { src: "/assets/img/og-image.png", width: info.width, height: info.height, bytes: info.size };
  } else problems.push(`missing ${file}`);
}

// Icons: from candle.png (512x512). A hand-pixelled candle-32.png, if present, is used for favicon.ico.
{
  const file = join(ART, "candle.png");
  if (existsSync(file)) {
    await checkSize(file, [512, 512]);
    const icon = (size) => sharp(file).resize({ width: size, height: size, kernel: "lanczos3" }).flatten({ background: BLACK }).png();
    await icon(180).toFile(join(ICONS, "apple-touch-icon.png"));
    await icon(192).toFile(join(ICONS, "icon-192.png"));
    await icon(512).toFile(join(ICONS, "icon-512.png"));
    const small = join(ART, "candle-32.png");
    const png32 = existsSync(small)
      ? await sharp(small).resize({ width: 32, height: 32, kernel: "nearest" }).flatten({ background: BLACK }).png().toBuffer()
      : await icon(32).toBuffer();
    writeFileSync(join(ICONS, "favicon.ico"), icoFromPng(png32, 32));
  } else problems.push(`missing ${file}`);
}

writeFileSync(DATA, JSON.stringify(out, null, 2) + "\n");
for (const [k, v] of Object.entries(out))
  for (const o of [].concat(v)) console.log(`${k}: ${o.src} ${o.width}x${o.height} ${(o.bytes / 1024).toFixed(1)} KB`);
if (problems.length) {
  console.error("\nProblems:\n  " + problems.join("\n  "));
  process.exitCode = 1;
}

// An .ico file holding one PNG image (supported by every current browser).
function icoFromPng(png, size) {
  const header = Buffer.alloc(6 + 16);
  header.writeUInt16LE(0, 0);            // reserved
  header.writeUInt16LE(1, 2);            // type: icon
  header.writeUInt16LE(1, 4);            // one image
  header.writeUInt8(size % 256, 6);      // width (0 means 256)
  header.writeUInt8(size % 256, 7);      // height
  header.writeUInt8(0, 8);               // no palette
  header.writeUInt8(0, 9);               // reserved
  header.writeUInt16LE(1, 10);           // colour planes
  header.writeUInt16LE(32, 12);          // bits per pixel
  header.writeUInt32LE(png.length, 14);  // image size
  header.writeUInt32LE(22, 18);          // image offset
  return Buffer.concat([header, png]);
}
