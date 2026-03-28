import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(__dirname, "../js/data.js");
const outPath = path.join(__dirname, "../js/tmdbFallbackUrls.js");

function collectPairs() {
  const text = fs.readFileSync(dataPath, "utf8");
  const map = new Map();
  const add = (id, type) => {
    const t = type || "movie";
    map.set(`${t}-${id}`, [String(id), t]);
  };

  for (const m of text.matchAll(/tmdbId:\s*(\d+),\s*\n\s*tmdbType:\s*"(movie|tv)"/g)) {
    add(m[1], m[2]);
  }
  for (const m of text.matchAll(
    /item\(\d+,\s*"[^"]*",\s*(\d+),\s*"(movie|tv)"/g,
  )) {
    add(m[1], m[2]);
  }
  return [...map.values()];
}

function parseOgImages(html) {
  const re =
    /<meta\s+property="og:image"\s+content="(https:\/\/[^"]+)"/gi;
  const urls = [];
  let x;
  while ((x = re.exec(html)) !== null) urls.push(x[1]);
  return urls;
}

function toImageTmdb(u) {
  return u.replace("https://media.themoviedb.org/", "https://image.tmdb.org/");
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const pairs = collectPairs();
  const result = {};

  for (let i = 0; i < pairs.length; i++) {
    const [id, type] = pairs[i];
    const url = `https://www.themoviedb.org/${type}/${id}`;
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; CatalogFallback/1.0)" },
      });
      const html = await res.text();
      const og = parseOgImages(html).map(toImageTmdb);
      const poster = og.find((u) => /\/w\d+\/[^/]+\.jpg$/i.test(u) && u.includes("/w500/")) || og[0] || "";
      let backdrop = og.find((u) => u.includes("/w780/") || u.includes("/w1280/")) || "";
      if (backdrop && backdrop.includes("/w780/")) {
        backdrop = backdrop.replace("/w780/", "/w1280/");
      }
      if (!backdrop && poster) {
        backdrop = poster.replace("/w500/", "/w1280/");
      }
      result[`${type}-${id}`] = { poster, backdrop };
      process.stdout.write(`\r${i + 1}/${pairs.length} ${type}-${id}`);
    } catch (e) {
      console.error(`\nfail ${type}-${id}:`, e.message);
      result[`${type}-${id}`] = { poster: "", backdrop: "" };
    }
    await sleep(150);
  }

  const body = `/**
 * URLs estáticas das capas (og:image das páginas públicas do TMDB).
 * Usadas quando não há TMDB_API_KEY ou a API falha — o CDN não exige chave.
 * Gerado por: catalogo/scripts/build-tmdb-fallbacks.mjs
 */
export const TMDB_FALLBACK_URLS = ${JSON.stringify(result, null, 2)};
`;

  fs.writeFileSync(outPath, body, "utf8");
  console.log(`\nWrote ${outPath} (${Object.keys(result).length} entries)`);
}

main();
