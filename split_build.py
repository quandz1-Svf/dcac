from pathlib import Path
import re

BASE = Path('/mnt/data/discord-auto-click')
SRC = BASE / 'Văn bản đã dán (1)(3).txt'
SRC_DIR = BASE / 'src'
SRC_DIR.mkdir(exist_ok=True)

s = SRC.read_text(encoding='utf-8')
body = s[s.index('(function () {') + len('(function () {'):s.rindex('})();')]
pat = re.compile(r'/\*\s*=+\s*\n\s*(.*?)\s*\n\s*=+\s*\*/', re.S)
ms = list(pat.finditer(body))
sections = {}
for i, m in enumerate(ms):
    name = m.group(1).strip()
    start = m.end()
    end = ms[i+1].start() if i+1 < len(ms) else len(body)
    sections[name] = '/* =========================================================\n   ' + name + '\n========================================================= */\n' + body[start:end].strip('\n') + '\n'

# Group related sections into files.
groups = {
    '01-config.js': ['CONFIG', 'STATE'],
    '02-gui.js': ['GUI', 'HEADER', 'TARGET LIST', 'DELAY', 'TEAM STATUS', 'CONDITIONS'],
    '03-helpers.js': ['HELPERS'],
    '04-member-settings.js': ['MEMBER SETTINGS'],
    '05-member-render.js': ['RENDER MEMBERS'],
    '06-team-parser.js': ['PARSE STATS', 'READ TEAM MEMBERS', 'FIND LATEST TEAM', 'REFRESH TEAM'],
    '07-member-check.js': ['CHECK CONDITIONS'],
    '08-button-clicker.js': ['FIND BUTTON', 'RE-QUERY BUTTON BEFORE CLICK', 'FORCE CLICK'],
    '09-process.js': ['STOP TOOL', 'PROCESS', 'TOGGLE'],
    '10-debug.js': ['DEBUG'],
}

for fn, names in groups.items():
    out = '\n'.join(sections[n] for n in names)
    (SRC_DIR / fn).write_text(out, encoding='utf-8')

header = s[:s.index('(function () {')]
parts = [
    '01-config.js','02-gui.js','03-helpers.js','04-member-settings.js','05-member-render.js',
    '06-team-parser.js','07-member-check.js','08-button-clicker.js','09-process.js','10-debug.js'
]
main = header + '(function () {\n    \'use strict\';\n\n'
for p in parts:
    main += f'    // ===== {p} =====\n'
    text = (SRC_DIR / p).read_text(encoding='utf-8')
    main += text.replace('\n', '\n    ', 1) if False else text
    main += '\n'
main += '})();\n'
(BASE / 'discord-auto-click.user.js').write_text(main, encoding='utf-8')

build = '''from pathlib import Path\n\nROOT = Path(__file__).resolve().parent\nSRC = ROOT / "src"\nFILES = [\n    "01-config.js",\n    "02-gui.js",\n    "03-helpers.js",\n    "04-member-settings.js",\n    "05-member-render.js",\n    "06-team-parser.js",\n    "07-member-check.js",\n    "08-button-clicker.js",\n    "09-process.js",\n    "10-debug.js",\n]\n\nheader = """// ==UserScript==\n// @name         Discord Auto Click + Team Stats FIX\n// @namespace    https://tampermonkey.net/\n// @version      2026-08-08-MODULAR\n// @description  Auto click Discord + đọc HP/Thể lực/Tu vi\n// @author       You\n// @match        https://discord.com/channels/*\n// @grant        none\n// ==/UserScript==\n\n"""\n\nparts = [header, "(function () {\\n    'use strict';\\n\\n"]\nfor name in FILES:\n    parts.append(f"    // ===== {name} =====\\n")\n    parts.append((SRC / name).read_text(encoding="utf-8"))\n    parts.append("\\n")\nparts.append("})();\\n")\n(ROOT / "discord-auto-click.user.js").write_text("".join(parts), encoding="utf-8")\nprint("Built discord-auto-click.user.js")\n'''
(BASE / 'build.py').write_text(build, encoding='utf-8')

readme = '''# Discord Auto Click – Modular\n\n## Cấu trúc\n\n- `discord-auto-click.user.js`: bản hoàn chỉnh để cài vào Tampermonkey.\n- `src/01-config.js`: cấu hình và state.\n- `src/02-gui.js`: giao diện.\n- `src/03-helpers.js`: hàm tiện ích.\n- `src/04-member-settings.js`: lưu ngưỡng từng thành viên.\n- `src/05-member-render.js`: tạo/cập nhật bảng thành viên.\n- `src/06-team-parser.js`: đọc bảng đội và HP/Thể lực/Tu vi.\n- `src/07-member-check.js`: kiểm tra điều kiện trước Bắt Đầu.\n- `src/08-button-clicker.js`: tìm và click nút.\n- `src/09-process.js`: vòng lặp auto-click và nút bật/tắt.\n- `src/10-debug.js`: hàm test trong Console.\n- `build.py`: ghép các file `src` thành `discord-auto-click.user.js`.\n\n## Cách sửa\n\nChỉ sửa file trong `src/`. Sau đó chạy:\n\n```bash\npython build.py\n```\n\nTampermonkey chỉ cần cài file `discord-auto-click.user.js`.\n\n## Lưu ý GitHub\n\nNếu dùng GitHub, nên giữ nguyên cấu trúc `src/` và commit cả `build.py` lẫn file `.user.js` đã build.\n'''
(BASE / 'README.md').write_text(readme, encoding='utf-8')
print('Created', len(groups), 'modules')
