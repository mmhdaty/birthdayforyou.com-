/* =========================================================
   ====  EDIT BAGIAN INI UNTUK GANTI ISI KARTU  ====
   ========================================================= */
const CONFIG = {
  nickname: "Sayang",                 // panggilan untuk pasangan/teman
  date: "23.06.2026",                  // tanggal ulang tahun
  ageLine: "ciee umur dia sekarang udah 16 tahun sekarang",
  role: "Selamat yaa sayang",                // "Birthday Boy" atau "Birthday Girl"

  // path foto. Upload fotomu ke folder "assets" lalu tulis nama filenya di sini.
  // contoh: "assets/foto-aku.jpg"
  mainPhoto: "main.jpeg",         // foto besar di slide 2
  locketPhoto1: "1.jpeg",      // foto kiri di locket
  locketPhoto2: "2.jpeg",      // foto kanan di locket

  letter: [
    "happy birthday, sayangku tsundere.",
    "hari ini adalah hari spesialmu, semoga ke depannya kamu menemukan hal-hal positif dalam hidup kamu, senang bisa mengenal kamu, dan makasih juga buat udah mau jadi pasangan aku, hehe... semoga makin dewasa, makin sayang sama keluarga, dan makin sukses di jalan yang kamu pilih.",
    "jarak nggak akan pernah mengubah rasa ini. semoga makan cantik kek bidadari, kek sugar mommy ahahaha, cihuy, ke depannya jangan suka marah ya. and l love you."
  ],

  songName: "My Love Mine All Mine",
  songArtist: "Mitski",
  // foto kecil di samping lagu (cover lagu / foto kalian). taruh di folder assets.
  songPhoto: "song.jpeg",
  songSrc: "lagu.mp3"
};
/* ========================================================= */


document.addEventListener("DOMContentLoaded", () => {

  /* ---------- apply config to DOM ---------- */
  document.getElementById("bdayDate").textContent = CONFIG.date;
  document.getElementById("bdayDateIntro").textContent = CONFIG.date;
  document.querySelectorAll("#nicknameOut, #nicknameOut2, #nicknameOutIntro").forEach(el => el.textContent = CONFIG.nickname);
  document.getElementById("ageLineOut").textContent = CONFIG.ageLine;
  document.getElementById("ageLineOutIntro").textContent = CONFIG.ageLine;
  document.getElementById("roleTitleOut").textContent = CONFIG.role;

  if (CONFIG.mainPhoto) {
    const el = document.getElementById("mainPhoto");
    el.style.backgroundImage = `url('${CONFIG.mainPhoto}')`;
    el.querySelector(".photo-placeholder-text").style.display = "none";
  }
  if (CONFIG.locketPhoto1) {
    const el = document.querySelector('[data-slot="locket1"]');
    el.style.backgroundImage = `url('${CONFIG.locketPhoto1}')`;
    el.querySelector(".photo-placeholder-text").style.display = "none";
  }
  if (CONFIG.locketPhoto2) {
    const el = document.querySelector('[data-slot="locket2"]');
    el.style.backgroundImage = `url('${CONFIG.locketPhoto2}')`;
    el.querySelector(".photo-placeholder-text").style.display = "none";
  }

  const letterBody = document.getElementById("letterBody");
  letterBody.innerHTML = CONFIG.letter.map(p => `<p>${p}</p>`).join("");

  document.getElementById("songNameOut").textContent = CONFIG.songName;
  document.getElementById("songArtistOut").textContent = CONFIG.songArtist;
  if (CONFIG.songPhoto) {
    const el = document.getElementById("songPhoto");
    el.style.backgroundImage = `url('${CONFIG.songPhoto}')`;
    el.querySelector(".photo-placeholder-text").style.display = "none";
  }
  const audioEl = document.getElementById("bgAudio");
  if (CONFIG.songSrc) {
    audioEl.src = CONFIG.songSrc;
  }

  /* ---------- envelope opening ---------- */
  const envelopeScene = document.getElementById("envelope-scene");
  const cardScene = document.getElementById("card-scene");

  let opened = false;
  envelopeScene.addEventListener("click", () => {
    if (opened) return;
    opened = true;

    envelopeScene.classList.add("seal-split");
    setTimeout(() => envelopeScene.classList.add("flap-open"), 300);
    setTimeout(() => envelopeScene.classList.add("envelope-done"), 1500);
    setTimeout(() => {
      envelopeScene.classList.remove("active");
      cardScene.classList.add("active");
      showSlide(0);
    }, 2000);
  });

  /* ---------- slide navigation ---------- */
  const slides = Array.from(document.querySelectorAll(".card-slide"));
  const dotsWrap = document.getElementById("dots");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  let current = 0;

  slides.forEach((_, i) => {
    const dot = document.createElement("span");
    dot.className = "dot";
    dot.addEventListener("click", () => showSlide(i));
    dotsWrap.appendChild(dot);
  });
  const dots = Array.from(dotsWrap.children);

  function showSlide(index) {
    if (index < 0 || index >= slides.length) return;
    const dir = index > current ? "right" : "left";
    slides.forEach((s, i) => {
      s.classList.remove("active", "exit-left", "exit-right");
      if (i === index) {
        s.classList.add("active");
      } else if (i === current && i !== index) {
        s.classList.add(dir === "right" ? "exit-left" : "exit-right");
      }
    });
    dots.forEach((d, i) => d.classList.toggle("active", i === index));
    prevBtn.disabled = index === 0;
    nextBtn.disabled = index === slides.length - 1;
    current = index;
  }

  prevBtn.addEventListener("click", () => showSlide(current - 1));
  nextBtn.addEventListener("click", () => showSlide(current + 1));

  // swipe support
  let touchStartX = null;
  cardScene.addEventListener("touchstart", e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  cardScene.addEventListener("touchend", e => {
    if (touchStartX === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) {
      if (dx < 0) showSlide(current + 1);
      else showSlide(current - 1);
    }
    touchStartX = null;
  }, { passive: true });

  // keyboard support
  document.addEventListener("keydown", e => {
    if (!cardScene.classList.contains("active")) return;
    if (e.key === "ArrowRight") showSlide(current + 1);
    if (e.key === "ArrowLeft") showSlide(current - 1);
  });

  /* ---------- restart button ---------- */
  document.getElementById("restartBtn").addEventListener("click", () => {
    cardScene.classList.remove("active");
    envelopeScene.classList.remove("seal-split", "flap-open", "envelope-done");
    envelopeScene.classList.add("active");
    opened = false;
    showSlide(0);
  });

  /* ---------- blow-the-candle (microphone) ---------- */
  const cakeWish = document.getElementById("cakeWish");
  let audioCtx = null, analyser = null, micStream = null, rafId = null;

  async function tryEnableBlow() {
    if (cakeWish.classList.contains("blown")) return;
    try {
      micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioCtx.createMediaStreamSource(micStream);
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);

      const check = () => {
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        if (avg > 35) {
          cakeWish.classList.add("blown");
          cleanupMic();
          return;
        }
        rafId = requestAnimationFrame(check);
      };
      check();
    } catch (err) {
      // mic denied or unavailable — allow manual tap-to-blow fallback
    }
  }

  function cleanupMic() {
    if (rafId) cancelAnimationFrame(rafId);
    if (micStream) micStream.getTracks().forEach(t => t.stop());
    if (audioCtx) audioCtx.close();
  }

  cakeWish.addEventListener("click", () => {
    if (cakeWish.classList.contains("blown")) return;
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      tryEnableBlow();
    } else {
      cakeWish.classList.add("blown");
    }
  });
  // fallback: tap-and-hold also blows it out manually after 900ms
  let pressTimer = null;
  cakeWish.addEventListener("touchstart", () => {
    pressTimer = setTimeout(() => cakeWish.classList.add("blown"), 900);
  }, { passive: true });
  cakeWish.addEventListener("touchend", () => clearTimeout(pressTimer));

  /* ---------- play/pause song ---------- */
  const playBtn = document.getElementById("playBtn");
  const audioRow = document.querySelector(".audio-row");
  const songArt = document.getElementById("songPhoto");
  playBtn.addEventListener("click", () => {
    if (!audioEl.src) {
      playBtn.textContent = "♪";
      return;
    }
    if (audioEl.paused) {
      audioEl.play();
      playBtn.textContent = "❚❚";
      audioRow.classList.remove("paused");
      songArt.classList.add("spinning");
    } else {
      audioEl.pause();
      playBtn.textContent = "▶";
      audioRow.classList.add("paused");
      songArt.classList.remove("spinning");
    }
  });

});