# Marketplace Backend + Painel Administrativo (Node/Express/Mongo + React)

## Estrutura de pastas

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

### Frontend (painel admin)
```txt
frontend/src/
  pages/
  components/
  hooks/
  services/
  context/
```

## Recursos implementados
- Publicação e gerenciamento de produtos (admin/seller).
- CRUD de categorias com suporte a categoria pai.
- CRUD de promoções com regras de validade e conflito.
- Configurações administrativas persistidas em `settings`.
- Auditoria administrativa (`audit_logs`).
- Dashboard com métricas de produtos e vendas do mês.
- Upload múltiplo com compressão de imagens.
- JWT + role middleware + sanitização + rate limit + logs HTTP.
- Auth middleware aceita tokens via `Authorization: Bearer`, `Authorization: Token`, header `x-access-token` e `?token=` para compatibilidade legada.
- Validação com `express-validator` e `zod`.

## Endpoints principais
- Auth: `POST /api/auth/register`, `POST /api/auth/bootstrap-admin`, `POST /api/auth/login`
- Produtos: `POST /api/products`, `PUT /api/products/:id`, `DELETE /api/products/:id`, `GET /api/products`
- Categorias: `POST /api/categories`, `PUT /api/categories/:id`, `DELETE /api/categories/:id`, `GET /api/categories`
- Promoções: `POST /api/promotions`, `PUT /api/promotions/:id`, `DELETE /api/promotions/:id`, `GET /api/promotions`
- Settings: `GET /api/settings`, `PUT /api/settings`
- Dashboard: `GET /api/dashboard/metrics`
- Auditoria: `GET /api/audit-logs`
- Compatibilidade de rota: também responde em `/categories` e `/products` (sem prefixo `/api`) para integrações legadas.

## Exemplo de Model (MongoDB)
```js
const promotionSchema = new mongoose.Schema({
  nome: String,
  tipo: { type: String, enum: ['percentual', 'fixo', 'cupom'] },
  valor: Number,
  dataInicio: Date,
  dataFim: Date,
  aplicavelEm: { type: String, enum: ['produto', 'categoria', 'global'] },
  ativa: Boolean,
});
```

## Exemplo de Controller
```js
const getMetrics = async (req, res, next) => {
  try {
    const totalProdutos = await Product.countDocuments();
    return res.json({ totalProdutos });
  } catch (error) {
    return next(error);
  }
};
```

## Exemplo de formulário React funcional
Veja: `frontend/src/pages/ProductFormPage.jsx`.

## Variáveis de ambiente
Copie `.env.example` para `.env`.

## Scripts
- `npm run dev`
- `npm start`
- `npm run check:syntax`

## Primeiro admin
Siga `SETUP_ADMIN.md`.
