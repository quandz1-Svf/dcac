# Discord Auto Click – Modular

## Cấu trúc

- `discord-auto-click.user.js`: bản hoàn chỉnh để cài vào Tampermonkey.
- `src/01-config.js`: cấu hình và state.
- `src/02-gui.js`: giao diện.
- `src/03-helpers.js`: hàm tiện ích.
- `src/04-member-settings.js`: lưu ngưỡng từng thành viên.
- `src/05-member-render.js`: tạo/cập nhật bảng thành viên.
- `src/06-team-parser.js`: đọc bảng đội và HP/Thể lực/Tu vi.
- `src/07-member-check.js`: kiểm tra điều kiện trước Bắt Đầu.
- `src/08-button-clicker.js`: tìm và click nút.
- `src/09-process.js`: vòng lặp auto-click và nút bật/tắt.
- `src/10-debug.js`: hàm test trong Console.
- `build.py`: ghép các file `src` thành `discord-auto-click.user.js`.

## Cách sửa

Chỉ sửa file trong `src/`. Sau đó chạy:

```bash
python build.py
```

Tampermonkey chỉ cần cài file `discord-auto-click.user.js`.

## Lưu ý GitHub

Nếu dùng GitHub, nên giữ nguyên cấu trúc `src/` và commit cả `build.py` lẫn file `.user.js` đã build.
