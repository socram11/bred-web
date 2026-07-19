import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.resolve(__dirname, "../../bred-ecommerce-1.html");
const outDir = path.resolve(__dirname, "../public/products");
const manifestPath = path.resolve(__dirname, "image-manifest.json");

const html = fs.readFileSync(htmlPath, "utf8");
const match = html.match(/const IMGS=\{([\s\S]*?)\};\s*const P=/);
if (!match) {
  console.error("IMGS block not found");
  process.exit(1);
}

fs.mkdirSync(outDir, { recursive: true });
const entries = [...match[1].matchAll(/(\w+):"(data:image\/[^"]+)"/g)];
const manifest = {};

for (const [key, dataUrl] of entries) {
  const m = dataUrl.match(/^data:image\/(\w+);base64,(.+)$/);
  if (!m) continue;
  const ext = m[1] === "jpeg" ? "jpg" : m[1];
  const filename = `${key}.${ext}`;
  const buf = Buffer.from(m[2], "base64");
  fs.writeFileSync(path.join(outDir, filename), buf);
  manifest[key] = `/products/${filename}`;
  console.log(`Extracted ${filename} (${buf.length} bytes)`);
}

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
console.log(`Done: ${Object.keys(manifest).length} images`);
