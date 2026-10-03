/* THE DUEL — the cabinet's only machine.
   A move is played, never followed: nothing here navigates. Everything that does not
   fit on the single screen (the story, the house rules, the record, the setting art)
   lives in a floating window, and a window only opens when a button asks for it. */
(() => {
  const cabinet = document.querySelector(".cabinet");
  const readout = document.querySelector("#readout");
  const moveName = document.querySelector("#move-name");
  const moveSide = document.querySelector("#move-side");
  const turnSide = document.querySelector("#turn-side");
  const ticker = document.querySelector("#ticker");
  const floats = document.querySelector("#floats");
  const floatBody = document.querySelector("#float-body");
  const floatKicker = document.querySelector("#float-kicker");
  const floatTitle = document.querySelector("#float-title");
  const floatCount = document.querySelector("#float-count");
  if (!cabinet || !readout || !floats) return;

  const SIDES = {
    signal: {
      player: "PLAYER 01 · SIGNAL HOUND",
      circuit: "CIRCUIT 01 · THE MAKING HALF",
      logName: "SIGNAL HOUND",
      buttons: () => [...document.querySelectorAll('.team button[data-team="signal"]')],
    },
    archive: {
      player: "PLAYER 02 · ARCHIVE LEVIATHAN",
      circuit: "CIRCUIT 02 · THE REMEMBERING HALF",
      logName: "ARCHIVE LEVIATHAN",
      buttons: () => [...document.querySelectorAll('.team button[data-team="archive"]')],
    },
  };
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const selected = { signal: 0, archive: 0 };
  const entries = [];
  let side = "signal";
  let lastFocus = null;
  let openKey = null;

  /* ---------- the cards: setting art and the long text, kept off the screen ---------- */
  const CARDS = {
    story: {
      kicker: "Setting · the world",
      title: "WHAT THEY ACTUALLY FIGHT ABOUT",
      html: `
        <p>One desk, two tenants. The hound makes things; the leviathan remembers them. When the lamp
        is switched off they meet on the same violet floor and take opposite sides of one question:
        <b>what is worth keeping?</b></p>
        <p>The hound answers with a new draft — something that did not exist an hour ago. The leviathan
        answers with the version of it that already happened, footnoted. Neither of them wins. Both of
        them get sharper.</p>
        <p>Three creatures watch from the shelf above the desk and keep score in a language that is
        mostly tail. The moon above the window is a door; what is behind the door is what the two
        halves are <b>really</b> arguing about, and neither of them will say it out loud.</p>
        <p class="flag">Nothing on this page is a link. Doors belong to the room; the arena only keeps consequences.</p>`,
    },
    rules: {
      kicker: "Setting · house rules",
      title: "HOUSE RULES",
      html: `
        <ol>
          <li>A move has to be <b>finished</b> before the other half may answer.</li>
          <li>The half that speaks first loses the point — unless the other is still loading.</li>
          <li>Nothing is deleted. It is only moved somewhere darker.</li>
          <li>The duel never ends; it is <b>paused</b> when the lamp goes off.</li>
        </ol>
        <p class="flag">Four rules, no exceptions, one lamp switch.</p>`,
    },
    field: {
      kicker: "Setting plate · I",
      title: "THE FIELD",
      img: "../assets/duel/arena.webp",
      caption: "Before either half moves. The floor is lit; nobody is standing on it yet.",
    },
    clash: {
      kicker: "Setting plate · II",
      title: "THE CLASH",
      img: "../assets/duel/clash.webp",
      caption: "Both halves choosing, at the same instant, the same move.",
    },
    door: {
      kicker: "Setting plate · III",
      title: "THE DOOR THE MOON OPENS ONTO",
      img: "../assets/monster-duel-bg.webp",
      caption: "The thing both halves are actually fighting, and neither of them will name.",
    },
    residue: {
      kicker: "Setting plate · IV",
      title: "RESIDUE",
      img: "../assets/impact-streaks.webp",
      caption: "What is left on the desk after a round: streaks, scorch marks, no answers.",
    },
    knock: {
      kicker: "Missing plate",
      title: "THE ELEVENTH KNOCK",
      html: `<div class="plate" aria-hidden="true">?</div>
        <p>There were eleven plates. The eleventh is not on this wall any more — the nail is still
        there, and so is the shadow it left.</p>
        <p class="flag">Something was here and left. The room does not say what.</p>`,
    },
    "fighter-signal": {
      kicker: "Fighter card · 01",
      title: "SIGNAL HOUND",
      img: "../assets/duel/signal-hound.webp",
      body: [
        "<b>The making half.</b> Speed, drafts, half-finished brilliance. It would rather show you a rough thing tonight than a perfect thing next month.",
        "It fights with motion, type, sound, colour and light — and it considers a page that will still open in ten years to be the most romantic object on the desk.",
        "Weakness: it forgets what it already decided. That is the other one's whole business.",
      ],
      caption: "Trailing light. It never stands still long enough to be photographed properly.",
    },
    "fighter-archive": {
      kicker: "Fighter card · 02",
      title: "ARCHIVE LEVIATHAN",
      img: "../assets/duel/archive-leviathan.webp",
      body: [
        "<b>The remembering half.</b> It drags its drawers behind it and will not let a claim stand without its source.",
        "It fights with field notes, data wrangling, evaluation and the red pen — its favourite move is proving that a beautiful number was a lie.",
        "Weakness: it remembers so much that it can argue all night against a decision that was already made.",
      ],
      caption: "Dragging its drawers. Slow on purpose, and right more often than it is fast.",
    },
  };

  function cardFacts(move, team) {
    return {
      kicker: `Move card · ${team === "signal" ? "01 · the making half" : "02 · the remembering half"}`,
      title: move,
    };
  }

  function renderLogCard() {
    const list = document.createElement("ol");
    list.className = "log";
    if (!entries.length) {
      const idle = document.createElement("li");
      idle.className = "idle";
      idle.textContent = "The lamp is on. Neither half has moved yet.";
      list.append(idle);
    } else {
      entries.forEach((entry) => {
        const line = document.createElement("li");
        const who = document.createElement("b");
        who.textContent = entry.who;
        line.append(who, document.createTextNode(` — ${entry.move}: ${entry.log}`));
        list.append(line);
      });
    }
    const clear = document.createElement("button");
    clear.type = "button";
    clear.className = "card-button";
    clear.id = "clear-log";
    clear.textContent = "◉ CLEAR THE RECORD";
    const wrap = document.createElement("div");
    wrap.append(list, clear);
    return wrap;
  }

  function buildCard(key) {
    const card = CARDS[key];
    floatBody.replaceChildren();
    if (!card) return { kicker: "Nothing here", title: "EMPTY PLATE" };

    if (card.img) {
      const img = document.createElement("img");
      img.src = card.img;
      img.alt = card.title;
      floatBody.append(img);
    }
    if (card.html) {
      const block = document.createElement("div");
      block.innerHTML = card.html;
      floatBody.append(block);
    }
    if (card.body) card.body.forEach((text) => {
      const p = document.createElement("p");
      p.innerHTML = text;
      floatBody.append(p);
    });
    if (card.caption) {
      const p = document.createElement("p");
      p.className = "flag";
      p.textContent = card.caption;
      floatBody.append(p);
    }
    return card;
  }

  function openCard(key) {
    if (key === "move") {
      const button = SIDES[side].buttons()[selected[side]];
      if (!button) return;
      floatBody.replaceChildren();
      const img = document.createElement("img");
      img.src = button.dataset.art || "../assets/duel/arena.webp";
      img.alt = button.dataset.move;
      const note = document.createElement("p");
      note.className = "flag";
      note.textContent = `${button.dataset.note} · played by ${SIDES[button.dataset.team].logName}`;
      const text = document.createElement("p");
      text.textContent = button.dataset.log;
      floatBody.append(img, note, text);
      const facts = cardFacts(button.dataset.move, button.dataset.team);
      floatKicker.textContent = facts.kicker;
      floatTitle.textContent = facts.title;
    } else if (key === "log") {
      const card = { kicker: "Match record", title: "BATTLE LOG" };
      floatBody.replaceChildren(renderLogCard());
      floatKicker.textContent = card.kicker;
      floatTitle.textContent = card.title;
    } else {
      const card = buildCard(key);
      floatKicker.textContent = card.kicker || "Setting card";
      floatTitle.textContent = card.title || key;
    }

    openKey = key;
    lastFocus = document.activeElement;
    floats.hidden = false;
    cabinet.dataset.paused = "true";
    floatCount.textContent = key === "log" ? `${entries.length} logged` : "floating window";
    const closer = document.querySelector(".float__close");
    if (closer) closer.focus({ preventScroll: true });
  }

  function closeCard() {
    if (floats.hidden) return;
    floats.hidden = true;
    openKey = null;
    delete cabinet.dataset.paused;
    if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus({ preventScroll: true });
  }

  document.querySelectorAll("[data-open]").forEach((button) => {
    if (button.dataset.open === "move") return;         // handled through the current selection
    button.addEventListener("click", () => openCard(button.dataset.open));
  });
  document.querySelectorAll("[data-close]").forEach((el) => el.addEventListener("click", closeCard));

  floatBody.addEventListener("click", (event) => {
    if (event.target.id !== "clear-log") return;
    entries.length = 0;
    floatBody.replaceChildren(renderLogCard());
    floatCount.textContent = "0 logged";
    if (ticker) ticker.textContent = "THE LAMP IS ON. NEITHER HALF HAS MOVED YET.";
  });

  /* ---------- selecting and playing ---------- */
  function paint(focus = false) {
    document.querySelectorAll(".team button").forEach((b) => b.classList.remove("is-selected"));
    const list = SIDES[side].buttons();
    const active = list[selected[side]];
    if (!active) return;
    active.classList.add("is-selected");
    if (focus) active.focus({ preventScroll: true });
    moveName.textContent = active.dataset.move;
    readout.textContent = `${active.dataset.move} — ${active.querySelector("small").textContent}. Enter to play it.`;
  }

  function setSide(next, focusList = false) {
    side = next;
    cabinet.dataset.active = side;
    turnSide.textContent = SIDES[side].player;
    moveSide.textContent = SIDES[side].circuit;
    document.querySelectorAll("[data-team-select]").forEach((button) => {
      const on = button.dataset.teamSelect === side;
      button.classList.toggle("is-active", on);
      button.setAttribute("aria-pressed", String(on));
    });
    paint(focusList);
  }

  function play(button) {
    if (!button) return;
    const team = button.dataset.team;
    selected[team] = SIDES[team].buttons().indexOf(button);
    setSide(team, true);
    moveName.textContent = button.dataset.move;
    readout.textContent = button.dataset.log;
    button.classList.remove("is-playing");
    void button.offsetWidth;
    button.classList.add("is-playing");
    button.addEventListener("animationend", () => button.classList.remove("is-playing"), { once: true });
    if (!reduced.matches) {
      cabinet.classList.remove("is-hit");
      void cabinet.offsetWidth;
      cabinet.classList.add("is-hit");
      cabinet.addEventListener("animationend", () => cabinet.classList.remove("is-hit"), { once: true });
    }
    entries.push({ who: SIDES[team].logName, move: button.dataset.move, log: button.dataset.log });
    if (entries.length > 40) entries.shift();
    if (ticker) ticker.textContent = `${SIDES[team].logName} — ${button.dataset.move}`;
    if (openKey === "log") {
      floatBody.replaceChildren(renderLogCard());
      floatCount.textContent = `${entries.length} logged`;
    }
  }

  document.querySelectorAll(".team button").forEach((button) => {
    button.addEventListener("click", () => play(button));
    button.addEventListener("mouseenter", () => {
      if (button.dataset.team !== side) return;
      moveName.textContent = button.dataset.move;
      readout.textContent = `${button.dataset.move} — ${button.querySelector("small").textContent}.`;
    });
  });

  document.querySelectorAll("[data-team-select]").forEach((button) => {
    button.addEventListener("click", () => setSide(button.dataset.teamSelect));
  });

  const moveCard = document.querySelector("#open-move");
  if (moveCard) moveCard.addEventListener("click", () => openCard("move"));

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") { closeCard(); return; }
    if (!floats.hidden) return;                       // a card is open: keys belong to it
    if (event.target.matches("input, textarea")) return;
    if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Enter", " "].includes(event.key)) return;
    const list = SIDES[side].buttons();
    if (!list.length) return;
    if (event.key === "ArrowUp") { event.preventDefault(); selected[side] = (selected[side] - 1 + list.length) % list.length; paint(true); }
    else if (event.key === "ArrowDown") { event.preventDefault(); selected[side] = (selected[side] + 1) % list.length; paint(true); }
    else if (event.key === "ArrowLeft" || event.key === "ArrowRight") { event.preventDefault(); setSide(side === "signal" ? "archive" : "signal", true); }
    else if (event.key === "Enter" || event.key === " ") {
      if (document.activeElement && document.activeElement.tagName === "BUTTON") return;
      event.preventDefault();
      play(list[selected[side]]);
    }
  });

  setSide("signal");
})();
