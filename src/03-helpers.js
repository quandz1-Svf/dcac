/* =========================================================
   HELPERS
========================================================= */
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

        return (
            button.innerText ||
            button.textContent ||
            ''
        )
            .replace(/\s+/g, ' ')
            .trim();
    }

    function getTargets() {
        return targetList.value
            .split(',')
            .map(function (x) {
                return x.trim().toLowerCase();
            })
            .filter(Boolean);
    }

    function isButtonMatch(button, target) {
        return getButtonText(button)
            .toLowerCase()
            .includes(target);
    }

    
