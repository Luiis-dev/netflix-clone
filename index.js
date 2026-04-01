document.addEventListener("DOMContentLoaded", () => {
  /* ==================================================
     DARK MODE (COM PREFERÊNCIA + ESTADO)
  ================================================== */

  const body = document.body;
  const darkModeBtn = document.querySelector(".dark-mode-btn");

  // Detecta preferência do sistema
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  // Recupera preferência salva (se existir)
  const temaSalvo = localStorage.getItem("tema");

  // Define tema inicial (prioridade: salvo > sistema)
  if (temaSalvo) {
    body.classList.toggle("light-mode", temaSalvo === "light");
  } else {
    body.classList.toggle("light-mode", !prefersDark);
  }

  // Atualiza ícone do botão
  function atualizarIconeTema() {
    if (!darkModeBtn) return;

    darkModeBtn.textContent = body.classList.contains("light-mode")
      ? "☀️"
      : "🌙";
  }

  atualizarIconeTema();

  // Evento de troca de tema
  darkModeBtn?.addEventListener("click", () => {
    body.classList.toggle("light-mode");

    // Salva preferência
    localStorage.setItem(
      "tema",
      body.classList.contains("light-mode") ? "light" : "dark",
    );

    atualizarIconeTema();
  });

  /* ==================================================
     PERFIS (ESTRUTURA PRINCIPAL)
  ================================================== */

  const containerPerfis = document.querySelector(".perfis-container");
  const btnAdicionar = document.querySelector(".perfil-add");

  // Recupera perfis salvos
  let perfis = JSON.parse(localStorage.getItem("perfis")) || [];

  /* ==================================================
     CRIAR PERFIL (FUNÇÃO CENTRAL)
  ================================================== */
  function criarPerfilElemento(nome) {
    const li = document.createElement("li");
    li.className = "perfil";

    const link = document.createElement("a");
    link.href = "#";

    const img = document.createElement("img");
    img.src = "https://via.placeholder.com/150?text=Perfil";
    img.alt = `Perfil de ${nome}`;
    img.loading = "lazy";

    const span = document.createElement("span");
    span.className = "perfil-nome";
    span.textContent = nome;

    link.appendChild(img);
    link.appendChild(span);
    li.appendChild(link);

    // Evento de clique
    li.addEventListener("click", () => {
      alert(`🎬 Olá ${nome}!`);
    });

    return li;
  }

  /* ==================================================
     RENDERIZAR PERFIS (RENDER GLOBAL)
  ================================================== */
  function renderizarPerfis() {
    // Remove perfis antigos (mantém o botão de adicionar)
    document
      .querySelectorAll(".perfil:not(.perfil-add)")
      .forEach((el) => el.remove());

    // Recria todos os perfis
    perfis.forEach((nome) => {
      const perfilEl = criarPerfilElemento(nome);
      containerPerfis.insertBefore(perfilEl, btnAdicionar);
    });
  }

  renderizarPerfis();

  /* ==================================================
     ADICIONAR PERFIL
  ================================================== */
  btnAdicionar?.addEventListener("click", () => {
    const nome = prompt("Digite o nome do perfil:");

    // Validação mínima
    if (!nome || nome.trim().length < 2) {
      alert("Nome inválido (mínimo 2 caracteres)");
      return;
    }

    // Evita duplicados
    if (perfis.includes(nome.trim())) {
      alert("Esse perfil já existe!");
      return;
    }

    perfis.push(nome.trim());

    // Salva no navegador
    localStorage.setItem("perfis", JSON.stringify(perfis));

    renderizarPerfis();
  });

  /* ==================================================
     GERENCIAR PERFIS (BASE PARA EXPANSÃO)
  ================================================== */
  const btnGerenciar = document.querySelector(".btn-gerenciar");

  btnGerenciar?.addEventListener("click", () => {
    const lista = perfis.map((p, i) => `${i + 1}. ${p}`).join("\n");

    const escolha = prompt(
      `Perfis:\n${lista}\n\nDigite o número para remover:`,
    );

    const index = parseInt(escolha) - 1;

    if (!isNaN(index) && perfis[index]) {
      if (confirm(`Remover perfil "${perfis[index]}"?`)) {
        perfis.splice(index, 1);
        localStorage.setItem("perfis", JSON.stringify(perfis));
        renderizarPerfis();
      }
    }
  });

  /* ==================================================
     TRATAMENTO DE ERRO DE IMAGEM
  ================================================== */
  document.addEventListener(
    "error",
    (e) => {
      if (e.target.tagName === "IMG") {
        e.target.src = "https://via.placeholder.com/150?text=Perfil";
      }
    },
    true,
  );

  console.log("✅ Sistema carregado com sucesso");
});
