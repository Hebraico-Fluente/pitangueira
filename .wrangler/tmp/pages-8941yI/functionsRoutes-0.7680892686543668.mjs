import { onRequestDelete as __api_leads__id__js_onRequestDelete } from "/home/user/pitangueira/functions/api/leads/[id].js"
import { onRequestPatch as __api_leads__id__js_onRequestPatch } from "/home/user/pitangueira/functions/api/leads/[id].js"
import { onRequestGet as __api_leads_index_js_onRequestGet } from "/home/user/pitangueira/functions/api/leads/index.js"
import { onRequestPost as __api_leads_index_js_onRequestPost } from "/home/user/pitangueira/functions/api/leads/index.js"

export const routes = [
    {
      routePath: "/api/leads/:id",
      mountPath: "/api/leads",
      method: "DELETE",
      middlewares: [],
      modules: [__api_leads__id__js_onRequestDelete],
    },
  {
      routePath: "/api/leads/:id",
      mountPath: "/api/leads",
      method: "PATCH",
      middlewares: [],
      modules: [__api_leads__id__js_onRequestPatch],
    },
  {
      routePath: "/api/leads",
      mountPath: "/api/leads",
      method: "GET",
      middlewares: [],
      modules: [__api_leads_index_js_onRequestGet],
    },
  {
      routePath: "/api/leads",
      mountPath: "/api/leads",
      method: "POST",
      middlewares: [],
      modules: [__api_leads_index_js_onRequestPost],
    },
  ]