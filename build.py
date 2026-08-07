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

    
