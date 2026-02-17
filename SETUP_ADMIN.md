# O que alterar/criar para funcionar (primeiro admin)

## 1) Alterar o ambiente no deploy (.env / Render)
Crie/ajuste a variável:

- `BOOTSTRAP_ADMIN_TOKEN=um_token_forte_unico`

> Sem isso, o endpoint de bootstrap retorna 403.

## 2) Criar o primeiro admin (uma única vez)
Use o endpoint:

- `POST /api/auth/bootstrap-admin`

Envie o token em **um** destes formatos:
- Header: `x-bootstrap-token: <BOOTSTRAP_ADMIN_TOKEN>`
- Body: `bootstrapToken: <BOOTSTRAP_ADMIN_TOKEN>`

Body mínimo:
```json
{
  "nome": "Admin DSG",
  "email": "admin@dsg.com",
  "senha": "12345678"
}
```

## 3) Exemplo pronto (curl)
```bash
curl -X POST "https://SEU_DOMINIO/api/auth/bootstrap-admin" \
  -H "Content-Type: application/json" \
  -H "x-bootstrap-token: um_token_forte_unico" \
  -d '{
    "nome": "Admin DSG",
    "email": "admin@dsg.com",
    "senha": "12345678"
  }'
```

## 4) Depois disso
- Faça login com esse admin em `/api/auth/login`.
- Para criar outros admins, use:
  - `POST /api/auth/register/admin`
  - com Bearer token do admin logado.

## 5) Respostas esperadas
- `201`: admin criado com sucesso.
- `409`: já existe admin (bootstrap não pode ser reutilizado).
- `403`: token de bootstrap inválido/ausente ou variável não configurada.
