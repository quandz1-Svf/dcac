/* =========================================================
   GUI
========================================================= */
    const gui = document.createElement('div');

    gui.id = 'tamper-gui';

    Object.assign(gui.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: '999999',
        background: '#1e1e2e',
        color: '#cdd6f4',
        padding: '12px',
        borderRadius: '10px',
        fontFamily: 'sans-serif',
        width: '390px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 10px 25px rgba(0,0,0,.5)',
        border: '1px solid #45475a',
        fontSize: '12px'
    });

    document.body.appendChild(gui);

    function createEl(tag, text) {
        const el = document.createElement(tag);

        if (text !== undefined) {
            el.textContent = text;
        }

        return el;
    }

    

/* =========================================================
   HEADER
========================================================= */
    const header = createEl('div');

    Object.assign(header.style, {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '8px',
        fontWeight: 'bold',
        color: '#89b4fa',
        fontSize: '14px'
    });

    const title = createEl('span', 'AUTO CLICK DISCORD');
    const minimize = createEl('span', '[─]');

    Object.assign(minimize.style, {
        cursor: 'pointer',
        padding: '0 4px',
        fontSize: '12px',
        color: '#a6adc8'
    });

    header.append(title, minimize);
    gui.appendChild(header);

    const body = createEl('div');
    gui.appendChild(body);

    let minimized = false;

    minimize.addEventListener('click', function () {
        minimized = !minimized;

        body.style.display =
            minimized ? 'none' : 'block';

        minimize.textContent =
            minimized ? '[+]' : '[─]';
    });

    

/* =========================================================
   TARGET LIST
========================================================= */
    const targetLabel = createEl(
        'label',
        'Từ khóa cần click (cách nhau bằng dấu phẩy):'
    );

    targetLabel.style.color = '#a6adc8';
    targetLabel.style.display = 'block';
    targetLabel.style.marginBottom = '4px';

    body.appendChild(targetLabel);

    const targetList = document.createElement('textarea');

    targetList.value =
        'Gia Nhập 2, Quay lại, Bắt Đầu';

    Object.assign(targetList.style, {
        width: '100%',
        height: '55px',
        background: '#313244',
        color: '#cdd6f4',
        border: '1px solid #45475a',
        borderRadius: '6px',
        padding: '6px',
        fontSize: '12px',
        boxSizing: 'border-box',
        resize: 'vertical',
        marginBottom: '8px'
    });

    body.appendChild(targetList);

    

/* =========================================================
   DELAY
========================================================= */
    const delayRow = createEl('div');

    Object.assign(delayRow.style, {
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
        marginBottom: '8px'
    });

    delayRow.appendChild(
        createEl('span', 'Delay (ms):')
    );

    const delayInput = document.createElement('input');

    delayInput.type = 'number';
    delayInput.value = DEFAULT_DELAY;
    delayInput.min = '200';
    delayInput.step = '100';

    Object.assign(delayInput.style, {
        width: '75px',
        background: '#313244',
        color: '#cdd6f4',
        border: '1px solid #45475a',
        borderRadius: '4px',
        padding: '3px 5px'
    });

    delayRow.appendChild(delayInput);
    body.appendChild(delayRow);

    

/* =========================================================
   TEAM STATUS
========================================================= */
    const teamTitle =
        createEl('div', 'THÔNG TIN ĐỘI');

    Object.assign(teamTitle.style, {
        color: '#89b4fa',
        fontWeight: 'bold',
        margin: '10px 0 5px'
    });

    body.appendChild(teamTitle);

    const teamStatus =
        createEl('div', 'Chưa đọc bảng đội.');

    teamStatus.style.color = '#a6adc8';
    teamStatus.style.marginBottom = '6px';

    body.appendChild(teamStatus);

    const memberPanel =
        createEl('div');

    body.appendChild(memberPanel);

    

/* =========================================================
   CONDITIONS
========================================================= */
    const conditionTitle =
        createEl('div', 'ĐIỀU KIỆN');

    Object.assign(conditionTitle.style, {
        color: '#89b4fa',
        fontWeight: 'bold',
        margin: '10px 0 5px'
    });

    body.appendChild(conditionTitle);

    const stopZeroLabel =
        createEl('label');

    const stopZero =
        document.createElement('input');

    stopZero.type = 'checkbox';
    stopZero.checked = true;

    stopZeroLabel.append(
        stopZero,
        document.createTextNode(
            ' Dừng khi thành viên được chọn có Thể lực = 0'
        )
    );

    body.appendChild(stopZeroLabel);

    body.appendChild(
        document.createElement('br')
    );

    
