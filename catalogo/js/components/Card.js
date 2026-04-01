import { getYouTubeId } from '../utils.js';

/** Mesmo contrato de `data.js`: titulo, imagem (URL TMDB ou ""), progresso (% opcional), youtube (opcional). */
function posterPlaceholderDataUri(titulo) {
  const text = (titulo || "?")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/"/g, "&quot;")
    .slice(0, 40);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="280" viewBox="0 0 500 280"><rect fill="#1a1a1a" width="500" height="280"/><text fill="#b3b3b3" x="250" y="145" dominant-baseline="middle" text-anchor="middle" font-family="system-ui,sans-serif" font-size="18">${text}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function createCard(item) {
    const titulo = item.titulo ?? item.title ?? "";
    const imagem = (item.imagem ?? item.img ?? "").trim();
    const progresso = item.progresso ?? item.progress;
    const temProgresso = progresso != null;

    const card = document.createElement('div');
    card.className = 'movie-card';
    if (temProgresso) {
        card.classList.add('has-progress');
    }

    const img = document.createElement('img');
    img.src = imagem ? imagem : posterPlaceholderDataUri(titulo);
    img.alt = titulo || "Capa do filme";
    img.loading = "lazy";
    img.style.objectPosition = "top center";

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
        fallback.textContent = titulo;
        card.appendChild(fallback);
    };

    const iframe = document.createElement('iframe');
    iframe.frameBorder = "0";
    iframe.allow = "autoplay; encrypted-media";

    const videoId = getYouTubeId(item.youtube);

    card.appendChild(iframe);
    card.appendChild(img);

    if (temProgresso) {
        const pbContainer = document.createElement('div');
        pbContainer.className = 'progress-bar-container';
        const pbValue = document.createElement('div');
        pbValue.className = 'progress-value';
        pbValue.style.width = `${progresso}%`;
        pbContainer.appendChild(pbValue);
        card.appendChild(pbContainer);
    }

    let playTimeout;
    card.addEventListener('mouseenter', () => {
        const rect = card.getBoundingClientRect();
        const windowWidth = window.innerWidth;

        if (rect.left < 100) {
            card.classList.add('origin-left');
        } else if (rect.right > windowWidth - 100) {
            card.classList.add('origin-right');
        }

        playTimeout = setTimeout(() => {
            iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&modestbranding=1&loop=1&playlist=${videoId}`;
            iframe.classList.add('playing');
            img.classList.add('playing-video');
        }, 600);
    });

    card.addEventListener('mouseleave', () => {
        clearTimeout(playTimeout);
        iframe.classList.remove('playing');
        img.classList.remove('playing-video');
        iframe.src = "";
        card.classList.remove('origin-left');
        card.classList.remove('origin-right');
    });

    return card;
}
