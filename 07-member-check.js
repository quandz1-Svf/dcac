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

    
