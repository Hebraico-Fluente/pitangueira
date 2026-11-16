// /api/leads/:id
//   PATCH  → o painel atualiza status, responsável, notas e dados do lead (com senha)
//   DELETE → o painel exclui o lead (com senha)
import {
  db, json, tratarErro, exigirSenha, lerJson, txt, num, validarId, linhaParaLead,
  STATUS, RESPONSAVEIS, Erro,
} from "../../../lib/leads.js";

// Campos que o painel pode editar e como limpar cada um
const EDITAVEIS = {
  status: v => { if (!STATUS.includes(v)) throw new Erro(400, "Status inválido."); return v; },
  responsavel: v => { if (!RESPONSAVEIS.includes(v)) throw new Erro(400, "Responsável inválido."); return v; },
  notas: v => txt(v, 5000),
  nome: v => { const n = txt(v, 120); if (!n) throw new Erro(400, "Informe o nome."); return n; },
  whatsapp: v => txt(v, 30),
  data_casamento: v => (/^\d{4}-\d{2}-\d{2}$/.test(v || "") ? v : ""),
  local: v => txt(v, 160),
  convidados: v => (num(v) === null ? null : Math.floor(num(v))),
  valor_fechado: v => num(v),
  total: v => num(v) || 0,
};

export async function onRequestPatch({ request, env, params }) {
  try {
    exigirSenha(request, env);
    const id = validarId(params.id);
    const banco = await db(env);
    const b = await lerJson(request);

    const sets = [], valores = [];
    for (const [campo, limpar] of Object.entries(EDITAVEIS)) {
      if (campo in b) { sets.push(`${campo} = ?`); valores.push(limpar(b[campo])); }
    }
    if (!sets.length) throw new Erro(400, "Nada para atualizar.");
    sets.push("atualizado_em = ?");
    valores.push(new Date().toISOString());

    const r = await banco.prepare(`UPDATE leads SET ${sets.join(", ")} WHERE id = ?`).bind(...valores, id).run();
    if (!r.meta.changes) throw new Erro(404, "Lead não encontrado.");
    const lead = await banco.prepare("SELECT * FROM leads WHERE id = ?").bind(id).first();
    return json({ lead: linhaParaLead(lead) });
  } catch (e) {
    return tratarErro(e);
  }
}

export async function onRequestDelete({ request, env, params }) {
  try {
    exigirSenha(request, env);
    const id = validarId(params.id);
    const banco = await db(env);
    const r = await banco.prepare("DELETE FROM leads WHERE id = ?").bind(id).run();
    if (!r.meta.changes) throw new Erro(404, "Lead não encontrado.");
    return json({ ok: true });
  } catch (e) {
    return tratarErro(e);
  }
}
