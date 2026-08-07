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

    
