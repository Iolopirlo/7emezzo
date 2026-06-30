(() => {
  const MAX_SCORE = 10;
  const AUTO_NEXT_ROUND_MS = 1800;

  const suits = ["Denari", "Coppe", "Bastoni", "Spade"];
  const ranks = [
    { label: "A", name: "Asso", value: 1, col: 0 },
    { label: "2", name: "Due", value: 2, col: 1 },
    { label: "3", name: "Tre", value: 3, col: 2 },
    { label: "4", name: "Quattro", value: 4, col: 3 },
    { label: "5", name: "Cinque", value: 5, col: 4 },
    { label: "6", name: "Sei", value: 6, col: 5 },
    { label: "7", name: "Sette", value: 7, col: 6 },
    { label: "F", name: "Fante", value: 0.5, col: 7 },
    { label: "C", name: "Cavallo", value: 0.5, col: 8 },
    { label: "R", name: "Re", value: 0.5, col: 9 }
  ];
  const suitRows = { Denari: 0, Coppe: 1, Bastoni: 2, Spade: 3 };

  let deck = [];
  let player = [];
  let dealer = [];
  let status = "playing";
  let playerScore = 0;
  let dealerScore = 0;
  let timer = null;

  const els = {
    playerScore: document.getElementById("playerScore"),
    dealerScore: document.getElementById("dealerScore"),
    message: document.getElementById("message"),
    playerValue: document.getElementById("playerValue"),
    dealerValue: document.getElementById("dealerValue"),
    playerCards: document.getElementById("playerCards"),
    dealerCards: document.getElementById("dealerCards"),
    hitBtn: document.getElementById("hitBtn"),
    standBtn: document.getElementById("standBtn"),
    newRoundBtn: document.getElementById("newRoundBtn"),
    resetBtn: document.getElementById("resetBtn"),
    winnerBanner: document.getElementById("winnerBanner"),
    maxScoreLabel: document.getElementById("maxScoreLabel")
  };
  els.maxScoreLabel.textContent = MAX_SCORE;

  function createDeck() {
    const d = [];
    suits.forEach(suit => ranks.forEach(rank => d.push({ ...rank, suit, id: `${rank.label}-${suit}-${Math.random()}` })));
    return shuffle(d);
  }

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function draw() { return deck.pop(); }
  function handValue(hand) { return hand.reduce((sum, card) => sum + card.value, 0); }
  function formatValue(value) { return Number.isInteger(value) ? String(value) : `${Math.floor(value)}½`; }

  function newRound(auto = false) {
    clearTimeout(timer);
    deck = createDeck();
    player = [draw()];
    dealer = [draw()];
    status = "playing";
    els.winnerBanner.classList.remove("show");
    els.message.textContent = auto ? "Neue Runde automatisch gestartet. Du bist am Zug." : "Neue Runde gestartet. Du bist am Zug.";
    render();
  }

  function resetGame() {
    clearTimeout(timer);
    playerScore = 0;
    dealerScore = 0;
    els.winnerBanner.classList.remove("show");
    newRound(false);
    els.message.textContent = "Spiel zurückgesetzt. Neue Runde automatisch gestartet.";
  }

  function hit() {
    if (status !== "playing") return;
    player.push(draw());
    const value = handValue(player);
    if (value > 7.5) {
      finishRound("dealer", `Überkauft! Dein Wert ist ${formatValue(value)}. Dealer gewinnt die Runde.`);
    } else if (value === 7.5) {
      stand();
    } else {
      els.message.textContent = `Aktueller Wert: ${formatValue(value)}. Noch eine Karte?`;
      render();
    }
  }

  function stand() {
    if (status !== "playing") return;
    while (handValue(dealer) < 5.5) dealer.push(draw());
    const pv = handValue(player);
    const dv = handValue(dealer);

    if (dv > 7.5) finishRound("player", `Dealer überkauft mit ${formatValue(dv)}. Du gewinnst!`);
    else if (pv > dv) finishRound("player", `Du gewinnst mit ${formatValue(pv)} gegen ${formatValue(dv)}.`);
    else if (pv < dv) finishRound("dealer", `Dealer gewinnt mit ${formatValue(dv)} gegen ${formatValue(pv)}.`);
    else finishRound(null, `Unentschieden: ${formatValue(pv)} zu ${formatValue(dv)}.`);
  }

  function finishRound(winner, text) {
    status = "finished";
    if (winner === "player") playerScore += 1;
    if (winner === "dealer") dealerScore += 1;
    render();

    const matchWinner = playerScore >= MAX_SCORE ? "player" : dealerScore >= MAX_SCORE ? "dealer" : null;
    if (matchWinner) {
      status = "gameover";
      const winnerText = matchWinner === "player" ? "Du gewinnst" : "Dealer gewinnt";
      els.message.textContent = `${text} Match beendet.`;
      els.winnerBanner.textContent = `${winnerText} das Match mit ${MAX_SCORE} Punkten!`;
      els.winnerBanner.classList.add("show");
      renderButtons();
      return;
    }

    els.message.textContent = `${text} Neue Runde startet automatisch...`;
    timer = setTimeout(() => newRound(true), AUTO_NEXT_ROUND_MS);
  }

  function cardEl(card, hidden = false) {
    const wrap = document.createElement("div");
    wrap.className = "playing-card";
    wrap.title = hidden ? "Verdeckte Dealerkarte" : `${card.name} di ${card.suit}`;
    if (hidden) {
      const img = document.createElement("img");
      img.className = "card-back";
      img.alt = "Verdeckte Dealerkarte";
      img.src = "./assets/asset-2.png";
      wrap.appendChild(img);
    } else {
      const face = document.createElement("div");
      face.className = "sprite-card";
      face.style.backgroundPosition = `${card.col * 100 / 9}% ${suitRows[card.suit] * 100 / 3}%`;
      wrap.appendChild(face);
    }
    return wrap;
  }

  function renderCards() {
    els.playerCards.innerHTML = "";
    player.forEach(card => els.playerCards.appendChild(cardEl(card, false)));
    els.dealerCards.innerHTML = "";
    dealer.forEach((card, index) => els.dealerCards.appendChild(cardEl(card, status === "playing" && index === 0)));
  }

  function renderButtons() {
    els.hitBtn.disabled = status !== "playing";
    els.standBtn.disabled = status !== "playing";
  }

  function render() {
    els.playerScore.textContent = playerScore;
    els.dealerScore.textContent = dealerScore;
    els.playerValue.textContent = formatValue(handValue(player));
    els.dealerValue.textContent = status === "playing" ? "?" : formatValue(handValue(dealer));
    renderCards();
    renderButtons();
  }

  els.hitBtn.addEventListener("click", hit);
  els.standBtn.addEventListener("click", stand);
  els.newRoundBtn.addEventListener("click", () => newRound(false));
  els.resetBtn.addEventListener("click", resetGame);

  newRound(true);
})();
