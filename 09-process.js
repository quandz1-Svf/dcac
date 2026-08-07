/* =========================================================
   MEMBER SETTINGS
========================================================= */
    function getSavedSettings(name) {
        const key = normalizeName(name);

        if (!memberSettings.has(key)) {
            memberSettings.set(key, {
                checked: true,
                hp: 0,
                energy: 0,
                exp: 0
            });
        }

        return memberSettings.get(key);
    }

    function saveRowSettings(row) {
        const key =
            normalizeName(row.data.name);

        memberSettings.set(key, {
            checked: row.check.checked,
            hp: row.hpInput.value,
            energy: row.energyInput.value,
            exp: row.expInput.value
        });
    }

    function saveAllRowSettings() {
        for (const row of memberRows.values()) {
            saveRowSettings(row);
        }
    }

    
