/* =========================================================
   FIND BUTTON (KHÔNG PHỤ THUỘC BẢNG ĐỘI)
========================================================= */
    /*
     * Quét TẤT CẢ message (mới nhất -> cũ hơn).
     *
     * Message nào có nút khớp bất kỳ từ khóa nào
     * trong danh sách -> click ngay, BẤT KỂ giao diện
     * đó có phải "bảng đội" (<ol> danh sách thành viên)
     * hay không.
     *
     * Đây là điểm khác biệt quan trọng so với bản trước:
     * trước đây TOÀN BỘ việc click phụ thuộc vào việc
     * tìm thấy bảng đội trước (findLatestTeamMessage),
     * nên hễ đổi sang giao diện khác (màn hình trận đấu,
     * kết quả...) không có <ol> là tool bị đứng lại dù
     * nút cần bấm vẫn hiển thị rành rành trên màn hình.
     */

    function findAnyMatchingButton(targets) {
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

            if (gui.contains(article)) {
                continue;
            }

            const buttons =
                Array.from(
                    article.querySelectorAll(
                        'button,[role="button"]'
                    )
                ).filter(function (button) {
                    return !gui.contains(button);
                });

            if (!buttons.length) {
                continue;
            }

            for (const target of targets) {
                const button =
                    buttons.find(function (btn) {
                        return isButtonMatch(
                            btn,
                            target
                        );
                    });

                if (button) {
                    return {
                        button,
                        target,
                        article
                    };
                }
            }
        }

        return null;
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

    
