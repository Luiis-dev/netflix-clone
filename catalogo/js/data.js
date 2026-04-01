// ── Helpers ───────────────────────────────────────────────────
// tmdbId  = ID do filme/série no TMDB
// tmdbType = "movie" ou "tv"
const item = (id, titulo, tmdbId, tmdbType, progresso) => ({
  id,
  titulo,
  imagem: "", // preenchido por tmdbLoader.js (API TMDB) antes da renderização
  tmdbId,
  tmdbType: tmdbType || "movie",
  ...(progresso != null && { progresso }),
});

// ── Banners ────────────────────────────────────────────────────
export const banners = {
  acao: {
    titulo: "Duna: Parte Dois",
    destaque: "🔥 Em Alta",
    tmdbId: 693134,
    tmdbType: "movie",
    descricao:
      "Paul Atreides se une aos Fremen enquanto busca vingança contra os conspiradores que destruíram sua família.",
  },
  anime: {
    titulo: "Jujutsu Kaisen",
    destaque: "⭐ Top 1 no Brasil",
    tmdbId: 95479,
    tmdbType: "tv",
    descricao:
      "Um estudante descobre um mundo oculto de feiticeiros e maldições após engolir um dedo amaldiçoado.",
  },
  kids: {
    titulo: "Shrek",
    destaque: "🎉 Diversão Garantida",
    tmdbId: 808,
    tmdbType: "movie",
    descricao:
      "Um ogro solitário embarca em aventura para resgatar uma princesa, com a ajuda de um burro muito falante.",
  },
  docs: {
    titulo: "Planeta Terra III",
    destaque: "🏆 Premiado",
    tmdbId: 209867,
    tmdbType: "tv",
    descricao:
      "Uma jornada extraordinária pelos ecossistemas mais remotos e fascinantes do nosso planeta.",
  },
};

// ── Categorias por perfil ─────────────────────────────────────
export const categoriesByProfile = {
  acao: [
    {
      titulo: "Continue Assistindo",
      progresso: true,
      items: [
        item(1, "Mad Max: Estrada da Fúria", 76341, "movie", 70),
        item(2, "John Wick 4", 603692, "movie", 45),
        item(3, "Mission: Impossible DR", 575264, "movie", 20),
      ],
    },
    {
      titulo: "🔥 Bombando Agora",
      badge: "TOP 10",
      items: [
        item(4, "Duna: Parte Dois", 693134, "movie"),
        item(5, "Oppenheimer", 872585, "movie"),
        item(6, "Top Gun: Maverick", 361743, "movie"),
        item(7, "Avatar: O Caminho da Água", 76600, "movie"),
        item(8, "Aquaman 2", 572802, "movie"),
      ],
    },
    {
      titulo: "Ficção Científica",
      items: [
        item(9, "Interestelar", 157336, "movie"),
        item(10, "Blade Runner 2049", 335984, "movie"),
        item(11, "Prometheus", 70981, "movie"),
        item(12, "O Marciano", 286217, "movie"),
        item(13, "Chegada", 329865, "movie"),
        item(14, "Matrix", 603, "movie"),
      ],
    },
    {
      titulo: "Thrillers Intensos",
      badge: "NOVO",
      items: [
        item(15, "Ninguém", 754609, "movie"),
        item(16, "Oldboy", 16869, "movie"),
        item(17, "Parasita", 496243, "movie"),
        item(18, "Seven", 807, "movie"),
        item(19, "Joker", 475557, "movie"),
      ],
    },
    {
      titulo: "Clássicos de Ação",
      items: [
        item(20, "Exterminador do Futuro 2", 280, "movie"),
        item(21, "Die Hard", 1724, "movie"),
        item(22, "Speed", 1637, "movie"),
        item(23, "Predador", 106, "movie"),
      ],
    },
  ],

  anime: [
    {
      titulo: "Continue Assistindo",
      progresso: true,
      items: [
        item(101, "Jujutsu Kaisen T2", 95479, "tv", 60),
        item(102, "Demon Slayer T3", 85937, "tv", 35),
        item(103, "Solo Leveling", 247752, "tv", 80),
      ],
    },
    {
      titulo: "⭐ Top Shōnen",
      badge: "TOP 10",
      items: [
        item(104, "Naruto Shippuden", 1412, "tv"),
        item(105, "One Piece", 37854, "tv"),
        item(106, "Dragon Ball Super", 62715, "tv"),
        item(107, "My Hero Academia", 65930, "tv"),
        item(108, "Black Clover", 71746, "tv"),
        item(109, "Bleach: TYBW", 30984, "tv"),
      ],
    },
    {
      titulo: "Isekai em Alta",
      badge: "NOVO",
      items: [
        item(110, "Re:Zero", 64929, "tv"),
        item(111, "Sword Art Online", 45782, "tv"),
        item(112, "That Time I Got Reincarnated", 70390, "tv"),
        item(113, "Overlord", 61663, "tv"),
        item(114, "Konosuba", 63175, "tv"),
      ],
    },
    {
      titulo: "Romance e Slice of Life",
      items: [
        item(115, "Kaguya-sama", 85271, "tv"),
        item(116, "Your Lie in April", 44217, "tv"),
        item(117, "Toradora", 33194, "tv"),
        item(118, "Horimiya", 112149, "tv"),
      ],
    },
    {
      titulo: "Filmes de Anime",
      items: [
        item(119, "Seu Nome", 372058, "movie"),
        item(120, "Spirited Away", 129, "movie"),
        item(121, "Princess Mononoke", 128, "movie"),
        item(122, "Demon Slayer: Mugen Train", 635302, "movie"),
        item(123, "Jujutsu Kaisen 0", 851644, "movie"),
      ],
    },
  ],

  kids: [
    {
      titulo: "Continue Assistindo",
      progresso: true,
      items: [
        item(201, "Shrek", 808, "movie", 55),
        item(202, "Moana", 277834, "movie", 40),
        item(203, "Toy Story 4", 301528, "movie", 90),
      ],
    },
    {
      titulo: "🎉 Mais Divertidos",
      badge: "FAVORITO",
      items: [
        item(204, "Frozen 2", 330457, "movie"),
        item(205, "Encanto", 568124, "movie"),
        item(206, "Minions 2", 438148, "movie"),
        item(207, "O Rei Leão", 420818, "movie"),
        item(208, "Ratatouille", 2062, "movie"),
      ],
    },
    {
      titulo: "Animações em Série",
      badge: "NOVO",
      items: [
        item(209, "Bluey", 171665, "tv"),
        item(210, "Peppa Pig", 12862, "tv"),
        item(211, "Miraculous", 60735, "tv"),
        item(212, "PAW Patrol", 62193, "tv"),
        item(213, "Hora de Aventura", 15260, "tv"),
        item(214, "Steven Universo", 67287, "tv"),
      ],
    },
    {
      titulo: "Clássicos Disney",
      items: [
        item(215, "A Bela e a Fera", 321612, "movie"),
        item(216, "Aladdin", 420817, "movie"),
        item(217, "Tarzan", 9695, "movie"),
        item(218, "Mulan", 337401, "movie"),
      ],
    },
    {
      titulo: "Pixar",
      items: [
        item(219, "Soul", 508442, "movie"),
        item(220, "Coco", 354912, "movie"),
        item(221, "Up: Altas Aventuras", 14160, "movie"),
        item(222, "Divertida Mente 2", 1022789, "movie"),
      ],
    },
  ],

  docs: [
    {
      titulo: "Continue Assistindo",
      progresso: true,
      items: [
        item(301, "Planeta Terra III", 209867, "tv", 50),
        item(302, "O Nosso Planeta", 79508, "tv", 30),
        item(303, "Cosmos", 57243, "tv", 75),
      ],
    },
    {
      titulo: "🏆 Premiados",
      badge: "PREMIADO",
      items: [
        item(304, "Free Solo", 453588, "movie"),
        item(305, "Icarus", 464110, "movie"),
        item(306, "O Dilema das Redes", 750117, "movie"),
        item(307, "13th", 432875, "movie"),
        item(308, "Amy", 256599, "movie"),
      ],
    },
    {
      titulo: "Natureza e Ciência",
      badge: "NOVO",
      items: [
        item(309, "Blue Planet II", 70779, "tv"),
        item(310, "Our Planet", 79508, "tv"),
        item(311, "Night on Earth", 88374, "tv"),
        item(312, "Explained", 97180, "tv"),
        item(313, "Moving Art", 68004, "tv"),
      ],
    },
    {
      titulo: "Tecnologia e Futuro",
      items: [
        item(314, "AlphaGo", 430355, "movie"),
        item(315, "Coded Bias", 665879, "movie"),
        item(316, "General Magic", 587605, "movie"),
        item(317, "iHuman", 634507, "movie"),
      ],
    },
    {
      titulo: "Crime e Sociedade",
      items: [
        item(318, "Making a Murderer", 62858, "tv"),
        item(319, "Wild Wild Country", 77239, "tv"),
        item(320, "The Last Czar", 88987, "tv"),
        item(321, "Bad Vegan", 181299, "tv"),
      ],
    },
  ],
};

// ── Configuração visual por perfil ────────────────────────────
export const profileConfig = {
  acao: { accentColor: "#e50914", navbarBg: "#141414" },
  anime: { accentColor: "#7c3aed", navbarBg: "#0d0016" },
  kids: { accentColor: "#10b981", navbarBg: "#0a1a0f" },
  docs: { accentColor: "#2563eb", navbarBg: "#040d1a" },
};
