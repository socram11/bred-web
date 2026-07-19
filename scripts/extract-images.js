const fs = require("fs");
const path = require("path");

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
const re = /(\w+):"(data:image\/[^"]+)"/g;
const manifest = {};
let m;

while ((m = re.exec(match[1])) !== null) {
  const key = m[1];
  const dataUrl = m[2];
  const parts = dataUrl.match(/^data:image\/(\w+);base64,(.+)$/);
  if (!parts) continue;
  const ext = parts[1] === "jpeg" ? "jpg" : parts[1];
  const filename = `${key}.${ext}`;
  const buf = Buffer.from(parts[2], "base64");
  fs.writeFileSync(path.join(outDir, filename), buf);
  manifest[key] = `/products/${filename}`;
  console.log(`Extracted ${filename} (${buf.length} bytes)`);
}

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
console.log(`Done: ${Object.keys(manifest).length} images`);
