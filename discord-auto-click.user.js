// ==UserScript==
// @name         Discord Auto Click + Team Stats FIX
// @namespace    https://tampermonkey.net/
// @version      2026-08-08-MODULAR
// @description  Auto click Discord + đọc HP/Thể lực/Tu vi
// @author       You
// @match        https://discord.com/channels/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // ===== 01-config.js =====
/* =========================================================
   CONFIG
========================================================= */
    const SCAN_INTERVAL = 500;
    const DEFAULT_DELAY = 1500;
    const MAX_MEMBERS = 5;

    // Bật để in lý do mỗi lần KHÔNG click ra Console (giúp debug).
    const DEBUG_LOG = true;
    let lastDebugReason = '';

    function debugLog(reason) {
        if (!DEBUG_LOG) {
            return;
        }

        if (reason === lastDebugReason) {
            return;
        }

        lastDebugReason = reason;
        console.log('[AutoBot][debug]', reason);
    }

    

/* =========================================================
   STATE
========================================================= */
    let running = false;
    let timer = null;
    let cooldown = false;

    // Lưu cấu hình của từng thành viên.
    // Key = tên thành viên đã chuẩn hóa.
    const memberSettings = new Map();

    // Các row GUI hiện tại.
    const memberRows = new Map();

    let lastTeamSignature = '';

    

    // ===== 02-gui.js =====
/* =========================================================
   GUI
========================================================= */
    const gui = document.createElement('div');

    gui.id = 'tamper-gui';

    Object.assign(gui.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: '999999',
        background: '#1e1e2e',
        color: '#cdd6f4',
        padding: '12px',
        borderRadius: '10px',
        fontFamily: 'sans-serif',
        width: '390px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 10px 25px rgba(0,0,0,.5)',
        border: '1px solid #45475a',
        fontSize: '12px'
    });

    document.body.appendChild(gui);

    function createEl(tag, text) {
        const el = document.createElement(tag);

        if (text !== undefined) {
            el.textContent = text;
        }

        return el;
    }

    

/* =========================================================
   HEADER
========================================================= */
    const header = createEl('div');

    Object.assign(header.style, {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '8px',
        fontWeight: 'bold',
        color: '#89b4fa',
        fontSize: '14px'
    });

    const title = createEl('span', 'AUTO CLICK DISCORD');
    const minimize = createEl('span', '[─]');

    Object.assign(minimize.style, {
        cursor: 'pointer',
        padding: '0 4px',
        fontSize: '12px',
        color: '#a6adc8'
    });

    header.append(title, minimize);
    gui.appendChild(header);

    const body = createEl('div');
    gui.appendChild(body);

    let minimized = false;

    minimize.addEventListener('click', function () {
        minimized = !minimized;

        body.style.display =
            minimized ? 'none' : 'block';

        minimize.textContent =
            minimized ? '[+]' : '[─]';
    });

    

/* =========================================================
   TARGET LIST
========================================================= */
    const targetLabel = createEl(
        'label',
        'Từ khóa cần click (cách nhau bằng dấu phẩy):'
    );

    targetLabel.style.color = '#a6adc8';
    targetLabel.style.display = 'block';
    targetLabel.style.marginBottom = '4px';

    body.appendChild(targetLabel);

    const targetList = document.createElement('textarea');

    targetList.value =
        'Gia Nhập 2, Quay lại, Bắt Đầu';

    Object.assign(targetList.style, {
        width: '100%',
        height: '55px',
        background: '#313244',
        color: '#cdd6f4',
        border: '1px solid #45475a',
        borderRadius: '6px',
        padding: '6px',
        fontSize: '12px',
        boxSizing: 'border-box',
        resize: 'vertical',
        marginBottom: '8px'
    });

    body.appendChild(targetList);

    

/* =========================================================
   DELAY
========================================================= */
    const delayRow = createEl('div');

    Object.assign(delayRow.style, {
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
        marginBottom: '8px'
    });

    delayRow.appendChild(
        createEl('span', 'Delay (ms):')
    );

    const delayInput = document.createElement('input');

    delayInput.type = 'number';
    delayInput.value = DEFAULT_DELAY;
    delayInput.min = '200';
    delayInput.step = '100';

    Object.assign(delayInput.style, {
        width: '75px',
        background: '#313244',
        color: '#cdd6f4',
        border: '1px solid #45475a',
        borderRadius: '4px',
        padding: '3px 5px'
    });

    delayRow.appendChild(delayInput);
    body.appendChild(delayRow);

    

/* =========================================================
   TEAM STATUS
========================================================= */
    const teamTitle =
        createEl('div', 'THÔNG TIN ĐỘI');

    Object.assign(teamTitle.style, {
        color: '#89b4fa',
        fontWeight: 'bold',
        margin: '10px 0 5px'
    });

    body.appendChild(teamTitle);

    const teamStatus =
        createEl('div', 'Chưa đọc bảng đội.');

    teamStatus.style.color = '#a6adc8';
    teamStatus.style.marginBottom = '6px';

    body.appendChild(teamStatus);

    const memberPanel =
        createEl('div');

    body.appendChild(memberPanel);

    

/* =========================================================
   CONDITIONS
========================================================= */
    const conditionTitle =
        createEl('div', 'ĐIỀU KIỆN');

    Object.assign(conditionTitle.style, {
        color: '#89b4fa',
        fontWeight: 'bold',
        margin: '10px 0 5px'
    });

    body.appendChild(conditionTitle);

    const stopZeroLabel =
        createEl('label');

    const stopZero =
        document.createElement('input');

    stopZero.type = 'checkbox';
    stopZero.checked = true;

    stopZeroLabel.append(
        stopZero,
        document.createTextNode(
            ' Dừng khi thành viên được chọn có Thể lực = 0'
        )
    );

    body.appendChild(stopZeroLabel);

    body.appendChild(
        document.createElement('br')
    );

    

    // ===== 03-helpers.js =====
/* =========================================================
   HELPERS
========================================================= */
    /*
     * FIX: chuẩn hoá + BỎ DẤU tiếng Việt trước khi so khớp text nút.
     *
     * Lý do: text nút Discord render có thể ở dạng Unicode
     * tổ hợp (NFD) khác với chuỗi mình gõ trong ô từ khóa (NFC).
     * Nếu chỉ .toLowerCase() thì includes() có thể KHÔNG BAO GIỜ
     * khớp dù nhìn giống hệt nhau -> nút không được tìm thấy
     * -> không click được. Bỏ dấu giúp so khớp ổn định tuyệt đối.
     */
    function normalizeText(text) {
        return String(text || '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, ' ')
            .trim()
            .toLowerCase();
    }

    function normalizeName(name) {
        return String(name || '')
            .replace(/\s+/g, ' ')
            .trim()
            .toLowerCase();
    }

    function makeNumberInput(value) {
        const input =
            document.createElement('input');

        input.type = 'number';
        input.value = value;
        input.min = '0';
        input.step = '1';

        Object.assign(input.style, {
            width: '48px',
            background: '#313244',
            color: '#cdd6f4',
            border: '1px solid #45475a',
            borderRadius: '3px',
            padding: '2px',
            boxSizing: 'border-box'
        });

        return input;
    }

    function getButtonText(button) {
        if (!button) {
            return '';
        }

        /*
         * Discord dùng class label__57f77 để chứa text thật
         * của nút (một số nút không có text node trực tiếp).
         * Ưu tiên lấy từ đây trước, giống bản gốc đã chạy ổn.
         */

        const label =
            button.querySelector('.label__57f77');

        if (label && label.textContent) {
            return label.textContent
                .replace(/\s+/g, ' ')
                .trim();
        }

        return (
            button.innerText ||
            button.textContent ||
            button.getAttribute('aria-label') ||
            ''
        )
            .replace(/\s+/g, ' ')
            .trim();
    }

    function getTargets() {
        return targetList.value
            .split(',')
            .map(function (x) {
                return normalizeText(x);
            })
            .filter(Boolean);
    }

    function isButtonMatch(button, target) {
        return normalizeText(
            getButtonText(button)
        ).includes(
            normalizeText(target)
        );
    }

    

    // ===== 04-member-settings.js =====
/* =========================================================
   MEMBER SETTINGS
========================================================= */
    function getSavedSettings(name) {
        const key = normalizeName(name);

        if (!memberSettings.has(key)) {
            memberSettings.set(key, {
                checked: true,
                hp: 0,
                energy: 0,
                exp: 0
            });
        }

        return memberSettings.get(key);
    }

    function saveRowSettings(row) {
        const key =
            normalizeName(row.data.name);

        memberSettings.set(key, {
            checked: row.check.checked,
            hp: row.hpInput.value,
            energy: row.energyInput.value,
            exp: row.expInput.value
        });
    }

    function saveAllRowSettings() {
        for (const row of memberRows.values()) {
            saveRowSettings(row);
        }
    }

    

    // ===== 05-member-render.js =====
/* =========================================================
   RENDER MEMBERS
========================================================= */
    function createMemberRow(member, index) {
        const key =
            normalizeName(member.name);

        const saved =
            getSavedSettings(member.name);

        const row =
            createEl('div');

        Object.assign(row.style, {
            background: '#313244',
            border: '1px solid #45475a',
            borderRadius: '6px',
            padding: '6px',
            marginBottom: '5px'
        });

        const top =
            createEl('div');

        Object.assign(top.style, {
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            marginBottom: '4px'
        });

        const check =
            document.createElement('input');

        check.type = 'checkbox';
        check.checked =
            saved.checked !== false;

        const name =
            createEl(
                'span',
                member.name ||
                `Thành viên ${index + 1}`
            );

        Object.assign(name.style, {
            fontWeight: 'bold',
            color: '#cdd6f4',
            flex: '1'
        });

        const status =
            createEl('span', '---');

        status.style.fontWeight = 'bold';

        top.append(
            check,
            name,
            status
        );

        row.appendChild(top);

        const stats =
            createEl('div');

        stats.style.color = '#a6adc8';
        stats.style.marginBottom = '5px';

        row.appendChild(stats);

        const condition =
            createEl('div');

        condition.style.display = 'flex';
        condition.style.gap = '5px';
        condition.style.alignItems = 'center';
        condition.style.flexWrap = 'wrap';

        condition.appendChild(
            createEl('span', 'HP%')
        );

        const hpInput =
            makeNumberInput(saved.hp ?? 0);

        condition.appendChild(hpInput);

        condition.appendChild(
            createEl('span', 'TL')
        );

        const energyInput =
            makeNumberInput(saved.energy ?? 0);

        condition.appendChild(energyInput);

        condition.appendChild(
            createEl('span', 'Tu vi%')
        );

        const expInput =
            makeNumberInput(saved.exp ?? 0);

        condition.appendChild(expInput);

        row.appendChild(condition);
        memberPanel.appendChild(row);

        const rowData = {
            key,
            data: member,
            row,
            check,
            status,
            stats,
            hpInput,
            energyInput,
            expInput
        };

        memberRows.set(key, rowData);

        // Lưu ngay khi người dùng chỉnh.
        check.addEventListener(
            'change',
            function () {
                saveRowSettings(rowData);
            }
        );

        hpInput.addEventListener(
            'input',
            function () {
                saveRowSettings(rowData);
            }
        );

        energyInput.addEventListener(
            'input',
            function () {
                saveRowSettings(rowData);
            }
        );

        expInput.addEventListener(
            'input',
            function () {
                saveRowSettings(rowData);
            }
        );

        updateMemberRow(rowData, member);

        return rowData;
    }

    function updateMemberRow(row, member) {
        row.data = member;

        row.stats.textContent =
            `HP: ${member.hpText} | ` +
            `Thể lực: ${member.energyText} | ` +
            `Tu vi: ${member.expText}`;
    }

    /*
     * Chỉ render lại khi danh sách thành viên thực sự thay đổi.
     *
     * Đây là phần sửa lỗi quan trọng:
     * Không còn replaceChildren() mỗi lần Bắt Đầu.
     */

    function syncMemberPanel(data) {
        const limited =
            data.slice(0, MAX_MEMBERS);

        const signature =
            limited
                .map(function (m) {
                    return normalizeName(m.name);
                })
                .join('|');

        if (signature === lastTeamSignature) {
            for (const member of limited) {
                const key =
                    normalizeName(member.name);

                const row =
                    memberRows.get(key);

                if (row) {
                    updateMemberRow(row, member);
                }
            }

            return;
        }

        saveAllRowSettings();

        memberPanel.replaceChildren();
        memberRows.clear();

        limited.forEach(function (member, index) {
            createMemberRow(member, index);
        });

        lastTeamSignature = signature;
    }

    

    // ===== 06-team-parser.js =====
/* =========================================================
   PARSE STATS
========================================================= */
    function parseNumber(value) {
        if (value === null || value === undefined) {
            return null;
        }

        const cleaned =
            String(value).replace(/[.,](?=\d{3}\b)/g, '');

        const number =
            Number(cleaned.replace(',', '.'));

        return Number.isFinite(number)
            ? number
            : null;
    }

    function parseStats(li) {
        const text =
            (li.innerText || li.textContent || '')
                .replace(/\s+/g, ' ')
                .trim();

        /*
         * Ưu tiên lấy tên từ <strong>.
         *
         * Với HTML bạn cung cấp:
         *
         * <strong>Vấn kỳ</strong>
         *
         * nên không cần phụ thuộc vào 🤝 hay [.
         */

        let name = '';

        const strong =
            li.querySelector('strong');

        if (strong) {
            name =
                (strong.innerText ||
                 strong.textContent ||
                 '')
                    .replace(/\s+/g, ' ')
                    .trim();
        }

        /*
         * Fallback nếu không có strong.
         */

        if (!name) {
            name = text
                .split('🤝')[0]
                .split('[')[0]
                .replace(/^✅\s*/, '')
                .replace(/^☑\s*/, '')
                .trim();
        }

        /*
         * HP
         */

        const hpMatch =
            text.match(
                /Sinh mệnh\s*:\s*[^\d(]*\(?\s*([\d.,]+)\s*\/\s*([\d.,]+)\s*\)?/i
            );

        /*
         * Thể lực
         */

        const energyMatch =
            text.match(
                /Thể lực\s*:\s*[^\d(]*\(?\s*([\d.,]+)\s*\/\s*([\d.,]+)\s*\)?/i
            );

        /*
         * Tu vi
         *
         * Hỗ trợ:
         * 16%
         * 16,5%
         * 16.5%
         */

        const expMatch =
            text.match(
                /Tu vi\s*:\s*[^\d(]*\(?\s*([\d]+(?:[.,]\d+)?)\s*%\s*\)?/i
            );

        const hpCurrent =
            hpMatch
                ? parseNumber(hpMatch[1])
                : null;

        const hpMax =
            hpMatch
                ? parseNumber(hpMatch[2])
                : null;

        const energyCurrent =
            energyMatch
                ? parseNumber(energyMatch[1])
                : null;

        const energyMax =
            energyMatch
                ? parseNumber(energyMatch[2])
                : null;

        const expPercent =
            expMatch
                ? parseNumber(expMatch[1])
                : null;

        return {
            name,

            hpCurrent,
            hpMax,

            energyCurrent,
            energyMax,

            expPercent,

            hpText:
                hpCurrent !== null &&
                hpMax !== null
                    ? `${hpCurrent}/${hpMax}`
                    : '?',

            energyText:
                energyCurrent !== null &&
                energyMax !== null
                    ? `${energyCurrent}/${energyMax}`
                    : '?',

            expText:
                expPercent !== null
                    ? `${expPercent}%`
                    : '?'
        };
    }

    

/* =========================================================
   READ TEAM MEMBERS
========================================================= */
    function getMembersFromMessage(message) {
        const result = [];

        const lists =
            message.querySelectorAll('ol');

        for (const list of lists) {
            const items =
                list.querySelectorAll(':scope > li');

            if (!items.length) {
                continue;
            }

            for (const li of items) {
                const parsed =
                    parseStats(li);

                if (
                    parsed.name &&
                    (
                        parsed.hpCurrent !== null ||
                        parsed.energyCurrent !== null ||
                        parsed.expPercent !== null
                    )
                ) {
                    result.push(parsed);
                }
            }

            if (result.length) {
                break;
            }
        }

        return result;
    }

    

/* =========================================================
   FIND LATEST TEAM
========================================================= */
    function findLatestTeamMessage() {
        const articles =
            Array.from(
                document.querySelectorAll(
                    'div[role="article"][data-list-item-id^="chat-messages"]'
                )
            );

        for (
            let i = articles.length - 1;
            i >= 0;
            i--
        ) {
            const article =
                articles[i];

            /*
             * FIX: KHÔNG bắt buộc nút "Bắt Đầu"
             * nằm chung article với bảng đội.
             *
             * Nhiều bot Discord gửi bảng thành viên
             * và nút hành động ở HAI message khác nhau
             * (nút thường nằm ở message SAU).
             *
             * Trước đây hasStart bắt buộc khiến
             * findLatestTeamMessage() luôn trả về null
             * -> tool không bao giờ tìm thấy bảng đội
             * -> KHÔNG BAO GIỜ CLICK.
             *
             * Việc tìm nút thật sự đã được xử lý
             * (có fallback tìm ở các message sau)
             * trong findTargetButton() / findFreshButton()
             * ở 08-button-clicker.js, nên không cần
             * điều kiện hasStart ở đây nữa.
             */

            const buttons =
                Array.from(
                    article.querySelectorAll(
                        'button,[role="button"]'
                    )
                );

            const memberData =
                getMembersFromMessage(article);

            if (!memberData.length) {
                continue;
            }

            return {
                element: article,
                members: memberData,
                buttons
            };
        }

        return null;
    }

    

/* =========================================================
   REFRESH TEAM
========================================================= */
    function refreshTeamInfo(team) {
        if (!team) {
            teamStatus.textContent =
                'Không tìm thấy bảng đội.';

            teamStatus.style.color =
                '#f38ba8';

            return;
        }

        const count =
            Math.min(
                team.members.length,
                MAX_MEMBERS
            );

        teamStatus.textContent =
            `Đã đọc ${count}/${MAX_MEMBERS} thành viên`;

        teamStatus.style.color =
            '#a6e3a1';

        /*
         * Chỉ cập nhật dữ liệu.
         * Không reset input.
         */

        syncMemberPanel(team.members);
    }

    

    // ===== 07-member-check.js =====
/* =========================================================
   CHECK CONDITIONS
========================================================= */
    function checkMembersBeforeStart(team) {
        let valid = true;
        let zeroEnergy = false;
        let selectedCount = 0;

        for (const row of memberRows.values()) {
            row.status.textContent =
                'Bỏ qua';

            row.status.style.color =
                '#6c7086';

            if (!row.check.checked) {
                continue;
            }

            selectedCount++;

            const current =
                team.members.find(function (member) {
                    return normalizeName(member.name) ===
                        normalizeName(row.data.name);
                });

            if (!current) {
                row.status.textContent =
                    'Không tìm thấy';

                row.status.style.color =
                    '#f38ba8';

                valid = false;
                continue;
            }

            /*
             * Cập nhật dữ liệu mới nhất.
             */

            row.data = current;
            updateMemberRow(row, current);

            const hpMin =
                Math.max(
                    0,
                    Number(row.hpInput.value) || 0
                );

            const energyMin =
                Math.max(
                    0,
                    Number(row.energyInput.value) || 0
                );

            const expMin =
                Math.max(
                    0,
                    Number(row.expInput.value) || 0
                );

            /*
             * HP%
             */

            const hpPercent =
                current.hpCurrent !== null &&
                current.hpMax !== null &&
                current.hpMax > 0
                    ? (
                        current.hpCurrent /
                        current.hpMax
                    ) * 100
                    : null;

            /*
             * Dừng khi TL = 0.
             */

            if (
                stopZero.checked &&
                current.energyCurrent !== null &&
                current.energyCurrent === 0
            ) {
                zeroEnergy = true;
            }

            /*
             * QUAN TRỌNG:
             *
             * Ngưỡng = 0 nghĩa là bỏ qua.
             *
             * Vì vậy nếu không đọc được chỉ số
             * nhưng ngưỡng = 0 thì không fail.
             */

            const hpOK =
                hpMin === 0 ||
                (
                    hpPercent !== null &&
                    hpPercent >= hpMin
                );

            const energyOK =
                energyMin === 0 ||
                (
                    current.energyCurrent !== null &&
                    current.energyCurrent >= energyMin
                );

            const expOK =
                expMin === 0 ||
                (
                    current.expPercent !== null &&
                    current.expPercent >= expMin
                );

            if (
                hpOK &&
                energyOK &&
                expOK
            ) {
                row.status.textContent =
                    'ĐẠT';

                row.status.style.color =
                    '#a6e3a1';
            } else {
                row.status.textContent =
                    'KHÔNG ĐẠT';

                row.status.style.color =
                    '#f38ba8';

                valid = false;
            }
        }

        /*
         * Không chọn ai:
         * không chặn Bắt Đầu.
         */

        if (selectedCount === 0) {
            return {
                action: 'click',
                reason: ''
            };
        }

        /*
         * TL = 0 có ưu tiên cao nhất.
         */

        if (zeroEnergy) {
            return {
                action: 'stop',
                reason:
                    'Có thành viên được chọn đã hết thể lực.'
            };
        }

        if (!valid) {
            return {
                action: 'skip',
                reason:
                    'Có thành viên được chọn không đạt điều kiện.'
            };
        }

        return {
            action: 'click',
            reason: ''
        };
    }

    

    // ===== 08-button-clicker.js =====
/* =========================================================
   FIND BUTTON
========================================================= */
    function findButtonInArticle(article, target) {
        if (!article) {
            return null;
        }

        const buttons =
            Array.from(
                article.querySelectorAll(
                    'button,[role="button"]'
                )
            );

        /*
         * Không lấy GUI của script.
         */

        return buttons.find(function (button) {
            if (gui.contains(button)) {
                return false;
            }

            return isButtonMatch(
                button,
                target
            );
        }) || null;
    }

    /*
     * Tìm nút thuộc bảng đội trước.
     *
     * Nếu không có, chỉ tìm ở các article
     * xuất hiện SAU bảng đội.
     *
     * Không quay ngược về các message cũ.
     */

    function findTargetButton(team, targets) {
        if (!team) {
            return null;
        }

        /*
         * 1. Ưu tiên chính bảng đội.
         */

        for (const target of targets) {
            const button =
                findButtonInArticle(
                    team.element,
                    target
                );

            if (button) {
                return {
                    button,
                    target
                };
            }
        }

        /*
         * 2. Fallback:
         * tìm các message mới hơn bảng đội.
         */

        const articles =
            Array.from(
                document.querySelectorAll(
                    'div[role="article"][data-list-item-id^="chat-messages"]'
                )
            );

        const index =
            articles.indexOf(team.element);

        if (index === -1) {
            return null;
        }

        for (
            let i = articles.length - 1;
            i > index;
            i--
        ) {
            const article =
                articles[i];

            for (const target of targets) {
                const button =
                    findButtonInArticle(
                        article,
                        target
                    );

                if (button) {
                    return {
                        button,
                        target
                    };
                }
            }
        }

        return null;
    }

    

/* =========================================================
   RE-QUERY BUTTON BEFORE CLICK
========================================================= */
    function findFreshButton(team, target) {
        if (!team) {
            return null;
        }

        /*
         * Tìm lại bảng đội mới nhất.
         */

        const freshTeam =
            findLatestTeamMessage();

        if (!freshTeam) {
            return null;
        }

        /*
         * Nếu target là Bắt Đầu,
         * bắt buộc lấy từ bảng đội mới nhất.
         */

        if (
            /*
             * target đã được bỏ dấu (normalizeText trong getTargets),
             * nên so với chuỗi không dấu 'bat dau'.
             */
            normalizeText(target)
                .includes('bat dau')
        ) {
            return findButtonInArticle(
                freshTeam.element,
                target
            );
        }

        /*
         * Các nút khác:
         * thử bảng đội trước.
         */

        const direct =
            findButtonInArticle(
                freshTeam.element,
                target
            );

        if (direct) {
            return direct;
        }

        /*
         * Sau đó mới tìm các message
         * xuất hiện sau bảng đội.
         */

        const result =
            findTargetButton(
                freshTeam,
                [target]
            );

        return result
            ? result.button
            : null;
    }

    

/* =========================================================
   FORCE CLICK
========================================================= */
    function forceClick(button) {
        if (!button) {
            return false;
        }

        /*
         * Không click node đã bị React thay thế.
         */

        if (!button.isConnected) {
            return false;
        }

        /*
         * Không đụng GUI của script.
         */

        if (gui.contains(button)) {
            return false;
        }

        /*
         * Giữ logic cũ:
         * bỏ disabled để xử lý nút Discord.
         */

        if (button.hasAttribute('disabled')) {
            button.removeAttribute('disabled');
        }

        button.disabled = false;
        button.setAttribute(
            'aria-disabled',
            'false'
        );

        const options = {
            bubbles: true,
            cancelable: true,
            view: window
        };

        button.dispatchEvent(
            new MouseEvent(
                'pointerdown',
                options
            )
        );

        button.dispatchEvent(
            new MouseEvent(
                'mousedown',
                options
            )
        );

        button.dispatchEvent(
            new MouseEvent(
                'pointerup',
                options
            )
        );

        button.dispatchEvent(
            new MouseEvent(
                'mouseup',
                options
            )
        );

        button.click();

        console.log(
            '[AutoBot] CLICK:',
            getButtonText(button)
        );

        return true;
    }

    

    // ===== 09-process.js =====
/* =========================================================
   STOP TOOL
========================================================= */
    function stopTool(reason) {
        running = false;

        if (timer) {
            clearInterval(timer);
            timer = null;
        }

        cooldown = false;

        toggleButton.textContent =
            'BẮT ĐẦU';

        toggleButton.style.background =
            '#a6e3a1';

        if (reason) {
            teamStatus.textContent =
                '🛑 ĐÃ DỪNG: ' + reason;

            teamStatus.style.color =
                '#f38ba8';

            console.warn(
                '[AutoBot] STOP:',
                reason
            );
        }
    }

    

/* =========================================================
   PROCESS
========================================================= */
    function processAutoClick() {
        if (!running || cooldown) {
            return;
        }

        const targets =
            getTargets();

        if (!targets.length) {
            debugLog('Chưa nhập từ khóa cần click.');
            return;
        }

        const team =
            findLatestTeamMessage();

        if (!team) {
            debugLog('Không tìm thấy bảng đội (message chứa danh sách thành viên) trên màn hình.');
            return;
        }

        /*
         * Cập nhật bảng thông tin.
         *
         * Hàm này KHÔNG reset input.
         */

        refreshTeamInfo(team);

        const found =
            findTargetButton(
                team,
                targets
            );

        if (!found) {
            debugLog(
                'Không tìm thấy nút khớp từ khóa: ' +
                targets.join(', ')
            );

            return;
        }

        const target =
            found.target;

        /*
         * Kiểm tra Bắt Đầu.
         */

        if (
            /*
             * target đã được bỏ dấu (normalizeText)
             * nên so với chuỗi không dấu 'bat dau'.
             */
            target.includes('bat dau')
        ) {
            /*
             * Đọc lại bảng đội NGAY TRƯỚC khi kiểm tra.
             */

            const latestTeam =
                findLatestTeamMessage();

            if (!latestTeam) {
                return;
            }

            refreshTeamInfo(latestTeam);

            const result =
                checkMembersBeforeStart(
                    latestTeam
                );

            if (result.action === 'stop') {
                stopTool(result.reason);
                return;
            }

            if (result.action === 'skip') {
                teamStatus.textContent =
                    '⏸ Chưa click Bắt Đầu: ' +
                    result.reason;

                teamStatus.style.color =
                    '#f9e2af';

                return;
            }

            teamStatus.textContent =
                '✅ Điều kiện đạt → đang click Bắt Đầu';

            teamStatus.style.color =
                '#a6e3a1';
        }

        /*
         * QUAN TRỌNG:
         * Không dùng targetButton cũ nữa.
         *
         * Tìm lại button hiện tại trong DOM.
         */

        const freshButton =
            findFreshButton(
                team,
                target
            );

        if (!freshButton) {
            debugLog('Nút "' + target + '" đã biến mất khỏi DOM trước khi click lại.');
            return;
        }

        /*
         * Kiểm tra lại text.
         */

        if (
            !isButtonMatch(
                freshButton,
                target
            )
        ) {
            debugLog('Text nút đã đổi, không còn khớp "' + target + '".');
            return;
        }

        const clicked =
            forceClick(freshButton);

        if (!clicked) {
            debugLog('forceClick() thất bại (nút không còn gắn vào DOM hoặc thuộc GUI của tool).');
            return;
        }

        cooldown = true;

        const delay =
            Math.max(
                200,
                parseInt(
                    delayInput.value,
                    10
                ) || DEFAULT_DELAY
            );

        setTimeout(
            function () {
                cooldown = false;
            },
            delay
        );
    }

    

/* =========================================================
   TOGGLE
========================================================= */
    const toggleButton =
        document.createElement('button');

    toggleButton.textContent =
        'BẮT ĐẦU';

    Object.assign(toggleButton.style, {
        width: '100%',
        padding: '8px',
        marginTop: '8px',
        background: '#a6e3a1',
        color: '#11111b',
        border: 'none',
        borderRadius: '6px',
        fontWeight: 'bold',
        cursor: 'pointer',
        fontSize: '13px'
    });

    body.appendChild(toggleButton);

    toggleButton.addEventListener(
        'click',
        function () {
            running = !running;

            if (running) {
                const targets =
                    getTargets();

                if (!targets.length) {
                    running = false;

                    alert(
                        'Vui lòng nhập ít nhất một từ khóa.'
                    );

                    return;
                }

                toggleButton.textContent =
                    'DỪNG TOOL';

                toggleButton.style.background =
                    '#f38ba8';

                console.log(
                    '[AutoBot] Bắt đầu.'
                );

                processAutoClick();

                timer =
                    setInterval(
                        processAutoClick,
                        SCAN_INTERVAL
                    );

            } else {
                stopTool();

                console.log(
                    '[AutoBot] Đã dừng.'
                );
            }
        }
    );

    

    // ===== 10-debug.js =====
/* =========================================================
   DEBUG
========================================================= */
    window.discordAutoClickTest =
        function () {
            const team =
                findLatestTeamMessage();

            if (!team) {
                console.log(
                    '[AutoBot] Không tìm thấy bảng đội.'
                );

                return;
            }

            console.log(
                '[AutoBot] Bảng đội:',
                team.element
            );

            console.table(
                team.members
            );

            refreshTeamInfo(team);

            console.log(
                '[AutoBot] Thành viên:',
                team.members
            );
        };

    window.discordAutoClickCheck =
        function () {
            const team =
                findLatestTeamMessage();

            if (!team) {
                console.log(
                    '[AutoBot] Không tìm thấy bảng đội.'
                );

                return;
            }

            refreshTeamInfo(team);

            const result =
                checkMembersBeforeStart(
                    team
                );

            console.log(
                '[AutoBot] Kết quả:',
                result
            );

            return result;
        };

    console.log(
        '%c[AutoBot] Loaded FIX1',
        'color:#89b4fa;font-weight:bold'
    );

    console.log(
        'discordAutoClickTest() = đọc bảng đội'
    );

    console.log(
        'discordAutoClickCheck() = kiểm tra điều kiện'
    );

})();
