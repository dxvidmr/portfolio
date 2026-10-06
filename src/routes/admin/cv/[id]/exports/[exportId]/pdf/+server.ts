import { error } from '@sveltejs/kit';
import { getCvExport } from '$lib/server/admin/cvs';
import { cvId } from '$lib/server/admin/cv-route';
import { renderCvPdf } from '$lib/server/admin/cv-pdf';
import type { RequestHandler } from './$types';

export const config = { runtime: 'nodejs22.x', maxDuration: 60, split: true };

export const GET: RequestHandler = async ({ params, url, cookies }) => {
  const id = cvId(params.id);
  const exportId = cvId(params.exportId);
  await getCvExport(id, exportId);
  // The admin guard protects both this download and the HTML rendered by Chromium.
  const documentUrl = new URL(`/admin/cv/${id}/exports/${exportId}`, url.origin);
  try {
    const pdf = await renderCvPdf(documentUrl, cookies.getAll());
    return new Response(Buffer.from(pdf), {
      headers: {
        'content-type': 'application/pdf',
        'content-disposition': `attachment; filename="cv-${id}-version-${exportId}.pdf"`,
        'cache-control': 'private, no-store'
      }
    });
  } catch (cause) {
    console.error('[cv] PDF', cause);
    error(500, 'No se pudo generar el PDF. Vuelve a intentarlo.');
  }
};
