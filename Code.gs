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

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const date = new Date(p.date + 'T12:00:00');
  const monthName = MONTHS[date.getMonth()];
  const sheet = ss.getSheetByName(monthName);

  if (!sheet) {
    throw new Error('Не найден лист месяца: ' + monthName);
  }

  const start = timeSerial_(p.start);
  const end = timeSerial_(p.end);

  const lastRow = Math.max(sheet.getLastRow(), 2);
  let row = lastRow + 1;

  if (lastRow >= 3) {
    const values = sheet.getRange(3, 2, lastRow - 2, 5).getValues();

    for (let i = 0; i < values.length; i++) {
      if (values[i].every(v => v === '' || v === null)) {
        row = i + 3;
        break;
      }
    }
  }

  sheet.getRange(row, 2, 1, 5).setValues([[
    date,
    start,
    end,
    p.worker,
    p.store
  ]]);

  sheet.getRange(row, 2).setNumberFormat('dd.MM.yyyy');
  sheet.getRange(row, 3, 1, 2).setNumberFormat('HH:mm');

  // If the row is beyond the original template range, create the
  // assembly-time formula in G dynamically.
  const assemblyCell = sheet.getRange(row, 7);
  if (!assemblyCell.getFormula()) {
    assemblyCell.setFormula(`=D${row}-C${row}`);
    assemblyCell.setNumberFormat('[h]:mm:ss');
  }

  // Keep the worker summary dynamic instead of limiting it to row 502.
  // Existing worker names/formulas in I:J are preserved.
  const summaryLastRow = Math.min(Math.max(sheet.getLastRow(), 4), 20);
  if (sheet.getMaxColumns() >= 10 && summaryLastRow >= 4) {
    for (let r = 4; r <= summaryLastRow; r++) {
      const workerName = sheet.getRange(r, 9).getDisplayValue().trim();
      if (workerName) {
        sheet.getRange(r, 10).setFormula(`=SUMIF($E:$E,I${r},$G:$G)`);
        sheet.getRange(r, 10).setNumberFormat('[h]:mm:ss');
      }
    }
  }

  return {
    ok: true,
    message: 'Запись добавлена',
    sheet: monthName,
    row: row
  };
}

function listRecords_(p) {
  if (!p.worker) throw new Error('Не выбран работник.');

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const result = [];

  ss.getSheets().forEach(sheet => {
    const name = sheet.getName();
    if (name === 'Ошибки') return;

    const last = Math.max(sheet.getLastRow(), 2);
    if (last < 3) return;

    const values = sheet.getRange(3, 2, last - 2, 6).getDisplayValues();

    values.forEach((r, i) => {
      const rowNumber = i + 3;
      const date = (r[0] || '').trim();
      const worker = (r[3] || '').trim();

      if (!date || worker !== String(p.worker).trim()) return;

      result.push({
        sheet: name,
        row: rowNumber,
        date: date,
        start: r[1] || '',
        end: r[2] || '',
        worker: worker,
        store: r[4] || '',
        assembly: r[5] || ''
      });
    });
  });

  result.reverse();

  return { ok: true, records: result.slice(0, 300) };
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

  const r = source.getRange(row, 2, 1, 6).getDisplayValues()[0];
  const recordDate = (r[0] || '').trim();
  const recordStart = r[1] || '';
  const recordEnd = r[2] || '';
  const recordWorker = (r[3] || '').trim();
  const recordStore = r[4] || '';
  const recordAssembly = r[5] || '';

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
