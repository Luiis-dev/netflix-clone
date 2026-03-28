import { banners, categoriesByProfile } from "./data.js";
import { TMDB_API_KEY } from "./tmdbConfig.js";
import { TMDB_FALLBACK_URLS } from "./tmdbFallbackUrls.js";

const TMDB_IMG = "https://image.tmdb.org/t/p";

function posterUrl(path, size) {
  if (!path) return "";
  return `${TMDB_IMG}/${size}${path}`;
}

export function resolveApiKey() {
  if (typeof window !== "undefined" && window.__TMDB_API_KEY__) {
    return String(window.__TMDB_API_KEY__).trim();
  }
  if (TMDB_API_KEY && String(TMDB_API_KEY).trim()) {
    return String(TMDB_API_KEY).trim();
  }
  if (typeof localStorage !== "undefined") {
    const k = localStorage.getItem("tmdb_api_key");
    if (k) return k.trim();
  }
  return "";
}

async function fetchMedia(apiKey, tmdbId, tmdbType) {
  const segment = tmdbType === "tv" ? "tv" : "movie";
  const url = `https://api.themoviedb.org/3/${segment}/${tmdbId}?api_key=${encodeURIComponent(apiKey)}&language=pt-BR`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const d = await res.json();
  return {
    poster: posterUrl(d.poster_path, "w500"),
    backdrop: posterUrl(d.backdrop_path, "w1280"),
  };
}

function collectUniquePairs() {
  const map = new Map();
  const add = (id, type) => {
    const t = type || "movie";
    map.set(`${t}-${id}`, [id, t]);
  };
  for (const b of Object.values(banners)) {
    add(b.tmdbId, b.tmdbType);
  }
  for (const rows of Object.values(categoriesByProfile)) {
    for (const cat of rows) {
      for (const it of cat.items) {
        add(it.tmdbId, it.tmdbType);
      }
    }
  }
  return [...map.values()];
}

/** Preenche URLs do CDN (sem chave de API) a partir de tmdbFallbackUrls.js. */
function applyStaticImageFallbacks() {
  for (const b of Object.values(banners)) {
    const key = `${b.tmdbType}-${b.tmdbId}`;
    const fb = TMDB_FALLBACK_URLS[key];
    if (!fb) continue;
    b.imagem = fb.backdrop || fb.poster || b.imagem;
  }
  for (const rows of Object.values(categoriesByProfile)) {
    for (const cat of rows) {
      for (const it of cat.items) {
        const key = `${it.tmdbType}-${it.tmdbId}`;
        const fb = TMDB_FALLBACK_URLS[key];
        if (fb?.poster) it.imagem = fb.poster;
      }
    }
  }
}

/**
 * Preenche `imagem` nos banners e itens (fallback CDN + API TMDB opcional).
 * Deve rodar antes de montar o DOM do catálogo.
 */
export async function hydrateTmdbCatalog() {
  applyStaticImageFallbacks();

  const apiKey = resolveApiKey();
  if (!apiKey) {
    console.info(
      "[Catálogo] Capas via URLs estáticas do TMDB. Opcional: TMDB_API_KEY em tmdbConfig.js para dados atualizados pela API.",
    );
    return;
  }

  const pairs = collectUniquePairs();
  const results = new Map();
  const chunk = 10;

  for (let i = 0; i < pairs.length; i += chunk) {
    const slice = pairs.slice(i, i + chunk);
    const batch = await Promise.all(
      slice.map(async ([id, type]) => {
        const key = `${type}-${id}`;
        const data = await fetchMedia(apiKey, id, type);
        return [key, data];
      }),
    );
    for (const [key, data] of batch) {
      results.set(key, data);
    }
  }

  for (const b of Object.values(banners)) {
    const key = `${b.tmdbType}-${b.tmdbId}`;
    const u = results.get(key);
    if (!u) continue;
    if (u.backdrop) b.imagem = u.backdrop;
    else if (u.poster) b.imagem = u.poster;
  }

  for (const rows of Object.values(categoriesByProfile)) {
    for (const cat of rows) {
      for (const it of cat.items) {
        const key = `${it.tmdbType}-${it.tmdbId}`;
        const u = results.get(key);
        if (u?.poster) it.imagem = u.poster;
      }
    }
  }
}
