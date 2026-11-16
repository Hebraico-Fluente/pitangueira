// Funções compartilhadas da API de leads (Cloudflare Pages Functions + D1).

export const STATUS = ["novo", "conversa", "proposta", "fechado", "perdido"];
export const RESPONSAVEIS = ["", "Pétala", "Isa"];

const SCHEMA = `CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  criado_em TEXT NOT NULL,
  atualizado_em TEXT NOT NULL,
  origem TEXT NOT NULL DEFAULT 'site',
  status TEXT NOT NULL DEFAULT 'novo',
  responsavel TEXT NOT NULL DEFAULT '',
  notas TEXT NOT NULL DEFAULT '',
  nome TEXT NOT NULL,
  whatsapp TEXT NOT NULL DEFAULT '',
  data_casamento TEXT NOT NULL DEFAULT '',
  local TEXT NOT NULL DEFAULT '',
  convidados INTEGER,
  obs TEXT NOT NULL DEFAULT '',
  itens TEXT NOT NULL DEFAULT '[]',
  total REAL NOT NULL DEFAULT 0,
  a_combinar INTEGER NOT NULL DEFAULT 0,
  com_idv INTEGER NOT NULL DEFAULT 0,
  valor_fechado REAL
)`;

let tabelaPronta = false;

// Cria a tabela na primeira chamada (não precisa rodar nada no painel da Cloudflare).
export async function db(env) {
  if (!env.DB) throw new Erro(503, "Banco D1 não conectado. Crie um banco D1 e faça o binding com o nome DB.");
  if (!tabelaPronta) {
    await env.DB.prepare(SCHEMA).run();
    tabelaPronta = true;
  }
  return env.DB;
}

export class Erro extends Error {
  constructor(status, mensagem) { super(mensagem); this.status = status; }
}

export function json(dados, status = 200) {
  return new Response(JSON.stringify(dados), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

export function tratarErro(e) {
  if (e instanceof Erro) return json({ erro: e.message }, e.status);
  console.error(e);
  return json({ erro: "Erro interno." }, 500);
}

// Compara a senha do painel sem vazar tempo de comparação.
export function autorizado(request, env) {
  const senha = env.PAINEL_SENHA;
  if (!senha) return false; // sem senha configurada, ninguém entra no painel (mas o site continua recebendo pedidos)
  const enviada = request.headers.get("x-senha") || "";
  const a = new TextEncoder().encode(enviada);
  const b = new TextEncoder().encode(senha);
  let dif = a.length ^ b.length;
  for (let i = 0; i < b.length; i++) dif |= (a[i] || 0) ^ b[i];
  return dif === 0;
}

export function exigirSenha(request, env) {
  if (!env.PAINEL_SENHA) throw new Erro(503, "Senha do painel não configurada (variável PAINEL_SENHA).");
  if (!autorizado(request, env)) throw new Erro(401, "Senha incorreta.");
}

export async function lerJson(request, limite = 32_000) {
  const texto = await request.text();
  if (texto.length > limite) throw new Erro(413, "Pedido grande demais.");
  try { return JSON.parse(texto || "{}"); } catch { throw new Erro(400, "JSON inválido."); }
}

export const txt = (v, max = 200) => String(v ?? "").trim().slice(0, max);
export const num = v => {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : null;
};
const ID_OK = /^[A-Za-z0-9-]{8,64}$/;
export function validarId(id) {
  if (!ID_OK.test(id || "")) throw new Erro(400, "ID inválido.");
  return id;
}

// Limpa a lista de itens que vem do site.
export function limparItens(itens) {
  if (!Array.isArray(itens)) return [];
  return itens.slice(0, 80).map(i => ({
    id: txt(i.id, 60),
    nome: txt(i.nome, 120),
    qtd: Math.max(1, Math.min(9999, Math.floor(num(i.qtd) || 1))),
    unidade: txt(i.unidade, 30),
    preco: num(i.preco),
    subtotal: num(i.subtotal),
  }));
}

// Converte uma linha do banco para o formato do painel.
export function linhaParaLead(r) {
  let itens = [];
  try { itens = JSON.parse(r.itens || "[]"); } catch {}
  return { ...r, itens, a_combinar: !!r.a_combinar, com_idv: !!r.com_idv };
}
