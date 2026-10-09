import { Marked } from 'marked';
import { renderInlineMarkup } from './inline-markup';
import { CV_ARROW_SVG } from './cv-format';

const escapeAttribute = (text: string) => text.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const markdown = new Marked({
  async: false,
  breaks: true,
  renderer: {
    // Existing, attribute-free emphasis remains valid; other raw HTML is escaped.
    html({ text }) { return renderInlineMarkup(text); },
    link({ href, title, tokens }) {
      const label = this.parser.parseInline(tokens);
      if (!/^(https?:\/\/|mailto:|\/(?!\/)|#)/i.test(href)) return label;
      return `<a href="${escapeAttribute(href)}"${title ? ` title="${escapeAttribute(title)}"` : ''}>${label}${CV_ARROW_SVG}</a>`;
    },
    image({ text }) { return renderInlineMarkup(text); },
    heading({ tokens }) { return `<h4>${this.parser.parseInline(tokens)}</h4>\n`; }
  }
});

/** Shared rendering for CV prose in the preview and the printable document. */
export const renderCvMarkdown = (body: string): string => markdown.parse(body) as string;
