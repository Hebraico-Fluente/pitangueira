# Pitangueira · Design para casamentos criativos

- **Site** (`/`): tabela de valores interativa. A cliente escolhe os itens, vê o total e envia o pedido pronto para o WhatsApp.
- **Painel de leads** (`/painel`): cada pedido enviado pelo site aparece aqui para a Pétala e a Isa acompanharem (Novo → Em conversa → Proposta enviada → Fechado / Perdido). Protegido por senha.

Roda na **Cloudflare** (site + API) com banco **D1** (leads). Tudo no plano gratuito.

## Colocar no ar (uma vez só)

1. No painel da Cloudflare: **Workers & Pages → Create → Import a repository**.
2. Conecte o GitHub e escolha o repositório **`pitangueira`**.
3. Deixe tudo como vier (Deploy command: `npx wrangler deploy`) e clique em **Deploy**.
   O banco de dados `pitangueira-leads` é criado sozinho.
4. Quando terminar, abra o projeto → **Settings → Variables and Secrets → Add**:
   Type **Secret**, Name **`PAINEL_SENHA`**, Value: a senha da Pétala e da Isa → **Deploy**.

Pronto: o site fica em `https://pitangueira.<sua-conta>.workers.dev` e o painel em `/painel`.
Para um domínio próprio: **Settings → Domains & Routes → Add → Custom domain**.

Cada alteração enviada ao GitHub publica o site automaticamente.

> Também funciona como projeto **Pages** (pasta de saída `public`, binding D1 `DB`, secret `PAINEL_SENHA`).

## Como editar o site

Tudo que muda no dia a dia fica no começo do `<script>` em `public/index.html`, na parte **CONFIGURAÇÃO — EDITE AQUI**:

| O quê | Onde |
|---|---|
| Número do WhatsApp | `const WHATSAPP` |
| Serviços e preços | `const SERVICOS` (use `preco: null` para "a combinar") |
| Categorias | `const CATEGORIAS` |
| Projetos do portfólio | `const PORTFOLIO` |

Fotos:
- Pétala e Isa: `public/fotos/petala.png` e `public/fotos/isa.png`
- Portfólio: `public/fotos/` (ex.: `public/fotos/petala-lucas/capa.jpg`)

## Estrutura

```
public/            o que vai para o ar
  index.html       site (orçamento, quem somos, portfólio)
  painel/          painel de leads
  marca/           logo e ícone em SVG (cores do manual de marca)
  fotos/           fotos
functions/api/     API dos leads
lib/leads.js       funções compartilhadas da API
src/worker.js      entrada para Cloudflare Workers
wrangler.jsonc     configuração da Cloudflare (nome, banco D1, pasta do site)
```

## Testar no computador

```bash
npx wrangler dev --var PAINEL_SENHA:teste
```
