# Backend - Landing Page Mini Commerce API

Backend này được xây dựng để hỗ trợ landing page giới thiệu sản phẩm công nghệ theo đề bài tuyển dụng. Hệ thống cung cấp REST API cho đăng ký, đăng nhập, danh sách sản phẩm, sản phẩm yêu thích, giỏ hàng, sản phẩm đã xem, upload ảnh sản phẩm qua Cloudinary và chatbot tư vấn sản phẩm.

## Công Nghệ Sử Dụng

- Node.js, Express.js
- MongoDB Atlas, Mongoose
- JWT authentication, HTTP-only cookie, Bearer token
- Zod validation
- Helmet, CORS, Morgan
- Multer + Cloudinary cho upload ảnh
- Chatbot rule-based, có thể cấu hình OpenAI hoặc Gemini

## Vai Trò Trong Dự Án

Backend giúp landing page có khả năng kết nối dữ liệu bên ngoài và mở rộng thành trải nghiệm thương mại điện tử mini:

- Lưu và đọc dữ liệu sản phẩm từ MongoDB.
- Xác thực người dùng để dùng giỏ hàng, yêu thích và sản phẩm đã xem.
- Cung cấp API cho chatbot ở góc màn hình frontend.
- Hỗ trợ admin tạo/cập nhật sản phẩm và upload ảnh.
- Cho phép deploy độc lập lên các nền tảng cloud hỗ trợ Node.js.

## Cấu Trúc Thư Mục

```text
src/
  app.js                 Cấu hình Express app, middleware, routes
  server.js              Entry point, kết nối database và start server
  config/                Biến môi trường, MongoDB, Cloudinary
  controllers/           Logic xử lý request
  middleware/            Auth, validate, upload, error handler
  models/                Mongoose models
  routes/                API route definitions
  services/              Chatbot và Cloudinary service
  seed/                  Dữ liệu sản phẩm mẫu
  utils/                 Helper JWT, pagination, async handler
public/
  chat-widget.js         Chat widget nhúng độc lập
  chat-widget.css        Style cho chat widget
  demo.html              Trang demo widget
```

## Cài Đặt Và Chạy Local

Yêu cầu:

- Node.js 20+
- MongoDB Atlas hoặc MongoDB local

```bash
npm install
npm run dev
```

Server mặc định chạy tại:

```text
http://localhost:4000
```

Kiểm tra server:

```text
GET /health
```

Kết quả mong đợi:

```json
{
  "status": "ok",
  "service": "mini-commerce-backend"
}
```

## Biến Môi Trường

Tạo file `.env` ở thư mục backend:

```bash
NODE_ENV=development
PORT=4000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/landing-page
JWT_SECRET=your_strong_jwt_secret
JWT_EXPIRES_IN=7d
COOKIE_NAME=mini_commerce_token
CLIENT_ORIGIN=http://localhost:3000

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_FOLDER=landing-products

CHATBOT_PROVIDER=rule-based
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
GEMINI_API_KEY=
GEMINI_MODEL=gemini-1.5-flash
```

Biến bắt buộc:

- `MONGODB_URI`: chuỗi kết nối MongoDB.
- `JWT_SECRET`: khóa ký JWT.

Biến tùy chọn:

- `CLIENT_ORIGIN`: danh sách domain frontend được phép gọi API, phân tách bằng dấu phẩy.
- `CLOUDINARY_*`: cần khi upload ảnh sản phẩm.
- `CHATBOT_PROVIDER`: dùng `rule-based`, `openai` hoặc `gemini`.

## Scripts

```bash
npm run dev      # Chạy server bằng nodemon
npm start        # Chạy production bằng node
npm run seed     # Tạo dữ liệu sản phẩm mẫu
npm run check    # Kiểm tra cú pháp entry file
```

## Seed Dữ Liệu Mẫu

Sau khi cấu hình `MONGODB_URI` và `JWT_SECRET`:

```bash
npm run seed
```

Seed sẽ tạo danh sách sản phẩm mẫu để frontend có dữ liệu hiển thị ở trang sản phẩm, chi tiết sản phẩm, giỏ hàng, yêu thích và chatbot.

## API Chính

### Auth

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

Ví dụ register:

```json
{
  "name": "Nguyen Van A",
  "email": "user@example.com",
  "password": "123456"
}
```

Ví dụ login:

```json
{
  "email": "user@example.com",
  "password": "123456"
}
```

### Products

```text
GET   /api/products
GET   /api/products/:idOrSlug
POST  /api/products
PATCH /api/products/:productId
POST  /api/products/:productId/images
```

Query hỗ trợ:

```text
?page=1&limit=12&q=iphone&category=phone&sort=price_asc&minPrice=1000000&maxPrice=30000000
```

`POST`, `PATCH` và upload ảnh yêu cầu tài khoản admin.

Ví dụ tạo sản phẩm:

```json
{
  "name": "iPhone 18 Pro Concept",
  "description": "Smartphone concept cao cấp cho landing page.",
  "category": "smartphone",
  "price": 32990000,
  "originalPrice": 35990000,
  "currency": "VND",
  "stock": 20,
  "tags": ["iphone", "pro", "smartphone"],
  "specs": {
    "Display": "6.9 inch LTPO OLED",
    "Chip": "A20 2 nm",
    "Camera": "48 MP + 64 MP telephoto"
  },
  "images": [
    {
      "url": "https://example.com/iphone.webp",
      "alt": "iPhone 18 Pro Concept"
    }
  ]
}
```

### Favorites

Yêu cầu đăng nhập.

```text
GET    /api/favorites
POST   /api/favorites/:productId
DELETE /api/favorites/:productId
```

### Cart

Yêu cầu đăng nhập.

```text
GET    /api/cart
POST   /api/cart/items
PATCH  /api/cart/items/:productId
DELETE /api/cart/items/:productId
DELETE /api/cart
```

Ví dụ thêm vào giỏ hàng:

```json
{
  "productId": "product_id",
  "quantity": 1
}
```

Ví dụ cập nhật số lượng:

```json
{
  "quantity": 2
}
```

### Viewed Products

Yêu cầu đăng nhập.

```text
GET    /api/viewed
DELETE /api/viewed
```

Khi người dùng đã đăng nhập và xem chi tiết sản phẩm, backend tự ghi nhận sản phẩm đã xem.

### Chatbot

```text
POST /api/chatbot/message
```

Ví dụ request:

```json
{
  "message": "Sản phẩm nào phù hợp để chụp ảnh?",
  "history": [
    {
      "role": "user",
      "content": "Tôi muốn mua điện thoại"
    },
    {
      "role": "assistant",
      "content": "Bạn ưu tiên camera, hiệu năng hay pin?"
    }
  ]
}
```

Nếu chưa cấu hình OpenAI/Gemini, chatbot vẫn trả lời bằng cơ chế rule-based dựa trên dữ liệu sản phẩm trong MongoDB.

## Xác Thực

Backend hỗ trợ cả hai cách gửi token:

- Cookie HTTP-only được set sau khi login/register.
- Header `Authorization: Bearer <token>`.

Frontend hiện lưu token trong `localStorage` và gửi kèm Bearer token qua helper `apiFetch`.

## Chat Widget Nhúng Độc Lập

Backend có sẵn widget để nhúng vào một trang HTML bất kỳ:

```html
<link rel="stylesheet" href="/chat-widget.css" />
<script src="/chat-widget.js" data-api-base="http://localhost:4000"></script>
```

Demo:

```text
public/demo.html
```

## Bảo Mật Và Validate

- `helmet` thêm security headers cơ bản.
- `cors` giới hạn origin theo `CLIENT_ORIGIN`.
- `zod` validate dữ liệu auth, product, cart và chatbot.
- Password được hash bằng `bcryptjs`.
- Route giỏ hàng, yêu thích và sản phẩm đã xem yêu cầu đăng nhập.
- Route quản trị sản phẩm yêu cầu user có quyền admin.

## Deploy Backend

Có thể deploy backend lên Render, Railway hoặc dịch vụ Node.js miễn phí/tier miễn phí tương đương.

Thiết lập thường dùng:

```text
Build command: npm install
Start command: npm start
Root directory: landing-page-be-nguyendanhminhtoan
```

Sau khi deploy:

- Thêm đầy đủ biến môi trường trên dashboard.
- Cập nhật `CLIENT_ORIGIN` bằng domain frontend production.
- Cập nhật `VITE_API_BASE_URL` ở frontend bằng domain backend.
- Kiểm tra lại endpoint `/health`.

## Ghi Chú Nộp Bài

Backend này đáp ứng phần điểm cộng của đề bài:

- Có backend xử lý dữ liệu.
- Có mini commerce: yêu thích, giỏ hàng, sản phẩm đã xem.
- Có chatbot tư vấn sản phẩm.
- Có validate dữ liệu đầu vào.
- Có khả năng kết nối dịch vụ ngoài qua MongoDB Atlas, Cloudinary và OpenAI/Gemini.
