# Marketplace Backend + Admin Panel

## Estrutura

### Backend
```txt
src/
  config/
  controllers/
  middlewares/
  models/
  routes/
  services/
  utils/
  validators/
```

### Frontend
```txt
frontend/src/
  components/
  context/
  hooks/
  pages/
  services/
```

## Funcionalidades implementadas
- Card de produto expansível com modal/drawer, avaliações, frete mock e adicionar ao carrinho.
- Sistema de avaliações por produto (`rating`, `comment`, `userId`, `createdAt`).
- Carrinho real (modelo + endpoints de add/update/remove/clear/get).
- Checkout do carrinho gerando Order com `totalPaid`, `profit`, `paidAt` e notificação admin de venda.
- Notificações admin via `GET /api/admin/notifications`.
- Perfil de usuário com endereço salvo e preferência de tema (`GET/PUT /api/users/profile`).
- Tema global (`light` e `dark-gold`) no frontend com persistência em localStorage.
- CRUD de produtos/categorias com proteção por role e compatibilidade de payload.

## Endpoints novos/relevantes
- Reviews
  - `GET /api/products/:id/reviews`
  - `POST /api/products/:id/reviews`
- Cart
  - `GET /api/cart`
  - `POST /api/cart/add`
  - `PUT /api/cart/update`
  - `DELETE /api/cart/remove`
  - `DELETE /api/cart/clear`
- Checkout / Orders
  - `POST /api/orders/checkout`
- Notificações admin
  - `GET /api/admin/notifications`
- Perfil
  - `GET /api/users/profile`
  - `PUT /api/users/profile`

## Scripts
- `npm run dev`
- `npm start`
- `npm run check:syntax`

## Primeiro admin
Siga `SETUP_ADMIN.md`.
