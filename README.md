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
- Auth aceita aliases comuns de frontend: `email|userEmail`, `nome|name|fullName|nomeCompleto`, `senha|password`.

## Scripts npm
- `npm run dev`
- `npm start`
- `npm run check:syntax`

## Variáveis de ambiente
Copie `.env.example` para `.env` e ajuste:
- `PORT`
- `MONGO_URI`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `JWT_ACCESS_EXPIRES_IN`
- `JWT_REFRESH_EXPIRES_IN`
- `UPLOAD_DIR` (ex.: `uploads`)
- `BOOTSTRAP_ADMIN_TOKEN` (usado para criar o primeiro admin)

## Endpoints principais
- Auth: `/api/auth/register`, `/api/auth/bootstrap-admin`, `/api/auth/login`, `/api/auth/refresh-token`
- Usuário: `/api/users/me`, `/api/users/:id/role`
- Categorias: `/api/categories`
- Produtos: `/api/products`
- Pedidos: `/api/orders`, `/api/orders/my-orders`


- Guia rápido de ativação do primeiro admin: `SETUP_ADMIN.md`

## Dica de deploy
Execute `npm run check:syntax` antes do deploy para evitar falhas de inicialização por erro de sintaxe.


## Como criar o primeiro administrador
1. Defina `BOOTSTRAP_ADMIN_TOKEN` no `.env`.
2. Faça `POST /api/auth/bootstrap-admin` com os dados do usuário e token no header `x-bootstrap-token` (ou `bootstrapToken` no body).
3. Esse endpoint só funciona se **ainda não existir** usuário com role `admin`.

Exemplo de body:
```json
{
  "nome": "Admin",
  "email": "admin@dsg.com",
  "senha": "123456",
  "bootstrapToken": "SEU_TOKEN"
}
```
