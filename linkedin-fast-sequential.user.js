// ==UserScript==
// @name         LinkedIn Auto Connect v10.0.3
// @namespace    https://github.com/tanersb/LinkedIn-Fast-Sequential-Auto-Connect
// @version      10.0.3
// @description  Shadow DOM fix + Clean UI + Speed Controls + Signature + Timestamp + Full Reset + Update Checker + Limit Detection + State Memory + Profile Saver + Auto Add Saved + Full Custom UI + Anti-Duplicate System + Multi-Language (TR/EN) + Auto Scroll + Anchor Tag Support. [v10: Full Perf Refactor]
// @author       tanersb
// @match        https://www.linkedin.com/*
// @updateURL    https://raw.githubusercontent.com/tanersb/LinkedIn-Fast-Sequential-Auto-Connect/main/linkedin-fast-sequential.user.js
// @downloadURL  https://raw.githubusercontent.com/tanersb/LinkedIn-Fast-Sequential-Auto-Connect/main/linkedin-fast-sequential.user.js
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    if (window.top !== window.self) return;

    // ─────────────────────────────────────────────
    // CONSTANTS
    // ─────────────────────────────────────────────
    const UPDATE_LINK = "https://raw.githubusercontent.com/tanersb/LinkedIn-Fast-Sequential-Auto-Connect/main/linkedin-fast-sequential.user.js";
    const STORAGE_KEY = 'LnAuto_State';
    const SLEEP_BETWEEN_ACTIONS = 2500;

    // ─────────────────────────────────────────────
    // i18n
    // ─────────────────────────────────────────────
    const TEXTS = {
        tr: {
            title: "LinkedIn Auto v10.0.3",
            total: "Toplam", last: "Son",
            save_btn: "BU PROFİLİ KAYDET", save_success: "KAYDEDİLDİ ✔",
            list_btn: "LİSTE", note_closer: "Not Kapatıcı",
            active: "AKTİF", passive: "PASİF",
            start: "BAŞLAT", stop: "DURDUR", limit_btn: "LİMİT DOLDU",
            update: "Güncelle", list_header: "Kayıtlı Profiller", list_empty: "Liste boş.",
            back: "« GERİ", auto_add: "HEPSİNİ EKLE (OTO)", clear: "TEMİZLE",
            confirm_reset_title: "Sayaç Sıfırlama", confirm_reset_msg: "Toplam sayı ve son işlem tarihi sıfırlansın mı?",
            confirm_clear_title: "Listeyi Temizle", confirm_clear_msg: "Tüm kayıtlı profiller silinecek. Emin misiniz?",
            alert_empty_title: "Liste Boş",
            alert_empty_msg: "İşleme başlamak için önce profil sayfalarına gidip <b>'BU PROFİLİ KAYDET'</b> butonuna basarak liste oluşturun.",
            confirm_auto_title: "Oto Ekleme Başlatılsın mı?",
            confirm_auto_msg_1: "Listede toplam <b>", confirm_auto_msg_2: "</b> kişi var.<br><br>Bot sırayla bu profilleri gezip 'Bağlantı Kur' butonuna basacak.",
            alert_limit_title: "⚠️ HAFTALIK LİMİT UYARISI",
            alert_limit_msg: "LinkedIn'in 'Haftalık Davet Sınırı' uyarısı tespit edildi ve ekranınızdan kaldırıldı.<br><br>Bot güvenliğiniz için otomatik olarak durduruldu.",
            modal_cancel: "İPTAL", modal_confirm: "ONAYLA", modal_ok: "TAMAM",
            error_profile: "Lütfen bir kişi profiline girin.<br>(Örn: linkedin.com/in/kullanici)",
            error_exists: "Bu kişi zaten listenizde kayıtlı.",
            dash_title: "🤖 Oto Ekleme Modu", dash_person: "Kişi",
            dash_status_scan: "Profil taranıyor...", dash_status_conn: "Bağlantı kuruluyor...",
            dash_status_sent: "✔ İstek Gönderildi", dash_status_pending: "⚠ Zaten İstek Atılmış",
            dash_status_fail: "❌ Buton Bulunamadı", dash_next: "Sıradaki profile geçiliyor...",
            dash_done: "✅ TÜM LİSTE TAMAMLANDI!", dash_stop_user: "🛑 Kullanıcı durdurdu.",
            dash_stop_limit: "⚠️ HAFTALIK LİMİT!", status_scrolling: "Buton aranıyor... (Kaydırılıyor)"
        },
        en: {
            title: "LinkedIn Auto v10.0.0",
            total: "Total", last: "Last",
            save_btn: "SAVE THIS PROFILE", save_success: "SAVED ✔",
            list_btn: "LIST", note_closer: "Note Closer",
            active: "ACTIVE", passive: "OFF",
            start: "START", stop: "STOP", limit_btn: "LIMIT REACHED",
            update: "Update", list_header: "Saved Profiles", list_empty: "List is empty.",
            back: "« BACK", auto_add: "ADD ALL (AUTO)", clear: "CLEAR ALL",
            confirm_reset_title: "Reset Counter", confirm_reset_msg: "Reset total count and last action date?",
            confirm_clear_title: "Clear List", confirm_clear_msg: "All saved profiles will be deleted. Are you sure?",
            alert_empty_title: "List Empty",
            alert_empty_msg: "To start, visit profile pages and click <b>'SAVE THIS PROFILE'</b> to build your list.",
            confirm_auto_title: "Start Auto Add?",
            confirm_auto_msg_1: "There are <b>", confirm_auto_msg_2: "</b> people in the list.<br><br>The bot will visit each profile and click 'Connect'.",
            alert_limit_title: "⚠️ WEEKLY LIMIT WARNING",
            alert_limit_msg: "LinkedIn's 'Weekly Invitation Limit' warning was detected and removed from your screen.<br><br>The bot has been stopped for your safety.",
            modal_cancel: "CANCEL", modal_confirm: "CONFIRM", modal_ok: "OK",
            error_profile: "Please visit a user profile.<br>(e.g. linkedin.com/in/user)",
            error_exists: "This person is already in your list.",
            dash_title: "🤖 Auto Add Mode", dash_person: "Person",
            dash_status_scan: "Scanning profile...", dash_status_conn: "Connecting...",
            dash_status_sent: "✔ Request Sent", dash_status_pending: "⚠ Already Pending",
            dash_status_fail: "❌ Button Not Found", dash_next: "Moving to next profile...",
            dash_done: "✅ ALL DONE!", dash_stop_user: "🛑 Stopped by user.",
            dash_stop_limit: "⚠️ WEEKLY LIMIT!", status_scrolling: "Searching... (Scrolling)"
        }
    };

    // ─────────────────────────────────────────────
    // STATE — tek JSON, tek key
    // ─────────────────────────────────────────────
    const DEFAULT_STATE = {
        lang: 'tr',
        totalCount: 0,
        lastDate: '-',
        speedPopup: 100,
        speedConnect: 1000,
        panelState: 'open',
        savedProfiles: [],
        isAutoAdding: false,
        autoAddIndex: 0,
    };

    function loadState() {
        try {
            return Object.assign({}, DEFAULT_STATE, JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'));
        } catch {
            return { ...DEFAULT_STATE };
        }
    }

    let S = loadState();

    // Debounced save — coalesces rapid writes into one localStorage call
    let _saveTimer = null;
    function saveState() {
        if (_saveTimer) return;
        _saveTimer = setTimeout(() => {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(S));
            _saveTimer = null;
        }, 150);
    }

    // Migrate old multi-key storage once
    (function migrateOldKeys() {
        const oldKeys = ['LnAuto_TotalCount','LnAuto_LastDate','LnAuto_SpeedPopup','LnAuto_SpeedConnect',
                         'LnAuto_PanelState','LnAuto_SavedProfiles','LnAuto_IsAutoAdding',
                         'LnAuto_AutoAddIndex','LnAuto_Lang'];
        if (!oldKeys.some(k => localStorage.getItem(k) !== null)) return;
        S.totalCount   = parseInt(localStorage.getItem('LnAuto_TotalCount')) || S.totalCount;
        S.lastDate     = localStorage.getItem('LnAuto_LastDate') || S.lastDate;
        S.speedPopup   = parseInt(localStorage.getItem('LnAuto_SpeedPopup')) || S.speedPopup;
        S.speedConnect = parseInt(localStorage.getItem('LnAuto_SpeedConnect')) || S.speedConnect;
        S.panelState   = localStorage.getItem('LnAuto_PanelState') || S.panelState;
        S.lang         = localStorage.getItem('LnAuto_Lang') || S.lang;
        S.isAutoAdding = localStorage.getItem('LnAuto_IsAutoAdding') === 'true';
        S.autoAddIndex = parseInt(localStorage.getItem('LnAuto_AutoAddIndex')) || 0;
        try { S.savedProfiles = JSON.parse(localStorage.getItem('LnAuto_SavedProfiles')) || []; } catch {}
        saveState();
        oldKeys.forEach(k => localStorage.removeItem(k));
    })();

    const t = (key) => TEXTS[S.lang][key] || key;

    // ─────────────────────────────────────────────
    // RUNTIME STATE (not persisted)
    // ─────────────────────────────────────────────
    let isConnectorRunning = false;
    let isNoteCloserActive = true;

    // ─────────────────────────────────────────────
    // DOM HELPERS
    // ─────────────────────────────────────────────

    /** Cached shadow root — LinkedIn's interop-outlet doesn't change */
    let _shadowRoot = null;
    function getShadowRoot() {
        if (_shadowRoot) return _shadowRoot;
        const host = document.querySelector('#interop-outlet');
        _shadowRoot = host?.shadowRoot || null;
        return _shadowRoot;
    }

    function findInShadows(selector) {
        return document.querySelector(selector)
            ?? getShadowRoot()?.querySelector(selector)
            ?? null;
    }

    /** Synthetic mouse event sequence for React/framework buttons */
    function nativeClick(el) {
        if (!el) return;
        const opts = { bubbles: true, cancelable: true, view: window };
        for (const type of ['mouseover', 'mousedown', 'mouseup', 'click']) {
            el.dispatchEvent(new MouseEvent(type, opts));
        }
    }

    function getFormattedDate() {
        const d = new Date();
        return `${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
    }

    function updateCounterDisplay() {
        document.getElementById('lnk-counter-val')?.replaceChildren(document.createTextNode(S.totalCount));
        const dateEl = document.getElementById('lnk-last-date');
        if (dateEl) dateEl.textContent = S.lastDate;
        saveState();
    }

    // ─────────────────────────────────────────────
    // NOTE BUTTON FINDER — shared, memoised per call
    // ─────────────────────────────────────────────
    function findSendWithoutNoteBtn() {
        return findInShadows('button[aria-label="Not olmadan gönderin"]')
            ?? findInShadows('button[aria-label="Send without a note"]')
            ?? (() => {
                for (const btn of document.querySelectorAll('.artdeco-button--primary')) {
                    const txt = btn.innerText.toLowerCase();
                    if (txt.includes('not olmadan') || txt.includes('without a note')) return btn;
                }
                return null;
            })();
    }

    // ─────────────────────────────────────────────
    // CONNECT BUTTON FINDER
    // ─────────────────────────────────────────────
    const CONNECT_EXCLUDE = ['mesaj','message','takip','follow','beklemede','pending','withdraw'];

    function findConnectBtn() {
        // Selects ALL clickable elements — including custom-class <a> tags like
        // LinkedIn's /preload/search-custom-invite/ anchor (no artdeco-button class)
        for (const el of document.querySelectorAll('button, a[href], a[role="button"]')) {
            if (el.disabled || el.getAttribute('aria-disabled') === 'true') continue;
            const txt   = el.innerText?.replace(/\s+/g,' ').trim().toLowerCase() ?? '';
            const label = el.getAttribute('aria-label')?.toLowerCase() ?? '';
            if (CONNECT_EXCLUDE.some(x => txt.includes(x) || label.includes(x))) continue;
            if (txt === 'bağlantı kur' || txt === 'connect') return el;
            if (label.includes('bağlantı kur') || label.includes('davet et') ||
                label.includes('connect')       || label.includes('invite')) return el;
        }
        return null;
    }

    // ─────────────────────────────────────────────
    // WEEKLY LIMIT DETECTION
    // ─────────────────────────────────────────────
    function checkWeeklyLimit() {
        if (document.getElementById('ip-fuse-limit-alert__header')) return true;
        const body = document.body.innerText;
        return body.includes('Haftalık bağlantı daveti sınırına') || body.includes('Weekly invitation limit');
    }

    function handleLimitHit() {
        isConnectorRunning = false;
        S.isAutoAdding = false;
        saveState();
        const btn = document.getElementById('lnk-btn-start');
        if (btn) { btn.textContent = t('limit_btn'); btn.style.background = '#000'; btn.style.cursor = 'not-allowed'; }
        setTimeout(() => showModal('alert-error', t('alert_limit_title'), t('alert_limit_msg')), 100);
    }

    // ─────────────────────────────────────────────
    // NOTE-CLOSER via MutationObserver (replaces loopPopup polling)
    // ─────────────────────────────────────────────
    const noteCloserObserver = new MutationObserver(() => {
        if (!isNoteCloserActive) return;
        const btn = findSendWithoutNoteBtn();
        if (btn && !btn.disabled) nativeClick(btn);
    });
    // Only watch for dialog additions, not full subtree text changes
    noteCloserObserver.observe(document.body, { childList: true, subtree: false });

    // Also observe shadow root once it's available
    function attachShadowObserver() {
        const root = getShadowRoot();
        if (root) {
            noteCloserObserver.observe(root, { childList: true, subtree: true });
        } else {
            // Shadow root not ready yet — retry once
            setTimeout(attachShadowObserver, 1000);
        }
    }
    attachShadowObserver();

    // ─────────────────────────────────────────────
    // NEXT PAGE — "Sonraki" / "Next" button on search results
    // ─────────────────────────────────────────────
    function findNextPageBtn() {
        // 1) data-testid (most reliable — LinkedIn search pagination)
        const byTestId = document.querySelector('[data-testid="pagination-controls-next-button-visible"]');
        if (byTestId && !byTestId.disabled) return byTestId;

        // 2) aria-label / innerText fallback
        for (const el of document.querySelectorAll('button, a[href]')) {
            if (el.disabled || el.getAttribute('aria-disabled') === 'true') continue;
            const txt   = el.innerText?.trim().toLowerCase() ?? '';
            const label = el.getAttribute('aria-label')?.toLowerCase() ?? '';
            if (txt === 'sonraki' || txt === 'next' || label === 'sonraki' || label === 'next') return el;
        }
        return null;
    }

    // Track scroll attempts so we don't scroll forever before trying next page
    let _scrollAttempts = 0;
    const MAX_SCROLL_BEFORE_NEXTPAGE = 3;

    // ─────────────────────────────────────────────
    // CONNECT LOOP — still timer-based (needs interval control)
    // but only queries DOM when actually running
    // ─────────────────────────────────────────────
    function scheduleConnect() {
        setTimeout(() => {
            if (isConnectorRunning && !S.isAutoAdding) {
                if (checkWeeklyLimit()) { handleLimitHit(); scheduleConnect(); return; }

                const isPopupOpen = findInShadows('div[role="dialog"]') || findInShadows('.artdeco-modal');
                if (!isPopupOpen) {
                    const btn = findConnectBtn();
                    if (btn) {
                        _scrollAttempts = 0; // reset on success
                        nativeClick(btn);
                        S.totalCount++;
                        S.lastDate = getFormattedDate();
                        updateCounterDisplay();
                    } else {
                        // Scroll down a few times first to reveal lazily-loaded cards
                        if (_scrollAttempts < MAX_SCROLL_BEFORE_NEXTPAGE) {
                            _scrollAttempts++;
                            window.scrollBy({ top: 350, behavior: 'smooth' });
                        } else {
                            // No more connect buttons on this page → go to next page
                            _scrollAttempts = 0;
                            const nextBtn = findNextPageBtn();
                            if (nextBtn) {
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                setTimeout(() => nativeClick(nextBtn), 400);
                            }
                            // If no next button either, we're on the last page — just wait
                        }
                    }
                }
            }
            scheduleConnect();
        }, S.speedConnect);
    }
    scheduleConnect();

    // ─────────────────────────────────────────────
    // LIMIT WATCHER — focused MutationObserver (childList only on body)
    // ─────────────────────────────────────────────
    const limitObserver = new MutationObserver((mutations) => {
        for (const m of mutations) {
            for (const node of m.addedNodes) {
                if (!(node instanceof Element)) continue;
                if (node.classList?.contains('ip-fuse-limit-alert') ||
                    node.getAttribute?.('data-test-modal-id') === 'fuse-limit-alert' ||
                    node.id === 'ip-fuse-limit-alert__header') {

                    node.remove();
                    document.querySelectorAll('.artdeco-modal-overlay').forEach(el => el.remove());
                    document.body.style.overflow = 'auto';
                    document.body.classList.remove('artdeco-modal-is-open');
                    handleLimitHit();
                }
            }
        }
    });
    // childList only — no subtree needed, limit alerts are direct body children
    limitObserver.observe(document.body, { childList: true });

    // ─────────────────────────────────────────────
    // MANUAL CONNECT COUNTER (trusted click listener)
    // ─────────────────────────────────────────────
    document.addEventListener('click', (e) => {
        if (!e.isTrusted) return;
        const btn = e.target.closest('button, a');
        if (!btn) return;
        const txt   = btn.innerText?.toLowerCase() ?? '';
        const label = btn.getAttribute('aria-label')?.toLowerCase() ?? '';

        if (txt.includes('not olmadan') || label.includes('not olmadan') || label.includes('without a note')) {
            S.totalCount++;
            S.lastDate = getFormattedDate();
            updateCounterDisplay();
            return;
        }
        if (txt.includes('bağlantı kur') || label.includes('bağlantı kur') ||
            label.includes('davet et')   || label.includes('connect')) {
            // Count only if no modal follows (direct connect, no note popup)
            setTimeout(() => {
                const modal = document.querySelector('.artdeco-modal, div[role="dialog"]');
                if (!modal) { S.totalCount++; S.lastDate = getFormattedDate(); updateCounterDisplay(); }
            }, 600);
        }
    }, true);

    // ─────────────────────────────────────────────
    // MODAL
    // ─────────────────────────────────────────────
    function injectModalStyles() {
        if (document.getElementById('lnk-modal-style')) return;
        const s = document.createElement('style');
        s.id = 'lnk-modal-style';
        s.textContent = `
            @keyframes lnkFadeIn { from { opacity:0 } to { opacity:1 } }
            @keyframes lnkPopIn  { from { transform:scale(.9); opacity:0 } to { transform:scale(1); opacity:1 } }
            .lnk-modal-btn { padding:12px 24px; border-radius:8px; border:none; cursor:pointer; font-weight:600; font-size:14px; margin:0 5px; transition:.2s; }
            .lnk-modal-btn:hover { opacity:.9; transform:translateY(-1px); }
            .lnk-modal-btn:active { transform:scale(.96); }
        `;
        document.head.appendChild(s);
    }

    function showModal(type, title, message, onConfirm) {
        const existing = document.getElementById('lnk-custom-modal-overlay');
        if (existing?.innerText?.includes(title)) return;
        existing?.remove();
        injectModalStyles();

        const overlay = Object.assign(document.createElement('div'), { id: 'lnk-custom-modal-overlay' });
        overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.85);backdrop-filter:blur(8px);z-index:2147483647;display:flex;align-items:center;justify-content:center;animation:lnkFadeIn .2s ease-out;';

        const isConfirm = type === 'confirm';
        const borderColor = type === 'alert-error' ? '#ff4444' : '#333';
        const buttons = isConfirm
            ? `<button id="lnk-modal-cancel" class="lnk-modal-btn" style="background:#333;color:#ccc;">${t('modal_cancel')}</button>
               <button id="lnk-modal-confirm" class="lnk-modal-btn" style="background:#0d6efd;color:#fff;">${t('modal_confirm')}</button>`
            : `<button id="lnk-modal-ok" class="lnk-modal-btn" style="background:#0d6efd;color:#fff;min-width:100px;">${t('modal_ok')}</button>`;

        overlay.innerHTML = `
            <div style="background:#121212;width:400px;padding:30px;border-radius:16px;border:2px solid ${borderColor};
                        box-shadow:0 0 50px rgba(0,0,0,.5);text-align:center;font-family:system-ui;color:#fff;
                        animation:lnkPopIn .2s cubic-bezier(.175,.885,.32,1.275) forwards;">
                <div style="font-size:22px;font-weight:800;margin-bottom:12px;">${title}</div>
                <div style="font-size:16px;color:#ccc;margin-bottom:30px;line-height:1.5;">${message}</div>
                <div style="display:flex;justify-content:center;gap:10px;">${buttons}</div>
            </div>`;

        document.body.appendChild(overlay);
        if (isConfirm) {
            document.getElementById('lnk-modal-cancel').onclick  = () => overlay.remove();
            document.getElementById('lnk-modal-confirm').onclick = () => { overlay.remove(); onConfirm?.(); };
        } else {
            document.getElementById('lnk-modal-ok').onclick = () => overlay.remove();
        }
    }

    // ─────────────────────────────────────────────
    // PROFILE SAVE
    // ─────────────────────────────────────────────
    function saveCurrentProfile() {
        const url = window.location.href;
        if (!url.includes('/in/')) { showModal('alert', t('title'), t('error_profile')); return; }
        if (S.savedProfiles.some(p => p.url === url)) { showModal('alert', t('title'), t('error_exists')); return; }

        const name = document.querySelector('h1')?.innerText.trim()
                  || document.title.split('|')[0].trim()
                  || 'Unknown';

        S.savedProfiles.push({ name, url, date: getFormattedDate() });
        saveState();

        const btn = document.getElementById('lnk-btn-save');
        if (btn) {
            const orig = btn.textContent;
            btn.textContent = t('save_success');
            btn.style.background = '#198754';
            setTimeout(() => { btn.textContent = orig; btn.style.background = '#6610f2'; }, 1500);
        }
        const listBtn = document.getElementById('lnk-btn-list');
        if (listBtn) listBtn.textContent = `${t('list_btn')} (${S.savedProfiles.length})`;
    }

    function deleteProfile(index) {
        S.savedProfiles.splice(index, 1);
        saveState();
        renderSavedListView();
    }

    // ─────────────────────────────────────────────
    // AUTO-ADD DASHBOARD
    // ─────────────────────────────────────────────
    function startAutoAddProcess() {
        if (!S.savedProfiles.length) { showModal('alert', t('alert_empty_title'), t('alert_empty_msg')); return; }
        showModal('confirm', t('confirm_auto_title'),
            `${t('confirm_auto_msg_1')}${S.savedProfiles.length}${t('confirm_auto_msg_2')}`,
            () => { S.isAutoAdding = true; S.autoAddIndex = 0; saveState(); window.location.href = S.savedProfiles[0].url; });
    }

    function processAutoAddStep() {
        if (!S.isAutoAdding) return;

        const total   = S.savedProfiles.length;
        const current = S.autoAddIndex;
        const pct     = Math.round(((current + 1) / total) * 100);

        if (!document.getElementById('lnk-dash-style')) {
            const s = document.createElement('style');
            s.id = 'lnk-dash-style';
            s.textContent = `
                @keyframes lnkSlideIn { from { opacity:0;transform:translateX(50px) } to { opacity:1;transform:translateX(0) } }
                .lnk-progress-bar  { width:100%;height:6px;background:#444;border-radius:3px;overflow:hidden;margin-top:5px; }
                .lnk-progress-fill { height:100%;background:#0d6efd;transition:width .5s ease; }
                .lnk-dash-btn:active { transform:scale(.96); }
            `;
            document.head.appendChild(s);
        }

        const dash = document.createElement('div');
        dash.style.cssText = 'position:fixed;top:80px;right:20px;width:280px;background:rgba(25,25,25,.9);backdrop-filter:blur(12px);border-left:4px solid #0d6efd;border-radius:8px;box-shadow:0 8px 32px rgba(0,0,0,.4);z-index:999999;font-family:-apple-system,system-ui;color:#fff;padding:15px;display:flex;flex-direction:column;gap:10px;animation:lnkSlideIn .5s ease-out;';
        dash.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;">
                <span style="font-weight:700;font-size:14px;color:#0d6efd;">${t('dash_title')}</span>
                <span style="font-size:12px;color:#aaa;">${pct}%</span>
            </div>
            <div style="font-size:13px;color:#eee;">${t('dash_person')}: <b>${current + 1}</b> / ${total}</div>
            <div class="lnk-progress-bar"><div class="lnk-progress-fill" style="width:${pct}%"></div></div>
            <div id="lnk-status-text" style="font-size:12px;color:#ccc;min-height:18px;">${t('dash_status_scan')}</div>`;

        const stopBtn = document.createElement('button');
        stopBtn.className = 'lnk-dash-btn';
        stopBtn.textContent = t('stop');
        stopBtn.style.cssText = 'background:#333;color:#ff6b6b;border:1px solid #444;padding:6px 12px;border-radius:6px;cursor:pointer;font-size:12px;font-weight:600;margin-top:5px;width:100%;transition:all .2s;';
        stopBtn.onmouseover = () => stopBtn.style.background = '#444';
        stopBtn.onmouseout  = () => stopBtn.style.background = '#333';
        stopBtn.onclick = () => {
            S.isAutoAdding = false; saveState();
            dash.style.borderLeftColor = '#dc3545';
            document.getElementById('lnk-status-text').innerHTML = t('dash_stop_user');
            dash.querySelector('.lnk-progress-fill').style.background = '#dc3545';
            setTimeout(() => dash.remove(), 2000);
        };
        dash.appendChild(stopBtn);
        document.body.appendChild(dash);

        // Main auto-add logic — async IIFE so we can await naturally
        (async () => {
            const statusText = document.getElementById('lnk-status-text');
            const progressFill = dash.querySelector('.lnk-progress-fill');

            await new Promise(r => setTimeout(r, SLEEP_BETWEEN_ACTIONS));

            if (checkWeeklyLimit()) {
                S.isAutoAdding = false; saveState();
                dash.style.borderLeftColor = '#dc3545';
                statusText.innerHTML = `<span style='color:#ff4444'>${t('dash_stop_limit')}</span>`;
                return;
            }

            const connectBtn = findConnectBtn();
            const pendingBtn = (() => {
                for (const b of document.querySelectorAll('button, a')) {
                    const txt = b.innerText?.toLowerCase() ?? '';
                    if (txt.includes('istek gönderildi') || txt.includes('pending') || txt.includes('beklemede')) return b;
                }
                return null;
            })();

            if (connectBtn) {
                statusText.textContent = t('dash_status_conn');
                connectBtn.click();
                await new Promise(r => setTimeout(r, 1000));

                const sendBtn = findSendWithoutNoteBtn();
                if (sendBtn) {
                    nativeClick(sendBtn);
                    S.totalCount++;
                    S.lastDate = getFormattedDate();
                    saveState();
                }
                statusText.innerHTML = `<span style='color:#198754'>${t('dash_status_sent')}</span>`;
                progressFill.style.background = '#198754';
            } else if (pendingBtn) {
                statusText.innerHTML = `<span style='color:#ffc107'>${t('dash_status_pending')}</span>`;
                progressFill.style.background = '#ffc107';
            } else {
                statusText.innerHTML = `<span style='color:#aaa'>${t('dash_status_fail')}</span>`;
            }

            S.autoAddIndex++;
            saveState();
            await new Promise(r => setTimeout(r, 1500));

            if (S.autoAddIndex < total) {
                statusText.textContent = t('dash_next');
                window.location.href = S.savedProfiles[S.autoAddIndex].url;
            } else {
                S.isAutoAdding = false;
                S.autoAddIndex = 0;
                saveState();
                dash.style.borderLeftColor = '#198754';
                progressFill.style.width   = '100%';
                progressFill.style.background = '#198754';
                statusText.textContent = t('dash_done');
                stopBtn.style.display = 'none';
                setTimeout(() => dash.remove(), 5000);
            }
        })();
    }

    // ─────────────────────────────────────────────
    // PANEL UI
    // ─────────────────────────────────────────────
    function renderMainView() {
        const container = document.getElementById('lnk-panel-content');
        if (!container) return;
        container.innerHTML = '';

        // Counter row
        const infoRow = document.createElement('div');
        infoRow.style.cssText = 'text-align:center;color:#ccc;font-size:12px;margin-bottom:5px;border-bottom:1px solid #444;padding-bottom:10px;cursor:pointer;';
        infoRow.innerHTML = `<span style="color:#fff;font-weight:bold;">${t('total')}: <span id="lnk-counter-val">${S.totalCount}</span></span> <span style="color:#555;">|</span> <span>${t('last')}: <span id="lnk-last-date" style="color:#fff;">${S.lastDate}</span></span>`;
        infoRow.onclick = () => showModal('confirm', t('confirm_reset_title'), t('confirm_reset_msg'), () => {
            S.totalCount = 0; S.lastDate = '-'; updateCounterDisplay();
        });

        // Shared styles
        const R  = 'display:flex;gap:10px;align-items:center;';
        const B  = 'border:none;border-radius:6px;padding:10px;cursor:pointer;font-weight:600;font-size:13px;flex-grow:1;color:#fff;text-align:center;';
        const I  = 'width:50px;padding:10px;border-radius:6px;border:1px solid #555;background:#222;color:#fff;text-align:center;font-size:13px;outline:none;';

        // Save + List row
        const saveRow = document.createElement('div');
        saveRow.style.cssText = R;

        const saveBtn = document.createElement('button');
        saveBtn.id = 'lnk-btn-save';
        saveBtn.textContent = t('save_btn');
        saveBtn.style.cssText = B + 'background:#6610f2;';
        saveBtn.onclick = saveCurrentProfile;

        const listBtn = document.createElement('button');
        listBtn.id = 'lnk-btn-list';
        listBtn.textContent = `${t('list_btn')} (${S.savedProfiles.length})`;
        listBtn.style.cssText = B + 'background:#fd7e14;max-width:80px;';
        listBtn.onclick = renderSavedListView;
        saveRow.append(saveBtn, listBtn);

        // Note closer row
        const row1 = document.createElement('div');
        row1.style.cssText = R;

        const noteBtn = document.createElement('button');
        noteBtn.textContent = `${t('note_closer')}: ${isNoteCloserActive ? t('active') : t('passive')}`;
        noteBtn.style.cssText = B + (isNoteCloserActive ? 'background:#198754;' : 'background:#6c757d;');
        noteBtn.onclick = () => {
            isNoteCloserActive = !isNoteCloserActive;
            noteBtn.textContent = `${t('note_closer')}: ${isNoteCloserActive ? t('active') : t('passive')}`;
            noteBtn.style.background = isNoteCloserActive ? '#198754' : '#6c757d';
        };

        const noteInput = document.createElement('input');
        noteInput.type = 'number'; noteInput.value = S.speedPopup; noteInput.style.cssText = I;
        noteInput.onchange = (e) => { S.speedPopup = parseInt(e.target.value) || 100; saveState(); };
        row1.append(noteBtn, noteInput);

        // Start/Stop row
        const row2 = document.createElement('div');
        row2.style.cssText = R;

        const startBtn = document.createElement('button');
        startBtn.id = 'lnk-btn-start';
        startBtn.textContent = isConnectorRunning ? t('stop') : t('start');
        startBtn.style.cssText = B + (isConnectorRunning ? 'background:#dc3545;' : 'background:#0d6efd;');
        startBtn.onclick = () => {
            if (startBtn.textContent.includes(t('limit_btn'))) {
                showModal('alert-error', 'Dikkat', t('alert_limit_msg')); return;
            }
            isConnectorRunning = !isConnectorRunning;
            startBtn.textContent = isConnectorRunning ? t('stop') : t('start');
            startBtn.style.background = isConnectorRunning ? '#dc3545' : '#0d6efd';
        };

        const startInput = document.createElement('input');
        startInput.type = 'number'; startInput.value = S.speedConnect; startInput.style.cssText = I;
        startInput.onchange = (e) => { S.speedConnect = parseInt(e.target.value) || 1000; saveState(); };
        row2.append(startBtn, startInput);

        // Footer
        const footer = document.createElement('div');
        footer.style.cssText = 'display:flex;justify-content:space-between;margin-top:5px;font-size:10px;color:#777;';
        const updateLink = document.createElement('a');
        updateLink.href = UPDATE_LINK; updateLink.target = '_blank';
        updateLink.style.cssText = 'color:#777;text-decoration:none;';
        updateLink.innerHTML = `🔄 ${t('update')}`;
        const sig = document.createElement('div');
        sig.textContent = 'tanersb'; sig.style.cssText = 'font-style:italic;';
        footer.append(updateLink, sig);

        container.append(infoRow, saveRow, row1, row2, footer);
    }

    function renderSavedListView() {
        const container = document.getElementById('lnk-panel-content');
        if (!container) return;
        container.innerHTML = '';

        const header = document.createElement('div');
        header.style.cssText = 'text-align:center;padding-bottom:10px;border-bottom:1px solid #444;margin-bottom:10px;';
        header.innerHTML = `<b>${t('list_header')} (${S.savedProfiles.length})</b>`;

        const listWrap = document.createElement('div');
        listWrap.style.cssText = 'max-height:200px;overflow-y:auto;display:flex;flex-direction:column;gap:8px;margin-bottom:10px;padding-right:5px;';

        if (!S.savedProfiles.length) {
            listWrap.innerHTML = `<div style='text-align:center;color:#777;font-style:italic;'>${t('list_empty')}</div>`;
        } else {
            S.savedProfiles.forEach((profile, i) => {
                const item = document.createElement('div');
                item.style.cssText = 'display:flex;justify-content:space-between;align-items:center;background:#333;padding:8px;border-radius:6px;';
                const link = Object.assign(document.createElement('a'), { href: profile.url, target: '_blank', textContent: profile.name });
                link.style.cssText = 'color:#fff;text-decoration:none;font-size:13px;font-weight:bold;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:180px;';
                const del = document.createElement('button');
                del.innerHTML = '&times;';
                del.style.cssText = 'background:none;border:none;color:#ff6b6b;font-size:18px;cursor:pointer;';
                del.onclick = () => deleteProfile(i);
                item.append(link, del);
                listWrap.appendChild(item);
            });
        }

        const btnRow = document.createElement('div');
        btnRow.style.cssText = 'display:flex;gap:5px;';

        const backBtn = document.createElement('button');
        backBtn.textContent = t('back');
        backBtn.style.cssText = 'flex:1;padding:8px;background:#6c757d;border:none;border-radius:6px;color:white;cursor:pointer;font-size:11px;';
        backBtn.onclick = renderMainView;

        const autoBtn = document.createElement('button');
        autoBtn.textContent = t('auto_add');
        autoBtn.style.cssText = 'flex:2;padding:8px;background:#0dcaf0;border:none;border-radius:6px;color:#000;font-weight:bold;cursor:pointer;font-size:11px;transition:.2s;';
        autoBtn.onclick = startAutoAddProcess;

        const clearBtn = document.createElement('button');
        clearBtn.textContent = t('clear');
        clearBtn.style.cssText = 'flex:1;padding:8px;background:#dc3545;border:none;border-radius:6px;color:white;cursor:pointer;font-size:11px;transition:.2s;';
        clearBtn.onclick = () => showModal('confirm', t('confirm_clear_title'), t('confirm_clear_msg'), () => {
            S.savedProfiles = []; saveState(); renderSavedListView();
        });

        btnRow.append(backBtn, autoBtn, clearBtn);
        container.append(header, listWrap, btnRow);
    }

    // ─────────────────────────────────────────────
    // PANEL INIT
    // ─────────────────────────────────────────────
    function initPanel() {
        document.querySelectorAll('#lnk-modern-panel').forEach(e => e.remove());
        if (!document.body) { setTimeout(initPanel, 500); return; }

        if (S.isAutoAdding) processAutoAddStep();

        if (!document.getElementById('lnk-panel-style')) {
            const s = document.createElement('style');
            s.id = 'lnk-panel-style';
            s.textContent = `
                input[type=number]::-webkit-inner-spin-button,
                input[type=number]::-webkit-outer-spin-button { -webkit-appearance:none;margin:0; }
                input[type=number] { -moz-appearance:textfield; }
                #lnk-panel-content ::-webkit-scrollbar { width:5px; }
                #lnk-panel-content ::-webkit-scrollbar-track { background:#222; }
                #lnk-panel-content ::-webkit-scrollbar-thumb { background:#555;border-radius:5px; }
                #lnk-modern-panel button { transition:transform .1s ease,background .2s; }
                #lnk-modern-panel button:active { transform:scale(.95);opacity:.9; }
            `;
            document.head.appendChild(s);
        }

        const isClosed = S.panelState === 'closed';
        const panel = document.createElement('div');
        panel.id = 'lnk-modern-panel';
        panel.style.cssText = `position:fixed;bottom:85px;right:25px;z-index:2147483647;background:rgba(20,20,20,.95);border:1px solid #555;color:#fff;font-family:system-ui;backdrop-filter:blur(10px);min-width:${isClosed?'auto':'280px'};border-radius:${isClosed?'30px':'12px'};transition:all .3s;`;

        const wrapper = document.createElement('div');
        wrapper.style.cssText = `display:${isClosed?'none':'block'};padding:20px;`;

        const headerRow = document.createElement('div');
        headerRow.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:5px;';

        const titleEl = document.createElement('div');
        titleEl.textContent = t('title');
        titleEl.style.cssText = 'font-weight:800;font-size:16px;';

        const controls = document.createElement('div');
        controls.style.cssText = 'display:flex;gap:8px;align-items:center;';

        const langBtn = document.createElement('button');
        langBtn.textContent = S.lang.toUpperCase();
        langBtn.title = 'Change Language / Dili Değiştir';
        langBtn.style.cssText = 'background:#333;color:#aaa;border:1px solid #555;border-radius:4px;font-size:10px;padding:2px 5px;cursor:pointer;font-weight:bold;';
        langBtn.onclick = (e) => {
            e.stopPropagation();
            S.lang = S.lang === 'tr' ? 'en' : 'tr';
            saveState();
            panel.remove();
            initPanel();
        };

        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '&minus;';
        closeBtn.style.cssText = 'background:#333;color:#fff;border:none;border-radius:50%;width:28px;height:28px;cursor:pointer;';

        controls.append(langBtn, closeBtn);

        const content = document.createElement('div');
        content.id = 'lnk-panel-content';
        content.style.cssText = 'display:flex;flex-direction:column;gap:15px;margin-top:10px;';

        headerRow.append(titleEl, controls);
        wrapper.append(headerRow, content);

        const mini = document.createElement('div');
        mini.textContent = '@tanersb';
        mini.style.cssText = `padding:20px;cursor:pointer;font-weight:bold;display:${isClosed?'flex':'none'};`;

        const openPanel  = () => { mini.style.display='none'; wrapper.style.display='block'; panel.style.minWidth='280px'; panel.style.borderRadius='12px'; S.panelState='open'; saveState(); };
        const closePanel = (e) => { e?.stopPropagation(); wrapper.style.display='none'; mini.style.display='flex'; panel.style.minWidth='auto'; panel.style.borderRadius='30px'; S.panelState='closed'; saveState(); };

        mini.onclick    = openPanel;
        closeBtn.onclick = closePanel;

        panel.append(wrapper, mini);
        document.body.appendChild(panel);
        renderMainView();
    }

    initPanel();
})();
