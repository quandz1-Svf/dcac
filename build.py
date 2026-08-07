from pathlib import Path

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "src"
FILES = [
    "01-config.js",
    "02-gui.js",
    "03-helpers.js",
    "04-member-settings.js",
    "05-member-render.js",
    "06-team-parser.js",
    "07-member-check.js",
    "08-button-clicker.js",
    "09-process.js",
    "10-debug.js",
]

header = """// ==UserScript==
// @name         Discord Auto Click + Team Stats FIX
// @namespace    https://tampermonkey.net/
// @version      2026-08-08-MODULAR
// @description  Auto click Discord + đọc HP/Thể lực/Tu vi
// @author       You
// @match        https://discord.com/channels/*
// @grant        none
// ==/UserScript==

"""

parts = [header, "(function () {\n    'use strict';\n\n"]
for name in FILES:
    parts.append(f"    // ===== {name} =====\n")
    parts.append((SRC / name).read_text(encoding="utf-8"))
    parts.append("\n")
parts.append("})();\n")
(ROOT / "discord-auto-click.user.js").write_text("".join(parts), encoding="utf-8")
print("Built discord-auto-click.user.js")
