# EugestaTimer PWA — финальная версия

## Состав
- `index.html` — PWA интерфейс, RU/EN/EE, запоминание работника и языка.
- `manifest.webmanifest` — установка на телефон.
- `sw.js` — Service Worker с обновляемым кэшем.
- `eugesta-logo.png` и `icons/` — иконки.
- `Code.gs` — Google Apps Script backend.

## Перенос на другую таблицу/аккаунт
1. В `Code.gs` изменить только `SPREADSHEET_ID`.
2. Развернуть Apps Script как Web App.
3. В `index.html` изменить только `API_URL` на новый `/exec` URL, если URL Apps Script изменился.
4. Загрузить содержимое папки на GitHub Pages так, чтобы `index.html` был в корне.

## Записи
Backend не ограничивает историю 500 строками. Если запись добавляется ниже старого шаблона, формула `G = D - C` создаётся автоматически. Формулы сводки I:J используют целые колонки E:G.


### v5 changes
- Error-report date is now a calendar picker instead of a date list.
- Recent records and today total are filtered to the currently selected worker.
- Service worker cache bumped to v5.

## Таймер при закрытии приложения
В версии V6 активная сессия сохраняется локально. При закрытии/выгрузке PWA текущий интервал фиксируется как завершённый. При следующем открытии предыдущая сессия больше не продолжается — можно начать новую запись. Если сеть недоступна в момент закрытия, запись остаётся локально и будет отправлена в Google при следующем открытии.
