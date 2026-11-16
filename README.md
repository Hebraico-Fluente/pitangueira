# Pitangueira · Design para casamentos criativos

Site da Pitangueira com:

- **Tabela de valores interativa:** a cliente escolhe os itens, vê o total e envia o pedido pronto para o WhatsApp.
- **Portfólio** com galeria de fotos de cada casamento.
- **Quem somos:** Pétala e Isa.

## Como editar

Tudo que muda no dia a dia fica no começo do `<script>` em `index.html`, na parte **CONFIGURAÇÃO — EDITE AQUI**:

| O quê | Onde |
|---|---|
| Número do WhatsApp | `const WHATSAPP` |
| Serviços e preços | `const SERVICOS` (use `preco: null` para "a combinar") |
| Categorias | `const CATEGORIAS` |
| Projetos do portfólio | `const PORTFOLIO` |

Fotos do portfólio vão na pasta `fotos/` (ex.: `fotos/petala-lucas/capa.jpg`).

## Arquivos

- `index.html`: o site inteiro (HTML, CSS e JavaScript)
- `marca/`: logo e ícone em SVG, nas cores do manual de marca
- `fotos/`: fotos do portfólio
