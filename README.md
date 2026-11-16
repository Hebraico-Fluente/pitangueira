# Pitangueira · Design para casamentos criativos

- **Site** (`/`): tabela de valores interativa. A cliente escolhe os itens, vê o total e envia o pedido pronto para o WhatsApp.
- **Painel de leads** (`/painel`): cada pedido enviado pelo site aparece aqui para a Pétala e a Isa acompanharem (Novo → Em conversa → Proposta enviada → Fechado / Perdido). Protegido por senha.

Roda na **Cloudflare Pages** (site + API) com banco **D1** (leads). Tudo no plano gratuito.

## Colocar no ar (uma vez só)

1. **Criar o banco:** no painel da Cloudflare, vá em *Storage & Databases → D1* → *Create database*. Nome: `pitangueira-leads`.
2. **Criar o site:** *Workers & Pages → Create → Pages → Connect to Git* → escolha o repositório `pitangueira`.
   - Framework preset: **None**
   - Build command: *(deixe vazio)*
   - Build output directory: **`public`**
3. **Ligar o banco ao site:** no projeto criado, *Settings → Bindings → Add → D1 database*.
   - Variable name: **`DB`**
   - Database: `pitangueira-leads`
4. **Senha do painel:** *Settings → Variables and Secrets → Add*.
   - Type: **Secret**, Name: **`PAINEL_SENHA`**, Value: a senha que a Pétala e a Isa vão usar.
5. Em *Deployments*, clique em **Retry deployment** para aplicar o banco e a senha.

Pronto: o site fica em `https://<nome-do-projeto>.pages.dev` e o painel em `https://<nome-do-projeto>.pages.dev/painel`.
Para usar um domínio próprio: *Custom domains → Set up a domain*.

A tabela do banco é criada sozinha no primeiro pedido. Cada alteração enviada ao GitHub publica o site automaticamente.

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
functions/api/     API dos leads (Cloudflare Pages Functions)
lib/leads.js       funções compartilhadas da API
```

## Testar no computador

```bash
npx wrangler pages dev public --d1 DB=pitangueira-leads --binding PAINEL_SENHA=teste
```
