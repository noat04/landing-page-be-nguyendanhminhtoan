# Backend mini commerce

Backend Node.js cho landing page: dang ky, dang nhap, dang xuat, san pham, yeu thich, gio hang, san pham da xem, upload anh Cloudinary va chatbot tu van san pham.

## Chay local

```bash
npm install
cp .env.example .env
npm run dev
```

Sua `.env` voi Mongo Atlas, JWT secret va Cloudinary. API mac dinh chay tai `http://localhost:4000`.

## API chinh

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/products`
- `GET /api/products/:idOrSlug`
- `POST /api/products` tao san pham, can dang nhap admin
- `POST /api/products/:id/images` upload anh Cloudinary, can admin
- `GET /api/favorites`
- `POST /api/favorites/:productId`
- `DELETE /api/favorites/:productId`
- `GET /api/cart`
- `POST /api/cart/items`
- `PATCH /api/cart/items/:productId`
- `DELETE /api/cart/items/:productId`
- `GET /api/viewed`
- `DELETE /api/viewed`
- `POST /api/chatbot/message`

## Chat widget

Chen vao landing page:

```html
<link rel="stylesheet" href="/chat-widget.css" />
<script src="/chat-widget.js" data-api-base="http://localhost:4000"></script>
```

File demo co san tai `public/demo.html`.

## Seed san pham mau

Sau khi cau hinh Mongo Atlas:

```bash
npm run seed
```

Seed tao cac san pham mau voi anh placeholder. Ban co the cap nhat bang API upload Cloudinary.
