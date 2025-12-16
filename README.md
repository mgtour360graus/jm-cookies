# JM Cookies — Gestão Financeira PRO (Caixa + Compras + Lucro)

## Rodar local (recomendado)
1) Instale Node.js (18+)
2) No terminal:
```bash
npm install
npm run dev
```

## Build para subir no servidor
```bash
npm run build
```
Isso gera a pasta `dist/`. Envie **somente** a pasta `dist/` para o seu servidor (ou use Vercel/Netlify).

## Login e salvamento
- Por padrão: **login rápido** e dados salvos no navegador (LocalStorage) — já funciona “de verdade”.
- Opcional (PRO+): ativar Supabase (login real + banco):
  - Copie `.env.example` para `.env`
  - Preencha `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`
  - (Depois) crie as tabelas conforme instruções no final do README.

## Dica rápida
No primeiro acesso, você pode entrar com:
- Usuário: `admin`
- Senha: `jm123`

> Dá pra trocar isso no arquivo `src/services/auth.js`.

---

### (Opcional) Supabase — tabelas sugeridas
- profiles (id, username)
- products (id, user_id, name, unit)
- fillings (id, user_id, name, unit)
- utensils (id, user_id, name, unit)
- purchases (id, user_id, day, item_kind, item_name, unit, qty, unit_price, total, note)
- sales (id, user_id, day, qty, ticket, gross, pix, cash, card, note)

Se você quiser, eu te passo o SQL certinho já pronto.
