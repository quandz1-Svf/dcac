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

        /*
         * Đọc bảng đội theo kiểu BEST-EFFORT.
         *
         * KHÔNG return sớm nếu không tìm thấy — chỉ dùng
         * để (1) cập nhật GUI hiển thị HP/Thể lực và
         * (2) kiểm tra an toàn riêng cho nút "Bắt Đầu"
         * bên dưới, NẾU đọc được. Việc click nút vẫn diễn
         * ra bình thường theo từ khóa dù không đọc được
         * bảng đội (ví dụ đang ở giao diện trận đấu/kết quả
         * không có danh sách thành viên).
         */

        const team =
            findLatestTeamMessage();

        if (team) {
            refreshTeamInfo(team);
        }

        const found =
            findAnyMatchingButton(
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
         * Kiểm tra an toàn trước khi Bắt Đầu — CHỈ áp
         * dụng khi đang đọc được bảng đội (có dữ liệu
         * HP/Thể lực để kiểm tra). Nếu không đọc được,
         * cứ click thẳng theo đúng yêu cầu: khớp từ khóa
         * là click, bất kể giao diện nào.
         */

        if (
            target.includes('bat dau') &&
            team
        ) {
            const result =
                checkMembersBeforeStart(
                    team
                );

            if (result.action === 'stop') {
                debugLog('STOP trước Bắt Đầu: ' + result.reason);
                stopTool(result.reason);
                return;
            }

            if (result.action === 'skip') {
                debugLog('SKIP Bắt Đầu: ' + result.reason);

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

        const clicked =
            forceClick(
                found.button
            );

        if (!clicked) {
            debugLog('forceClick() thất bại cho nút "' + target + '".');
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

    
