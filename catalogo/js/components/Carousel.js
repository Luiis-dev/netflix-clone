/** Placeholder local quando `imagem` ainda não veio do TMDB (evita src="" e layout quebrado). */
function posterPlaceholderDataUri(titulo) {
  const text = (titulo || "?")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/"/g, "&quot;")
    .slice(0, 40);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="280" viewBox="0 0 500 280"><rect fill="#1a1a1a" width="500" height="280"/><text fill="#b3b3b3" x="250" y="145" dominant-baseline="middle" text-anchor="middle" font-family="system-ui,sans-serif" font-size="18">${text}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

import { openDetailModal } from "../detailModal.js";

/**
 * Carousel.js
 * Cria uma linha (row) de cards para o catálogo Netflix.
 * Espera um objeto `category` com:
 *   - titulo    {string}  — título da row
 *   - items     {Array}   — lista de filmes/séries
 *   - progresso {boolean} — se true, exibe barra de progresso nos cards
 *   - badge     {string}  — texto do badge (ex: "TOP 10", "NOVO")
 */
export function createCarousel(category) {
  const { titulo, items = [], progresso: hasProgress, badge } = category;

  // ── Seção da row ─────────────────────────────────────────
  const section = document.createElement("section");
  section.className = "slider-section"; // corresponde ao catalogo.css

  // ── Cabeçalho com título ──────────────────────────────────
  const header = document.createElement("div");
  header.className = "slider-header";

  const heading = document.createElement("h2");
  heading.className = "slider-title"; // corresponde ao catalogo.css
  heading.textContent = titulo;

  header.appendChild(heading);
  section.appendChild(header);

  // ── Faixa de cards ────────────────────────────────────────
  const track = document.createElement("div");
  track.className = "movie-row"; // corresponde ao catalogo.css

  items.forEach((item) => {
    track.appendChild(createCard(item, hasProgress, badge));
  });

  section.appendChild(track);

  // Impede a página de rolar (cima/baixo) quando a roda está sobre o carrossel:
  // converte movimento vertical em scroll horizontal da faixa.
  track.addEventListener(
    "wheel",
    (e) => {
      if (track.scrollWidth <= track.clientWidth) return;
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      e.preventDefault();
      track.scrollLeft += e.deltaY;
    },
    { passive: false },
  );

  return section;
}

// ── Card individual ───────────────────────────────────────────
function createCard(item, hasProgress, badge) {
  const { titulo, imagem, progresso } = item;

  const card = document.createElement("div");
  card.className = "movie-card"; // corresponde ao catalogo.css
  card.setAttribute("role", "button");
  card.setAttribute("tabindex", "0");
  card.setAttribute(
    "aria-label",
    `Abrir detalhes: ${titulo || "título"}`,
  );
  if (hasProgress && progresso != null) {
    card.classList.add("has-progress");
  }

  card.addEventListener("click", () => openDetailModal(item));
  card.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openDetailModal(item);
    }
  });

  // Badge (TOP 10, NOVO…)
  if (badge) {
    const badgeEl = document.createElement("div");
    badgeEl.className = "badge-top10";
    badgeEl.innerHTML = `<span class="top">TOP</span><span class="number">10</span>`;
    card.appendChild(badgeEl);
  }

  // Imagem do card (nunca src vazio — quebra renderização até o TMDB preencher)
  const img = document.createElement("img");
  img.src = imagem?.trim() ? imagem : posterPlaceholderDataUri(titulo);
  img.alt = titulo || "Capa do filme";
  img.loading = "lazy";

  // Mostra a parte de cima do pôster (onde ficam os rostos)
  img.style.objectPosition = "top center";

  // Fallback quando a imagem não carrega
  img.onerror = () => {
    img.style.display = "none";
    card.style.background =
      "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)";
    const fallback = document.createElement("div");
    fallback.style.cssText = `
      position: absolute; inset: 0;
      display: flex; align-items: center; justify-content: center;
      padding: 8px; text-align: center;
      font-size: 12px; font-weight: 600;
      color: rgba(255,255,255,0.85); z-index: 2;
    `;
    fallback.textContent = titulo || "";
    card.appendChild(fallback);
  };

  card.appendChild(img);

  // Barra de progresso
  if (hasProgress && progresso != null) {
    const pbContainer = document.createElement("div");
    pbContainer.className = "progress-bar-container";

    const pbValue = document.createElement("div");
    pbValue.className = "progress-value";
    pbValue.style.width = `${progresso}%`;

    pbContainer.appendChild(pbValue);
    card.appendChild(pbContainer);
  }

  // Detecta posição para evitar corte nas bordas
  card.addEventListener("mouseenter", () => {
    const rect = card.getBoundingClientRect();
    if (rect.left < 100) card.classList.add("origin-left");
    else if (rect.right > window.innerWidth - 100)
      card.classList.add("origin-right");
  });

  card.addEventListener("mouseleave", () => {
    card.classList.remove("origin-left", "origin-right");
  });

  return card;
}
