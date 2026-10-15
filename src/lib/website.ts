import "server-only";
import { after } from "next/server";

export type WebsiteTag = "menu" | "promotions";

/**
 * Avisa a la página web que el menú o las promociones cambiaron para que
 * actualice su caché al instante. Se ejecuta después de responder
 * (`after`), así no hace esperar al personal.
 *
 * Requiere WEBSITE_REVALIDATE_URL y REVALIDATE_SECRET. Sin ellas, la web
 * igual se actualiza sola en pocos minutos.
 */
export function revalidateWebsite(tags: WebsiteTag[]) {
  const url = process.env.WEBSITE_REVALIDATE_URL;
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
