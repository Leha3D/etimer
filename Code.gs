const SPREADSHEET_ID = '1nWGgzcg8KZFzflutG43A1S2-4cl9N-6VJ930zt9R1-c';

const MONTHS = [
  'Январь','Февраль','Март','Апрель','Май','Июнь',
  'Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'
];

function timeSerial_(value) {
  const s = String(value || '').trim();

  // TimerAI sends: YYYY-MM-DD HH:mm:ss
  let m = s.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?/);

  // Also accept ISO input for compatibility.
  if (!m) {
    m = s.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?/);
  }

  if (!m) {
    throw new Error('Неверный формат времени: ' + s);
  }

  const h = Number(m[4]);
  const min = Number(m[5]);
  const sec = Number(m[6] || 0);

  if (h > 23 || min > 59 || sec > 59) {
    throw new Error('Неверное время: ' + s);
  }

  return (h * 3600 + min * 60 + sec) / 86400;
}

function saveRecord_(p) {
  if (!p.date || !p.start || !p.end || !p.store || !p.worker) {
    throw new Error('Нужно указать дату, начало, конец, магазин и работника.');
  }

  // Prevent duplicate writes when the browser submits the same record twice
  // because of a lag/retry. Only one save can run at a time.
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const date = new Date(p.date + 'T12:00:00');
    const monthName = MONTHS[date.getMonth()];
    const sheet = ss.getSheetByName(monthName);

    if (!sheet) {
      throw new Error('Не найден лист месяца: ' + monthName);
    }

    const start = timeSerial_(p.start);
    const end = timeSerial_(p.end);
    const worker = String(p.worker).trim();
    const department = String(p.department || '').trim();
    const store = String(p.store).trim();

    // Clean any exact duplicates already present in this month before adding.
    removeDuplicateRecords_(sheet);

    // If the exact same record is already present, do not create another row.
    const existingRow = findRecordRow_(sheet, date, start, end, worker, department, store);
    if (existingRow !== null) {
      updateWorkerSummary_(sheet);
      return {
        ok: true,
        duplicate: true,
        message: 'Такая запись уже существует',
        sheet: monthName,
        row: existingRow
      };
    }

    const lastRow = Math.max(sheet.getLastRow(), 2);
    let row = lastRow + 1;

    if (lastRow >= 3) {
      const values = sheet.getRange(3, 2, lastRow - 2, 6).getValues();

      for (let i = 0; i < values.length; i++) {
        if (values[i].every(v => v === '' || v === null)) {
          row = i + 3;
          break;
        }
      }
    }

    sheet.getRange(row, 2, 1, 6).setValues([[
      date,
      start,
      end,
      worker,
      department,
      store
    ]]);

    sheet.getRange(row, 2).setNumberFormat('dd.MM.yyyy');
    sheet.getRange(row, 3, 1, 2).setNumberFormat('HH:mm:ss');

    // H = assembly duration.
    const assemblyCell = sheet.getRange(row, 8);
    if (!assemblyCell.getFormula()) {
      assemblyCell.setFormula(`=D${row}-C${row}`);
      assemblyCell.setNumberFormat('[h]:mm:ss');
    }

    // Final duplicate cleanup and summary rebuild.
    removeDuplicateRecords_(sheet);
    updateWorkerSummary_(sheet);

    return {
      ok: true,
      duplicate: false,
      message: 'Запись добавлена',
      sheet: monthName,
      row: row
    };
  } finally {
    lock.releaseLock();
  }
}

function recordKey_(dateValue, startValue, endValue, worker, department, store) {
  const dateText = dateValue instanceof Date
    ? Utilities.formatDate(dateValue, Session.getScriptTimeZone(), 'yyyy-MM-dd')
    : String(dateValue || '').trim();

  const startSeconds = timeValueToSeconds_(startValue);
  const endSeconds = timeValueToSeconds_(endValue);

  return [
    dateText,
    startSeconds == null ? '' : startSeconds,
    endSeconds == null ? '' : endSeconds,
    String(worker || '').trim(),
    String(department || '').trim(),
    String(store || '').trim()
  ].join('|');
}

function findRecordRow_(sheet, dateValue, startValue, endValue, worker, department, store) {
  const lastRow = Math.max(sheet.getLastRow(), 2);
  if (lastRow < 3) return null;

  const values = sheet.getRange(3, 2, lastRow - 2, 7).getValues();
  const wanted = recordKey_(dateValue, startValue, endValue, worker, department, store);

  for (let i = 0; i < values.length; i++) {
    const r = values[i];
    if (!(r[0] instanceof Date)) continue;

    const key = recordKey_(r[0], r[1], r[2], r[3], r[4], r[5]);
    if (key === wanted) return i + 3;
  }

  return null;
}

function removeDuplicateRecords_(sheet) {
  const lastRow = Math.max(sheet.getLastRow(), 2);
  if (lastRow < 3) return 0;

  const values = sheet.getRange(3, 2, lastRow - 2, 7).getValues();
  const seen = new Set();
  const duplicateRows = [];

  for (let i = 0; i < values.length; i++) {
    const r = values[i];
    const rowNumber = i + 3;
    const worker = String(r[3] || '').trim();

    // Ignore completely blank rows and rows without a worker/date.
    if (!worker || !(r[0] instanceof Date)) continue;

    const key = recordKey_(r[0], r[1], r[2], r[3], r[4], r[5]);

    if (seen.has(key)) {
      duplicateRows.push(rowNumber);
    } else {
      seen.add(key);
    }
  }

  // Delete from bottom to top so row numbers remain valid.
  for (let i = duplicateRows.length - 1; i >= 0; i--) {
    sheet.deleteRow(duplicateRows[i]);
  }

  return duplicateRows.length;
}

function cleanupDuplicateRecordsAllMonths() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let removed = 0;

  MONTHS.forEach(name => {
    const sheet = ss.getSheetByName(name);
    if (!sheet) return;
    removed += removeDuplicateRecords_(sheet);
    updateWorkerSummary_(sheet);
  });

  return `Готово. Удалено дубликатов: ${removed}`;
}

function updateWorkerSummary_(sheet) {
  if (sheet.getMaxColumns() < 11) return;

  const lastDataRow = Math.max(sheet.getLastRow(), 2);
  const names = [];
  const totals = new Map();

  // Read real worker/time values and calculate totals in Apps Script.
  // This avoids locale-dependent Google Sheets formulas (comma vs semicolon)
  // and guarantees seconds are preserved.
  if (lastDataRow >= 3) {
    const rows = sheet.getRange(3, 3, lastDataRow - 2, 3).getValues();

    rows.forEach(row => {
      const startValue = row[0]; // C
      const endValue = row[1];   // D
      const worker = String(row[2] || '').trim(); // E
      if (!worker) return;

      if (!totals.has(worker)) {
        totals.set(worker, 0);
        names.push(worker);
      }

      const startSeconds = timeValueToSeconds_(startValue);
      const endSeconds = timeValueToSeconds_(endValue);

      if (startSeconds != null && endSeconds != null) {
        let duration = endSeconds - startSeconds;
        if (duration < 0) duration += 86400;
        totals.set(worker, totals.get(worker) + duration);
      }
    });
  }

  // Header stays in J:K.
  sheet.getRange(2, 10).setValue('общее время');
  sheet.getRange(3, 10).setValue('Имя работника');
  sheet.getRange(3, 11).setValue('Общее время');

  // Clear old summary values, including any previous broken formulas.
  const maxSummaryRows = Math.max(sheet.getMaxRows() - 3, 1);
  sheet.getRange(4, 10, maxSummaryRows, 2).clearContent();

  if (!names.length) return;

  // Write values, not formulas, so the summary is independent of sheet locale.
  const rows = names.map(name => [name, totals.get(name) / 86400]);
  sheet.getRange(4, 10, rows.length, 2).setValues(rows);
  sheet.getRange(4, 11, rows.length, 1).setNumberFormat('[h]:mm:ss');
}

function timeValueToSeconds_(value) {
  if (value instanceof Date) {
    const text = Utilities.formatDate(value, Session.getScriptTimeZone(), 'HH:mm:ss');
    const m = text.match(/^(\d{2}):(\d{2}):(\d{2})$/);
    return m ? Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]) : null;
  }

  if (typeof value === 'number') {
    return Math.round((value - Math.floor(value)) * 86400);
  }

  const text = String(value || '').trim();
  const m = text.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  return m ? Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3] || 0) : null;
}

function rebuildAllWorkerSummaries() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let changed = 0;

  MONTHS.forEach(name => {
    const sheet = ss.getSheetByName(name);
    if (!sheet) return;
    updateWorkerSummary_(sheet);
    changed++;
  });

  return `Готово. Сводки обновлены на листах: ${changed}`;
}

function parseDurationTextToSeconds_(value) {
  const text = String(value || '').trim();
  const m = text.match(/^(\d{1,3}):([0-5]\d):([0-5]\d)$/);
  if (!m) return null;
  return Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]);
}

function listRecords_(p) {
  if (!p.worker) throw new Error('Не выбран работник.');

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const result = [];

  function toTimeSeconds_(value) {
    if (value instanceof Date) {
      const text = Utilities.formatDate(value, Session.getScriptTimeZone(), 'HH:mm:ss');
      const m = text.match(/^(\d{2}):(\d{2}):(\d{2})$/);
      return m ? Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]) : null;
    }
    if (typeof value === 'number') {
      return Math.round((value - Math.floor(value)) * 86400);
    }
    const text = String(value || '').trim();
    const m = text.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
    return m ? Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3] || 0) : null;
  }

  ss.getSheets().forEach(sheet => {
    const name = sheet.getName();
    if (name === 'Ошибки') return;

    const last = Math.max(sheet.getLastRow(), 2);
    if (last < 3) return;

    // Use display values for date/time fields so ETimer sees exactly what is shown
    // in Google Sheets, independent of the Apps Script project timezone.
    const range = sheet.getRange(3, 2, last - 2, 7);
    const values = range.getValues();
    const display = range.getDisplayValues();

    values.forEach((r, i) => {
      const rowNumber = i + 3;
      const dateValue = r[0];
      const displayRow = display[i];
      const worker = String(displayRow[3] || r[3] || '').trim();

      if (!worker || !(dateValue instanceof Date) || worker !== String(p.worker).trim()) return;

      // B, C, D, E, F, G, H correspond to displayRow[0..6].
      const date = String(displayRow[0] || '').trim();
      const start = String(displayRow[1] || '').trim();
      const end = String(displayRow[2] || '').trim();

      // Always derive the duration from the actual start/end values first.
      // This avoids losing seconds or getting 0 when the duration/formula cell
      // is returned by Apps Script as a Date object instead of a number.
      const startSec = toTimeSeconds_(r[1]);
      const endSec = toTimeSeconds_(r[2]);
      let durationSeconds = 0;
      if (startSec != null && endSec != null) {
        durationSeconds = Math.max(0, endSec - startSec + (endSec < startSec ? 86400 : 0));
      } else {
        const displayDuration = parseDurationTextToSeconds_(displayRow[6]);
        if (displayDuration != null) durationSeconds = displayDuration;
      }

      const duration = `${Math.floor(durationSeconds / 3600)}:${String(Math.floor(durationSeconds % 3600 / 60)).padStart(2, '0')}:${String(durationSeconds % 60).padStart(2, '0')}`;

      result.push({
        sheet: name,
        row: rowNumber,
        date: date,
        start: start,
        end: end,
        worker: worker,
        department: r[4] || '',
        store: r[5] || '',
        assembly: duration,
        duration: duration,
        durationSeconds: durationSeconds
      });
    });
  });

  result.sort((a, b) => {
    const ad = String(a.date || '').split('.').reverse().join('');
    const bd = String(b.date || '').split('.').reverse().join('');
    if (ad !== bd) return bd.localeCompare(ad);
    const at = toSecondsForSort_(a.start);
    const bt = toSecondsForSort_(b.start);
    return bt - at;
  });

  return { ok: true, records: result.slice(0, 300) };
}


function listErrors_(p) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Ошибки');
  if (!sheet || sheet.getLastRow() < 2) {
    return { ok: true, errors: [] };
  }

  const values = sheet.getRange(2, 1, sheet.getLastRow() - 1, 8).getDisplayValues();
  const errors = values.map((r, i) => ({
    row: i + 2,
    date: r[0] || '',
    worker: r[1] || '',
    store: r[2] || '',
    start: r[3] || '',
    end: r[4] || '',
    assembly: r[5] || '',
    reason: r[6] || '',
    comment: r[7] || ''
  })).filter(e => e.date || e.worker || e.reason || e.comment);

  return { ok: true, errors };
}

function toSecondsForSort_(value) {
  const m = String(value || '').match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  return m ? Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3] || 0) : 0;
}

function reportError_(p) {
  if (!p.sheet || !p.row || !p.worker || !p.reason) {
    throw new Error('Не хватает данных для сообщения об ошибке.');
  }

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const source = ss.getSheetByName(String(p.sheet));
  if (!source) throw new Error('Исходный лист не найден.');

  const row = Number(p.row);
  if (!Number.isInteger(row) || row < 3 || row > source.getMaxRows()) {
    throw new Error('Неверная строка записи.');
  }

  const r = source.getRange(row, 2, 1, 7).getDisplayValues()[0];
  const recordDate = (r[0] || '').trim();
  const recordStart = r[1] || '';
  const recordEnd = r[2] || '';
  const recordWorker = (r[3] || '').trim();
  const recordStore = r[5] || '';
  const recordAssembly = r[6] || '';

  if (!recordDate || recordWorker !== String(p.worker).trim()) {
    throw new Error('Выбранная запись не принадлежит указанному работнику.');
  }

  let sheet = ss.getSheetByName('Ошибки');

  if (!sheet) {
    sheet = ss.insertSheet('Ошибки');
  }

  if (sheet.getMaxColumns() >= 10) {
    sheet.getRange(1, 9, sheet.getMaxRows(), 2).clearContent();
  }

  sheet.getRange(1, 1, 1, 8).setValues([[
    'Дата','Работник','Магазин','Начало','Конец','Время сборки',
    'Причина','Комментарий'
  ]]);
  sheet.getRange(1, 1, 1, 8).setFontWeight('bold');

  const nextRow = Math.max(sheet.getLastRow() + 1, 2);
  sheet.getRange(nextRow, 1, 1, 8).setValues([[
    recordDate,
    recordWorker,
    recordStore,
    recordStart,
    recordEnd,
    recordAssembly,
    p.reason,
    p.comment || ''
  ]]);

  return {
    ok: true,
    message: 'Сообщение сохранено',
    sheet: 'Ошибки',
    row: nextRow
  };
}


// One-time migration for the live Google Sheet: insert Department after Worker
// on every month sheet and move the summary to J:K. Run manually once from
// Apps Script after deploying the new Code.gs. It is safe to run again.
function migrateDepartmentColumn() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const monthSheets = MONTHS.map(name => ss.getSheetByName(name)).filter(Boolean);
  let changed = 0;

  monthSheets.forEach(sheet => {
    const header = String(sheet.getRange(2, 6).getDisplayValue() || '').trim().toLowerCase();
    if (header === 'отдел' || header === 'department') return;

    // Current live structure is B:G plus H spacer and I:J summary.
    // Insert new F so old F:J shift to G:K.
    sheet.insertColumnAfter(5);

    // Copy Worker column formatting into the new Department column.
    sheet.getRange(2, 5, sheet.getMaxRows() - 1, 1).copyTo(
      sheet.getRange(2, 6, sheet.getMaxRows() - 1, 1),
      SpreadsheetApp.CopyPasteType.PASTE_FORMAT,
      false
    );

    sheet.getRange(2, 6).setValue('отдел');
    sheet.getRange(3, 6, Math.max(sheet.getLastRow() - 2, 1), 1).clearContent();

    // Existing known worker department.
    const last = Math.max(sheet.getLastRow(), 2);
    if (last >= 3) {
      const workers = sheet.getRange(3, 5, last - 2, 1).getDisplayValues();
      const departments = workers.map(row => [
        String(row[0] || '').trim() === 'Aleksei Katsõlo' ? 'Tõstukijuht' : ''
      ]);
      sheet.getRange(3, 6, departments.length, 1).setValues(departments);

      // New duration column H = D - C for existing data rows.
      const formulas = workers.map((_, i) => {
        const rowNum = i + 3;
        const hasData = String(sheet.getRange(rowNum, 2).getDisplayValue() || '').trim() !== '';
        return [hasData ? `=D${rowNum}-C${rowNum}` : ''];
      });
      sheet.getRange(3, 8, formulas.length, 1).setFormulas(formulas);
      sheet.getRange(3, 8, formulas.length, 1).setNumberFormat('[h]:mm:ss');
    }

    sheet.getRange(2, 3, 1, 2).setNumberFormat('HH:mm:ss');
    sheet.getRange(2, 6, 1, 1).setNumberFormat('@');

    // Summary moved to J:K and rebuilt from existing data.
    updateWorkerSummary_(sheet);

    sheet.setColumnWidth(6, 140);
    changed++;
  });

  return `Готово. Изменено листов: ${changed}`;
}

function doGet(e) {
  const p = e && e.parameter ? e.parameter : {};
  let result;

  try {
    if (p.action === 'add') {
      result = saveRecord_(p);
    } else if (p.action === 'listRecords') {
      result = listRecords_(p);
    } else if (p.action === 'reportError') {
      result = reportError_(p);
    } else if (p.action === 'listErrors') {
      result = listErrors_(p);
    } else if (p.action === 'rebuildSummaries') {
      result = { ok: true, message: rebuildAllWorkerSummaries() };
    } else {
      result = {
        ok: true,
        message: 'Скрипт работает'
      };
    }
  } catch (err) {
    result = {
      ok: false,
      message: String(err && err.message ? err.message : err)
    };
  }

  const json = JSON.stringify(result);
  const callback = p.callback;

  if (callback && /^[A-Za-z_$][0-9A-Za-z_$]*$/.test(callback)) {
    return ContentService
      .createTextOutput(callback + '(' + json + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  return ContentService
    .createTextOutput(json)
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  let result;

  try {
    result = saveRecord_(e.parameter || {});
  } catch (err) {
    result = {
      ok: false,
      message: String(err && err.message ? err.message : err)
    };
  }

  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}
