// Envelope do Convite
const conviteOverlay = document.getElementById("convite-overlay");
const monograma = document.querySelector(".monograma");
// Bloqueia scroll ao entrar no site
document.body.classList.add("convite-aberto");

conviteOverlay.addEventListener("click", () => {
  conviteOverlay.classList.add("aberto");
  document.body.classList.remove("convite-aberto");
  setTimeout(() => {
    monograma.classList.add("animar");
  }, 500);
});

// Nav bar
const nav = document.getElementById("navbar");
const sections = document.querySelectorAll("section");
const navLinks = document.querySelectorAll("nav a");

window.addEventListener("scroll", () => {
  if (window.scrollY > window.innerHeight - 100) {
    nav.classList.add("scrolled");
  } else {
    nav.classList.remove("scrolled");
  }
});

window.addEventListener("scroll", () => {
  let current = "";

  sections.forEach(section => {
    const top = section.offsetTop - 120;
    if (scrollY >= top) {
      current = section.getAttribute("id");
    }
  });

  navLinks.forEach(a => {
    a.classList.remove("active");
    if (a.getAttribute("href") === "#" + current) {
      a.classList.add("active");
    }
  });
});

// Countdown
const weddingDate = new Date("2026-11-14T17:00:00");

setInterval(() => {
  const now = new Date();
  const diff = weddingDate - now;

  if (diff <= 0) return;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  const d = document.getElementById("dias");
  const h = document.getElementById("horas");
  const m = document.getElementById("minutos");
  const s = document.getElementById("segundos");

  if (d) d.innerText = days;
  if (h) h.innerText = hours.toString().padStart(2, "0");
  if (m) m.innerText = minutes.toString().padStart(2, "0");
  if (s) s.innerText = seconds.toString().padStart(2, "0");

}, 1000);

// Pix
let pixPayload = "";
let presenteSelecionado = "";
let valorSelecionado = "";

function gerarCRC16(payload) {
  let polinomio = 0x1021;
  let resultado = 0xFFFF;

  for (let i = 0; i < payload.length; i++) {
    resultado ^= payload.charCodeAt(i) << 8;

    for (let j = 0; j < 8; j++) {
      if ((resultado & 0x8000) !== 0) {
        resultado = (resultado << 1) ^ polinomio;
      } else {
        resultado <<= 1;
      }
      resultado &= 0xFFFF;
    }
  }
  return resultado.toString(16).toUpperCase().padStart(4, "0");
}

function gerarPayload(valor) {
  const valorFormatado = valor.toFixed(2);
  const chave = "12858670684";
  const nome = "MARCELO";
  const cidade = "NOVOHAMBURGO";
  const gui = "BR.GOV.BCB.PIX";
  const chavePix = chave;

  const merchantAccount =
    "00" + gui.length.toString().padStart(2, "0") + gui +
    "01" + chavePix.length.toString().padStart(2, "0") + chavePix;

  const merchantAccountLength = merchantAccount.length.toString().padStart(2, "0");

  let payload =
    "000201" +
    "26" + merchantAccountLength + merchantAccount +
    "52040000" +
    "5303986" +
    "54" + valorFormatado.length.toString().padStart(2, "0") + valorFormatado +
    "5802BR" +
    "59" + nome.length.toString().padStart(2, "0") + nome +
    "60" + cidade.length.toString().padStart(2, "0") + cidade +
    "62070503***" +
    "6304";

  const crc = gerarCRC16(payload);
  return payload + crc;
}

function gerarPix(valor, botao) {
  pixPayload = gerarPayload(valor);
  // Seleciona o card do presente
  const gift = botao.closest(".gift");

  // Seleciona nome e valor
  presenteSelecionado = gift.querySelector(".gift-title strong").innerText;
  valorSelecionado = gift.querySelector(".gift-price").innerText;

  const canvas = document.getElementById("qrcode");
  canvas.innerHTML = "";
  QRCode.toCanvas(canvas, pixPayload, { width: 220 });
  document.getElementById("pixModal").style.display = "flex";

  // Limpa os campos ao abrir
  document.getElementById("giftName").value = "";
  document.getElementById("giftMessage").value = "";
}

function copiarPix() {
  navigator.clipboard.writeText(pixPayload);
  alert("Código PIX copiado!");
}

// Forms Presentes
async function fecharModal() {
  const nome = document.getElementById("giftName").value.trim();
  const mensagem = document.getElementById("giftMessage").value.trim();

  // se escreveu mensagem, nome é obrigatório
  if (mensagem && !nome) {
    alert("Preencha o campo Nome(s) para enviar uma mensagem.");
    return;
  }

  // só envia se pelo menos um dos campos foi preenchido
  if (nome || mensagem) {
    const formData = new FormData();

    formData.append("entry.1204416743", nome);
    formData.append("entry.778532851", mensagem);
    formData.append("entry.993903146", presenteSelecionado);
    formData.append("entry.379738400", valorSelecionado);

    try {
      await fetch("https://docs.google.com/forms/d/e/1FAIpQLSdeW09CZRHiCvvPiM_YscroRPC1da623I6FmX7DIYO_3cSgBA/formResponse", {
        method: "POST",
        mode: "no-cors",
        body: formData
      });
    } catch (error) {
      console.error("Erro ao enviar formulário:", error);
      alert("Erro ao enviar:", error);
    }
    alert("Mensagem enviada!")
  }
  document.getElementById("pixModal").style.display = "none";
}

// Fade-in
const elements = document.querySelectorAll('.fade');

window.addEventListener('scroll', () => {
  elements.forEach(el => {
    const top = el.getBoundingClientRect().top;
    if (top < window.innerHeight - 50) {
      el.classList.add('show');
    }
  });
});

// Carrossel de Presentes
const track = document.getElementById("giftsTrack");
const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");
const pages = document.querySelectorAll(".gift-page");
let currentPage = 0;

function updateCarousel() {
  track.style.transform =
    `translateX(-${currentPage * 100}%)`;

  if (currentPage === 0) {
    prevBtn.classList.add("hidden");
  } else {
    prevBtn.classList.remove("hidden");
  }
}

nextBtn.addEventListener("click", () => {
  if (currentPage >= pages.length - 1) {
    currentPage = 0;
  } else {
    currentPage++;
  }
  updateCarousel();
});

prevBtn.addEventListener("click", () => {
  currentPage--;

  if (currentPage < 0) {
    currentPage = 0;
  }
  updateCarousel();
});

// Swipe mobile
let startX = 0;
track.addEventListener("touchstart", (e) => {
  startX = e.touches[0].clientX;
});

track.addEventListener("touchend", (e) => {
  const endX = e.changedTouches[0].clientX;

  if (startX - endX > 50) {
    nextBtn.click();
  }
  if (endX - startX > 50) {
    prevBtn.click();
  }
});
updateCarousel();

// Formatação Telefone
const telefoneInput = document.querySelector('[name="telefone"]');

if (telefoneInput) {
  telefoneInput.addEventListener("input", function () {
    let v = this.value.replace(/\D/g, "");

    if (v.length > 11) v = v.slice(0, 11);

    if (v.length === 0) {
      this.value = "";
    } else if (v.length <= 2) {
      this.value = "(" + v;
    } else if (v.length <= 6) {
      this.value = "(" + v.slice(0, 2) + ") " + v.slice(2);
    } else {
      this.value =
        "(" +
        v.slice(0, 2) +
        ") " +
        v.slice(2, 7) +
        "-" +
        v.slice(7);
    }
  });
}

// Form Lista de Presença
document.getElementById("rsvpForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const nome = document.querySelector('[name="nome"]').value.trim();
  const presencaEl = document.querySelector('[name="presenca"]:checked');
  const telefone = document.querySelector('[name="telefone"]').value.trim();

  const regexTelefone = /^\(\d{2}\) \d{5}-\d{4}$/;

  if (!regexTelefone.test(telefone)) {
    alert("Por favor, insira um telefone válido.");
    return;
  }

  if (!presencaEl) {
    alert("Por favor, selecione se irá ao evento.");
    return;
  }

  const presenca = presencaEl.value;
  const formData = new FormData();

  formData.append("entry.1498135098", nome);
  formData.append("entry.877086558", presenca);
  formData.append("entry.1424661284", telefone);

  fetch("https://docs.google.com/forms/d/e/1FAIpQLSdqfbrxBhPOqH9pQE12oMwBwASs3B_Gjt6WiaOkBpFTBjEQew/formResponse", {
    method: "POST",
    mode: "no-cors",
    body: formData
  });

  document.getElementById("msg").innerText = "Concluído! Obrigado pela resposta!";
  this.reset();
});