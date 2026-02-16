# Marketplace Backend (Node.js + Express + MongoDB)

Backend completo de marketplace com arquitetura em camadas, autenticação JWT, controle de roles, upload múltiplo de imagens, promoções inteligentes e geração de link de WhatsApp para fechamento de pedido.

## Stack
- Express
- Mongoose
- JWT
- Bcrypt
- Multer
- Dotenv
- Cors
- Helmet
- Morgan
- Express-validator
- UUID
- Dayjs

## Estrutura
```
src/
  config/
  models/
  controllers/
  services/
  routes/
  middlewares/
  utils/
  validators/
```

## Regras principais implementadas
- Apenas `admin` altera role.
- `distribuidor` e `revendedor` (e `admin`) podem cadastrar/editar/remover produtos.
- Usuário comum autenticado pode comprar (criar pedidos).
- CRUD de categorias protegido para `admin`.
- `GET /api/products` com filtros, ordenação e paginação.
- Promoção aplicada automaticamente nos retornos de produto.
- Geração de link do WhatsApp na criação do pedido.
- Compatibilidade de payload PT/EN em autenticação/produto/pedido (`nome|name`, `senha|password`, `preco|price`, `produtos|items`) para reduzir erros 400 de integração.

## Scripts npm
- `npm run dev`
- `npm start`

## Variáveis de ambiente
Copie `.env.example` para `.env` e ajuste:
- `PORT`
- `MONGO_URI`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `JWT_ACCESS_EXPIRES_IN`
- `JWT_REFRESH_EXPIRES_IN`
- `UPLOAD_DIR` (ex.: `uploads`)

## Endpoints principais
- Auth: `/api/auth/register`, `/api/auth/login`, `/api/auth/refresh-token`
- Usuário: `/api/users/me`, `/api/users/:id/role`
- Categorias: `/api/categories`
- Produtos: `/api/products`
- Pedidos: `/api/orders`, `/api/orders/my-orders`
