import "server-only";
import { after } from "next/server";

export type WebsiteTag = "menu" | "promotions";

/** Acepta la URL del endpoint o solo la de la web (se completa con /api/revalidate). */
function revalidateUrl() {
  const raw = process.env.WEBSITE_REVALIDATE_URL || process.env.WEBSITE_URL;
  if (!raw) return null;
  try {
    const url = new URL(raw.trim());
    if (url.pathname === "/" || url.pathname === "") url.pathname = "/api/revalidate";
    return url.toString();
  } catch {
    return null;
  }
}

/**
 * Avisa a la página web que el menú o las promociones cambiaron para que
 * actualice su caché al instante. Se ejecuta después de responder
 * (`after`), así no hace esperar al personal.
 *
 * Requiere REVALIDATE_SECRET y WEBSITE_REVALIDATE_URL (o WEBSITE_URL). Sin
 * ellas, la web igual se actualiza sola en un minuto.
 */
export function revalidateWebsite(tags: WebsiteTag[]) {
  const url = revalidateUrl();
  const secret = process.env.REVALIDATE_SECRET;
  if (!url || !secret) return;

  after(async () => {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${secret}` },
        body: JSON.stringify({ tags }),
      });
      if (!response.ok) console.error(`[web] revalidación falló: ${response.status}`);
    } catch (error) {
      console.error("[web] no se pudo avisar a la página web", error);
    }
  });
}
