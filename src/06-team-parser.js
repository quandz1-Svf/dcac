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
             * FIX 2: KHÔNG bắt buộc chữ "Bắt Đầu" cụ thể,
             * nhưng VẪN yêu cầu message phải có ít nhất
             * 1 nút (bất kỳ) đi kèm bảng thành viên.
             *
             * Lý do: một số bot còn gửi thêm các bảng
             * dạng <ol> khác (bảng kết quả, log...) không
             * đi kèm nút nào. Nếu không lọc điều kiện này,
             * findLatestTeamMessage() có thể nhầm lấy
             * bảng đó làm "bảng đội" khi nó là message
             * mới nhất -> tên thành viên không khớp với
             * các dòng đã hiển thị trong GUI -> kiểm tra
             * trước Bắt Đầu luôn báo lỗi/skip -> không
             * click được nữa dù trước đó vẫn click bình
             * thường ở các bước menu chính.
             */

            const buttons =
                Array.from(
                    article.querySelectorAll(
                        'button,[role="button"]'
                    )
                );

            if (!buttons.length) {
                continue;
            }

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

    
