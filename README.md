# Frontend Monitoramento

Painel web do responsavel para o projeto Navegacao Segura.

## API

Por padrao, o painel usa:

```text
https://backend-monitoramento-vsid.onrender.com
```

Para sobrescrever localmente, crie `.env`:

```env
VITE_API_BASE_URL=https://backend-monitoramento-vsid.onrender.com
```

## Desenvolvimento

```powershell
npm install
npm run dev
```

## Build

```powershell
npm run build
```

## Deploy no Render

O arquivo `render.yaml` cria um Static Site:

- Build command: `npm ci && npm run build`
- Publish directory: `dist`
- Variavel: `VITE_API_BASE_URL=https://backend-monitoramento-vsid.onrender.com`
- Rewrite SPA: `/* -> /index.html`
