import { resolveApiKey } from "./tmdbLoader.js";
import { MEDIA_DETAIL_FALLBACKS } from "./mediaDetailFallbacks.js";
import { TMDB_FALLBACK_URLS } from "./tmdbFallbackUrls.js";

const TMDB_IMG = "https://image.tmdb.org/t/p";

let overlayEl = null;

function esc(s) {
  const d = document.createElement("div");
  d.textContent = s ?? "";
  return d.innerHTML;
}

function backdropForItem(item) {
  const key = `${item.tmdbType}-${item.tmdbId}`;
  const fb = TMDB_FALLBACK_URLS[key];
  if (fb?.backdrop) return fb.backdrop;
  if (fb?.poster) return fb.poster;
  return (item.imagem || "").trim();
}

async function fetchDetailFromApi(item, apiKey) {
  const seg = item.tmdbType === "tv" ? "tv" : "movie";
  const url = `https://api.themoviedb.org/3/${seg}/${item.tmdbId}?api_key=${encodeURIComponent(apiKey)}&language=pt-BR&append_to_response=videos,credits`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const d = await res.json();
  const vids = d.videos?.results || [];
  const trailer =
    vids.find((v) => v.type === "Trailer" && v.site === "YouTube") ||
    vids.find((v) => v.site === "YouTube");
  const cast = (d.credits?.cast || [])
    .slice(0, 10)
    .map((c) => c.name)
    .filter(Boolean);
  const genres = (d.genres || []).map((g) => g.name);
  const year =
    seg === "tv"
      ? (d.first_air_date || "").slice(0, 4)
      : (d.release_date || "").slice(0, 4);
  let runtime = "";
  if (seg === "tv") {
    if (d.episode_run_time?.length)
      runtime = `${d.episode_run_time[0]} min/ep`;
    else if (d.number_of_seasons)
      runtime = `${d.number_of_seasons} temporada${d.number_of_seasons > 1 ? "s" : ""}`;
  } else if (d.runtime) {
    runtime = `${d.runtime} min`;
  }
  const title = d.title || d.name || item.titulo;
  const overview = d.overview || "";
  const bd = d.backdrop_path
    ? `${TMDB_IMG}/w1280${d.backdrop_path}`
    : backdropForItem(item);
  const poster = d.poster_path ? `${TMDB_IMG}/w500${d.poster_path}` : "";

  return {
    title,
    overview,
    year,
    runtime,
    genres,
    cast,
    vote: typeof d.vote_average === "number" ? d.vote_average : null,
    trailerKey: trailer?.key || "",
    backdrop: bd || poster || backdropForItem(item),
    maturity: seg === "tv" ? d.adult ? "A18" : "A14" : "A14",
  };
}

function mergeFallback(item) {
  const key = `${item.tmdbType}-${item.tmdbId}`;
  const df = MEDIA_DETAIL_FALLBACKS[key] || {};
  const pct =
    typeof item.id === "number"
      ? 72 + (item.id % 27)
      : 80 + (String(item.titulo || "").length % 18);
  return {
    title: item.titulo || "Título",
    overview: df.overview || "",
    year: df.year || "",
    runtime: "",
    genres: [],
    cast: [],
    vote: pct / 10,
    trailerKey: df.trailerYoutubeId || "",
    backdrop: backdropForItem(item),
    maturity: "A14",
  };
}

async function resolveDetail(item) {
  const apiKey = resolveApiKey();
  if (apiKey) {
    try {
      const api = await fetchDetailFromApi(item, apiKey);
      if (api) {
        const fb = mergeFallback(item);
        if (!api.overview && fb.overview) api.overview = fb.overview;
        if (!api.trailerKey && fb.trailerKey) api.trailerKey = fb.trailerKey;
        return api;
      }
    } catch (_) {
      /* usa fallback */
    }
  }
  return mergeFallback(item);
}

function buildOverlay() {
  const root = document.createElement("div");
  root.className = "detail-modal-overlay";
  root.hidden = true;
  root.setAttribute("role", "dialog");
  root.setAttribute("aria-modal", "true");
  root.setAttribute("aria-label", "Detalhes do título");
  root.innerHTML = `
    <div class="detail-modal">
      <button type="button" class="detail-modal-close" aria-label="Fechar">&times;</button>
      <div class="detail-modal-hero">
        <div class="detail-modal-backdrop-wrap">
          <img class="detail-modal-backdrop" alt="" />
          <div class="detail-modal-backdrop-fade"></div>
        </div>
        <div class="detail-modal-trailer-wrap" hidden>
          <iframe class="detail-modal-trailer" title="Trailer" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
        </div>
      </div>
      <div class="detail-modal-content">
        <div class="detail-modal-loaded">
          <div class="detail-modal-toolbar">
            <button type="button" class="detail-modal-play">
              <i class="fas fa-play"></i> Assistir
            </button>
            <button type="button" class="detail-modal-list" aria-label="Minha lista">
              <i class="fas fa-plus"></i>
            </button>
          </div>
          <h2 class="detail-modal-title"></h2>
          <div class="detail-modal-facts"></div>
          <p class="detail-modal-overview"></p>
          <p class="detail-modal-castline"></p>
        </div>
      </div>
    </div>
  `;
  return root;
}

function setBodyOpen(open) {
  document.body.classList.toggle("detail-modal-open", open);
}

function closeModal() {
  if (!overlayEl) return;
  overlayEl.hidden = true;
  overlayEl.classList.remove("has-trailer");
  const iframe = overlayEl.querySelector(".detail-modal-trailer");
  if (iframe) iframe.src = "";
  const backdropImg = overlayEl.querySelector(".detail-modal-backdrop");
  if (backdropImg) backdropImg.style.opacity = "";
  setBodyOpen(false);
}

export function initDetailModal() {
  if (overlayEl) return;
  overlayEl = buildOverlay();
  document.body.appendChild(overlayEl);

  overlayEl.addEventListener("click", (e) => {
    if (e.target === overlayEl) closeModal();
  });
  overlayEl.querySelector(".detail-modal-close").addEventListener("click", closeModal);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !overlayEl.hidden) closeModal();
  });
}

export async function openDetailModal(item) {
  initDetailModal();
  const loaded = overlayEl.querySelector(".detail-modal-loaded");
  const backdropImg = overlayEl.querySelector(".detail-modal-backdrop");
  const trailerWrap = overlayEl.querySelector(".detail-modal-trailer-wrap");
  const trailerIframe = overlayEl.querySelector(".detail-modal-trailer");

  const bd = backdropForItem(item);
  backdropImg.src = bd || "";
  backdropImg.alt = item.titulo || "";

  trailerWrap.hidden = true;
  trailerIframe.src = "";

  const detail = await resolveDetail(item);

  loaded.querySelector(".detail-modal-title").textContent = detail.title;

  const facts = loaded.querySelector(".detail-modal-facts");
  const match =
    detail.vote != null && detail.vote > 0
      ? Math.min(99, Math.round(detail.vote * 10))
      : 75 + ((item.titulo || "").length % 20);
  const metaParts = [
    `<span class="detail-match">${match}% relevante</span>`,
    detail.year ? `<span>${esc(detail.year)}</span>` : "",
    detail.runtime ? `<span>${esc(detail.runtime)}</span>` : "",
    `<span class="detail-hd">HD</span>`,
    `<span class="detail-badge">${esc(detail.maturity || "A14")}</span>`,
  ].filter(Boolean);
  const genres =
    detail.genres?.length > 0
      ? `<div class="detail-genres">${detail.genres.map((g) => `<span>${esc(g)}</span>`).join("")}</div>`
      : "";
  facts.innerHTML = `<div class="detail-meta-row">${metaParts.join("")}</div>${genres}`;

  loaded.querySelector(".detail-modal-overview").textContent =
    detail.overview || "Sinopse indisponível no momento.";

  const castLine = loaded.querySelector(".detail-modal-castline");
  if (detail.cast?.length) {
    castLine.textContent = `Elenco: ${detail.cast.join(", ")}`;
    castLine.hidden = false;
  } else {
    castLine.textContent = "";
    castLine.hidden = true;
  }

  overlayEl.classList.toggle("has-trailer", Boolean(detail.trailerKey));
  if (detail.trailerKey) {
    trailerWrap.hidden = false;
    trailerIframe.src = `https://www.youtube.com/embed/${detail.trailerKey}?autoplay=0&rel=0&modestbranding=1`;
  } else {
    trailerWrap.hidden = true;
    trailerIframe.src = "";
  }

  const playBtn = loaded.querySelector(".detail-modal-play");
  playBtn.disabled = !detail.trailerKey;
  playBtn.title = detail.trailerKey ? "Assistir trailer" : "Trailer indisponível";
  playBtn.style.opacity = detail.trailerKey ? "" : "0.55";

  playBtn.onclick = () => {
    if (!detail.trailerKey) return;
    trailerWrap.hidden = false;
    overlayEl.classList.add("has-trailer");
    trailerIframe.src = `https://www.youtube.com/embed/${detail.trailerKey}?autoplay=1&rel=0`;
  };

  overlayEl.hidden = false;
  setBodyOpen(true);
}

export function closeDetailModal() {
  closeModal();
}
