// utils/extractclient.js
// Node 18+ (global fetch, FormData, Blob available)

export async function extractSlides({
    filename,
    buffer,
    extractorUrl = process.env.EXTRACTOR_URL,
    timeoutMs = 60_000
  }) {
    if (!extractorUrl) throw new Error('EXTRACTOR_URL is missing in .env');
    if (!filename || !buffer) throw new Error('filename or buffer missing');
  
    const isPdf = filename.toLowerCase().endsWith('.pdf');
    const mime = isPdf
      ? 'application/pdf'
      : 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
  
    // Build multipart/form-data with the file
    const fd = new FormData();
    const blob = new Blob([buffer], { type: mime });
    fd.append('file', blob, filename);
  
    // Timeout guard (AbortController)
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
  
    let res;
    try {
      res = await fetch(extractorUrl, {
        method: 'POST',
        body: fd,
        signal: ctrl.signal
      });
    } catch (err) {
      clearTimeout(t);
      const reason = err.name === 'AbortError' ? `timeout after ${timeoutMs}ms` : String(err);
      throw new Error(`Extractor request failed: ${reason}`);
    }
    clearTimeout(t);
  
    if (!res.ok) {
      const text = await safeText(res);
      throw new Error(`Extractor ${res.status}: ${text || 'no body'}`);
    }
  
    const json = await safeJson(res);
    // Basic shape check
    if (!json || !Array.isArray(json.slides)) {
      throw new Error('Extractor returned unexpected shape (no slides array)');
    }
    return json; // { slides: [...], count }
  }
  
  // ---- helpers ----
  async function safeText(res) {
    try { return await res.text(); } catch { return ''; }
  }
  async function safeJson(res) {
    try { return await res.json(); } catch { return null; }
  }
  