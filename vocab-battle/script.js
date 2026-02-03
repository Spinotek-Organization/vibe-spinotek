const questionBank = [
  {
    q: "SEMANGKA",
    a: "Watermelon",
    options: ["Melon", "Watermelon", "Pineapple", "Apple"],
  },
  { q: "BUKU", a: "Book", options: ["Pencil", "Eraser", "Book", "Ruler"] },
  {
    q: "SEPEDA",
    a: "Bicycle",
    options: ["Car", "Motorcycle", "Bicycle", "Bus"],
  },
  { q: "MATAHARI", a: "Sun", options: ["Moon", "Star", "Sun", "Cloud"] },
  { q: "KUCING", a: "Cat", options: ["Dog", "Cat", "Bird", "Rabbit"] },
  { q: "JERUK", a: "Orange", options: ["Apple", "Grape", "Orange", "Banana"] },
  { q: "TAS", a: "Bag", options: ["Table", "Bag", "Chair", "Lamp"] },
  { q: "PINTU", a: "Door", options: ["Window", "Door", "Wall", "Floor"] },
];

let gameState = {
  1: {
    score: 0,
    currentIdx: 0,
    timeLeft: 10,
    timer: null,
    active: false,
    finished: false,
  },
  2: {
    score: 0,
    currentIdx: 0,
    timeLeft: 10,
    timer: null,
    active: false,
    finished: false,
  },
};

let startBtn;
let overlay;
let menuContent;
let countdownEl;
let winnerCard;

document.addEventListener("DOMContentLoaded", () => {
  startBtn = document.getElementById("start-btn");
  overlay = document.getElementById("overlay");
  menuContent = document.getElementById("menu-content");
  countdownEl = document.getElementById("countdown");
  winnerCard = document.getElementById("winner-card");

  if (startBtn) {
    startBtn.onclick = () => {
      menuContent.classList.add("hidden");
      countdownEl.classList.remove("hidden");
      let count = 3;

      const countInterval = setInterval(() => {
        countdownEl.innerText = count === 0 ? "GO!" : count;
        countdownEl.classList.remove("animate__zoomIn");
        void countdownEl.offsetWidth;
        countdownEl.classList.add("animate__zoomIn");

        if (count < 0) {
          clearInterval(countInterval);
          countdownEl.classList.add("hidden");
          initGame();
        }
        count--;
      }, 1000);
    };
  }
});

function initGame() {
  overlay.classList.add("hidden");
  [1, 2].forEach(team => {
    gameState[team].score = 0;
    gameState[team].currentIdx = 0;
    gameState[team].active = true;
    gameState[team].finished = false;
    document.getElementById(`score${team}`).innerText = "0";
    document.getElementById(`rocket${team}`).style.bottom = "0%";
    showQuestion(team);
  });
}

function showQuestion(team) {
  const teamData = gameState[team];
  const qEl = document.getElementById(`q${team}`);
  const cEl = document.getElementById(`choices${team}`);

  if (teamData.currentIdx >= questionBank.length) {
    teamData.active = false;
    teamData.finished = true;
    clearInterval(teamData.timer);
    qEl.innerText = "MISSION COMPLETE 🏁";
    qEl.classList.add("text-sky-400");
    cEl.innerHTML = "";
    checkGameOver();
    return;
  }

  const currentQ = questionBank[teamData.currentIdx];
  qEl.innerText = currentQ.q;

  // Efek transisi soal
  qEl.classList.remove("animate__fadeInUp");
  void qEl.offsetWidth;
  qEl.classList.add("animate__fadeInUp", "animate__animated");

  cEl.innerHTML = "";
  [...currentQ.options]
    .sort(() => Math.random() - 0.5)
    .forEach(opt => {
      const btn = document.createElement("button");
      btn.innerText = opt;
      // Menyesuaikan dengan class CSS Glassmorphism
      btn.className = `choice-btn py-6 px-4 rounded-2xl text-xl font-bold text-white uppercase tracking-widest`;
      btn.onclick = () => handleAnswer(team, opt, btn);
      cEl.appendChild(btn);
    });

  startTimer(team);
}

function handleAnswer(team, selected, btn) {
  const teamData = gameState[team];
  if (!teamData.active) return;
  clearInterval(teamData.timer);

  const isCorrect = selected === questionBank[teamData.currentIdx].a;
  const sfx = document.getElementById(isCorrect ? "sfx-correct" : "sfx-wrong");
  const rocket = document.getElementById(`rocket${team}`);

  sfx.currentTime = 0;
  sfx.play();

  if (isCorrect) {
    teamData.score += 50 + teamData.timeLeft * 10;
    btn.classList.add("correct");
    document.getElementById(`score${team}`).innerText = teamData.score;

    // ANIMASI ROKET MELUNCUR (Menambahkan class ke parent untuk menyalakan api/thruster)
    rocket.parentElement.parentElement.classList.add("launching");

    const progress = ((teamData.currentIdx + 1) / questionBank.length) * 85;
    rocket.style.bottom = `${progress}%`;

    // Matikan thruster setelah meluncur selesai
    setTimeout(() => {
      rocket.parentElement.parentElement.classList.remove("launching");
    }, 800);
  } else {
    btn.classList.add("wrong");
    // ANIMASI ROKET ERROR (Goncang)
    rocket.classList.add("animate__animated", "animate__headShake");
    setTimeout(() => {
      rocket.classList.remove("animate__animated", "animate__headShake");
    }, 500);
  }

  // Kunci tombol agar tidak bisa klik berkali-kali
  btn.parentElement
    .querySelectorAll("button")
    .forEach(b => (b.disabled = true));

  setTimeout(() => {
    teamData.currentIdx++;
    showQuestion(team);
  }, 800);
}

function startTimer(team) {
  const teamData = gameState[team];
  teamData.timeLeft = 10;
  const timerDisplay = document.getElementById(`timer${team}`);
  timerDisplay.innerText = "10";
  timerDisplay.classList.remove("text-red-500");

  teamData.timer = setInterval(() => {
    teamData.timeLeft--;
    timerDisplay.innerText = teamData.timeLeft;

    // Warning jika waktu mau habis
    if (teamData.timeLeft <= 3) timerDisplay.classList.add("text-red-500");

    if (teamData.timeLeft <= 0) {
      clearInterval(teamData.timer);
      teamData.currentIdx++;
      showQuestion(team);
    }
  }, 1000);
}

function checkGameOver() {
  if (gameState[1].finished && gameState[2].finished) {
    setTimeout(() => {
      overlay.classList.remove("hidden");
      winnerCard.classList.remove("hidden");

      const s1 = gameState[1].score;
      const s2 = gameState[2].score;
      document.getElementById("final-s1").innerText = s1;
      document.getElementById("final-s2").innerText = s2;

      const winTitle = document.getElementById("winner-team-name");
      if (s1 > s2) {
        winTitle.innerText = "TEAM ALPHA MENANG! 🏆";
        winTitle.className =
          "text-7xl font-black text-sky-400 mb-6 tracking-tighter";
      } else if (s2 > s1) {
        winTitle.innerText = "TEAM BRAVO MENANG! 🏆";
        winTitle.className =
          "text-7xl font-black text-purple-400 mb-6 tracking-tighter";
      } else {
        winTitle.innerText = "MISI SERI! 🤝";
        winTitle.className =
          "text-7xl font-black text-white mb-6 tracking-tighter";
      }

      launchFinalFireworks();
    }, 1200);
  }
}

function launchFinalFireworks() {
  const duration = 5 * 1000;
  const end = Date.now() + duration;

  (function frame() {
    confetti({
      particleCount: 5,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ["#38bdf8", "#ffffff"],
    });
    confetti({
      particleCount: 5,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ["#a855f7", "#ffffff"],
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}
