# ⚡ Quizizz Clone - Trực Tiếp & Quét Mã QR

Bản sao Quizizz hoàn chỉnh với giao diện đặc trưng (Gamified UI, 3D buttons, dark purple theme, âm thanh game show Web Audio API) cùng luồng hoạt động chuẩn:
1. **Tạo phòng thi trực tiếp (Host Game)**: Sinh mã PIN 6 số & mã QR tức thì.
2. **Quét mã QR để vào phòng (Student QR Join)**: Học sinh dùng điện thoại (camera thường) quét mã QR, tự động nhận diện IP mạng LAN nội bộ và điền sẵn mã PIN để vào phòng ngay lập tức.
3. **Thi đấu thời gian thực (Real-time Gameplay)**: 
   - Đếm ngược 3-2-1
   - 4 ô đáp án 3D đầy màu sắc (Đỏ, Xanh dương, Vàng, Xanh lá)
   - Thanh đếm ngược thời gian
   - Điểm số cộng dồn theo tốc độ + Chuỗi thắng (Streak 🔥)
   - Giao diện phản hồi meme Quizizz ngay sau khi chọn đáp án (Đúng/Sai, giải thích, xếp hạng)
   - Bảng xếp hạng trực tiếp nhảy hạng real-time trên màn hình giáo viên.
   - Hỗ trợ thêm người chơi ảo (Bot) để giáo viên test một mình không cần điện thoại phụ.
4. **Tổng kết & Thống kê điểm số giống hệt Quizizz (Post-Game Analytics)**:
   - Bục vinh quang 3 bậc (Hạng 1, 2, 3) với hiệu ứng pháo giấy Confetti & âm thanh vinh danh!
   - Thống kê tỷ lệ chính xác toàn lớp (Overall Accuracy)
   - Câu hỏi khó nhất / dễ nhất
   - Bảng xếp hạng chi tiết từng học sinh (Điểm, %, Đúng/Sai, Thời gian làm bài)
   - Phân tích chi tiết từng câu hỏi (Biểu đồ số học sinh chọn từng đáp án A, B, C, D)
   - Xem lại bài làm của từng em
   - **Xuất báo cáo kết quả ra file Excel / CSV** (chuẩn UTF-8 tiếng Việt).
5. **Thư viện đề thi & Trình tạo câu hỏi (Quiz Creator)**:
   - Đã tích hợp sẵn 3 bộ đề phong phú (Vũ trụ & Khoa học, Toán IQ, Địa lý & Danh thắng Việt Nam).
   - Dễ dàng tạo thêm bộ câu hỏi mới, chỉnh thời gian (10s, 20s, 30s, 60s), đáp án và lời giải thích.

---

## 🚀 Hướng Dẫn Khởi Động

### 1. Cài đặt các gói phụ thuộc (Dependencies)
```bash
pnpm install
cd client && pnpm install && cd ..
```

### 2. Chạy ứng dụng (Cả Server & Client)
```bash
pnpm dev
```

- **Màn hình Giáo viên (Host)**: Mở trình duyệt truy cập:
  - `http://localhost:3002` (hoặc cổng hiển thị trên terminal)
  - Chọn một bộ đề và bấm **"TẠO PHÒNG THI"**.
- **Màn hình Học sinh (Student)**:
  - Dùng điện thoại cùng mạng Wi-Fi quét mã QR trên màn hình giáo viên.
  - Hoặc truy cập đường link hiển thị dưới mã QR: `http://192.168.x.x:3002/join?pin=XXXXXX`.
  - Nhập tên biệt danh, chọn linh vật yêu thích và bấm **"VÀO PHÒNG NGAY"**.

---

## 🛠️ Cấu Trúc Dự Án

```
quizziz/
├── server/
│   ├── index.js          # Express + Socket.IO server, logic chấm điểm & thống kê
│   └── data/
│       └── quizzes.json  # Dữ liệu các bộ đề thi (lưu trữ bền vững)
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx         # Thanh điều hướng, bật/tắt âm thanh, toàn màn hình
│   │   │   ├── QuizList.tsx       # Danh sách đề thi, xem trước & tạo phòng
│   │   │   ├── QuizEditor.tsx     # Trình tạo câu hỏi mới
│   │   │   ├── HostLobby.tsx      # Sảnh chờ, mã QR điện thoại, phóng to máy chiếu
│   │   │   ├── HostLiveGame.tsx   # Màn hình theo dõi trực tiếp của giáo viên
│   │   │   ├── HostResults.tsx    # Bục vinh quang, thống kê, phân tích câu hỏi & xuất CSV
│   │   │   ├── StudentJoin.tsx    # Giao diện học sinh nhập PIN / quét QR
│   │   │   ├── StudentGame.tsx    # Giao diện câu hỏi, 4 nút màu 3D, phản hồi meme
│   │   │   └── StudentResults.tsx # Kết quả cá nhân và xem lại câu đúng/sai
│   │   ├── utils/
│   │   │   └── sound.ts           # Bộ tổng hợp âm thanh game show bằng Web Audio API
│   │   ├── socket.ts              # Kết nối Socket.IO
│   │   └── App.tsx                # Điều phối luồng và trạng thái game
│   └── vite.config.ts
└── package.json
```
