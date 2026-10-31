/**
 * Dirección a la que vuelven los enlaces de los correos. PUBLIC_SITE_URL permite fijar el
 * sitio real, y así un registro hecho en local o en una vista previa no apunta a esa dirección.
 * Supabase además debe tener esta dirección en Authentication > URL Configuration.
 */
export function siteUrl(path: string): string {
  const configured = (import.meta.env.PUBLIC_SITE_URL as string | undefined)?.replace(/\/$/, '')
  return `${configured || window.location.origin}${path}`
}
