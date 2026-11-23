# Como corrigir a publicação do NeuroFisio via GitHub e Cloudflare Workers

O projeto criado no Cloudflare é um **Worker** chamado `neurofisio`. Este pacote adiciona o arquivo `wrangler.jsonc` que indica para o Worker onde estão os arquivos estáticos em `dist/`.

## 1 — GitHub

1. Extraia este ZIP.
2. Entre no seu repositório `neurofisio` (ou crie um novo).
3. Envie **o conteúdo dentro desta pasta**, incluindo `package.json`, `wrangler.jsonc`, `index.html`, `src/`, `public/`, `scripts/` e `dist/`. Não envie somente o ZIP.
4. Esses arquivos precisam ficar na **raiz do repositório**, e não sob uma pasta `neurofisio-github-corrigido/`.
5. Clique em **Commit changes** na branch `main`.

## 2 — Cloudflare Workers

Abra Workers & Pages → `neurofisio` → Settings → Build (ou Build configuration). Confira:

- Production branch: `main`
- Root directory: `/` (ou vazio) caso os arquivos estejam na raiz
- Build command: `npm run build:cloudflare`
- Deploy command: `npx wrangler deploy`

Salve e inicie novo deploy (ou crie um commit no GitHub).

## 3 — Diagnóstico em caso de falha

Workers & Pages → `neurofisio` → Deployments → View build history → selecione a falha → veja o **Build log** e envie o texto do primeiro erro.

## Observações

- O script `build:cloudflare` usa o compilador TypeScript instalado em `npm install`, gerando a distribuição estática já testada; não requer o Vite nessa etapa.
- O comando `npm run build` original foi mantido para uma compilação React + Vite futura, que ainda requer testes de instalação com npm.
- O arquivo `wrangler.jsonc` publica os arquivos de `dist/` em Cloudflare Workers Static Assets, sem script Worker separado.
- Os sinais desta fase são exemplos artificiais sem validação clínica.
- Se preferir Cloudflare Pages, não use esta configuração de Worker: configure React (Vite), build `npm run build`, output `dist`.
