export function isFutureDate(date: string, today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Madrid' })) {
  return /^\d{4}(?:-\d{2}(?:-\d{2})?)?$/.test(date) && date > today.slice(0, date.length);
}
export function meritPeriod(start: string, end: string, language: 'es'|'en', today?: string) {
  const year = (date: string) => date.match(/^\d{4}/)?.[0] || '';
  const first=year(start), last=year(end);
  if (!first && !last) return '';
  if (!end) return `${first}-${language==='en' ? 'present' : 'actualidad'}`;
  const period=first && first!==last ? `${first}-${last}` : last;
  return isFutureDate(end,today) ? `${period} (${language==='en' ? 'expected end' : 'fin previsto'})` : period;
}
