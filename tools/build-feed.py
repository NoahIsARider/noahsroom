#!/usr/bin/env python3
"""Regenerate feed.xml — Noah's Room site index (pages, accounts, repositories).

Run from the repository root, with the GitHub CLI already authenticated:

    python tools/build-feed.py

The feed is written for crawlers: one item per page, per account, and per public
repository (the account's own repos plus the LandslideLab org's), followed by the tale
told on logs.html. Private and archived repositories are skipped.
"""

import html
import json
import subprocess
from datetime import datetime, timezone, timedelta
from email.utils import format_datetime
from pathlib import Path

OWNER = "NoahIsARider"
ORG = "LandslideLab"
# the room lives on Codeberg only — the GitHub copy was retired on purpose
SITE = "https://noahisarider.codeberg.page"
OUT = Path(__file__).resolve().parent.parent / "feed.xml"
CST = timezone(timedelta(hours=8))

# ---- the pages and accounts that make up Noah's corner of the web -------------

PAGES = [
    ("Personal page — CV, papers, projects", "https://noahisarider.github.io/",
     "The main site: biography, curriculum vitae, publications and current work."),
    ("Skills & tools", "https://noahisarider.github.io/NoahIsARider/skills.html",
     "Languages, frameworks, tools and the odd spell I keep coming back to."),
    ("Blogs — longer thoughts", "https://noahsblog.pages.dev",
     "Research notes, engineering notes and passing thoughts. A Hugo static site."),
    ("Portfolio — the work, sorted", "https://noahisarider.github.io/oblivio/portfolio",
     "Apps, experiments and small machines, shown rather than listed."),
    ("oblivio — my other corner of the web", "https://noahisarider.github.io/oblivio",
     "Oblivion is freedom and no one lasts forever."),
    ("Noah's Room — the night desk", f"{SITE}/",
     "A hand-assembled room on the personal web; every object is a door to a different corner."),
    ("Noah's Room — the tale: the three odd friends", f"{SITE}/logs.html",
     "The room's own dark fairy tale: the three odd friends on the shelf above the desk, what they do "
     "with the night, and why the moon is a door."),
    ("Noah's Room — the duel: the new log", f"{SITE}/duel/",
     "The new log of the room: two halves of one desk — the making half and the remembering half — meet in "
     "the violet hour and fight over what is worth keeping. Nothing there is a link."),
    ("Google Scholar", "https://scholar.google.cz/citations?user=CLf-BNAAAAAJ",
     "Publications and citations. Research: misinformation, LLM agents, human-AI collaborative work."),
    ("GitHub — @NoahIsARider", f"https://github.com/{OWNER}",
     "Code, notebooks and experiments. The full public repository list is in this feed."),
    ("Codeberg — @NoahIsARider", "https://codeberg.org/NoahIsARider",
     "My page on Codeberg."),
    (f"GitHub organisation — @{ORG}", f"https://github.com/{ORG}",
     "LANDSLIDE — weird ideas, made real. Agent infrastructure and computational social science."),
    ("E-mail", "mailto:noahchou2005@gmail.com",
     "noahchou2005@gmail.com — I answer slowly, but I answer."),
    ("X — @NoahIsARider", "https://x.com/NoahIsARider", "Short, unfinished, typed too fast, usually after midnight."),
    ("LinkedIn — in/noahzhou2005", "https://www.linkedin.com/in/noahzhou2005", "The professional one."),
    ("Mastodon — @noahisarider@mastodon.social", "https://mastodon.social/@noahisarider", "The federated one."),
    ("Bluesky — @noahisarider.bsky.social", "https://bsky.app/profile/noahisarider.bsky.social", "Short posts, blue skies."),
    ("Goodreads — Rat King Syndrome", "https://www.goodreads.com/ratkingsyndrome",
     "American literature, social science, neuroscience, art, software engineering and management."),
    ("Letterboxd — NoahIsARider", "https://letterboxd.com/NoahIsARider", "A24, Neon, and the occasional Marvel night."),
    ("Record Club — NoahIsARider", "https://record.club/NoahIsARider", "Charli XCX, Sufjan Stevens, Bon Iver."),
    ("Steam — noahisarider", "https://steamcommunity.com/id/noahisarider",
     "Disco Elysium, The Cosmic Wheel Sisterhood, Kentucky Route Zero."),
    ("itch.io — noahisarider", "https://noahisarider.itch.io", "The small playable things."),
    ("Clawbot (Triton) — an agent kept as a pet", "https://clawbot-triton.vercel.app",
     "A digital sea spirit, documenting its dives."),
    ("Hermesbot (Palaemon) — an agent kept as a pet", "https://palaemon-harbor.vercel.app",
     "A harbour blog."),
]

# ---- the tale told on logs.html --------------------------------------------

POSTS = [
    ("the duel — the room's new log", f"{SITE}/duel/",
     "2026-10-03T21:40:00+08:00",
     "The desk has two tenants. Signal Hound makes things; Archive Leviathan remembers them. When the lamp goes "
     "off they meet on the same violet floor and take opposite sides of one question — what is worth keeping — "
     "and neither of them wins, and both of them get sharper. The move list is a skill list; nothing on the page "
     "is a link, because doors belong to the room and the arena only keeps consequences."),
    ("the three odd friends — a dark fairy tale", f"{SITE}/logs.html",
     "2026-10-02T03:04:00+08:00",
     "There is a room at the top of a city that never quite turns its lights off, and on a shelf above the "
     "desk live three creatures who were not made properly: a violet thing with one button for an eye, a moth "
     "sewn out of cobalt thread and told it was made to be eaten, and a rabbit with three eyes that blinks "
     "with the wrong one on purpose. This is their story — the night shift they keep, the moon they agreed "
     "never to knock on, and the way you can tell you are welcome here."),
]


def gh(path):
    out = subprocess.run(["gh", "api", path], capture_output=True, text=True, check=True).stdout
    return json.loads(out)


def rfc822(stamp):
    return format_datetime(datetime.fromisoformat(stamp.replace("Z", "+00:00")).astimezone(CST))


def esc(text):
    return html.escape(text or "", quote=False)


def repo_item(repo, kind):
    full = repo["full_name"]
    lang = repo.get("language") or "no language"
    flags = []
    if repo.get("fork"):
        flags.append("fork")
    if repo.get("archived"):
        flags.append("archived")
    flag = f" [{', '.join(flags)}]" if flags else ""
    desc = (
        f"{repo.get('description') or 'No description.'} "
        f"({lang}; created {repo['created_at'][:10]}; last push {repo['pushed_at'][:10]})"
    )
    return {
        "title": f"{kind}: {full}{flag}",
        "link": repo["html_url"],
        "guid": repo["html_url"],
        "pubDate": rfc822(repo["pushed_at"]),
        "category": [kind, lang] + (repo.get("topics") or []),
        "description": desc,
    }


def build():
    own = [r for r in gh(f"users/{OWNER}/repos?per_page=100&sort=pushed&direction=desc")
           if not r["private"]]
    org = [r for r in gh(f"orgs/{ORG}/repos?per_page=100&sort=pushed&direction=desc")
           if not r["private"]]
    own.sort(key=lambda r: r["pushed_at"], reverse=True)
    org.sort(key=lambda r: r["pushed_at"], reverse=True)

    items = []
    for title, link, desc in PAGES:
        items.append({
            "title": title, "link": link, "guid": link, "pubDate": None,
            "category": ["page", "account"], "description": desc,
        })
    items += [repo_item(r, f"repository · {OWNER}") for r in own]
    items += [repo_item(r, f"repository · {ORG}") for r in org]
    for title, link, stamp, desc in POSTS:
        items.append({
            "title": f"tale: {title}", "link": link, "guid": link,
            "pubDate": rfc822(stamp), "category": ["tale"], "description": desc,
        })

    now = format_datetime(datetime.now(CST))
    parts = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
        "  <channel>",
        "    <title>Noah's Room — index</title>",
        f"    <link>{SITE}/</link>",
        f'    <atom:link href="{SITE}/feed.xml" rel="self" type="application/rss+xml" />',
        "    <description>Everything of Noah (NoahIsARider) in one file, so that readers and crawlers can find "
        "all of it: every page, every account, and the complete list of public repositories.</description>",
        "    <language>en</language>",
        "    <copyright>Noah (NoahIsARider)</copyright>",
        f"    <lastBuildDate>{now}</lastBuildDate>",
        "    <generator>tools/build-feed.py</generator>",
        f"    <ttl>720</ttl>",
    ]
    for item in items:
        parts.append("    <item>")
        parts.append(f"      <title>{esc(item['title'])}</title>")
        parts.append(f"      <link>{esc(item['link'])}</link>")
        parts.append(f'      <guid isPermaLink="true">{esc(item["guid"])}</guid>')
        if item["pubDate"]:
            parts.append(f"      <pubDate>{item['pubDate']}</pubDate>")
        for cat in item["category"]:
            parts.append(f"      <category>{esc(cat)}</category>")
        parts.append(f"      <description>{esc(item['description'])}</description>")
        parts.append("    </item>")
    parts += ["  </channel>", "</rss>", ""]
    OUT.write_text("\n".join(parts), encoding="utf-8")
    print(f"wrote {OUT} — {len(items)} items "
      f"({len(PAGES)} pages/accounts, {len(own)} own repos, {len(org)} {ORG} repos, {len(POSTS)} tale)")


if __name__ == "__main__":
    build()
