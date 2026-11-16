// Ponto de entrada para Cloudflare Workers (fluxo padrão "Import a repository").
// Serve o site da pasta public/ e encaminha /api/leads para as mesmas funções
// usadas no Cloudflare Pages (pasta functions/).
import * as lista from "../functions/api/leads/index.js";
import * as item from "../functions/api/leads/[id].js";

const METODOS = { GET: "onRequestGet", POST: "onRequestPost", PATCH: "onRequestPatch", DELETE: "onRequestDelete" };

function despachar(modulo, request, env, params = {}) {
  const fn = modulo[METODOS[request.method]];
  if (!fn) return new Response(JSON.stringify({ erro: "Método não permitido." }), {
    status: 405, headers: { "content-type": "application/json; charset=utf-8" },
  });
  return fn({ request, env, params });
}

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    // Diagnóstico: mostra só os NOMES das configurações (nunca os valores).
    if (pathname === "/api/status") {
      return new Response(JSON.stringify({
        banco: !!env.DB,
        senha_configurada: !!env.PAINEL_SENHA,
        variaveis: Object.keys(env).filter(k => k !== "DB" && k !== "ASSETS"),
      }), { headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
    }
    if (pathname === "/api/leads" || pathname === "/api/leads/") return despachar(lista, request, env);
    const m = pathname.match(/^\/api\/leads\/([^/]+)\/?$/);
    if (m) return despachar(item, request, env, { id: decodeURIComponent(m[1]) });
    return env.ASSETS.fetch(request);
  },
};
