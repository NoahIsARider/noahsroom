/* THE DUEL — the only interactive machine on this page.
   There is nothing to navigate to: a move is played, not followed. */
(() => {
  const stage = document.querySelector(".stage");
  const readout = document.querySelector("#readout");
  const turnSide = document.querySelector("#turn-side");
  const log = document.querySelector("#battle-log");
  const clear = document.querySelector("#clear-log");
  if (!stage || !readout || !log) return;

  const teams = {
    signal: { label: "PLAYER 01 · SIGNAL HOUND", moves: () => [...document.querySelectorAll('.team button[data-team="signal"]')] },
    archive: { label: "PLAYER 02 · ARCHIVE LEVIATHAN", moves: () => [...document.querySelectorAll('.team button[data-team="archive"]')] },
  };
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const selected = { signal: 0, archive: 0 };
  let side = "signal";
  let idleLine = log.querySelector(".idle");

  function paintSelection(focus = false) {
    document.querySelectorAll(".team button").forEach((b) => b.classList.remove("is-selected"));
    const active = teams[side].moves()[selected[side]];
    if (!active) return;
    active.classList.add("is-selected");
    if (focus) active.focus({ preventScroll: true });
    readout.textContent = `${active.dataset.move} // ${active.querySelector("small").textContent}`;
  }

  function setSide(next, focus = false) {
    side = next;
    stage.dataset.active = side;
    turnSide.textContent = teams[side].label;
    paintSelection(focus);
  }

  function play(button) {
    const team = button.dataset.team;
    selected[team] = teams[team].moves().indexOf(button);
    setSide(team, true);
    readout.textContent = `▶ ${button.dataset.move} — ${button.dataset.log}`;
    button.classList.remove("is-playing");
    void button.offsetWidth;
    button.classList.add("is-playing");
    button.addEventListener("animationend", () => button.classList.remove("is-playing"), { once: true });
    if (stage && !reduced.matches) {
      stage.classList.remove("is-hit");
      void stage.offsetWidth;
      stage.classList.add("is-hit");
      stage.addEventListener("animationend", () => stage.classList.remove("is-hit"), { once: true });
    }
    if (idleLine) { idleLine.remove(); idleLine = null; }
    const line = document.createElement("li");
    const who = document.createElement("b");
    who.textContent = team === "signal" ? "SIGNAL HOUND" : "ARCHIVE LEVIATHAN";
    line.append(who, document.createTextNode(` — ${button.dataset.move}: ${button.dataset.log}`));
    log.append(line);
    if (log.children.length > 12) log.firstElementChild.remove();
    log.lastElementChild.scrollIntoView({ block: "nearest" });
  }

  document.querySelectorAll(".team button").forEach((button) => {
    button.addEventListener("click", () => play(button));
    button.addEventListener("mouseenter", () => {
      if (button.dataset.team !== side) return;
      readout.textContent = `${button.dataset.move} // ${button.querySelector("small").textContent}`;
    });
  });

  document.querySelectorAll(".fighter").forEach((fighter) => {
    fighter.style.cursor = "pointer";
    fighter.addEventListener("click", () => setSide(fighter.classList.contains("fighter--archive") ? "archive" : "signal"));
  });

  document.addEventListener("keydown", (event) => {
    if (event.target.matches("input, textarea")) return;
    const keys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Enter", " "];
    if (!keys.includes(event.key)) return;
    const list = teams[side].moves();
    if (!list.length) return;
    if (event.key === "ArrowUp") { event.preventDefault(); selected[side] = (selected[side] - 1 + list.length) % list.length; paintSelection(true); }
    else if (event.key === "ArrowDown") { event.preventDefault(); selected[side] = (selected[side] + 1) % list.length; paintSelection(true); }
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
      readout.textContent = "CHOOSE A MOVE — ↑↓ TO PICK, ENTER TO PLAY IT.";
    });
  }

  setSide("signal");
})();
