// ============================================
// LUCIDE — renderiza os ícones do HTML
// ============================================
lucide.createIcons();

// ============================================
// DARK MODE
// ============================================
const darkBtn = document.querySelector(".dark-mode-btn");

darkBtn.addEventListener("click", () => {
  document.body.classList.toggle("light-mode");
  darkBtn.textContent = document.body.classList.contains("light-mode")
    ? "🌙"
    : "☀️";
});

// ============================================
// SALVAR PERFIL NO LOCALSTORAGE AO CLICAR
// ============================================

// Cada perfil → catálogo em data.js (categoriesByProfile + banners + cores)
// Luis: ação | Duda: anime | Evton: infantil | Maria: documentários
const profileData = [
  { nome: "Luis", imagem: "../assets/perfil-1.png", tipo: "acao" },
  { nome: "Duda", imagem: "../assets/perfil-2.png", tipo: "anime" },
  { nome: "Evton", imagem: "../assets/perfil-3.png", tipo: "kids" },
  { nome: "Maria", imagem: "../assets/perfil-4.png", tipo: "docs" },
];

document.querySelectorAll(".perfis-container a").forEach((link, index) => {
  link.addEventListener("click", () => {
    const perfil = profileData[index];
    if (perfil) {
      localStorage.setItem("perfilAtivoNome", perfil.nome);
      localStorage.setItem("perfilAtivoImagem", perfil.imagem);
      localStorage.setItem("perfilAtivo", perfil.tipo);
    }
  });
});

// ============================================
// GERENCIAR PERFIS
// ============================================
const btnGerenciar = document.querySelector(".btn-gerenciar");
const titulo = document.querySelector("h1");

btnGerenciar.addEventListener("click", () => {
  const modoEdicao = document.body.classList.toggle("modo-edicao");

  if (modoEdicao) {
    titulo.textContent = "Gerenciar Perfis";
    btnGerenciar.textContent = "Concluído";
  } else {
    titulo.textContent = "Quem está assistindo?";
    btnGerenciar.textContent = "Gerenciar perfis";
  }
});

// ============================================
// EDITAR NOME AO CLICAR NO OVERLAY
// ============================================
document.querySelectorAll(".edit-overlay").forEach((overlay) => {
  overlay.addEventListener("click", () => {
    const figcaption = overlay.closest(".perfil").querySelector("figcaption");
    const nomeAtual = figcaption.textContent;
    const novoNome = prompt(`Novo nome para "${nomeAtual}":`, nomeAtual);

    if (novoNome && novoNome.trim() !== "") {
      figcaption.textContent = novoNome.trim();
    }
  });
});
