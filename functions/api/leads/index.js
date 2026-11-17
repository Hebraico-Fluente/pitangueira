// /api/leads
//   POST  → o site registra um pedido (público) ou o painel cria um lead manual (com senha)
//   GET   → o painel lista os leads (com senha)
import {
  db, json, tratarErro, autorizado, exigirSenha, lerJson, txt, num,
  validarId, limparItens, linhaParaLead, STATUS, RESPONSAVEIS, Erro,
} from "../../../lib/leads.js";

const ORIGENS_MANUAIS = ["instagram", "whatsapp", "indicacao", "outro"];

// Aviso no celular quando chega pedido novo (app gratuito "ntfy").
// Ative criando a variável NTFY_TOPICO na Cloudflare com um nome secreto e difícil de adivinhar.
function avisarCelular(env, waitUntil, request, lead) {
  if (!env.NTFY_TOPICO || !waitUntil) return;
  const total = lead.total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const painel = new URL("/painel/", request.url).toString();
  waitUntil(fetch(`https://ntfy.sh/${encodeURIComponent(env.NTFY_TOPICO)}`, {
    method: "POST",
    headers: { Title: "Novo pedido no site", Tags: "orange_heart", Click: painel },
    body: `${lead.nome}: ${lead.itens} ${lead.itens === 1 ? "item" : "itens"}, ${total}${lead.aCombinar ? " + a combinar" : ""}`,
  }).catch(() => {}));
}

export async function onRequestPost({ request, env, waitUntil }) {
  try {
    const banco = await db(env);
    const b = await lerJson(request);
    const nome = txt(b.nome, 120);
    if (!nome) throw new Erro(400, "Informe o nome.");

    const agora = new Date().toISOString();
    const comum = {
      nome,
      whatsapp: txt(b.whatsapp, 30),
      data_casamento: /^\d{4}-\d{2}-\d{2}$/.test(b.data_casamento || "") ? b.data_casamento : "",
      local: txt(b.local, 160),
      convidados: num(b.convidados) === null ? null : Math.floor(num(b.convidados)),
      obs: txt(b.obs, 2000),
    };

    // Lead criado à mão no painel
    if (autorizado(request, env)) {
      const id = crypto.randomUUID();
      const status = STATUS.includes(b.status) ? b.status : "novo";
      await banco.prepare(
        `INSERT INTO leads (id, criado_em, atualizado_em, origem, status, responsavel, notas,
          nome, whatsapp, data_casamento, local, convidados, obs, itens, total, a_combinar, com_idv, valor_fechado)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
      ).bind(
        id, agora, agora,
        ORIGENS_MANUAIS.includes(b.origem) ? b.origem : "outro",
        status,
        RESPONSAVEIS.includes(b.responsavel) ? b.responsavel : "",
        txt(b.notas, 5000),
        comum.nome, comum.whatsapp, comum.data_casamento, comum.local, comum.convidados, comum.obs,
        "[]", num(b.total) || 0, 0, 0, num(b.valor_fechado),
      ).run();
      return json({ ok: true, id }, 201);
    }

    // Pedido vindo do site (público). O mesmo id atualiza o pedido se a cliente reenviar.
    const id = validarId(b.id);
    const itens = limparItens(b.itens);
    if (!itens.length) throw new Erro(400, "Nenhum item no pedido.");
    const total = itens.reduce((t, i) => t + (i.subtotal || 0), 0);
    const aCombinar = itens.some(i => i.subtotal === null) ? 1 : 0;
    const comIdv = itens.some(i => i.id === "identidade-visual") ? 1 : 0;
    const jaExistia = await banco.prepare("SELECT 1 FROM leads WHERE id = ?").bind(id).first();

    await banco.prepare(
      `INSERT INTO leads (id, criado_em, atualizado_em, origem, nome, whatsapp, data_casamento, local,
         convidados, obs, itens, total, a_combinar, com_idv)
       VALUES (?,?,?,'site',?,?,?,?,?,?,?,?,?,?)
       ON CONFLICT(id) DO UPDATE SET
         atualizado_em = excluded.atualizado_em, nome = excluded.nome, whatsapp = excluded.whatsapp,
         data_casamento = excluded.data_casamento, local = excluded.local, convidados = excluded.convidados,
         obs = excluded.obs, itens = excluded.itens, total = excluded.total,
         a_combinar = excluded.a_combinar, com_idv = excluded.com_idv
       WHERE leads.origem = 'site' AND leads.status = 'novo'`
    ).bind(
      id, agora, agora, comum.nome, comum.whatsapp, comum.data_casamento, comum.local,
      comum.convidados, comum.obs, JSON.stringify(itens), total, aCombinar, comIdv,
    ).run();
    if (!jaExistia) avisarCelular(env, waitUntil, request, { nome: comum.nome, itens: itens.length, total, aCombinar });
    return json({ ok: true }, 201);
  } catch (e) {
    return tratarErro(e);
  }
}

export async function onRequestGet({ request, env }) {
  try {
    exigirSenha(request, env);
    const banco = await db(env);
    const { results } = await banco.prepare(
      "SELECT * FROM leads ORDER BY criado_em DESC LIMIT 2000"
    ).all();
    return json({ leads: results.map(linhaParaLead) });
  } catch (e) {
    return tratarErro(e);
  }
}
