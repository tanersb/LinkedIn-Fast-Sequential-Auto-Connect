// ==UserScript==
// @name         LinkedIn Auto Connect
// @namespace    https://github.com/tanersb/LinkedIn-Fast-Sequential-Auto-Connect
// @version      8.0
// @description  Shadow DOM fix + Clean UI + Speed Controls + Signature + Timestamp + Full Reset + Update Checker + Limit Detection + State Memory + Profile Saver + Auto Add Saved + Full Custom UI + Robust Interceptor.
// @author       tanersb
// @match        https://www.linkedin.com/*
// @updateURL    https://raw.githubusercontent.com/tanersb/LinkedIn-Fast-Sequential-Auto-Connect/main/linkedin-fast-sequential.user.js
// @downloadURL  https://raw.githubusercontent.com/tanersb/LinkedIn-Fast-Sequential-Auto-Connect/main/linkedin-fast-sequential.user.js
// @grant        none
// ==/UserScript==

/*
    LinkedIn Fast Sequential Auto Connect
    ------------------------------------
    Author  : TanerSB
    Repo    : https://github.com/tanersb/LinkedIn-Fast-Sequential-Auto-Connect
    License : MIT
*/

(function () {
    'use strict';

    // --- SABİTLER ---
    const UPDATE_LINK = "https://raw.githubusercontent.com/tanersb/LinkedIn-Fast-Sequential-Auto-Connect/main/linkedin-fast-sequential.user.js";
    const SLEEP_BETWEEN_ACTIONS = 2500;

    // --- AYARLAR VE HAFIZA ---
    let isConnectorRunning = false;
    let isNoteCloserActive = true;

    let totalCount = parseInt(localStorage.getItem('LnAuto_TotalCount')) || 0;
    let speedPopup = parseInt(localStorage.getItem('LnAuto_SpeedPopup')) || 100;
    let speedConnect = parseInt(localStorage.getItem('LnAuto_SpeedConnect')) || 1000;
    let lastActionDate = localStorage.getItem('LnAuto_LastDate') || '-';
    let panelState = localStorage.getItem('LnAuto_PanelState') || 'open';

    let savedProfiles = [];
    try {
        savedProfiles = JSON.parse(localStorage.getItem('LnAuto_SavedProfiles')) || [];
    } catch (e) {
        savedProfiles = [];
    }

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
    }

    // --- YARDIMCI FONKSİYONLAR ---
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
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const hour = String(now.getHours()).padStart(2, '0');
        const min = String(now.getMinutes()).padStart(2, '0');
        return `${day}.${month} ${hour}:${min}`;
    }

    function updateCounterDisplay() {
        const counterEl = document.getElementById('lnk-counter-val');
        const dateEl = document.getElementById('lnk-last-date');
        if (counterEl) counterEl.textContent = totalCount;
        if (dateEl) dateEl.textContent = lastActionDate;
        saveSettings();
    }

    // --- GLOBAL CUSTOM MODAL SİSTEMİ ---
    function showModal(type, title, message, onConfirm) {
        // Zaten açık bir modal varsa ve içeriği aynıysa tekrar açma (Loop koruması)
        const existingModal = document.getElementById('lnk-custom-modal-overlay');
        if (existingModal && existingModal.innerText.includes(title)) return;
        if (existingModal) existingModal.remove();

        const overlay = document.createElement('div');
        overlay.id = 'lnk-custom-modal-overlay';
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0, 0, 0, 0.85); /* Daha koyu arka plan */
            backdrop-filter: blur(8px);
            z-index: 2147483647; /* En üst katman */
            display: flex; align-items: center; justify-content: center;
            animation: fadeIn 0.2s ease-out;
        `;

        const modal = document.createElement('div');
        modal.style.cssText = `
            background: #121212;
            width: 400px;
            padding: 30px;
            border-radius: 16px;
            border: 2px solid #ff4444; /* Hata durumunda kırmızı çerçeve varsayılan olsun */
            box-shadow: 0 0 50px rgba(255, 68, 68, 0.2);
            text-align: center;
            font-family: system-ui, -apple-system, sans-serif;
            color: #fff;
            transform: scale(0.9);
            animation: popIn 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        `;

        // Eğer type confirm ise veya normal bir uyarıysa border rengini ayarla
        if (type !== 'alert-error' && title.includes('Limit') === false) {
             modal.style.border = "1px solid #333";
             modal.style.boxShadow = "0 25px 60px rgba(0,0,0,0.6)";
        }

        if (!document.getElementById('lnk-modal-style')) {
            const style = document.createElement('style');
            style.id = 'lnk-modal-style';
            style.innerHTML = `
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes popIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                .lnk-modal-btn { padding: 12px 24px; border-radius: 8px; border: none; cursor: pointer; font-weight: 600; font-size: 14px; margin: 0 5px; transition: 0.2s; }
                .lnk-modal-btn:hover { opacity: 0.9; transform: translateY(-1px); }
                .lnk-modal-btn:active { transform: scale(0.96); }
            `;
            document.head.appendChild(style);
        }

        let buttonsHtml = '';
        if (type === 'confirm') {
            buttonsHtml = `
                <button id="lnk-modal-cancel" class="lnk-modal-btn" style="background: #333; color: #ccc;">İPTAL</button>
                <button id="lnk-modal-confirm" class="lnk-modal-btn" style="background: #0d6efd; color: #fff;">ONAYLA</button>
            `;
        } else {
            buttonsHtml = `
                <button id="lnk-modal-ok" class="lnk-modal-btn" style="background: #0d6efd; color: #fff; min-width: 100px;">TAMAM</button>
            `;
        }

        modal.innerHTML = `
            <div style="font-size: 22px; font-weight: 800; margin-bottom: 12px; color: #fff;">${title}</div>
            <div style="font-size: 16px; color: #ccc; margin-bottom: 30px; line-height: 1.5;">${message}</div>
            <div style="display: flex; justify-content: center; gap: 10px;">
                ${buttonsHtml}
            </div>
        `;

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        if (type === 'confirm') {
            document.getElementById('lnk-modal-cancel').onclick = () => overlay.remove();
            document.getElementById('lnk-modal-confirm').onclick = () => {
                overlay.remove();
                if (onConfirm) onConfirm();
            };
        } else {
            document.getElementById('lnk-modal-ok').onclick = () => overlay.remove();
        }
    }

    // --- MUTATION OBSERVER (KESKİN NİŞANCI MODU) ---
    const observer = new MutationObserver((mutations) => {
        // LinkedIn'in limit uyarısının olası tüm class ve id'leri
        const limitAlert = document.querySelector('.ip-fuse-limit-alert');
        const limitOverlay = document.querySelector('[data-test-modal-id="fuse-limit-alert"]');
        const limitHeader = document.getElementById('ip-fuse-limit-alert__header');

        if (limitAlert || limitOverlay || limitHeader) {
            console.warn(">>> [INTERCEPTOR] LinkedIn Limit Uyarısı Yakalandı! İmha ediliyor...");

            // 1. LinkedIn Elementlerini Yok Et
            if (limitOverlay) limitOverlay.remove();
            if (limitAlert) limitAlert.remove();

            // 2. Kalan Artıkları Temizle
            document.querySelectorAll('.artdeco-modal-overlay').forEach(el => el.remove());
            document.body.style.overflow = 'auto';
            document.body.classList.remove('artdeco-modal-is-open');

            // 3. Botu Durdur
            isConnectorRunning = false;
            isAutoAdding = false;
            saveSettings();

            // 4. Paneldeki Butonu Güncelle (Varsa)
            const startBtn = document.getElementById('lnk-btn-start');
            if (startBtn) {
                startBtn.textContent = "LİMİT DOLDU";
                startBtn.style.background = "#000";
            }

            // 5. BİZİM UYARIYI BAS (Gecikmeli, garanti olsun diye)
            setTimeout(() => {
                showModal('alert-error', '⚠️ HAFTALIK LİMİT UYARISI',
                    'LinkedIn\'in "Haftalık Davet Sınırı" uyarısı tespit edildi ve ekranınızdan kaldırıldı.<br><br>Bot güvenliğiniz için otomatik olarak durduruldu. Lütfen daha fazla zorlamayın.');
            }, 100);
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });


    // --- OTO EKLEME ---
    function startAutoAddProcess() {
        if (!savedProfiles || savedProfiles.length === 0) {
            showModal('alert', 'Liste Boş', 'İşleme başlamak için önce profil sayfalarına gidip <b>"BU PROFİLİ KAYDET"</b> butonuna basarak liste oluşturun.');
            return;
        }

        showModal('confirm', 'Oto Ekleme Başlatılsın mı?',
            `Listede toplam <b>${savedProfiles.length}</b> kişi var.<br><br>Bot sırayla bu profilleri gezip 'Bağlantı Kur' butonuna basacak.`,
            () => {
                isAutoAdding = true;
                autoAddIndex = 0;
                saveSettings();
                window.location.href = savedProfiles[0].url;
            }
        );
    }

    function processAutoAddStep() {
        if (!isAutoAdding) return;

        const dashboard = document.createElement('div');
        const progressPercent = Math.round(((autoAddIndex + 1) / savedProfiles.length) * 100);

        dashboard.style.cssText = `
            position: fixed; top: 80px; right: 20px; width: 280px;
            background: rgba(25, 25, 25, 0.9); backdrop-filter: blur(12px);
            border-left: 4px solid #0d6efd; border-radius: 8px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4); z-index: 999999;
            font-family: -apple-system, system-ui; color: #fff; padding: 15px;
            display: flex; flex-direction: column; gap: 10px; animation: slideIn 0.5s ease-out;
        `;

        const styleSheet = document.createElement("style");
        styleSheet.innerText = `
            @keyframes slideIn { from { opacity: 0; transform: translateX(50px); } to { opacity: 1; transform: translateX(0); } }
            .lnk-progress-bar { width: 100%; height: 6px; background: #444; border-radius: 3px; overflow: hidden; margin-top: 5px; }
            .lnk-progress-fill { height: 100%; background: #0d6efd; width: 0%; transition: width 0.5s ease; }
            .lnk-dash-btn:active { transform: scale(0.96); }
        `;
        document.head.appendChild(styleSheet);

        dashboard.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <span style="font-weight:700; font-size:14px; color:#0d6efd;">🤖 Oto Ekleme Modu</span>
                <span style="font-size:12px; color:#aaa;">${progressPercent}%</span>
            </div>
            <div style="font-size:13px; color:#eee;">Kişi: <b>${autoAddIndex + 1}</b> / ${savedProfiles.length}</div>
            <div class="lnk-progress-bar"><div class="lnk-progress-fill" style="width: ${progressPercent}%"></div></div>
            <div id="lnk-status-text" style="font-size:12px; color:#ccc; min-height:18px;">Profil taranıyor...</div>
        `;

        const stopBtn = document.createElement("button");
        stopBtn.className = "lnk-dash-btn";
        stopBtn.textContent = "Durdur";
        stopBtn.style.cssText = `background: #333; color: #ff6b6b; border: 1px solid #444; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600; margin-top: 5px; width: 100%; transition: all 0.2s;`;
        stopBtn.onmouseover = () => stopBtn.style.background = "#444";
        stopBtn.onmouseout = () => stopBtn.style.background = "#333";

        stopBtn.onclick = () => {
            isAutoAdding = false;
            saveSettings();
            dashboard.style.borderLeftColor = "#dc3545";
            document.getElementById('lnk-status-text').innerHTML = "🛑 Kullanıcı durdurdu.";
            document.querySelector('.lnk-progress-fill').style.background = "#dc3545";
            setTimeout(() => dashboard.remove(), 2000);
        };
        dashboard.appendChild(stopBtn);
        document.body.appendChild(dashboard);

        setTimeout(async () => {
            const statusText = document.getElementById('lnk-status-text');

            // (Observer zaten yakalar ama burası da dursun)
            const limitHeader = document.getElementById('ip-fuse-limit-alert__header');
            if (limitHeader) {
                // Burada bir şey yapmaya gerek yok, Observer halledecek.
                return;
            }

            const buttons = Array.from(document.querySelectorAll('button'));
            const connectBtn = buttons.find(b => (b.innerText.trim() === 'Bağlantı kur' || b.innerText.trim() === 'Connect') && !b.disabled);
            const pendingBtn = buttons.find(b => b.innerText.trim() === 'İstek gönderildi' || b.innerText.trim() === 'Pending');

            if (connectBtn) {
                statusText.innerText = "Bağlantı kuruluyor...";
                connectBtn.click();
                await new Promise(r => setTimeout(r, 1000));
                const sendNowBtn = findInShadows('button[aria-label="Not olmadan gönderin"]') || document.querySelector('button[aria-label="Send without a note"]');
                if (sendNowBtn) {
                    nativeClick(sendNowBtn);
                    totalCount++;
                    lastActionDate = getFormattedDate();
                }
                statusText.innerHTML = "<span style='color:#198754'>✔ İstek Gönderildi</span>";
                document.querySelector('.lnk-progress-fill').style.background = "#198754";
            } else if (pendingBtn) {
                statusText.innerHTML = "<span style='color:#ffc107'>⚠ Zaten İstek Atılmış</span>";
                document.querySelector('.lnk-progress-fill').style.background = "#ffc107";
            } else {
                statusText.innerHTML = "<span style='color:#aaa'>❌ Buton Bulunamadı</span>";
            }

            autoAddIndex++;
            saveSettings();
            await new Promise(r => setTimeout(r, 1500));

            if (autoAddIndex < savedProfiles.length) {
                statusText.innerText = "Sıradaki profile geçiliyor...";
                window.location.href = savedProfiles[autoAddIndex].url;
            } else {
                isAutoAdding = false;
                autoAddIndex = 0;
                saveSettings();
                dashboard.style.borderLeftColor = "#198754";
                document.querySelector('.lnk-progress-fill').style.width = "100%";
                document.querySelector('.lnk-progress-fill').style.background = "#198754";
                statusText.innerText = "✅ TÜM LİSTE TAMAMLANDI!";
                stopBtn.style.display = "none";
                setTimeout(() => dashboard.remove(), 5000);
            }
        }, SLEEP_BETWEEN_ACTIONS);
    }

    // --- DİĞER FONKSİYONLAR ---
    function saveCurrentProfile() {
        const url = window.location.href;
        if (!url.includes('/in/')) {
            showModal('alert', 'Hata', 'Lütfen bir kişi profiline girin.<br>(Örn: linkedin.com/in/kullanici)');
            return;
        }
        if (savedProfiles.some(p => p.url === url)) {
            showModal('alert', 'Mevcut', 'Bu kişi zaten listenizde kayıtlı.');
            return;
        }

        let name = "Bilinmeyen İsim";
        const h1 = document.querySelector('h1');
        if (h1) name = h1.innerText.trim();
        else {
            const title = document.title.split('|')[0].trim();
            if (title) name = title;
        }

        savedProfiles.push({ name, url, date: getFormattedDate() });
        saveSettings();

        const btn = document.getElementById('lnk-btn-save');
        if(btn) {
            const oldTxt = btn.innerText;
            btn.innerText = "KAYDEDİLDİ ✔";
            btn.style.background = "#198754";
            setTimeout(() => { btn.innerText = oldTxt; btn.style.background = "#6610f2"; }, 1500);
        }

        const listBtn = document.getElementById('lnk-btn-list');
        if(listBtn) listBtn.textContent = `LİSTE (${savedProfiles.length})`;
    }

    function deleteProfile(index) {
        savedProfiles.splice(index, 1);
        saveSettings();
        renderSavedListView();
    }

    function renderMainView() {
        const container = document.getElementById('lnk-panel-content');
        if(!container) return;
        container.innerHTML = '';

        const infoRow = document.createElement("div");
        infoRow.style.cssText = "text-align:center; color:#ccc; font-size:12px; margin-bottom:5px; border-bottom:1px solid #444; padding-bottom:10px; cursor:pointer;";
        infoRow.innerHTML = `<span style="color:#fff; font-weight:bold;">Toplam: <span id="lnk-counter-val">${totalCount}</span></span> <span style="color:#555;">|</span> <span>Son: <span id="lnk-last-date" style="color:#fff;">${lastActionDate}</span></span>`;
        infoRow.onclick = () => {
            showModal('confirm', 'Sayaç Sıfırlama', 'Toplam sayı ve son işlem tarihi sıfırlansın mı?', () => {
                totalCount = 0; lastActionDate = '-'; updateCounterDisplay();
            });
        };

        const rowStyle = "display: flex; gap: 10px; align-items: center;";
        const btnStyle = "border:none; border-radius:6px; padding:10px; cursor:pointer; font-weight:600; font-size:13px; flex-grow:1; color:#fff; text-align:center;";
        const inputStyle = "width:50px; padding:10px; border-radius:6px; border:1px solid #555; background:#222; color:#fff; text-align:center; font-size:13px; outline:none;";

        const saveRow = document.createElement("div");
        saveRow.style.cssText = rowStyle;
        const saveBtn = document.createElement("button");
        saveBtn.id = "lnk-btn-save";
        saveBtn.textContent = "BU PROFİLİ KAYDET";
        saveBtn.style.cssText = btnStyle + "background: #6610f2;";
        saveBtn.onclick = saveCurrentProfile;
        const listBtn = document.createElement("button");
        listBtn.id = "lnk-btn-list";
        listBtn.textContent = `LİSTE (${savedProfiles.length})`;
        listBtn.style.cssText = btnStyle + "background: #fd7e14; max-width: 80px;";
        listBtn.onclick = renderSavedListView;
        saveRow.append(saveBtn, listBtn);

        const row1 = document.createElement("div");
        row1.style.cssText = rowStyle;
        const noteBtn = document.createElement("button");
        noteBtn.textContent = isNoteCloserActive ? "Not Kapatıcı: AKTİF" : "Not Kapatıcı: PASİF";
        noteBtn.style.cssText = btnStyle + (isNoteCloserActive ? "background: #198754;" : "background: #6c757d;");
        noteBtn.onclick = () => { isNoteCloserActive = !isNoteCloserActive; noteBtn.textContent = isNoteCloserActive ? "Not Kapatıcı: AKTİF" : "Not Kapatıcı: PASİF"; noteBtn.style.background = isNoteCloserActive ? "#198754" : "#6c757d"; };
        const noteInput = document.createElement("input");
        noteInput.type = "number"; noteInput.value = speedPopup; noteInput.style.cssText = inputStyle;
        noteInput.onchange = (e) => { speedPopup = parseInt(e.target.value) || 100; saveSettings(); };
        row1.append(noteBtn, noteInput);

        const row2 = document.createElement("div");
        row2.style.cssText = rowStyle;
        const startBtn = document.createElement("button");
        startBtn.id = "lnk-btn-start";
        startBtn.textContent = isConnectorRunning ? "DURDUR" : "BAŞLAT";
        startBtn.style.cssText = btnStyle + (isConnectorRunning ? "background: #dc3545;" : "background: #0d6efd;");
        startBtn.onclick = () => {
            if (startBtn.textContent.includes("LİMİT")) return;
            isConnectorRunning = !isConnectorRunning;
            startBtn.textContent = isConnectorRunning ? "DURDUR" : "BAŞLAT";
            startBtn.style.background = isConnectorRunning ? "#dc3545" : "#0d6efd";
        };
        const startInput = document.createElement("input");
        startInput.type = "number"; startInput.value = speedConnect; startInput.style.cssText = inputStyle;
        startInput.onchange = (e) => { speedConnect = parseInt(e.target.value) || 1000; saveSettings(); };
        row2.append(startBtn, startInput);

        const footerRow = document.createElement("div");
        footerRow.style.cssText = "display:flex; justify-content:space-between; margin-top:5px; font-size:10px; color:#777;";
        const updateLink = document.createElement("a");
        updateLink.href = UPDATE_LINK; updateLink.target = "_blank"; updateLink.style.cssText = "color:#777; text-decoration:none;"; updateLink.innerHTML = "🔄 Update";
        const signature = document.createElement("div"); signature.textContent = "tanersb"; signature.style.cssText = "font-style:italic;";
        footerRow.append(updateLink, signature);

        container.append(infoRow, saveRow, row1, row2, footerRow);
    }

    function renderSavedListView() {
        const container = document.getElementById('lnk-panel-content');
        if(!container) return;
        container.innerHTML = '';

        const header = document.createElement("div");
        header.innerHTML = `<b>Kayıtlı Profiller (${savedProfiles.length})</b>`;
        header.style.cssText = "text-align:center; padding-bottom:10px; border-bottom:1px solid #444; margin-bottom:10px;";

        const listContainer = document.createElement("div");
        listContainer.style.cssText = "max-height:200px; overflow-y:auto; display:flex; flex-direction:column; gap:8px; margin-bottom:10px; padding-right:5px;";

        if (savedProfiles.length === 0) {
            listContainer.innerHTML = "<div style='text-align:center; color:#777; font-style:italic;'>Liste boş.</div>";
        } else {
            savedProfiles.forEach((profile, index) => {
                const item = document.createElement("div");
                item.style.cssText = "display:flex; justify-content:space-between; align-items:center; background:#333; padding:8px; border-radius:6px;";
                const link = document.createElement("a");
                link.href = profile.url; link.textContent = profile.name; link.target = "_blank";
                link.style.cssText = "color:#fff; text-decoration:none; font-size:13px; font-weight:bold; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:180px;";
                const delBtn = document.createElement("button");
                delBtn.innerHTML = "&times;"; delBtn.style.cssText = "background:none; border:none; color:#ff6b6b; font-size:18px; cursor:pointer;";
                delBtn.addEventListener('click', () => deleteProfile(index));
                item.append(link, delBtn);
                listContainer.append(item);
            });
        }

        const btnRow = document.createElement("div");
        btnRow.style.cssText = "display:flex; gap:5px;";

        const backBtn = document.createElement("button");
        backBtn.textContent = "« GERİ";
        backBtn.style.cssText = "flex:1; padding:8px; background:#6c757d; border:none; border-radius:6px; color:white; cursor:pointer; font-size:11px;";
        backBtn.addEventListener('click', renderMainView);

        const autoAddBtn = document.createElement("button");
        autoAddBtn.textContent = "HEPSİNİ EKLE (OTO)";
        autoAddBtn.style.cssText = "flex:2; padding:8px; background:#0dcaf0; border:none; border-radius:6px; color:#000; font-weight:bold; cursor:pointer; font-size:11px; transition:0.2s;";
        autoAddBtn.addEventListener('click', () => { startAutoAddProcess(); });

        const clearAllBtn = document.createElement("button");
        clearAllBtn.textContent = "TEMİZLE";
        clearAllBtn.style.cssText = "flex:1; padding:8px; background:#dc3545; border:none; border-radius:6px; color:white; cursor:pointer; font-size:11px; transition:0.2s;";
        clearAllBtn.addEventListener('click', () => {
            showModal('confirm', 'Listeyi Temizle', 'Tüm kayıtlı profiller silinecek. Emin misiniz?', () => {
                savedProfiles = [];
                saveSettings();
                renderSavedListView();
            });
        });

        btnRow.append(backBtn, autoAddBtn, clearAllBtn);
        container.append(header, listContainer, btnRow);
    }

    // --- DÖNGÜLER ---
    function loopPopup() {
        if (isNoteCloserActive) {
            const sendBtn = findInShadows('button[aria-label="Not olmadan gönderin"]');
            if (sendBtn && !sendBtn.disabled) nativeClick(sendBtn);
        }
        setTimeout(loopPopup, speedPopup);
    }
    loopPopup();

    function loopConnect() {
        if (isConnectorRunning && !isAutoAdding) {
            const isPopupOpen = findInShadows('div[role="dialog"]') || findInShadows('.artdeco-modal');
            if (!isPopupOpen) {
                const allButtons = document.querySelectorAll('button, span');
                for (let el of allButtons) {
                    if (el.innerText && el.innerText.trim() === "Bağlantı kur") {
                        const btn = el.closest('button') || el;
                        if (btn && !btn.disabled) {
                            btn.click();
                            totalCount++;
                            lastActionDate = getFormattedDate();
                            updateCounterDisplay();
                            break;
                        }
                    }
                }
            }
        }
        setTimeout(loopConnect, speedConnect);
    }
    loopConnect();

    // --- INIT ---
    function initPanel() {
        if (!document.body) return setTimeout(initPanel, 500);

        if (isAutoAdding) processAutoAddStep();

        const old = document.getElementById('lnk-modern-panel');
        if(old) old.remove();

        const style = document.createElement('style');
        style.innerHTML = `
            input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
            input[type=number] { -moz-appearance: textfield; }
            #lnk-panel-content ::-webkit-scrollbar { width: 5px; }
            #lnk-panel-content ::-webkit-scrollbar-track { background: #222; }
            #lnk-panel-content ::-webkit-scrollbar-thumb { background: #555; border-radius: 5px; }
            #lnk-modern-panel button:active { transform: scale(0.95); opacity: 0.9; }
            #lnk-modern-panel button { transition: transform 0.1s ease, background 0.2s; }
        `;
        document.head.appendChild(style);

        const isClosed = panelState === 'closed';
        const panel = document.createElement("div");
        panel.id = "lnk-modern-panel";
        panel.style.cssText = `position:fixed; bottom:85px; right:25px; z-index:2147483647; background:rgba(20,20,20,0.95); border:1px solid #555; color:#fff; font-family:system-ui; backdrop-filter:blur(10px); min-width:${isClosed?'auto':'280px'}; border-radius:${isClosed?'30px':'12px'}; transition:all 0.3s;`;

        const wrapper = document.createElement("div");
        wrapper.style.display = isClosed ? 'none' : 'block';
        wrapper.style.padding = "20px";

        const headerRow = document.createElement("div");
        headerRow.style.cssText = "display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;";
        const title = document.createElement("div"); title.textContent = "LinkedIn Auto v8.0"; title.style.cssText = "font-weight:800; font-size:16px;";
        const closeBtn = document.createElement("button"); closeBtn.innerHTML = "&minus;"; closeBtn.style.cssText = "background:#333; color:#fff; border:none; border-radius:50%; width:28px; height:28px; cursor:pointer;";

        const dynamicContent = document.createElement("div");
        dynamicContent.id = "lnk-panel-content";
        dynamicContent.style.cssText = "display:flex; flex-direction:column; gap:15px; margin-top:10px;";

        headerRow.append(title, closeBtn);
        wrapper.append(headerRow, dynamicContent);

        const miniView = document.createElement("div");
        miniView.textContent = "@tanersb";
        miniView.style.cssText = `padding:20px; cursor:pointer; font-weight:bold; display:${isClosed?'flex':'none'};`;

        miniView.onclick = () => { miniView.style.display="none"; wrapper.style.display="block"; panel.style.minWidth="280px"; panel.style.borderRadius="12px"; localStorage.setItem('LnAuto_PanelState', 'open'); };
        closeBtn.onclick = (e) => { e.stopPropagation(); wrapper.style.display="none"; miniView.style.display="flex"; panel.style.minWidth="auto"; panel.style.borderRadius="30px"; localStorage.setItem('LnAuto_PanelState', 'closed'); };

        panel.append(wrapper, miniView);
        document.body.appendChild(panel);
        renderMainView();
    }
    initPanel();
})();
