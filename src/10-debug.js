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

    window.discordAutoClickFindButton =
        function () {
            const targets =
                getTargets();

            const found =
                findAnyMatchingButton(
                    targets
                );

            if (!found) {
                console.log(
                    '[AutoBot] Không tìm thấy nút khớp từ khóa:',
                    targets
                );

                return null;
            }

            console.log(
                '[AutoBot] Tìm thấy nút "' +
                found.target +
                '" trong message:',
                found.article
            );

            console.log(
                '[AutoBot] Button:',
                found.button
            );

            return found;
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

    console.log(
        'discordAutoClickFindButton() = tìm nút khớp từ khóa (không cần bảng đội)'
    );
