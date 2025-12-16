# Deploy automático no GitHub Pages (JM Cookies PRO)

## 1) Suba este projeto no repositório `jm-cookies`
- Branch: `main`
- Mantenha o `package.json`, `vite.config.js`, `src/` etc (não suba somente a pasta dist).

## 2) Ative GitHub Pages
No repositório:
- Settings → Pages
- Source: **GitHub Actions**

## 3) Pronto
Toda vez que você der `git push` na `main`, o GitHub vai:
- instalar dependências
- rodar `npm run build`
- publicar a pasta `dist` automaticamente no Pages.

✅ URL final:
https://mgtour360graus.github.io/jm-cookies/
