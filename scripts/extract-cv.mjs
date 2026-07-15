// Extractor puntual del CV (docx -> texto plano + HTML) para análisis previo al seed.
// Uso: node scripts/extract-cv.mjs
import mammoth from 'mammoth';
import { writeFileSync } from 'node:fs';

const input = 'c:/Users/david/Documents/Projects/portfolio/es-cv_davidmr.docx';
const out = 'C:/Users/david/AppData/Local/Temp/claude/c--Users-david-Documents-Projects-portfolio/91578522-bb3e-41c7-a679-40e6dfd6b33d/scratchpad';

const html = await mammoth.convertToHtml({ path: input });
writeFileSync(out + '/cv.html', html.value, 'utf8');

const text = await mammoth.extractRawText({ path: input });
writeFileSync(out + '/cv.txt', text.value, 'utf8');

console.log('HTML length:', html.value.length);
console.log('TEXT length:', text.value.length);
