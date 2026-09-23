/* Company-scoped, read-only moderator export. No service-role keys or external uploads. */
(function () {
  'use strict';
  const messages = {
    ru: { title:'Выгрузка в PDF', intro:'Выберите месяц и записи отдела или одного работника. Данные загружаются из базы при каждом формировании PDF.', month:'Месяц', type:'Тип записей', timer:'Записи таймера', manual:'Ручная работа', scope:'Кого включить', department:'Отдел', worker:'Конкретный работник', choose:'Выберите…', noDept:'Без отдела', targetDept:'Отдел по записи', targetWorker:'Работник', note:'Отдел определяется по записи, а не по текущему отделу работника. У каждого работника свой бланк и своя нумерация страниц. Первая строка и Muu остаются пустыми.', build:'Сформировать PDF', loading:'Загружаю данные…', building:'Формирую PDF…', empty:'За выбранный месяц записей нет. Измените условия выгрузки.', failed:'Не удалось сформировать PDF.', close:'Закрыть', download:'Сохранить PDF', open:'Открыть PDF', print:'Печать', preview:'Предварительный просмотр PDF', help:'Если просмотр не отображается, нажмите «Открыть PDF». На телефоне сохранение и печать доступны через меню «Поделиться».', printHelp:'Если диалог печати не открылся, нажмите «Открыть PDF» и выберите печать в просмотрщике.', summary:'Работников: {workers} · Записей: {records} · Листов: {pages}', workerSummary:'{name}: {records} записей, {pages} листов', legacy:'Внимание: {count} старых значений «Количество» содержат текст. Их TK оставлена пустой; исходные записи не изменены. Исправьте количество и сформируйте PDF заново.', selected:'Сначала выберите месяц и отдел или работника.', ready:'PDF готов. При изменении фильтров его нужно сформировать заново.', noAccess:'Выгрузка доступна только модератору с назначенной компанией.', assets:'Не удалось загрузить файлы PDF. Проверьте, что папки vendor и pdf-assets опубликованы вместе с приложением.', cancelled:'Сеанс изменился. Откройте выгрузку заново.', exportButton:'Выгрузка в PDF', uploadTemplate:'Загрузить бланк PDF', templateSource:'Использовать бланк', standardTemplate:'Стандартный', uploadedTemplate:'Загруженный', templateReady:'Бланк сохранён и автоматически подогнан под формат и правила ETimer.', templateStored:'Загруженный бланк сохранён. Сейчас используется стандартный.', templateInvalid:'Не удалось подготовить бланк: PDF должен содержать хотя бы один лист.', templateTooLarge:'Бланк не принят: размер PDF не должен превышать 5 МБ.', templateReadError:'Не удалось прочитать PDF-бланк. Выберите корректный PDF-файл.' },
    en: { title:'Export to PDF', intro:'Choose a month and a department or worker. Records are fetched from the database each time you generate a PDF.', month:'Month', type:'Record type', timer:'Timer records', manual:'Manual work', scope:'Include', department:'Department', worker:'One worker', choose:'Select…', noDept:'No department', targetDept:'Department on record', targetWorker:'Worker', note:'The department saved on the record is used, not the worker’s current department. Each worker has a separate form and page numbering. The first row and Muu stay empty.', build:'Generate PDF', loading:'Loading records…', building:'Generating PDF…', empty:'No records for this month and selection.', failed:'Could not generate PDF.', close:'Close', download:'Save PDF', open:'Open PDF', print:'Print', preview:'PDF preview', help:'If the preview is unavailable, use “Open PDF”. On a phone, use the Share menu to save or print.', printHelp:'If printing did not start, use “Open PDF” and print from the PDF viewer.', summary:'Workers: {workers} · Records: {records} · Pages: {pages}', workerSummary:'{name}: {records} records, {pages} pages', legacy:'Warning: {count} old quantity values contain text. Their TK is empty; source records are unchanged. Correct the quantities and generate again.', selected:'Select a month and department or worker first.', ready:'PDF ready. Generate again after changing filters.', noAccess:'Only a moderator with a company can export records.', assets:'PDF assets could not be loaded. Publish the vendor and pdf-assets folders with the app.', cancelled:'Your session changed. Reopen the export dialog.', exportButton:'Export to PDF', uploadTemplate:'Upload PDF template', templateSource:'Use template', standardTemplate:'Standard', uploadedTemplate:'Uploaded', templateReady:'The template was saved and automatically fitted to ETimer’s format and rules.', templateStored:'The uploaded template is saved. The standard template is currently active.', templateInvalid:'Could not prepare the template: the PDF must contain at least one page.', templateTooLarge:'Template rejected: PDF must be no larger than 5 MB.', templateReadError:'Could not read the PDF template.' },
    et: { title:'PDF-eksport', intro:'Vali kuu ja osakonna või ühe töötaja kirjed. PDF-i loomisel laaditakse andmed alati andmebaasist.', month:'Kuu', type:'Kirjete liik', timer:'Taimeri kirjed', manual:'Käsitsi tehtud töö', scope:'Keda kaasata', department:'Osakond', worker:'Üks töötaja', choose:'Vali…', noDept:'Osakonnata', targetDept:'Kirje osakond', targetWorker:'Töötaja', note:'Kasutatakse kirjele salvestatud osakonda, mitte töötaja praegust osakonda. Igal töötajal on eraldi leht ja lehekülgede numeratsioon. Esimene rida ja Muu jäävad tühjaks.', build:'Loo PDF', loading:'Laadin andmeid…', building:'Loon PDF-i…', empty:'Valitud kuul ja tingimustel kirjeid pole.', failed:'PDF-i loomine ebaõnnestus.', close:'Sulge', download:'Salvesta PDF', open:'Ava PDF', print:'Prindi', preview:'PDF-i eelvaade', help:'Kui eelvaadet ei kuvata, vajuta „Ava PDF“. Telefonis saab salvestada ja printida jagamismenüüst.', printHelp:'Kui printimisdialoog ei avanenud, vajuta „Ava PDF“ ja prindi PDF-vaaturist.', summary:'Töötajaid: {workers} · Kirjeid: {records} · Lehti: {pages}', workerSummary:'{name}: {records} kirjet, {pages} lehte', legacy:'Hoiatus: {count} varasemat koguse väärtust sisaldavad teksti. Nende TK on tühi; algandmeid ei muudeta. Paranda kogused ja loo PDF uuesti.', selected:'Vali esmalt kuu ja osakond või töötaja.', ready:'PDF on valmis. Filtrite muutmisel loo uus PDF.', noAccess:'Eksport on lubatud ainult ettevõttega moderaatorile.', assets:'PDF-i faile ei õnnestunud laadida. Avalda rakendusega kaustad vendor ja pdf-assets.', cancelled:'Seanss muutus. Ava eksport uuesti.', exportButton:'PDF-eksport', uploadTemplate:'Laadi üles oma PDF-vorm', templateSource:'Kasuta vormi', standardTemplate:'Standardne', uploadedTemplate:'Üles laaditud', templateReady:'Vorm salvestati ja kohandati automaatselt ETimeri formaadi ning reeglitega.', templateStored:'Üles laaditud vorm on salvestatud. Praegu kasutatakse standardvormi.', templateInvalid:'Vormi ei saanud ette valmistada: PDF peab sisaldama vähemalt ühte lehte.', templateTooLarge:'Vorm lükati tagasi: PDF ei tohi olla suurem kui 5 MB.', templateReadError:'PDF-vormi ei õnnestunud lugeda.' }
  };
  const tr = (key, values = {}) => (messages[typeof lang === 'string' ? lang : 'ru'] || messages.ru)[key].replace(/\{(\w+)\}/g, (_, k) => String(values[k] ?? ''));
  const el = id => document.getElementById(id);
  const overlay = document.createElement('div');
  overlay.className = 'pdf-overlay'; overlay.id = 'pdfExportOverlay'; overlay.hidden = true;
  overlay.innerHTML = `<section class="pdf-dialog" role="dialog" aria-modal="true" aria-labelledby="pdfTitle" tabindex="-1">
    <header class="pdf-head"><h2 id="pdfTitle" data-pdf-text="title"></h2><button type="button" class="pdf-close" id="pdfClose">×</button></header>
    <p class="pdf-note" data-pdf-text="intro"></p>
    <form id="pdfForm"><div class="pdf-grid">
      <div class="pdf-field"><label for="pdfMonth" data-pdf-text="month"></label><input type="month" id="pdfMonth" required min="1900-01" max="9998-12"></div>
      <div class="pdf-field"><label for="pdfType" data-pdf-text="type"></label><select id="pdfType"><option value="timer" data-pdf-text="timer"></option><option value="manual" data-pdf-text="manual"></option></select></div>
      <div class="pdf-field"><label for="pdfScope" data-pdf-text="scope"></label><select id="pdfScope"><option value="department" data-pdf-text="department"></option><option value="worker" data-pdf-text="worker"></option></select></div>
      <div class="pdf-field"><label for="pdfTarget" id="pdfTargetLabel"></label><select id="pdfTarget" required></select></div>
    </div><p class="pdf-note" data-pdf-text="note"></p><div class="pdf-actions"><button type="submit" class="pdf-primary" id="pdfBuild" data-pdf-text="build"></button></div></form>
    <div class="pdf-status" id="pdfStatus" role="status" aria-live="polite"></div>
    <div class="pdf-preview" id="pdfPreview" hidden><div class="pdf-summary" id="pdfSummary"></div><p class="pdf-warning" id="pdfWarning"></p>
      <div class="pdf-actions"><a id="pdfDownload" class="pdf-primary" data-pdf-text="download"></a><a id="pdfOpen" target="_blank" rel="noopener" data-pdf-text="open"></a><button id="pdfPrint" type="button" data-pdf-text="print"></button></div>
      <p class="pdf-help" data-pdf-text="help"></p><iframe id="pdfFrame"></iframe>
    </div></section>`;
  document.body.appendChild(overlay);
  let profiles = [], departments = [], generation = 0, busy = false, objectURL = null, previousFocus = null, abort = null;
  let assetsPromise = null;
  const exportButton = el('pdfExportBtn');
  const templateInput = el('pdfTemplateInput');
  const templateSource = el('pdfTemplateSource');
  const templateStatus = el('pdfTemplateStatus');
  const templateKey = () => currentProfile?.company_id ? `etimer_pdf_template_${currentProfile.company_id}` : '';
  const templateModeKey = () => currentProfile?.company_id ? `etimer_pdf_template_mode_${currentProfile.company_id}` : '';
  const templateStatusText = (text, kind = '') => { templateStatus.textContent = text; templateStatus.className = 'pdf-template-status ' + kind; };
  function storedTemplateMode() {
    const key = templateModeKey();
    if (!key) return storedTemplateBytes() ? 'custom' : 'standard';
    try {
      const value = localStorage.getItem(key);
      if (value === 'custom' && storedTemplateBytes()) return 'custom';
      if (value === 'standard') return 'standard';
    } catch (_) {}
    return storedTemplateBytes() ? 'custom' : 'standard';
  }
  function saveTemplateMode(mode) {
    const key = templateModeKey();
    if (!key) return;
    try { localStorage.setItem(key, mode === 'custom' ? 'custom' : 'standard'); } catch (_) {}
  }
  function activeTemplateBytes() { return storedTemplateMode() === 'custom' ? storedTemplateBytes() : null; }
  const syncMenuLabel = () => {
    el('pdfExportLabel').textContent = tr('exportButton');
    el('pdfTemplateMenuLabel').textContent = tr('uploadTemplate');
    el('pdfTemplateSourceLabel').textContent = tr('templateSource');
    el('pdfTemplateStandardOption').textContent = tr('standardTemplate');
    el('pdfTemplateCustomOption').textContent = tr('uploadedTemplate');
    updateTemplateChoice();
  };
  syncMenuLabel();
  new MutationObserver(syncMenuLabel).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  new MutationObserver(updateTemplateStatus).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  function status(text, kind = '') { el('pdfStatus').textContent = text; el('pdfStatus').className = 'pdf-status ' + kind; }
  function invalidate() {
    el('pdfPreview').hidden = true; el('pdfFrame').removeAttribute('src');
    el('pdfDownload').removeAttribute('href'); el('pdfOpen').removeAttribute('href');
    el('pdfSummary').textContent = ''; el('pdfWarning').textContent = '';
    if (objectURL) URL.revokeObjectURL(objectURL);
    objectURL = null;
  }
  function setBusy(value) {
    busy = value;
    el('pdfForm').querySelectorAll('input,select,button').forEach(node => { node.disabled = value; });
    el('pdfForm').setAttribute('aria-busy', String(value));
  }
  function close() {
    generation++; abort?.abort(); abort = null;
    overlay.hidden = true; invalidate(); setBusy(false); profiles = []; departments = [];
    if (previousFocus?.isConnected) previousFocus.focus();
  }
  function context() {
    if (!currentUser?.id || currentProfile?.role !== 'moderator' || !currentProfile.company_id) throw new Error(tr('noAccess'));
    return { user: currentUser.id, company: currentProfile.company_id };
  }
  function guard(token, ctx) {
    if (token !== generation || overlay.hidden || currentUser?.id !== ctx.user || currentProfile?.company_id !== ctx.company || currentProfile?.role !== 'moderator') throw new Error(tr('cancelled'));
  }
  function fillTargets() {
    const scope = el('pdfScope').value;
    el('pdfTargetLabel').textContent = tr(scope === 'worker' ? 'targetWorker' : 'targetDept');
    el('pdfTarget').replaceChildren(new Option(tr('choose'), ''));
    const list = scope === 'worker' ? profiles.filter(p => p.role === 'worker') : departments;
    for (const item of list) el('pdfTarget').add(new Option(item.name || '—', item.id));
    if (scope === 'department') el('pdfTarget').add(new Option(tr('noDept'), '__none__'));
  }
  async function open() {
    let ctx; try { ctx = context(); } catch (err) { alert(err.message); return; }
    previousFocus = document.activeElement; el('menuPanel').classList.remove('show'); updateTemplateStatus();
    invalidate(); overlay.hidden = false;
    overlay.querySelectorAll('[data-pdf-text]').forEach(node => { node.textContent = tr(node.dataset.pdfText); });
    el('pdfClose').setAttribute('aria-label', tr('close')); el('pdfFrame').title = tr('preview');
    el('pdfMonth').value = `${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}`;
    el('pdfTarget').replaceChildren(new Option(tr('loading'), ''));
    const token = ++generation; abort?.abort(); abort = new AbortController();
    setBusy(true); status(tr('loading')); el('pdfClose').focus();
    try {
      const check = () => guard(token, ctx);
      [profiles, departments] = await Promise.all([
        ETimerPDF.fetchAll(() => supabaseClient.from('profiles').select('id,name,role,department_id').eq('company_id', ctx.company).order('name').order('id').abortSignal(abort.signal), check),
        ETimerPDF.fetchAll(() => supabaseClient.from('departments').select('id,name').eq('company_id', ctx.company).order('name').order('id').abortSignal(abort.signal), check)
      ]);
      check(); fillTargets(); status('');
    } catch (err) { if (token === generation) status(tr('failed') + ' ' + (err.message || ''), 'error'); }
    finally { if (token === generation) setBusy(false); }
  }
  function script(src, globalName) {
    if (window[globalName]) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const node = document.createElement('script'); node.src = src;
      node.onload = () => window[globalName] ? resolve() : reject(new Error(tr('assets')));
      node.onerror = () => { node.remove(); reject(new Error(tr('assets'))); };
      document.head.appendChild(node);
    });
  }
  function decodeAsset(value) {
    const binary = atob(value); const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  }
  function storedTemplateBytes() {
    const key = templateKey(); if (!key) return null;
    try { const value = localStorage.getItem(key); return value ? decodeAsset(value) : null; } catch (_) { return null; }
  }
  function updateTemplateChoice() {
    const hasCustom = !!storedTemplateBytes();
    const customOption = el('pdfTemplateCustomOption');
    customOption.disabled = !hasCustom;
    templateSource.value = hasCustom ? storedTemplateMode() : 'standard';
  }
  function saveTemplateBytes(bytes) {
    const key = templateKey(); if (!key) throw new Error(tr('noAccess'));
    try {
      let binary = '';
      for (let offset = 0; offset < bytes.length; offset += 0x8000) binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
      localStorage.setItem(key, btoa(binary));
    }
    catch (_) { throw new Error(tr('templateReadError')); }
  }
  async function normalizeTemplate(bytes) {
    if (!bytes?.length || bytes.length > 5 * 1024 * 1024) throw new Error(tr('templateTooLarge'));
    const assets = await loadAssets();
    let source;
    try { source = await assets.PDFLib.PDFDocument.load(bytes, { updateMetadata: false, ignoreEncryption: false }); }
    catch (_) { throw new Error(tr('templateReadError')); }
    if (!source.getPageCount()) throw new Error(tr('templateInvalid'));
    try {
      // Keep the first uploaded page as the visual background. The resulting
      // one-page document is always the same portrait Letter size that the
      // fixed ETimer columns and row coordinates expect.
      const sourcePage = source.getPage(0);
      const sourceSize = sourcePage.getSize();
      const angle = ((sourcePage.getRotation().angle % 360) + 360) % 360;
      const rotated = angle === 90 || angle === 270;
      const sourceWidth = rotated ? sourceSize.height : sourceSize.width;
      const sourceHeight = rotated ? sourceSize.width : sourceSize.height;
      if (!(sourceWidth > 0 && sourceHeight > 0)) throw new Error(tr('templateInvalid'));
      const targetWidth = 612, targetHeight = 792;
      const scale = Math.min(targetWidth / sourceWidth, targetHeight / sourceHeight);
      const width = sourceSize.width * scale, height = sourceSize.height * scale;
      const out = await assets.PDFLib.PDFDocument.create();
      const embedded = await out.embedPage(sourcePage);
      const page = out.addPage([targetWidth, targetHeight]);
      page.drawPage(embedded, {
        x: (targetWidth - sourceWidth * scale) / 2,
        y: (targetHeight - sourceHeight * scale) / 2,
        width, height,
        rotate: assets.PDFLib.degrees(angle)
      });
      return await out.save();
    } catch (_) { throw new Error(tr('templateReadError')); }
  }
  function updateTemplateStatus() {
    const hasCustom = !!storedTemplateBytes();
    updateTemplateChoice();
    if (!hasCustom) templateStatusText('');
    else if (storedTemplateMode() === 'custom') templateStatusText(tr('templateReady'), 'success');
    else templateStatusText(tr('templateStored'), 'success');
  }
  async function loadAssets() {
    if (!assetsPromise) assetsPromise = (async () => {
      await Promise.all([script('vendor/pdf-lib.min.js', 'PDFLib'), script('vendor/fontkit.umd.min.js', 'fontkit')]);
      // The inline copy keeps exports working on hosts that do not serve binary
      // files correctly (and when an installed PWA has an old base URL).
      if (window.ETimerPdfAssets?.templateBytes && window.ETimerPdfAssets?.fontBytes) {
        return { PDFLib: window.PDFLib, fontkit: window.fontkit,
          templateBytes: activeTemplateBytes() || decodeAsset(window.ETimerPdfAssets.templateBytes),
          fontBytes: decodeAsset(window.ETimerPdfAssets.fontBytes) };
      }
      const get = async relativePath => {
        const url = new URL(relativePath, document.baseURI).href;
        let response;
        try { response = await fetch(url, { cache: 'no-store' }); }
        catch (error) { throw new Error(`${tr('assets')} (${url}: ${error.message || error})`); }
        if (!response.ok) throw new Error(`${tr('assets')} (${url}: HTTP ${response.status})`);
        return new Uint8Array(await response.arrayBuffer());
      };
      const [templateBytes, fontBytes] = await Promise.all([get('pdf-assets/blank.pdf'), get('pdf-assets/DejaVuSans.ttf')]);
      return { PDFLib: window.PDFLib, fontkit: window.fontkit, templateBytes: activeTemplateBytes() || templateBytes, fontBytes };
    })().catch(err => { assetsPromise = null; throw err; });
    return assetsPromise;
  }
  async function generate(event) {
    event.preventDefault(); if (busy) return;
    invalidate();
    const month = el('pdfMonth').value, type = el('pdfType').value, scope = el('pdfScope').value, target = el('pdfTarget').value;
    if (!target) { status(tr('selected'), 'error'); return; }
    let ctx, range; try { ctx = context(); range = ETimerPDF.monthRange(month); } catch (err) { status(tr('selected') + ' ' + err.message, 'error'); return; }
    const token = ++generation; abort?.abort(); abort = new AbortController();
    const check = () => guard(token, ctx);
    setBusy(true); status(tr('loading'));
    try {
      const table = type === 'manual' ? 'manual_work_records' : 'work_records';
      const fields = 'id,user_id,company_id,department_id,work_date,start_time,end_time,' + (type === 'manual' ? 'work_type,quantity_or_notes' : 'store_name,duration_seconds,assembly_seconds');
      const records = await ETimerPDF.fetchAll(() => {
        let q = supabaseClient.from(table).select(fields).eq('company_id', ctx.company).gte('work_date', range.start).lt('work_date', range.end);
        if (scope === 'worker') q = q.eq('user_id', target);
        else if (target === '__none__') q = q.is('department_id', null);
        else q = q.eq('department_id', target);
        return q.order('work_date').order('start_time').order('id').abortSignal(abort.signal);
      }, check);
      if (!records.length) { status(tr('empty')); return; }
      // Refresh names/departments too; never reuse an outdated preview as current data.
      const [freshProfiles, freshDepartments] = await Promise.all([
        ETimerPDF.fetchAll(() => supabaseClient.from('profiles').select('id,name,role').eq('company_id', ctx.company).order('id').abortSignal(abort.signal), check),
        ETimerPDF.fetchAll(() => supabaseClient.from('departments').select('id,name').eq('company_id', ctx.company).order('id').abortSignal(abort.signal), check)
      ]);
      check(); status(tr('building'));
      const prepared = ETimerPDF.prepare({ records, profiles:freshProfiles, departments:freshDepartments, companyId:ctx.company, month, type, scope, target });
      const assets = await loadAssets(); check();
      const result = await ETimerPDF.build(prepared, assets); check();
      objectURL = URL.createObjectURL(new Blob([result.bytes], { type:'application/pdf' }));
      el('pdfDownload').href = objectURL; el('pdfDownload').download = `ETimer_${month}_${type}.pdf`;
      el('pdfOpen').href = objectURL; el('pdfFrame').src = objectURL;
      el('pdfSummary').textContent = tr('summary', {workers:result.pageCounts.length, records:prepared.recordCount, pages:result.pages}) + '\n' + result.pageCounts.map(p => tr('workerSummary',p)).join('\n');
      el('pdfWarning').textContent = prepared.legacyQuantity ? tr('legacy', {count:prepared.legacyQuantity}) : '';
      el('pdfPreview').hidden = false; status(tr('ready'), 'success');
    } catch (err) { if (token === generation) { invalidate(); status(tr('failed') + ' ' + (err.message || ''), 'error'); } }
    finally { if (token === generation) setBusy(false); }
  }
  exportButton.addEventListener('click', open);
  templateInput.addEventListener('change', async () => {
    const file = templateInput.files?.[0]; templateInput.value = '';
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { templateStatusText(tr('templateTooLarge'), 'error'); return; }
    templateStatusText(tr('loading'));
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const normalized = await normalizeTemplate(bytes);
      saveTemplateBytes(normalized); saveTemplateMode('custom'); assetsPromise = null; updateTemplateChoice();
      templateStatusText(tr('templateReady'), 'success');
    } catch (error) { templateStatusText(error.message || tr('templateReadError'), 'error'); }
  });
  templateSource.addEventListener('change', () => {
    if (!storedTemplateBytes()) { updateTemplateChoice(); return; }
    saveTemplateMode(templateSource.value); assetsPromise = null; updateTemplateStatus();
  });
  el('pdfClose').addEventListener('click', close);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  el('pdfForm').addEventListener('submit', generate);
  el('pdfForm').addEventListener('change', e => { invalidate(); status(''); if (e.target.id === 'pdfScope') fillTargets(); });
  el('pdfMonth').addEventListener('input', () => { invalidate(); status(''); });
  el('pdfPrint').addEventListener('click', () => {
    if (!objectURL) return;
    try { context(); el('pdfFrame').contentWindow.focus(); el('pdfFrame').contentWindow.print(); }
    catch (_) { window.open(objectURL, '_blank', 'noopener'); }
    status(tr('printHelp'));
  });
  overlay.addEventListener('keydown', e => {
    if (e.key === 'Escape') { e.preventDefault(); close(); }
    if (e.key !== 'Tab') return;
    const items = [...overlay.querySelectorAll('button:not(:disabled),input:not(:disabled),select:not(:disabled),a[href],iframe')].filter(n => n.getClientRects().length);
    const first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
  window.ETimerPdfUI = { reset: close };
})();
