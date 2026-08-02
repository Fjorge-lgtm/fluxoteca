/* ============================================================
   FLUXOTECA — SCRIPT PRINCIPAL
   JavaScript Vanilla (ES6+), organizado em funções pequenas e
   independentes. Cada função cuida de uma única responsabilidade
   e é chamada a partir do bloco de inicialização no final do arquivo.
============================================================ */

/* Espera o HTML estar totalmente carregado antes de rodar qualquer coisa */
document.addEventListener("DOMContentLoaded", () => {
  initMenuMobile();
  initHeaderScroll();
  initScrollReveal();
  initShowcaseCarousel();
  initContactForm();
  initPixCopy();
  gerarQrCodePlaceholder();
  atualizarAnoRodape();
});

/* ------------------------------------------------------------
   1. MENU MOBILE
   Controla abrir/fechar o painel de navegação no celular e
   fecha o menu automaticamente ao clicar em um link de âncora.
------------------------------------------------------------ */
function initMenuMobile() {
  const navToggle = document.getElementById("navToggle");
  const nav = document.getElementById("nav");

  if (!navToggle || !nav) return;

  // Alterna a classe que exibe/esconde o menu e atualiza o aria-expanded
  navToggle.addEventListener("click", () => {
    const estaAberto = nav.classList.toggle("is-open");
    navToggle.classList.toggle("is-active", estaAberto);
    navToggle.setAttribute("aria-expanded", String(estaAberto));
    navToggle.setAttribute("aria-label", estaAberto ? "Fechar menu" : "Abrir menu");
  });

  // Fecha o menu automaticamente após o clique em qualquer link interno
  nav.querySelectorAll(".nav__link").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("is-open");
      navToggle.classList.remove("is-active");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

/* ------------------------------------------------------------
   2. HEADER COM SOMBRA AO ROLAR A PÁGINA
   Adiciona uma classe visual quando o usuário rola a página,
   dando profundidade ao cabeçalho fixo.
------------------------------------------------------------ */
function initHeaderScroll() {
  const header = document.getElementById("header");
  if (!header) return;

  const LIMITE_SCROLL = 12; // pixels rolados para ativar o efeito

  const aplicarEstadoScroll = () => {
    header.classList.toggle("header--scrolled", window.scrollY > LIMITE_SCROLL);
  };

  // "passive: true" melhora a performance do scroll em dispositivos móveis
  window.addEventListener("scroll", aplicarEstadoScroll, { passive: true });
  aplicarEstadoScroll(); // aplica o estado correto já no carregamento
}

/* ------------------------------------------------------------
   3. ANIMAÇÃO DE ENTRADA AO ROLAR (SCROLL REVEAL)
   Usa IntersectionObserver — mais performático que escutar o
   evento de scroll manualmente — para revelar elementos suavemente.
------------------------------------------------------------ */
function initScrollReveal() {
  const elementos = document.querySelectorAll("[data-animate]");
  if (!elementos.length) return;

  // Se o navegador não suportar IntersectionObserver, apenas mostra tudo
  if (!("IntersectionObserver" in window)) {
    elementos.forEach((el) => el.classList.add("in-view"));
    return;
  }

  const observer = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((entrada) => {
        if (entrada.isIntersecting) {
          entrada.target.classList.add("in-view");
          observer.unobserve(entrada.target); // anima só uma vez
        }
      });
    },
    { threshold: 0.15 }
  );

  elementos.forEach((el) => observer.observe(el));
}

/* ------------------------------------------------------------
   4. CARROSSEL DE TELAS DO APLICATIVO (APP SHOWCASE)
   A faixa de imagens já tem scroll nativo (arrastar com o dedo/mouse);
   aqui apenas adicionamos os botões de seta para navegar por clique.
------------------------------------------------------------ */
function initShowcaseCarousel() {
  const track = document.getElementById("showcaseTrack");
  const btnPrev = document.getElementById("showcasePrev");
  const btnNext = document.getElementById("showcaseNext");

  if (!track || !btnPrev || !btnNext) return;

  // Rola aproximadamente a largura de um card e meio a cada clique
  const calcularDistanciaScroll = () => {
    const primeiroItem = track.querySelector(".image-placeholder");
    const largura = primeiroItem ? primeiroItem.getBoundingClientRect().width : 220;
    return largura + 20; // soma a folga do "gap" entre os itens
  };

  btnPrev.addEventListener("click", () => {
    track.scrollBy({ left: -calcularDistanciaScroll(), behavior: "smooth" });
  });

  btnNext.addEventListener("click", () => {
    track.scrollBy({ left: calcularDistanciaScroll(), behavior: "smooth" });
  });
}

/* ------------------------------------------------------------
   5. FORMULÁRIO DE CONTATO
   Faz validação simples no front-end e simula o envio, já que
   este projeto não possui um back-end conectado. Basta trocar o
   bloco marcado abaixo por uma chamada fetch() real quando houver API.
------------------------------------------------------------ */
function initContactForm() {
  const form = document.getElementById("contactForm");
  const feedback = document.getElementById("formFeedback");
  if (!form || !feedback) return;

  form.addEventListener("submit", (evento) => {
    evento.preventDefault(); // impede o recarregamento padrão da página

    const campos = form.querySelectorAll("input[required], textarea[required]");
    let formularioValido = true;

    // Validação simples: cada campo obrigatório vazio recebe destaque visual
    campos.forEach((campo) => {
      const vazio = campo.value.trim() === "";
      campo.classList.toggle("is-invalid", vazio);
      if (vazio) formularioValido = false;
    });

    // Validação extra de formato de e-mail
    const campoEmail = form.querySelector("#email");
    if (campoEmail && campoEmail.value.trim() !== "") {
      const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(campoEmail.value.trim());
      campoEmail.classList.toggle("is-invalid", !emailValido);
      if (!emailValido) formularioValido = false;
    }

    if (!formularioValido) {
      feedback.textContent = "Por favor, preencha os campos destacados corretamente.";
      feedback.className = "contact-form__feedback is-error";
      return;
    }

    /* --------------------------------------------------------
       PONTO DE INTEGRAÇÃO COM BACK-END:
       Substitua o bloco abaixo por uma chamada real, por exemplo:

       fetch("/api/contato", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify(Object.fromEntries(new FormData(form)))
       });
    -------------------------------------------------------- */
    feedback.textContent = "Mensagem enviada com sucesso! Em breve entraremos em contato.";
    feedback.className = "contact-form__feedback is-success";
    form.reset();
  });

  // Remove o destaque de erro assim que o usuário volta a digitar no campo
  form.querySelectorAll("input, textarea").forEach((campo) => {
    campo.addEventListener("input", () => campo.classList.remove("is-invalid"));
  });
}

/* ------------------------------------------------------------
   6. CÓPIA DA CHAVE PIX
   Copia o texto da chave Pix para a área de transferência e
   exibe uma confirmação temporária no botão.
------------------------------------------------------------ */
function initPixCopy() {
  const botaoCopiar = document.getElementById("copyPixBtn");
  const chavePix = document.getElementById("pixKey");
  if (!botaoCopiar || !chavePix) return;

  botaoCopiar.addEventListener("click", async () => {
    const texto = chavePix.textContent.trim();

    try {
      // API moderna de área de transferência (funciona em contexto seguro/https)
      await navigator.clipboard.writeText(texto);
    } catch (erro) {
      // Alternativa para navegadores/contextos sem suporte à Clipboard API
      const areaTemporaria = document.createElement("textarea");
      areaTemporaria.value = texto;
      document.body.appendChild(areaTemporaria);
      areaTemporaria.select();
      document.execCommand("copy");
      document.body.removeChild(areaTemporaria);
    }

    const textoOriginal = botaoCopiar.textContent;
    botaoCopiar.textContent = "Copiado!";
    botaoCopiar.classList.add("is-copied");

    // Volta ao texto original após 2 segundos
    setTimeout(() => {
      botaoCopiar.textContent = textoOriginal;
      botaoCopiar.classList.remove("is-copied");
    }, 2000);
  });
}

/* ------------------------------------------------------------
   7. GERAÇÃO DO QR CODE (PLACEHOLDER ESTILIZADO)
   Este NÃO é um QR Code real e funcional — é uma representação
   visual gerada por código para preencher o layout esteticamente.
   Para produção, substitua por um QR Code real (ex: gerado por uma
   biblioteca como qrcode.js) apontando para a chave Pix verdadeira.
------------------------------------------------------------ */
function gerarQrCodePlaceholder() {
  const container = document.getElementById("pixQrCode");
  if (!container) return;

  const TAMANHO_GRID = 10; // grade 10x10, deve bater com o CSS (.payment-box__qr)
  const SEMENTE = 42; // valor fixo para o padrão ser sempre igual (não aleatório a cada load)

  // Gerador pseudo-aleatório simples e determinístico (mesma semente = mesmo padrão)
  let estadoSemente = SEMENTE;
  const pseudoAleatorio = () => {
    estadoSemente = (estadoSemente * 9301 + 49297) % 233280;
    return estadoSemente / 233280;
  };

  container.innerHTML = ""; // limpa qualquer conteúdo anterior

  for (let linha = 0; linha < TAMANHO_GRID; linha++) {
    for (let coluna = 0; coluna < TAMANHO_GRID; coluna++) {
      const modulo = document.createElement("span");

      // Desenha "âncoras" sólidas nos três cantos, como em um QR Code real
      const ehCantoSuperiorEsquerdo = linha < 3 && coluna < 3;
      const ehCantoSuperiorDireito = linha < 3 && coluna >= TAMANHO_GRID - 3;
      const ehCantoInferiorEsquerdo = linha >= TAMANHO_GRID - 3 && coluna < 3;

      if (ehCantoSuperiorEsquerdo || ehCantoSuperiorDireito || ehCantoInferiorEsquerdo) {
        modulo.classList.add("is-filled");
      } else if (pseudoAleatorio() > 0.5) {
        modulo.classList.add("is-filled");
      }

      container.appendChild(modulo);
    }
  }
}

/* ------------------------------------------------------------
   8. ANO ATUAL NO RODAPÉ
   Mantém o copyright sempre atualizado sem precisar editar o HTML.
------------------------------------------------------------ */
function atualizarAnoRodape() {
  const spanAno = document.getElementById("currentYear");
  if (spanAno) {
    spanAno.textContent = new Date().getFullYear();
  }
}
