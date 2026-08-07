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
                    '[role="article"]'
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
            target
                .toLowerCase()
                .includes('bắt đầu')
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

    
