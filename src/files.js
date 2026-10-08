/** Loading and saving, replacing serve.py's /api/coord, /api/coords, /api/save.
 *
 * Three sources, in the order the UI tries them:
 *
 *   a local directory   picked once with showDirectoryPicker, remembered in
 *                       IndexedDB, written in place — what the Python server
 *                       did when it wrote straight into data/exp_raw/coord/.
 *                       Chromium only.
 *   the repo            cases/ and coord/ as committed, over plain fetch. The
 *                       only source a static host can offer, and read-only.
 *   a file the user
 *   hands over          file picker or drag-and-drop in, download out.
 *                       Works everywhere, and is the fallback when there is no
 *                       directory handle.
 */

const DB = 'gridview', STORE = 'handles', KEY = 'coordDir';

export const canPickDir = 'showDirectoryPicker' in globalThis;

/* Every IndexedDB call below is best-effort and time-limited. In a private
   window, with site data blocked, or in a browser running without a profile,
   indexedDB.open can reject — or simply never fire either callback — and
   remembering which folder to save into must never be able to stop the app
   from loading. On failure we behave exactly as if no folder had been picked. */
const IDB_TIMEOUT = 2000;

function idb() {
  return new Promise((res, rej) => {
    let settled = false;
    const finish = (fn, v) => { if (!settled) { settled = true; clearTimeout(timer); fn(v); } };
    const timer = setTimeout(() => finish(rej, new Error('indexedDB did not respond')), IDB_TIMEOUT);
    let r;
    try { r = indexedDB.open(DB, 1); } catch (e) { return finish(rej, e); }
    r.onupgradeneeded = () => r.result.createObjectStore(STORE);
    r.onsuccess = () => finish(res, r.result);
    r.onerror = () => finish(rej, r.error);
    r.onblocked = () => finish(rej, new Error('indexedDB blocked'));
  });
}

async function idbGet(key) {
  try {
    const db = await idb();
    return await new Promise((res, rej) => {
      const r = db.transaction(STORE, 'readonly').objectStore(STORE).get(key);
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    });
  } catch (e) {
    return undefined;
  }
}

async function idbPut(key, val) {
  try {
    const db = await idb();
    await new Promise((res, rej) => {
      const t = db.transaction(STORE, 'readwrite');
      t.objectStore(STORE).put(val, key);
      t.oncomplete = () => res();
      t.onerror = () => rej(t.error);
    });
    return true;
  } catch (e) {
    return false;
  }
}

/* ---- the remembered coordinate directory -------------------------------- */

let dirHandle = null;

/** The handle survives reloads but its permission does not: Chromium drops to
 *  'prompt' each session and re-granting needs a user gesture. `interactive`
 *  says whether we are inside one. */
export async function coordDir({ interactive = false } = {}) {
  if (!dirHandle) dirHandle = (await idbGet(KEY)) || null;
  if (!dirHandle) return null;
  const opts = { mode: 'readwrite' };
  let perm = await dirHandle.queryPermission(opts);
  if (perm === 'prompt' && interactive) perm = await dirHandle.requestPermission(opts);
  return perm === 'granted' ? dirHandle : null;
}

/** Ask for a directory and remember it. Must be called from a user gesture. */
export async function pickCoordDir() {
  const h = await showDirectoryPicker({ mode: 'readwrite', id: 'gridview-coord' });
  dirHandle = h;
  await idbPut(KEY, h);
  return h;
}

export async function forgetCoordDir() {
  dirHandle = null;
  await idbPut(KEY, undefined);
}

export async function dirName() {
  if (!dirHandle) dirHandle = (await idbGet(KEY)) || null;
  return dirHandle ? dirHandle.name : null;
}

/* ---- reading ------------------------------------------------------------ */

export async function fetchJSON(path) {
  const r = await fetch(path, { cache: 'no-cache' });
  if (!r.ok) throw new Error(`${path}: ${r.status}`);
  return r.json();
}

/** A coordinate CSV: the picked directory first, then the committed copy.
 *  Returns null when neither has it, which is not an error — it means "draw a
 *  fresh layout". */
export async function readCoord(name) {
  const dir = await coordDir();
  if (dir) {
    try {
      const fh = await dir.getFileHandle(name + '.csv');
      return { text: await (await fh.getFile()).text(), from: dir.name + '/' };
    } catch (e) { /* not in the directory; fall through to the repo */ }
  }
  const r = await fetch(`coord/${encodeURIComponent(name)}.csv`, { cache: 'no-cache' });
  return r.ok ? { text: await r.text(), from: 'coord/' } : null;
}

export async function listCoords() {
  const dir = await coordDir();
  if (dir) {
    const names = [];
    for await (const [n, h] of dir.entries()) {
      if (h.kind === 'file' && n.endsWith('.csv')) names.push(n.slice(0, -4));
    }
    if (names.length) return { files: names.sort(), from: dir.name + '/' };
  }
  try {
    return { ...(await fetchJSON('coord/index.json')), from: 'coord/' };
  } catch (e) {
    return { files: [], from: null };
  }
}

/* ---- writing ----------------------------------------------------------- */

/** Write in place if a directory is set, otherwise hand the file over. The
 *  return value says which happened, because the difference matters to whoever
 *  is about to go looking for the file. */
export async function saveCoord(name, csv) {
  const dir = await coordDir({ interactive: true });
  if (dir) {
    const fh = await dir.getFileHandle(name + '.csv', { create: true });
    const w = await fh.createWritable();
    await w.write(csv);
    await w.close();
    return { how: 'dir', where: `${dir.name}/${name}.csv` };
  }
  if ('showSaveFilePicker' in globalThis) {
    const fh = await showSaveFilePicker({
      suggestedName: name + '.csv',
      types: [{ description: 'bus coordinates', accept: { 'text/csv': ['.csv'] } }],
    });
    const w = await fh.createWritable();
    await w.write(csv);
    await w.close();
    return { how: 'picked', where: fh.name };
  }
  download(name + '.csv', csv, 'text/csv');
  return { how: 'download', where: name + '.csv' };
}

export function download(filename, text, type = 'text/plain') {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type }));
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

/** One local file, by picker where there is one and by <input> where there is
 *  not. Resolves to null if the user cancels. */
export async function openLocalFile(accept = '.csv,.json') {
  if ('showOpenFilePicker' in globalThis) {
    try {
      const [fh] = await showOpenFilePicker({ multiple: false });
      const f = await fh.getFile();
      return { name: f.name, text: await f.text() };
    } catch (e) {
      if (e.name === 'AbortError') return null;
      throw e;
    }
  }
  return new Promise(res => {
    const inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = accept;
    inp.onchange = async () => {
      const f = inp.files[0];
      res(f ? { name: f.name, text: await f.text() } : null);
    };
    inp.oncancel = () => res(null);
    inp.click();
  });
}
