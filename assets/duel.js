(() => {
  const screen = document.querySelector(".game-screen");
  if (!screen) return;

  const teamButtons = [...document.querySelectorAll("[data-team-select]")];
  const lists = [...document.querySelectorAll("[data-command-list]")];
  const title = document.querySelector("#command-title");
  const turnSide = document.querySelector("#turn-side");
  const readout = document.querySelector("#command-readout");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const labels = { signal: "CREATIVE CIRCUIT", archive: "RESEARCH CIRCUIT" };
  const players = { signal: "PLAYER 01", archive: "PLAYER 02" };
  const selected = { signal: 0, archive: 0 };
  let side = "signal";
  let confirmTimer;

  const itemsFor = (name) => [...document.querySelectorAll(`.command-item[data-side="${name}"]`)];

  function pulse() {
    if (reduced.matches) return;
    screen.classList.remove("is-confirming");
    void screen.offsetWidth;
    screen.classList.add("is-confirming");
    clearTimeout(confirmTimer);
    confirmTimer = window.setTimeout(() => screen.classList.remove("is-confirming"), 260);
  }

  function select(index, focus = false) {
    const items = itemsFor(side);
    if (!items.length) return;
    const next = (index + items.length) % items.length;
    selected[side] = next;
    document.querySelectorAll(".command-item").forEach((item) => item.classList.remove("is-selected"));
    const active = items[next];
    active.classList.add("is-selected");
    active.scrollIntoView({ block: "nearest" });
    readout.textContent = `${active.querySelector("strong").textContent} // ${active.dataset.note}`;
    if (focus) active.focus({ preventScroll: true });
  }

  function setSide(next, focus = false) {
    side = next;
    screen.dataset.activeSide = side;
    teamButtons.forEach((button) => {
      const active = button.dataset.teamSelect === side;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    lists.forEach((list) => {
      const active = list.dataset.commandList === side;
      list.hidden = !active;
      list.classList.toggle("is-active", active);
    });
    title.textContent = labels[side];
    turnSide.textContent = players[side];
    select(selected[side], focus);
    pulse();
  }

  teamButtons.forEach((button) => {
    button.addEventListener("click", () => setSide(button.dataset.teamSelect, true));
  });

  document.querySelectorAll(".command-item").forEach((item) => {
    const activate = () => {
      if (side !== item.dataset.side) setSide(item.dataset.side);
      select(Number(item.dataset.index));
    };
    item.addEventListener("pointerenter", activate);
    item.addEventListener("focus", activate);
    item.addEventListener("click", pulse);
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      setSide(side === "signal" ? "archive" : "signal", true);
      return;
    }
    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      event.preventDefault();
      select(selected[side] + (event.key === "ArrowDown" ? 1 : -1), true);
      pulse();
      return;
    }
    if (event.key === "Enter" && !event.target.closest("a,button")) {
      event.preventDefault();
      itemsFor(side)[selected[side]]?.click();
    }
  });

  screen.addEventListener("pointermove", (event) => {
    if (reduced.matches || event.pointerType === "touch") return;
    const x = (event.clientX / innerWidth - .5) * -8;
    const y = (event.clientY / innerHeight - .5) * -5;
    screen.style.setProperty("--look-x", `${x.toFixed(2)}px`);
    screen.style.setProperty("--look-y", `${y.toFixed(2)}px`);
  });

  screen.addEventListener("pointerleave", () => {
    screen.style.setProperty("--look-x", "0px");
    screen.style.setProperty("--look-y", "0px");
  });

  setSide("signal");
})();
