"# GR2"
## 1. Giới thiệu project học tập tiếng nhật: Rakun JLPT
1.1 Vấn đề: 
Người học tiếng nhật hiện nay phải sử dụng nhiều nguồn khác nhau, thiếu một nền tảng tổng hợp giúp luyện tập đầy đủ các kỹ năng theo cấu trúc đề thi JLPT thật.
·   Khó tìm nguồn luyện tập tổng hợp (từ vựng, ngữ pháp, đọc, nghe).
·   Học rời rạc (app này chỉ từ vựng, app kia chỉ ngữ pháp), các app tổng hợp đầy đủ thì yêu cầu phí dịch vụ cao.
·   Khó theo dõi tiến độ học
1.2 Giải pháp:
·   Tạo ra một nền tảng tổng hợp các câu hỏi ôn tập theo cấp độ từ N5->N1. Phân loại các dạng câu hỏi(ngữ pháp, từ vựng, đọc, nghe,…).
·   Nền tảng cung cấp đề thi giúp thí sinh ôn tập kiến thức và làm quen với đề thi JLPT thật.
1.3 Đối tượng nhắm tới:
·   Người học JLPT (N5 -> N1)
·   Sinh viên
·   Người tự học
1.4 Các chức năng chính của App:
·   Cung cấp bài tập cho từng dạng câu hỏi, phân chia bài tập theo cấp độ.
1.5 Các chức năng phụ:
·  Cung cấp chức năng lưu từ vựng, ngữ pháp thành dạng thẻ flashcard để dễ dàng ôn tập.
· Dựa vào dữ liệu người dùng để theo dõi tiến độ học tập, đánh giá người điểm mạnh và yếu của người dùng(người dùng hay đúng hay sai ở dạng bài tập nào, thời gian làm dạng bài đó có lâu không,…).

1.6 Công nghệ sử dụng
- Front-end: sử dụng React, Vite, TypeScript, React Router, Tailwind CSS và các thư viện UI.  
- Back-end: sử dụng NestJS, TypeScript, MongoDB/Mongoose, JWT, Passport và bcrypt. 

## 2. Môi trường hoạt động
2.1 Thiết bị người dùng
Đây là ứng dụng web học JLPT, người dùng truy cập bằng trình duyệt trên PC, laptop.

## 3. Hướng dẫn cài đặt và chạy thử
3.1 Yêu cầu môi trường
- Node.js/NPM: cần cho cả `FE` và `BE/gr1_be`, vì cả hai đều có `package.json`.
- Front-end dependencies chính: React, Vite, TypeScript, Tailwind CSS, React Router, Radix UI, MUI, lucide-react, recharts. 
- Back-end dependencies chính: NestJS, Mongoose, `@nestjs/config`, `@nestjs/jwt`, Passport JWT, bcrypt, class-validator. 
- MongoDB: backend dùng `@nestjs/mongoose`, `mongoose` và biến `MONGODB_URI`.
3.2 Cấu hình môi trường
Back-end cần biến môi trường:
- `MONGODB_URI`: chuỗi kết nối MongoDB.
- `JWT_SECRET`: secret dùng để ký JWT trong `AuthModule`.
Lưu ý bảo mật: file `BE/gr1_be/envSample` có chứa giá trị mẫu cho connection string và JWT secret. Khi triển khai thật nên tạo file `.env` riêng và không commit secret thật.


3.3 Các bước cài đặt và chạy
1. Tại thư mục root project:
```powershell
cd "… \GR1"
```
2. Cài đặt và chạy back-end:
```powershell
cd BE\gr1_be
npm install
```
3. Tạo file `.env` trong `BE/gr1_be` dựa trên `envSample`:
```text
MONGODB_URI=<MongoDB connection string>
JWT_SECRET=<JWT secret>
```
4. Chạy back-end ở chế độ dev:
```powershell
npm run start:dev
```
5. Backend mặc định chạy ở:
```text
http://localhost:3000
```
6. Cài đặt và chạy front-end:
```powershell
cd ..\..\FE
npm install
npm run dev
```
7. Front-end Vite mặc định chạy ở:
```text
http://localhost:5173
```
8. Kết nối front-end/back-end:
- Front-end gọi API bằng prefix `/api`.
- `FE/vite.config.ts` proxy `/api` đến `http://localhost:3000`.
- Backend bật CORS cho origin `http://localhost:5173`.
