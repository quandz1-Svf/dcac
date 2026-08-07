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

    
