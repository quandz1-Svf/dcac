/* =========================================================
   CONFIG
========================================================= */
    const SCAN_INTERVAL = 500;
    const DEFAULT_DELAY = 1500;
    const MAX_MEMBERS = 5;

    // Bật để in lý do mỗi lần KHÔNG click ra Console (giúp debug).
    const DEBUG_LOG = true;
    let lastDebugReason = '';

    function debugLog(reason) {
        if (!DEBUG_LOG) {
            return;
        }

        if (reason === lastDebugReason) {
            return;
        }

        lastDebugReason = reason;
        console.log('[AutoBot][debug]', reason);
    }

    

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

    
