declare module 'pdf-parse/lib/pdf-parse.js' {
  interface PdfData {
    numpages: number;
    numrender: number;
    info: Record<string, unknown>;
    metadata: unknown;
    text: string;
    version: string;
  }

  function pdf(buffer: Buffer): Promise<PdfData>;
  export default pdf;
}
