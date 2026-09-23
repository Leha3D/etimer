/* ETimer PDF export. Pure data/layout functions, shared by the browser and tests. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.ETimerPDF = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const ROWS_PER_PAGE = 30;
  const COLS = [18.96, 66.96, 128.42, 201.89, 392.23, 428.98, 465.70, 502.42, 590.04];
  const MONTHS = ['Jaanuar', 'Veebruar', 'Märts', 'Aprill', 'Mai', 'Juuni', 'Juuli', 'August', 'September', 'Oktoober', 'November', 'Detsember'];
  const pad = n => String(n).padStart(2, '0');
  const clean = value => String(value ?? '').normalize('NFC').replace(/[\u0000-\u001f\u007f]/g, ' ').trim();

  function monthRange(month) {
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month) || +month.slice(0, 4) < 1900 || +month.slice(0, 4) > 9998) throw new Error('Invalid month');
    const [year, m] = month.split('-').map(Number);
    return { start: month + '-01', end: `${m === 12 ? year + 1 : year}-${pad(m === 12 ? 1 : m + 1)}-01` };
  }
  function time(value) {
    if (value == null || value === '') return '';
    const match = String(value).match(/^(\d{2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?$/);
    if (!match || +match[1] > 23 || +match[2] > 59 || +(match[3] || 0) > 59) throw new Error('Invalid record time');
    return `${match[1]}:${match[2]}:${match[3] || '00'}`;
  }
  function duration(start, end, saved) {
    if (saved != null && saved !== '') {
      const value = Number(saved);
      if (!Number.isFinite(value) || value < 0) throw new Error('Invalid record duration');
      return formatSeconds(value);
    }
    if (!start && !end) return '';
    if (!start || !end) throw new Error('Incomplete record time');
    const seconds = v => v.split(':').reduce((a, b) => a * 60 + Number(b), 0);
    const delta = seconds(end) - seconds(start);
    return formatSeconds(delta < 0 ? delta + 86400 : delta);
  }
  function formatSeconds(value) {
    const s = Math.round(value);
    return `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}`;
  }
  async function fetchAll(queryFactory, check = () => {}) {
    const all = [], size = 500;
    for (let offset = 0; ; offset += size) {
      check();
      const { data, error } = await queryFactory().range(offset, offset + size - 1);
      check();
      if (error) throw error;
      if (!Array.isArray(data)) throw new Error('Missing database response');
      all.push(...data);
      if (data.length < size) return all;
    }
  }
  function prepare({ records, profiles, departments, companyId, month, type, scope, target }) {
    monthRange(month);
    if (!['timer', 'manual'].includes(type) || !['worker', 'department'].includes(scope) || !companyId || !target) throw new Error('Invalid export selection');
    const names = new Map(profiles.map(p => [String(p.id), p]));
    const deps = new Map(departments.map(d => [String(d.id), clean(d.name)]));
    const groups = new Map(), seen = new Set();
    let legacyQuantity = 0;
    const sorted = [...records].sort((a, b) => String(a.work_date).localeCompare(String(b.work_date)) || String(a.start_time || '').localeCompare(String(b.start_time || '')) || String(a.id).localeCompare(String(b.id)));
    for (const r of sorted) {
      // Fail closed: never silently include another company, month or selected scope.
      if (r.company_id !== companyId || !String(r.work_date).startsWith(month + '-') ||
          (scope === 'worker' && r.user_id !== target) ||
          (scope === 'department' && (target === '__none__' ? r.department_id != null : r.department_id !== target))) throw new Error('Record outside export selection');
      if (!r.id || seen.has(r.id)) throw new Error('Duplicate or missing record ID; retry export');
      seen.add(r.id);
      const profile = names.get(String(r.user_id));
      if (!profile || !clean(profile.name)) throw new Error('Worker profile is unavailable');
      const name = clean(profile.name);
      if (!groups.has(r.user_id)) groups.set(r.user_id, { id: r.user_id, name, rows: [] });
      const start = time(r.start_time), end = time(r.end_time);
      const rawQuantity = String(r.quantity_or_notes ?? '');
      const validQuantity = /^\d*$/.test(rawQuantity);
      if (type === 'manual' && !validQuantity) legacyQuantity++;
      const dateParts = String(r.work_date).split('-');
      groups.get(r.user_id).rows.push({ id: r.id, cells: [
        `${dateParts[2]}.${dateParts[1]}.${dateParts[0]}`,
        [start, end].filter(Boolean).join('\n'),
        r.department_id ? (deps.get(String(r.department_id)) || '-') : '-',
        clean(type === 'timer' ? r.store_name : r.work_type) || '-',
        duration(start, end, type === 'timer' ? (r.duration_seconds ?? r.assembly_seconds) : null),
        type === 'manual' && validQuantity ? rawQuantity : '', '', ''
      ] });
    }
    return { groups: [...groups.values()].sort((a, b) => a.name.localeCompare(b.name, 'et') || String(a.id).localeCompare(String(b.id))), legacyQuantity, recordCount: records.length, month, type };
  }
  function wrap(text, font, size, width) {
    const lines = [];
    for (const paragraph of String(text).split('\n')) {
      if (!paragraph) { lines.push(''); continue; }
      let line = '';
      for (const char of paragraph) {
        if (font.widthOfTextAtSize(line + char, size) > width) {
          const space = line.lastIndexOf(' ');
          if (space > 0) { lines.push(line.slice(0, space)); line = line.slice(space + 1); }
          else { lines.push(line); line = ''; }
        }
        line += char;
      }
      lines.push(line.trim());
    }
    return lines;
  }
  function planPages(group, font) {
    const pages = []; let page = [];
    for (const row of group.rows) {
      const sizes = row.cells.map((value, col) => {
        // Keep single-line date/duration legible in the narrow original columns.
        if ([0, 4, 5].includes(col)) return Math.max(6.5, Math.min(8, 8 * (COLS[col + 1] - COLS[col] - 5) / Math.max(1, font.widthOfTextAtSize(value, 8))));
        return 8;
      });
      const lines = row.cells.map((text, i) => text ? wrap(text, font, sizes[i], COLS[i + 1] - COLS[i] - 5) : []);
      const count = Math.max(1, ...lines.map(list => Math.ceil(list.length / 2)));
      if (page.length && count <= ROWS_PER_PAGE && page.length + count > ROWS_PER_PAGE) { pages.push(page); page = []; }
      for (let part = 0; part < count; part++) {
        if (page.length === ROWS_PER_PAGE) { pages.push(page); page = []; }
        page.push({ id: row.id, sizes, cells: lines.map(list => list.slice(part * 2, part * 2 + 2)) });
      }
    }
    if (page.length) pages.push(page);
    return pages;
  }
  async function build(prepared, { PDFLib, fontkit, templateBytes, fontBytes }) {
    const { PDFDocument } = PDFLib;
    if (!prepared.groups.length) throw new Error('No records');
    const pdf = await PDFDocument.create();
    pdf.registerFontkit(fontkit);
    const font = await pdf.embedFont(fontBytes, { subset: true });
    const supported = new Set(font.getCharacterSet());
    const allText = prepared.groups.flatMap(g => [g.name, ...g.rows.flatMap(r => r.cells)]).join('');
    for (const char of allText) if (char !== '\n' && !supported.has(char.codePointAt(0))) throw new Error(`Unsupported PDF character: ${char}`);
    const blank = await PDFDocument.load(templateBytes);
    if (blank.getPageCount() !== 1) throw new Error('Invalid PDF template');
    const [background] = await pdf.embedPages([blank.getPage(0)]);
    const [year, month] = prepared.month.split('-').map(Number);
    const pageCounts = [];
    for (const group of prepared.groups) {
      const pages = planPages(group, font);
      pageCounts.push({ id: group.id, name: group.name, pages: pages.length, records: group.rows.length });
      for (let n = 0; n < pages.length; n++) {
        const p = pdf.addPage([612, 792]);
        p.drawPage(background);
        let nameSize = 10;
        while (font.widthOfTextAtSize(group.name, nameSize) > 305 && nameSize > 6.5) nameSize -= .25;
        if (font.widthOfTextAtSize(group.name, nameSize) > 305) throw new Error('Worker name is too long for this form');
        p.drawText(group.name, { x: 82, y: 720, font, size: nameSize });
        p.drawText(`${MONTHS[month - 1]} ${year}`, { x: 82, y: 699, font, size: 10 });
        for (let i = 0; i < pages[n].length; i++) {
          const row = pages[n][i], top = 141.26 + i * 19.56, bottom = 159.98 + i * 19.56;
          for (let col = 0; col < row.cells.length; col++) {
            const lines = row.cells[col], size = row.sizes[col];
            let y = 792 - (top + bottom) / 2 + (lines.length - 1) * (size + 1) / 2 - size * .32;
            for (const text of lines) {
              const width = font.widthOfTextAtSize(text, size);
              const x = [0, 1, 4, 5].includes(col) ? (COLS[col] + COLS[col + 1] - width) / 2 : COLS[col] + 3;
              p.drawText(text, { x, y, font, size }); y -= size + 1;
            }
          }
        }
        const number = `${n + 1}/${pages.length}`;
        p.drawText(number, { x: 590 - font.widthOfTextAtSize(number, 10), y: 25, size: 10, font });
      }
    }
    pdf.setTitle(`ETimer ${prepared.month} - ${prepared.type === 'timer' ? 'Taimer' : 'Käsitsi tehtud töö'}`);
    pdf.setAuthor('ETimer');
    return { bytes: await pdf.save(), pageCounts, pages: pdf.getPageCount() };
  }
  return { ROWS_PER_PAGE, monthRange, fetchAll, prepare, planPages, build, time, duration, formatSeconds };
});
