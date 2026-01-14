// ==UserScript==
// @name         LinkedIn Auto Connect v9.1
// @namespace    https://github.com/tanersb/LinkedIn-Fast-Sequential-Auto-Connect
// @version      9.1
// @author       tanersb
// @match        https://www.linkedin.com/*
// @updateURL    https://raw.githubusercontent.com/tanersb/LinkedIn-Fast-Sequential-Auto-Connect/main/linkedin-fast-sequential.user.js
// @downloadURL  https://raw.githubusercontent.com/tanersb/LinkedIn-Fast-Sequential-Auto-Connect/main/linkedin-fast-sequential.user.js
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    if (window.top !== window.self) return;

    const UPDATE_LINK = "https://raw.githubusercontent.com/tanersb/LinkedIn-Fast-Sequential-Auto-Connect/main/linkedin-fast-sequential.user.js";
    const SLEEP_BETWEEN_ACTIONS = 2500;

    const TEXTS = {
        tr: {
            title: "LinkedIn Auto v9.1",
            total: "Toplam",
            last: "Son",
            save_btn: "BU PROFİLİ KAYDET",
            save_success: "KAYDEDİLDİ ✔",
            list_btn: "LİSTE",
            note_closer: "Not Kapatıcı",
            active: "AKTİF",
            passive: "PASİF",
            start: "BAŞLAT",
            stop: "DURDUR",
            limit_btn: "LİMİT DOLDU",
            update: "Güncelle",
            list_header: "Kayıtlı Profiller",
            list_empty: "Liste boş.",
            back: "« GERİ",
            auto_add: "HEPSİNİ EKLE (OTO)",
            clear: "TEMİZLE",
            confirm_reset_title: "Sayaç Sıfırlama",
            confirm_reset_msg: "Toplam sayı ve son işlem tarihi sıfırlansın mı?",
            confirm_clear_title: "Listeyi Temizle",
            confirm_clear_msg: "Tüm kayıtlı profiller silinecek. Emin misiniz?",
            alert_empty_title: "Liste Boş",
            alert_empty_msg: "İşleme başlamak için önce profil sayfalarına gidip <b>'BU PROFİLİ KAYDET'</b> butonuna basarak liste oluşturun.",
            confirm_auto_title: "Oto Ekleme Başlatılsın mı?",
            confirm_auto_msg_1: "Listede toplam <b>",
            confirm_auto_msg_2: "</b> kişi var.<br><br>Bot sırayla bu profilleri gezip 'Bağlantı Kur' butonuna basacak.",
            alert_limit_title: "⚠️ HAFTALIK LİMİT UYARISI",
            alert_limit_msg: "LinkedIn'in 'Haftalık Davet Sınırı' uyarısı tespit edildi ve ekranınızdan kaldırıldı.<br><br>Bot güvenliğiniz için otomatik olarak durduruldu.",
            modal_cancel: "İPTAL",
            modal_confirm: "ONAYLA",
            modal_ok: "TAMAM",
            error_profile: "Lütfen bir kişi profiline girin.<br>(Örn: linkedin.com/in/kullanici)",
            error_exists: "Bu kişi zaten listenizde kayıtlı.",
            dash_title: "🤖 Oto Ekleme Modu",
            dash_person: "Kişi",
            dash_status_scan: "Profil taranıyor...",
            dash_status_conn: "Bağlantı kuruluyor...",
            dash_status_more: "Menü kontrol ediliyor...",
            dash_status_sent: "✔ İstek Gönderildi",
            dash_status_pending: "⚠ Zaten Beklemede (Atlandı)",
            dash_status_already: "✔ Zaten Bağlısınız (Atlandı)",
            dash_status_fail: "❌ Bağlantı Butonu Yok",
            dash_next: "Sıradaki profile geçiliyor...",
            dash_done: "✅ TÜM LİSTE TAMAMLANDI!",
            dash_stop_user: "🛑 Kullanıcı durdurdu.",
            dash_stop_limit: "⚠️ HAFTALIK LİMİT!",
            status_scrolling: "Buton aranıyor... (Kaydırılıyor)"
        },
        en: {
            title: "LinkedIn Auto v9.1",
            total: "Total",
            last: "Last",
            save_btn: "SAVE THIS PROFILE",
            save_success: "SAVED ✔",
            list_btn: "LIST",
            note_closer: "Note Closer",
            active: "ACTIVE",
            passive: "OFF",
            start: "START",
            stop: "STOP",
            limit_btn: "LIMIT REACHED",
            update: "Update",
            list_header: "Saved Profiles",
            list_empty: "List is empty.",
            back: "« BACK",
            auto_add: "ADD ALL (AUTO)",
            clear: "CLEAR ALL",
            confirm_reset_title: "Reset Counter",
            confirm_reset_msg: "Reset total count and last action date?",
            confirm_clear_title: "Clear List",
            confirm_clear_msg: "All saved profiles will be deleted. Are you sure?",
            alert_empty_title: "List Empty",
            alert_empty_msg: "To start, visit profile pages and click <b>'SAVE THIS PROFILE'</b> to build your list.",
            confirm_auto_title: "Start Auto Add?",
            confirm_auto_msg_1: "There are <b>",
            confirm_auto_msg_2: "</b> people in the list.<br><br>The bot will visit each profile and click 'Connect'.",
            alert_limit_title: "⚠️ WEEKLY LIMIT WARNING",
            alert_limit_msg: "LinkedIn's 'Weekly Invitation Limit' warning was detected and removed from your screen.<br><br>The bot has been stopped for your safety.",
            modal_cancel: "CANCEL",
            modal_confirm: "CONFIRM",
            modal_ok: "OK",
            error_profile: "Please visit a user profile.<br>(e.g. linkedin.com/in/user)",
            error_exists: "This person is already in your list.",
            dash_title: "🤖 Auto Add Mode",
            dash_person: "Person",
            dash_status_scan: "Scanning profile...",
            dash_status_conn: "Connecting...",
            dash_status_more: "Checking menu...",
            dash_status_sent: "✔ Request Sent",
            dash_status_pending: "⚠ Already Pending (Skipped)",
            dash_status_already: "✔ Already Connected (Skipped)",
            dash_status_fail: "❌ No Connect Button",
            dash_next: "Moving to next profile...",
            dash_done: "✅ ALL DONE!",
            dash_stop_user: "🛑 Stopped by user.",
            dash_stop_limit: "⚠️ WEEKLY LIMIT!",
            status_scrolling: "Searching... (Scrolling)"
        }
    };

    let currentLang = localStorage.getItem('LnAuto_Lang') || 'tr';
    const t = (key) => TEXTS[currentLang][key] || key;

    let isConnectorRunning = false;
    let isNoteCloserActive = true;
    let totalCount = parseInt(localStorage.getItem('LnAuto_TotalCount')) || 0;
    let speedPopup = parseInt(localStorage.getItem('LnAuto_SpeedPopup')) || 100;
    let speedConnect = parseInt(localStorage.getItem('LnAuto_SpeedConnect')) || 1000;
    let lastActionDate = localStorage.getItem('LnAuto_LastDate') || '-';
    let panelState = localStorage.getItem('LnAuto_PanelState') || 'open';
    let savedProfiles = [];
    try { savedProfiles = JSON.parse(localStorage.getItem('LnAuto_SavedProfiles')) || []; } catch (e) { savedProfiles = []; }
    let isAutoAdding = localStorage.getItem('LnAuto_IsAutoAdding') === 'true';
    let autoAddIndex = parseInt(localStorage.getItem('LnAuto_AutoAddIndex')) || 0;

    function saveSettings() {
        localStorage.setItem('LnAuto_SpeedPopup', speedPopup);
        localStorage.setItem('LnAuto_SpeedConnect', speedConnect);
        localStorage.setItem('LnAuto_TotalCount', totalCount);
        localStorage.setItem('LnAuto_LastDate', lastActionDate);
        localStorage.setItem('LnAuto_SavedProfiles', JSON.stringify(savedProfiles));
        localStorage.setItem('LnAuto_IsAutoAdding', isAutoAdding);
        localStorage.setItem('LnAuto_AutoAddIndex', autoAddIndex);
        localStorage.setItem('LnAuto_Lang', currentLang);
    }

    function findInShadows(selector) {
        let el = document.querySelector(selector);
        if (el) return el;
        const shadowHost = document.querySelector("#interop-outlet");
        if (shadowHost && shadowHost.shadowRoot) {
            el = shadowHost.shadowRoot.querySelector(selector);
            if (el) return el;
        }
        return null;
    }

    function nativeClick(element) {
        if (!element) return;
        ['mouseover', 'mousedown', 'mouseup', 'click'].forEach(evt => {
            element.dispatchEvent(new MouseEvent(evt, { bubbles: true, cancelable: true, view: window }));
        });
    }

    function getFormattedDate() {
        const now = new Date();
        return `${String(now.getDate()).padStart(2, '0')}.${String(now.getMonth() + 1).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    }

    function updateCounterDisplay() {
        const counterEl = document.getElementById('lnk-counter-val');
        const dateEl = document.getElementById('lnk-last-date');
        if (counterEl) counterEl.textContent = totalCount;
        if (dateEl) dateEl.textContent = lastActionDate;
        saveSettings();
    }

    function findTargetButton(keywords, checkAria = true) {
        const candidates = Array.from(document.querySelectorAll('button, a, div[role="button"]'));
        return candidates.find(btn => {
            if (btn.disabled || btn.getAttribute('aria-disabled') === 'true') return false;
            if (btn.offsetParent === null) return false;

            const text = (btn.innerText || "").toLowerCase();
            const label = checkAria ? (btn.getAttribute('aria-label') || "").toLowerCase() : "";

            return keywords.some(k => text.includes(k) || label.includes(k));
        });
    }

    const observer = new MutationObserver(() => {
        const limitEl = document.querySelector('.ip-fuse-limit-alert') || document.querySelector('[data-test-modal-id="fuse-limit-alert"]');
        if (limitEl) {
            limitEl.remove();
            document.querySelectorAll('.artdeco-modal-overlay').forEach(el => el.remove());
            document.body.style.overflow = 'auto';
            isConnectorRunning = false; isAutoAdding = false; saveSettings();
            showModal('alert-error', t('alert_limit_title'), t('alert_limit_msg'));
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    function checkWeeklyLimit() {
        if (document.body.innerText.includes("Haftalık bağlantı daveti sınırına") || document.body.innerText.includes("Weekly invitation limit")) return true;
        return false;
    }

    document.addEventListener('click', (e) => {
        if (!e.isTrusted) return;
        const btn = e.target.closest('button') || e.target.closest('a') || e.target.closest('div[role="button"]');
        if (!btn) return;
        const txt = (btn.innerText || "").toLowerCase();
        const label = (btn.getAttribute('aria-label') || "").toLowerCase();

        if (txt.includes('not olmadan') || label.includes('without a note')) {
            totalCount++; lastActionDate = getFormattedDate(); updateCounterDisplay(); return;
        }
        if (txt.includes('bağlantı kur') || label.includes('bağlantı kur') || label.includes('davet et') || label.includes('connect')) {
            setTimeout(() => {
                const modal = document.querySelector('.artdeco-modal') || document.querySelector('div[role="dialog"]');
                if (!modal) { totalCount++; lastActionDate = getFormattedDate(); updateCounterDisplay(); }
            }, 600);
        }
    }, true);

    function showModal(type, title, message, onConfirm) {
        const existing = document.getElementById('lnk-custom-modal-overlay');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.id = 'lnk-custom-modal-overlay';
        overlay.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.85); z-index: 2147483647; display: flex; align-items: center; justify-content: center;`;

        const modal = document.createElement('div');
        modal.style.cssText = `background: #121212; width: 400px; padding: 30px; border-radius: 16px; border: 2px solid ${type === 'alert-error' ? '#ff4444' : '#333'}; text-align: center; color: #fff; font-family: sans-serif;`;

        const btns = type === 'confirm'
            ? `<button id="lnk-mdl-cncl" style="padding:10px 20px; border-radius:8px; border:none; background:#333; color:#ccc; margin-right:10px; cursor:pointer;">${t('modal_cancel')}</button>
               <button id="lnk-mdl-cnf" style="padding:10px 20px; border-radius:8px; border:none; background:#0d6efd; color:#fff; cursor:pointer;">${t('modal_confirm')}</button>`
            : `<button id="lnk-mdl-ok" style="padding:10px 20px; border-radius:8px; border:none; background:#0d6efd; color:#fff; cursor:pointer;">${t('modal_ok')}</button>`;

        modal.innerHTML = `<div style="font-size:22px; font-weight:800; margin-bottom:12px;">${title}</div><div style="color:#ccc; margin-bottom:30px;">${message}</div><div>${btns}</div>`;
        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        if (type === 'confirm') {
            document.getElementById('lnk-mdl-cncl').onclick = () => overlay.remove();
            document.getElementById('lnk-mdl-cnf').onclick = () => { overlay.remove(); if (onConfirm) onConfirm(); };
        } else {
            document.getElementById('lnk-mdl-ok').onclick = () => overlay.remove();
        }
    }

    function startAutoAddProcess() {
        if (!savedProfiles.length) return showModal('alert', t('alert_empty_title'), t('alert_empty_msg'));
        showModal('confirm', t('confirm_auto_title'), `${t('confirm_auto_msg_1')}${savedProfiles.length}${t('confirm_auto_msg_2')}`, () => {
            isAutoAdding = true; autoAddIndex = 0; saveSettings();
            window.location.href = savedProfiles[0].url;
        });
    }

    function processAutoAddStep() {
        if (!isAutoAdding) return;

        let dashboard = document.getElementById('lnk-auto-dash');
        if (!dashboard) {
            dashboard = document.createElement('div');
            dashboard.id = 'lnk-auto-dash';
            dashboard.style.cssText = `position:fixed; top:80px; right:20px; width:280px; background:rgba(25,25,25,0.95); border-left:4px solid #0d6efd; border-radius:8px; padding:15px; z-index:999999; font-family:sans-serif; color:#fff; box-shadow:0 8px 32px rgba(0,0,0,0.5);`;
            document.body.appendChild(dashboard);
        }

        const progress = Math.round(((autoAddIndex + 1) / savedProfiles.length) * 100);
        dashboard.innerHTML = `
            <div style="display:flex; justify-content:space-between; font-weight:bold; color:#0d6efd; margin-bottom:5px;"><span>${t('dash_title')}</span><span>${progress}%</span></div>
            <div style="font-size:13px; margin-bottom:5px;">${t('dash_person')}: <b>${autoAddIndex + 1}</b> / ${savedProfiles.length}</div>
            <div style="width:100%; height:6px; background:#444; border-radius:3px; overflow:hidden; margin-bottom:8px;"><div style="height:100%; background:#0d6efd; width:${progress}%; transition:width 0.5s;"></div></div>
            <div id="lnk-status-text" style="font-size:12px; color:#ccc;">${t('dash_status_scan')}</div>
            <button id="lnk-dash-stop" style="width:100%; background:#333; color:#ff6b6b; border:1px solid #444; margin-top:8px; padding:5px; border-radius:4px; cursor:pointer;">${t('stop')}</button>
        `;

        document.getElementById('lnk-dash-stop').onclick = () => {
            isAutoAdding = false; saveSettings(); dashboard.remove();
        };

        setTimeout(async () => {
            const statusText = document.getElementById('lnk-status-text');
            if (checkWeeklyLimit()) {
                isAutoAdding = false; saveSettings();
                statusText.innerHTML = `<span style='color:#ff4444'>${t('dash_stop_limit')}</span>`;
                return;
            }

            const pendingBtn = findTargetButton(['beklemede', 'pending', 'istek gönderildi', 'withdraw']);
            if (pendingBtn) {
                statusText.innerHTML = `<span style='color:#ffc107'>${t('dash_status_pending')}</span>`;
                document.querySelector('#lnk-auto-dash div div[style*="background:#0d6efd"]').style.background = "#ffc107";
                return next();
            }

            let connectBtn = findTargetButton(['bağlantı kur', 'connect', 'davet et']);

            if (!connectBtn) {
                const moreBtn = findTargetButton(['daha fazla', 'more', 'actions']);

                if (moreBtn) {
                    statusText.innerText = t('dash_status_more');
                    nativeClick(moreBtn);
                    await new Promise(r => setTimeout(r, 600));

                    const disconnectBtn = findTargetButton(['bağlantıyı sil', 'remove connection', 'bağlantıyı kaldır']);

                    if (disconnectBtn) {
                         statusText.innerHTML = `<span style='color:#0dcaf0'>${t('dash_status_already')}</span>`;
                         document.querySelector('#lnk-auto-dash div div[style*="background:#0d6efd"]').style.background = "#0dcaf0";
                         return next();
                    }

                    connectBtn = findTargetButton(['bağlantı kur', 'connect', 'davet et']);
                }
            }

            if (connectBtn) {
                statusText.innerText = t('dash_status_conn');
                nativeClick(connectBtn);
                await new Promise(r => setTimeout(r, 1000));

                let sendNowBtn = findTargetButton(['not olmadan', 'without a note']);
                if (sendNowBtn) {
                    nativeClick(sendNowBtn);
                    totalCount++; lastActionDate = getFormattedDate();
                }

                statusText.innerHTML = `<span style='color:#198754'>${t('dash_status_sent')}</span>`;
                document.querySelector('#lnk-auto-dash div div[style*="background:#0d6efd"]').style.background = "#198754";
            } else {
                statusText.innerHTML = `<span style='color:#aaa'>${t('dash_status_fail')}</span>`;
            }

            next();
        }, SLEEP_BETWEEN_ACTIONS);
    }

    function next() {
        autoAddIndex++; saveSettings();
        setTimeout(() => {
            const dashboard = document.getElementById('lnk-auto-dash');
            const statusText = document.getElementById('lnk-status-text');
            if(!dashboard) return;

            if (autoAddIndex < savedProfiles.length) {
                statusText.innerText = t('dash_next');
                window.location.href = savedProfiles[autoAddIndex].url;
            } else {
                isAutoAdding = false; autoAddIndex = 0; saveSettings();
                statusText.innerText = t('dash_done');
                document.getElementById('lnk-dash-stop').style.display = "none";
                setTimeout(() => dashboard.remove(), 5000);
            }
        }, 1500);
    }

    function saveCurrentProfile() {
        const url = window.location.href;
        if (!url.includes('/in/')) return showModal('alert', t('title'), t('error_profile'));
        if (savedProfiles.some(p => p.url === url)) return showModal('alert', t('title'), t('error_exists'));

        let name = "Unknown";
        const h1 = document.querySelector('h1');
        if (h1) name = h1.innerText.trim();
        else { const title = document.title.split('|')[0].trim(); if(title) name = title; }

        savedProfiles.push({ name, url, date: getFormattedDate() });
        saveSettings();

        const btn = document.getElementById('lnk-btn-save');
        if(btn) { btn.innerText = t('save_success'); btn.style.background = "#198754"; setTimeout(() => { btn.innerText = t('save_btn'); btn.style.background = "#6610f2"; }, 1500); }
        const listBtn = document.getElementById('lnk-btn-list');
        if(listBtn) listBtn.textContent = `${t('list_btn')} (${savedProfiles.length})`;
    }

    function renderMainView() {
        const container = document.getElementById('lnk-panel-content');
        if(!container) return;
        container.innerHTML = '';

        const info = document.createElement("div");
        info.innerHTML = `<span style="color:#fff; font-weight:bold;">${t('total')}: <span id="lnk-counter-val">${totalCount}</span></span> <span style="color:#555;">|</span> <span>${t('last')}: <span id="lnk-last-date" style="color:#fff;">${lastActionDate}</span></span>`;
        info.style.cssText = "text-align:center; color:#ccc; font-size:12px; margin-bottom:5px; border-bottom:1px solid #444; padding-bottom:10px; cursor:pointer;";
        info.onclick = () => showModal('confirm', t('confirm_reset_title'), t('confirm_reset_msg'), () => { totalCount=0; lastActionDate='-'; updateCounterDisplay(); });

        const mkBtn = (txt, bg, click) => {
            const b = document.createElement('button'); b.textContent = txt; b.style.cssText = `border:none; border-radius:6px; padding:10px; cursor:pointer; font-weight:600; font-size:13px; flex-grow:1; color:#fff; background:${bg};`; b.onclick = click; return b;
        };
        const mkInp = (val, chg) => {
            const i = document.createElement('input'); i.type="number"; i.value=val; i.style.cssText = "width:50px; padding:10px; border-radius:6px; border:1px solid #555; background:#222; color:#fff; text-align:center; font-size:13px; -moz-appearance: textfield;"; i.onchange=chg; return i;
        };

        const r1 = document.createElement('div'); r1.style.cssText="display:flex; gap:10px;";
        r1.append(mkBtn(t('save_btn'), "#6610f2", saveCurrentProfile));
        const lb = mkBtn(`${t('list_btn')} (${savedProfiles.length})`, "#fd7e14", renderSavedListView); lb.id = "lnk-btn-list"; lb.style.maxWidth = "80px";
        r1.append(lb);

        const r2 = document.createElement('div'); r2.style.cssText="display:flex; gap:10px;";
        const nb = mkBtn(`${t('note_closer')}: ${isNoteCloserActive ? t('active') : t('passive')}`, isNoteCloserActive?"#198754":"#6c757d", function() { isNoteCloserActive=!isNoteCloserActive; this.textContent=`${t('note_closer')}: ${isNoteCloserActive ? t('active') : t('passive')}`; this.style.background=isNoteCloserActive?"#198754":"#6c757d"; });
        r2.append(nb, mkInp(speedPopup, (e)=> { speedPopup=parseInt(e.target.value)||100; saveSettings(); }));

        const r3 = document.createElement('div'); r3.style.cssText="display:flex; gap:10px;";
        const sb = mkBtn(isConnectorRunning?t('stop'):t('start'), isConnectorRunning?"#dc3545":"#0d6efd", function() { if(this.textContent.includes('LİMİT')) return; isConnectorRunning=!isConnectorRunning; this.textContent=isConnectorRunning?t('stop'):t('start'); this.style.background=isConnectorRunning?"#dc3545":"#0d6efd"; });
        sb.id = "lnk-btn-start";
        r3.append(sb, mkInp(speedConnect, (e)=> { speedConnect=parseInt(e.target.value)||1000; saveSettings(); }));

        const foot = document.createElement('div');
        foot.innerHTML = `<a href="${UPDATE_LINK}" target="_blank" style="color:#777; text-decoration:none;">🔄 ${t('update')}</a> <span style="font-style:italic;">tanersb</span>`;
        foot.style.cssText = "display:flex; justify-content:space-between; margin-top:5px; font-size:10px; color:#777;";

        container.append(info, r1, r2, r3, foot);
    }

    function renderSavedListView() {
        const container = document.getElementById('lnk-panel-content');
        if(!container) return;
        container.innerHTML = '';

        const head = document.createElement('div'); head.innerHTML = `<b>${t('list_header')} (${savedProfiles.length})</b>`; head.style.cssText = "text-align:center; padding-bottom:10px; border-bottom:1px solid #444; margin-bottom:10px;";
        const list = document.createElement('div'); list.style.cssText = "max-height:200px; overflow-y:auto; display:flex; flex-direction:column; gap:8px; margin-bottom:10px;";

        if(!savedProfiles.length) list.innerHTML = `<div style='text-align:center; color:#777;'>${t('list_empty')}</div>`;
        else savedProfiles.forEach((p, i) => {
            const row = document.createElement('div'); row.style.cssText = "display:flex; justify-content:space-between; background:#333; padding:8px; border-radius:6px;";
            row.innerHTML = `<a href="${p.url}" target="_blank" style="color:#fff; text-decoration:none; font-size:13px; font-weight:bold; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:180px;">${p.name}</a>`;
            const d = document.createElement('button'); d.innerHTML = "&times;"; d.style.cssText = "background:none; border:none; color:#ff6b6b; cursor:pointer; font-size:18px;";
            d.onclick = () => { savedProfiles.splice(i, 1); saveSettings(); renderSavedListView(); };
            row.appendChild(d); list.appendChild(row);
        });

        const acts = document.createElement('div'); acts.style.cssText = "display:flex; gap:5px;";
        const bBack = document.createElement('button'); bBack.textContent=t('back'); bBack.style.cssText="flex:1; padding:8px; background:#6c757d; border-radius:6px; border:none; color:#fff; cursor:pointer;"; bBack.onclick=renderMainView;
        const bAuto = document.createElement('button'); bAuto.textContent=t('auto_add'); bAuto.style.cssText="flex:2; padding:8px; background:#0dcaf0; border-radius:6px; border:none; color:#000; font-weight:bold; cursor:pointer;"; bAuto.onclick=startAutoAddProcess;
        const bClear = document.createElement('button'); bClear.textContent=t('clear'); bClear.style.cssText="flex:1; padding:8px; background:#dc3545; border-radius:6px; border:none; color:#fff; cursor:pointer;"; bClear.onclick=()=>showModal('confirm', t('confirm_clear_title'), t('confirm_clear_msg'), ()=>{ savedProfiles=[]; saveSettings(); renderSavedListView(); });

        acts.append(bBack, bAuto, bClear);
        container.append(head, list, acts);
    }

    function loopPopup() {
        if (isNoteCloserActive) {
            const btn = findTargetButton(['not olmadan', 'without a note']);
            if (btn) nativeClick(btn);
        }
        setTimeout(loopPopup, speedPopup);
    }
    loopPopup();

    function loopConnect() {
        if (isConnectorRunning && !isAutoAdding) {
            if (checkWeeklyLimit()) {
                isConnectorRunning = false;
                const sb = document.getElementById('lnk-btn-start'); if(sb) { sb.textContent=t('limit_btn'); sb.style.background="#000"; }
                showModal('alert-error', t('alert_limit_title'), t('alert_limit_msg'));
                return;
            }
            if (!document.querySelector('.artdeco-modal')) {
                const pending = findTargetButton(['beklemede', 'pending', 'withdraw']);
                if(!pending) {
                    const btn = findTargetButton(['bağlantı kur', 'connect', 'davet et']);
                    if (btn) { nativeClick(btn); totalCount++; lastActionDate = getFormattedDate(); updateCounterDisplay(); }
                    else window.scrollBy({ top: 350, behavior: 'smooth' });
                } else {
                    window.scrollBy({ top: 150, behavior: 'smooth' });
                }
            }
        }
        setTimeout(loopConnect, speedConnect);
    }
    loopConnect();

    function initPanel() {
        document.querySelectorAll('#lnk-modern-panel').forEach(e => e.remove());
        if (!document.body) return setTimeout(initPanel, 500);

        const style = document.createElement('style');
        style.innerHTML = `
            input[type=number]::-webkit-inner-spin-button,
            input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
            input[type=number] { -moz-appearance: textfield; }
        `;
        document.head.appendChild(style);

        if (isAutoAdding) processAutoAddStep();

        const p = document.createElement('div'); p.id = "lnk-modern-panel";
        const isClosed = panelState === 'closed';
        p.style.cssText = `position:fixed; bottom:85px; right:25px; z-index:2147483647; background:rgba(20,20,20,0.95); border:1px solid #555; color:#fff; font-family:system-ui; backdrop-filter:blur(10px); transition:all 0.3s; border-radius:${isClosed?'30px':'12px'}; min-width:${isClosed?'auto':'280px'};`;

        const w = document.createElement('div'); w.style.cssText = `padding:20px; display:${isClosed?'none':'block'};`;
        w.innerHTML = `<div style="display:flex; justify-content:space-between; margin-bottom:5px;"><span style="font-weight:800; font-size:16px;">${t('title')}</span><div><button id="lnk-lang" style="background:#333; color:#aaa; border:1px solid #555; padding:2px 5px; font-size:10px; cursor:pointer; margin-right:5px;">${currentLang.toUpperCase()}</button><button id="lnk-close" style="background:#333; color:#fff; border:none; border-radius:50%; width:28px; height:28px; cursor:pointer;">&minus;</button></div></div><div id="lnk-panel-content" style="display:flex; flex-direction:column; gap:15px; margin-top:10px;"></div>`;

        const m = document.createElement('div'); m.textContent = "@tanersb"; m.style.cssText = `padding:20px; cursor:pointer; font-weight:bold; display:${isClosed?'flex':'none'};`;
        m.onclick = () => { m.style.display="none"; w.style.display="block"; p.style.minWidth="280px"; p.style.borderRadius="12px"; localStorage.setItem('LnAuto_PanelState', 'open'); };

        p.append(w, m); document.body.appendChild(p);

        document.getElementById('lnk-close').onclick = () => { w.style.display="none"; m.style.display="flex"; p.style.minWidth="auto"; p.style.borderRadius="30px"; localStorage.setItem('LnAuto_PanelState', 'closed'); };
        document.getElementById('lnk-lang').onclick = () => { currentLang = currentLang==='tr'?'en':'tr'; saveSettings(); p.remove(); initPanel(); };

        renderMainView();
    }
    initPanel();
})();
