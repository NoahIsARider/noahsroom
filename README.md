# Noah's Room — a night desk on the personal web

A hand-assembled, retro/neon personal page for **Noah (NoahIsARider)**.
The room is drawn as a stack of independent layers: a wall, a window with a monochrome
moon over it, string lights, a working CRT, and about twenty objects cut out one at a time.

Live: <https://noahisarider.github.io/noahsroom/>

## What's inside

| Path | What it is |
| --- | --- |
| `index.html` | The night desk — the front door of the whole site |
| `layered.css` | Every layer's position and look, version by version (v1 → v17) |
| `layered.js` | The CRT's pages, the desk map, the moon door |
| `logs.html` | **The tale** — *the three odd friends*, the dark fairy tale the room is built on, told on the purple city background. No personal data lives here |
| `feed.xml` | **Site index** for readers and crawlers: one item per page, per account, and per public repository (all of `NoahIsARider` plus the `LandslideLab` org), then the tale |
| `tools/build-feed.py` | Regenerates `feed.xml` from the GitHub API — rerun it after adding a repository |
| `tools/make-favicon.py` | Redraws the icon: assets/objects/crt.png (the monitor master), violet backlight, green terminal; writes favicon 96/48/32/16 + apple-touch-icon. Needs the PNG masters, which are git-ignored |
| `relic/` | **relic** — the original room in three lights (the previous version of this page), archived whole; the old `/room/` URL redirects here |
| `assets/` | The artwork: scene layers, objects, favicon (`.webp`, alpha preserved) |
| `research-notes.md` | The reference study behind the layout (personal-web patterns, not code) |

## The moon is a door

The moon above the window is not decoration, and it does not open by itself. **Knock it ten
times** — each knock within about two seconds of the last — and it wakes: it brightens, its
cursor becomes a pointer, and it turns into a real link (`<a href="relic/">`) labelled
*THE RELIC →*. The eleventh click is the one that takes you, through to `relic/`, the
archived room with the three lights. Nothing navigates on a timer, so coming back never
throws you forward again.

A reload puts the moon back to sleep.

## One object, one door

Every clickable object leads to exactly one place, and no two objects lead to the same
place. Props, not dead ends:

| Object | Opens |
| --- | --- |
| lamp | personal page — the CV-and-papers version of me |
| media tower | Google Scholar — the research desk |
| star chart | skills & tools |
| tapes | the blog (longer thoughts) |
| radio | portfolio — the work, sorted |
| scrap wall | oblivio, my other corner of the web |
| books | Goodreads — the reading log |
| photos | Letterboxd — the film diary |
| walkman | Record Club — what is playing |
| floppies | GitHub — code and old files |
| plant | Codeberg — the other place the code lives |
| cactus | Landslide Lab |
| lucky cat | the tale — *the three odd friends* |
| envelope | e-mail |
| bottle | Steam |
| mug | itch.io |
| odd friend I / II / III | X · Mastodon · Bluesky |
| keyboard, home key | the CRT's home screen |

## Running it

No build step, no dependencies — it is a folder of static files.

```bash
python -m http.server 8123
# then open http://127.0.0.1:8123/
```

## Notes for future edits

- Images are `.webp` with alpha. The original PNG masters live beside them locally and are
  git-ignored via `.gitignore`; refresh a `.webp` before deleting its master.
- Keep the scene letterboxed to a 16:9 `.desk`; every object is positioned in percentages
  of that box, so a new prop needs a percentage box, not a pixel one.
- The CRT screen is `overflow-y: auto`: a page longer than the tube scrolls instead of
  being clipped, so page copy can grow without breaking the case.
- The hidden entrance is documented in `logs.html` (the logbook tells on itself).
