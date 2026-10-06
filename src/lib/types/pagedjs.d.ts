declare module 'pagedjs' {
  export class Previewer {
    preview(content: Node, stylesheets: Record<string, string>[], renderTo: HTMLElement): Promise<{ total: number }>;
    polisher: { destroy(): void };
    chunker: { destroy(): void; pages: { removeListeners(): void }[] };
  }
}
