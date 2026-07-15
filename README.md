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

## Testes

```powershell
npm test
```

## Deploy na Vercel

- Framework preset: Vite.
- Build command: `npm run build`.
- Output directory: `dist`.
- Variavel: `VITE_API_BASE_URL=https://backend-monitoramento-vsid.onrender.com`.
- `vercel.json` configura o fallback da SPA e cabecalhos de seguranca.

O backend deve permitir exatamente `https://frontend-monitoramento.vercel.app` em `Cors__AllowedOrigins__0`.

## Visualizacao ao vivo

A rota `/ao-vivo` lista os dispositivos vinculados, mostra a presenca do modo ao vivo e permite selecionar camera frontal, camera traseira ou tela. O navegador usa WebRTC para receber a midia e SignalR para sinalizacao autenticada. A configuracao STUN/TURN vem do backend; nenhuma credencial TURN e embutida no bundle do frontend.
