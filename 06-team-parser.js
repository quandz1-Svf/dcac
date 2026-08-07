/* =========================================================
   CONFIG
========================================================= */
    const SCAN_INTERVAL = 500;
    const DEFAULT_DELAY = 1500;
    const MAX_MEMBERS = 5;

    

/* =========================================================
   STATE
========================================================= */
    let running = false;
    let timer = null;
    let cooldown = false;

    // Lưu cấu hình của từng thành viên.
    // Key = tên thành viên đã chuẩn hóa.
    const memberSettings = new Map();

    // Các row GUI hiện tại.
    const memberRows = new Map();

    let lastTeamSignature = '';

    
