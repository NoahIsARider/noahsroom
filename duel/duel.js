/* THE DUEL — the cabinet's only machine.
   A move is played, never followed: nothing here navigates. */
(() => {
  const cabinet = document.querySelector(".cabinet");
  const readout = document.querySelector("#readout");
  const moveName = document.querySelector("#move-name");
  const moveSide = document.querySelector("#move-side");
  const turnSide = document.querySelector("#turn-side");
  const log = document.querySelector("#battle-log");
  const clear = document.querySelector("#clear-log");
  if (!cabinet || !readout || !log) return;

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
  let side = "signal";
  let idleLine = log.querySelector(".idle");

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
    if (idleLine) { idleLine.remove(); idleLine = null; }
    const line = document.createElement("li");
    const who = document.createElement("b");
    who.textContent = SIDES[team].logName;
    line.append(who, document.createTextNode(` — ${button.dataset.move}: ${button.dataset.log}`));
    log.append(line);
    if (log.children.length > 14) log.firstElementChild.remove();
    log.lastElementChild.scrollIntoView({ block: "nearest" });
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

  document.addEventListener("keydown", (event) => {
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

  if (clear) {
    clear.addEventListener("click", () => {
      log.innerHTML = '<li class="idle">The lamp is on. Neither half has moved yet.</li>';
      idleLine = log.querySelector(".idle");
      setSide("signal");
      moveName.textContent = "CHOOSE A MOVE";
      readout.textContent = "↑↓ TO PICK A MOVE — ENTER TO PLAY IT. NOTHING HERE LEADS ANYWHERE.";
    });
  }

  setSide("signal");
})();
