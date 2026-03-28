import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(__dirname, "../js/data.js");
const outPath = path.join(__dirname, "../js/mediaDetailFallbacks.js");

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

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function parsePage(html) {
  const descM = html.match(
    /<meta\s+property="og:description"\s+content="([^"]*)"/i,
  );
  let overview = descM ? descM[1] : "";
  overview = overview
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");

  let trailerKey = "";
  const trailerM = html.match(/play_trailer[^>]*data-id="([^"]+)"/i);
  if (trailerM) trailerKey = trailerM[1];

  const titleM = html.match(/<meta\s+property="og:title"\s+content="([^"]*)"/i);
  let year = "";
  if (titleM) {
    const y = titleM[1].match(/\((\d{4})\)/);
    if (y) year = y[1];
  }

  return { overview, trailerKey, year };
}

async function main() {
  const pairs = collectPairs();
  const result = {};

  for (let i = 0; i < pairs.length; i++) {
    const [id, type] = pairs[i];
    const url = `https://www.themoviedb.org/${type}/${id}`;
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; MediaDetailFallback/1.0)",
        },
      });
      const html = await res.text();
      const p = parsePage(html);
      result[`${type}-${id}`] = {
        overview: p.overview,
        trailerYoutubeId: p.trailerKey,
        year: p.year,
      };
      process.stdout.write(`\r${i + 1}/${pairs.length} ${type}-${id}`);
    } catch (e) {
      console.error(`\nfail ${type}-${id}`, e.message);
      result[`${type}-${id}`] = {
        overview: "",
        trailerYoutubeId: "",
        year: "",
      };
    }
    await sleep(120);
  }

  const body = `/**
 * Sinopse e ID do trailer (YouTube) extraídos das páginas públicas do TMDB.
 * Usado quando não há TMDB_API_KEY. Gerado por build-detail-fallbacks.mjs
 */
export const MEDIA_DETAIL_FALLBACKS = ${JSON.stringify(result, null, 2)};
`;

  fs.writeFileSync(outPath, body, "utf8");
  console.log(`\nWrote ${outPath}`);
}

main();
