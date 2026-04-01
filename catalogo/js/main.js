import { categoriesByProfile, banners, profileConfig } from "./data.js";
import { createCarousel } from "./components/Carousel.js";
import { hydrateTmdbCatalog, resolveApiKey } from "./tmdbLoader.js";
import { initDetailModal, openDetailModal } from "./detailModal.js";
import { MEDIA_DETAIL_FALLBACKS } from "./mediaDetailFallbacks.js";

// ============================================================
//  UTILITÁRIOS
// ============================================================

/**
 * Descobre que perfil está ativo pelo localStorage.
 * Tenta ler a chave "perfilAtivo" (ex: "acao", "anime", "kids", "docs").
 * Se não encontrar, usa "acao" como padrão.
 */
function getPerfilAtivo() {
  return localStorage.getItem("perfilAtivo") || "acao";
}

/**
 * Retorna uma saudação de acordo com o horário atual.
 */
function getSaudacao() {
  const hora = new Date().getHours();
  if (hora >= 5 && hora < 12) return "Bom dia";
  if (hora >= 12 && hora < 18) return "Boa tarde";
  return "Boa noite";
}

// ============================================================
//  ATUALIZAÇÃO DA NAVBAR
// ============================================================

/**
 * Atualiza nome, avatar e cor de destaque da navbar
 * de acordo com o perfil ativo.
 */
function atualizarNavbar(perfil, config) {
  const nomePerfil = localStorage.getItem("perfilAtivoNome");
  const imagemPerfil = localStorage.getItem("perfilAtivoImagem");

  // Nome na navbar
  const kidsLink = document.querySelector(".kids-link");
  if (kidsLink && nomePerfil) {
    kidsLink.textContent = nomePerfil;
  }

  // Avatar na navbar
  const profileIcon = document.querySelector(".profile-icon");
  if (profileIcon && imagemPerfil) {
    profileIcon.src = imagemPerfil;
  }

  // Cor de destaque via CSS variable (troca o vermelho Netflix pelo tema do perfil)
  document.documentElement.style.setProperty(
    "--accent-color",
    config.accentColor,
  );
  document.documentElement.style.setProperty("--navbar-bg", config.navbarBg);

}

// ============================================================
//  BANNER PRINCIPAL (Hero / billboard Netflix)
// ============================================================

function trailerKeyFromFallbacks(dados) {
  const k = `${dados.tmdbType}-${dados.tmdbId}`;
  return MEDIA_DETAIL_FALLBACKS[k]?.trailerYoutubeId?.trim() || "";
}

async function fetchTrailerKeyFromTmdb(dados) {
  const apiKey = resolveApiKey();
  if (!apiKey) return "";
  const seg = dados.tmdbType === "tv" ? "tv" : "movie";
  const url = `https://api.themoviedb.org/3/${seg}/${dados.tmdbId}/videos?api_key=${encodeURIComponent(apiKey)}&language=pt-BR`;
  try {
    const res = await fetch(url);
    if (!res.ok) return "";
    const data = await res.json();
    const vids = data.results || [];
    const pick =
      vids.find((v) => v.type === "Trailer" && v.site === "YouTube") ||
      vids.find((v) => v.site === "YouTube" && v.type === "Teaser") ||
      vids.find((v) => v.site === "YouTube");
    return pick?.key || "";
  } catch {
    return "";
  }
}

/**
 * Aplica imagem de fundo (via JS evita aspas quebradas no HTML) e trailer mudo em autoplay.
 */
async function setupHeroBillboard(section, dados) {
  const bg = section.querySelector(".hero-bg");
  const layer = section.querySelector(".hero-video-layer");
  const iframe = section.querySelector(".hero-video-iframe");
  if (!bg) return;

  const imgUrl =
    dados.imagem && String(dados.imagem).trim()
      ? String(dados.imagem).trim()
      : "";

  if (imgUrl) {
    bg.classList.remove("hero-bg--gradient");
    bg.style.backgroundImage = `url('${imgUrl.replace(/'/g, "%27")}')`;
  } else {
    bg.classList.add("hero-bg--gradient");
    bg.style.backgroundImage = "";
  }

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  if (!iframe || !layer || reduceMotion) {
    layer?.classList.add("hero-video-layer--off");
    return;
  }

  let youtubeKey = trailerKeyFromFallbacks(dados);
  if (!youtubeKey) youtubeKey = await fetchTrailerKeyFromTmdb(dados);
  if (!youtubeKey) {
    layer.classList.add("hero-video-layer--off");
    return;
  }

  const src = `https://www.youtube.com/embed/${youtubeKey}?autoplay=1&mute=1&controls=0&rel=0&modestbranding=1&playsinline=1&loop=1&playlist=${youtubeKey}&iv_load_policy=3&showinfo=0`;

  iframe.addEventListener(
    "load",
    () => {
      section.classList.add("hero-video-ready");
    },
    { once: true },
  );

  iframe.src = src;
}

/**
 * Cria o banner de destaque no topo do catálogo.
 * Cada perfil tem um conteúdo diferente definido em data.js.
 */
function criarBanner(perfil) {
  const dados = banners[perfil];
  if (!dados) return null;

  const section = document.createElement("section");
  section.className = "hero-banner";

  section.innerHTML = `
        <div class="hero-bg hero-bg--gradient"></div>
        <div class="hero-video-layer" aria-hidden="true">
            <iframe class="hero-video-iframe" title="Prévia em destaque" loading="eager"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen></iframe>
        </div>
        <div class="hero-gradient"></div>
        <div class="hero-content">
            <span class="hero-badge">${dados.destaque}</span>
            <h1 class="hero-titulo">${dados.titulo}</h1>
            <p class="hero-descricao">${dados.descricao}</p>
            <div class="hero-botoes">
                <button type="button" class="hero-btn hero-btn-primary">
                    <i class="fas fa-play"></i> Assistir
                </button>
                <button type="button" class="hero-btn hero-btn-secondary hero-open-detail">
                    <i class="fas fa-info-circle"></i> Mais informações
                </button>
            </div>
        </div>
    `;

  return section;
}

// ============================================================
//  SAUDAÇÃO PERSONALIZADA
// ============================================================

/**
 * Cria um elemento de saudação que aparece logo abaixo do banner.
 * Ex: "Boa tarde, Luís! 🎬 Seus filmes de ação favoritos estão te esperando."
 */
function criarSaudacao(perfil) {
  const nomePerfil = localStorage.getItem("perfilAtivoNome");
  if (!nomePerfil) return null;

  const saudacao = getSaudacao();

  // Mensagem personalizada por perfil
  const mensagens = {
    acao: `${saudacao}, ${nomePerfil}! 🎬 Prontos para mais adrenalina?`,
    anime: `${saudacao}, ${nomePerfil}! ⚡ Seus animes favoritos te esperam.`,
    kids: `${saudacao}, ${nomePerfil}! 🌈 Hora de se divertir!`,
    docs: `${saudacao}, ${nomePerfil}! 🔬 Hora de descobrir coisas incríveis.`,
  };

  const div = document.createElement("div");
  div.className = "saudacao-perfil";
  div.textContent = mensagens[perfil] || `${saudacao}, ${nomePerfil}!`;

  return div;
}

// ============================================================
//  RENDERIZAÇÃO DOS CARROSSÉIS
// ============================================================

/**
 * Injeta as rows de categorias do perfil ativo no container principal.
 * As rows com "progresso: true" mostram barra de progresso nos cards.
 */
function renderizarCategorias(container, perfil) {
  const categorias = categoriesByProfile[perfil];

  if (!categorias) {
    console.warn(
      `Perfil "${perfil}" não encontrado. Usando "acao" como padrão.`,
    );
    return renderizarCategorias(container, "acao");
  }

  categorias.forEach((categoria) => {
    const carousel = createCarousel(categoria);
    container.appendChild(carousel);
  });
}

// ============================================================
//  INICIALIZAÇÃO PRINCIPAL
// ============================================================

document.addEventListener("DOMContentLoaded", async () => {
  const perfil = getPerfilAtivo();
  const config = profileConfig[perfil] || profileConfig.acao;
  const container = document.getElementById("main-content");

  initDetailModal();

  // 1. Atualiza navbar (nome, avatar, cores)
  atualizarNavbar(perfil, config);

  if (!container) {
    console.error("Container #main-content não encontrado no HTML.");
    return;
  }

  // 1b. Capas e fundo do hero (TMDB) — precisa existir antes de criar banner/cards
  await hydrateTmdbCatalog();

  // 2. Injeta o banner personalizado
  const banner = criarBanner(perfil);
  if (banner) {
    container.appendChild(banner);
    const dadosHero = banners[perfil];
    await setupHeroBillboard(banner, dadosHero);
    const btnDetalhe = banner.querySelector(".hero-open-detail");
    if (btnDetalhe && dadosHero) {
      btnDetalhe.addEventListener("click", () => {
        openDetailModal({
          titulo: dadosHero.titulo,
          tmdbId: dadosHero.tmdbId,
          tmdbType: dadosHero.tmdbType,
          imagem: dadosHero.imagem || "",
          id: 0,
        });
      });
    }
    const btnHeroPlay = banner.querySelector(".hero-btn-primary");
    if (btnHeroPlay && dadosHero) {
      btnHeroPlay.addEventListener("click", () => {
        openDetailModal({
          titulo: dadosHero.titulo,
          tmdbId: dadosHero.tmdbId,
          tmdbType: dadosHero.tmdbType,
          imagem: dadosHero.imagem || "",
          id: 0,
        });
      });
    }
  }

  // 3. Injeta a saudação
  const saudacao = criarSaudacao(perfil);
  if (saudacao) container.appendChild(saudacao);

  // 4. Injeta os carrosséis de categorias do perfil
  renderizarCategorias(container, perfil);
});
