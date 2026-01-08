// ==UserScript==
// @name         LinkedIn Auto Connect
// @namespace    https://github.com/tanersb/LinkedIn-Fast-Sequential-Auto-Connect
// @version      6.0
// @description  Shadow DOM fix + Clean UI + Speed Controls + Signature + Timestamp + Full Reset.
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

    // --- AYARLAR VE HAFIZA ---
    let isConnectorRunning = false;
    let isNoteCloserActive = true;

    // Hafızadan Verileri Çek
    let totalCount = parseInt(localStorage.getItem('LnAuto_TotalCount')) || 0;
    let speedPopup = parseInt(localStorage.getItem('LnAuto_SpeedPopup')) || 100;
    let speedConnect = parseInt(localStorage.getItem('LnAuto_SpeedConnect')) || 1000;
    let lastActionDate = localStorage.getItem('LnAuto_LastDate') || '-';

    // Ayarları Kaydet
    function saveSettings() {
        localStorage.setItem('LnAuto_SpeedPopup', speedPopup);
        localStorage.setItem('LnAuto_SpeedConnect', speedConnect);
        localStorage.setItem('LnAuto_TotalCount', totalCount);
        localStorage.setItem('LnAuto_LastDate', lastActionDate);
    }

    // --- MANTIK KISMI ---
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

    // Tarih Formatlayıcı (GG.AA SS:DD)
    function getFormattedDate() {
        const now = new Date();
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const hour = String(now.getHours()).padStart(2, '0');
        const min = String(now.getMinutes()).padStart(2, '0');
        return `${day}.${month} ${hour}:${min}`;
    }

    // Göstergeyi Güncelle
    function updateCounterDisplay() {
        const counterEl = document.getElementById('lnk-counter-val');
        const dateEl = document.getElementById('lnk-last-date');

        if (counterEl) counterEl.textContent = totalCount;
        if (dateEl) dateEl.textContent = lastActionDate;

        saveSettings();
    }

    // --- DÖNGÜLER ---

    // 1. POPUP KAPATICI
    function loopPopup() {
        if (isNoteCloserActive) {
            const sendBtn = findInShadows('button[aria-label="Not olmadan gönderin"]');
            if (sendBtn && !sendBtn.disabled) {
                console.log('>>> [Shadow] Gizli buton bulundu ve tıklandı!');
                nativeClick(sendBtn);
            }
        }
        setTimeout(loopPopup, speedPopup);
    }
    loopPopup();

    // 2. BAĞLANTI BOTU
    function loopConnect() {
        if (isConnectorRunning) {
            const isPopupOpen = findInShadows('div[role="dialog"]') || findInShadows('.artdeco-modal');
            if (!isPopupOpen) {
                const allButtons = document.querySelectorAll('button, span');
                for (let el of allButtons) {
                    if (el.innerText && el.innerText.trim() === "Bağlantı kur") {
                        const btn = el.closest('button') || el;
                        if (btn && !btn.disabled) {
                            btn.click();

                            // Sayacı ve Tarihi Güncelle
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


    // --- MODERN ARAYÜZ ---
    function initPanel() {
        if (!document.body) return setTimeout(initPanel, 500);

        const old = document.getElementById('lnk-modern-panel');
        if(old) old.remove();

        // CSS: Okları Gizle
        const style = document.createElement('style');
        style.innerHTML = `
            input[type=number]::-webkit-inner-spin-button,
            input[type=number]::-webkit-outer-spin-button {
                -webkit-appearance: none; margin: 0;
            }
            input[type=number] { -moz-appearance: textfield; }
        `;
        document.head.appendChild(style);

        // 1. ANA ÇERÇEVE
        const panel = document.createElement("div");
        panel.id = "lnk-modern-panel";

        panel.style.cssText = `
            position: fixed;
            bottom: 85px;
            right: 25px;
            z-index: 2147483647;
            background: rgba(20, 20, 20, 0.95);
            border: 1px solid #555; box-shadow: 0 10px 30px rgba(0,0,0,0.7);
            border-radius: 12px; color: #fff;
            font-family: system-ui, -apple-system, sans-serif;
            transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
            backdrop-filter: blur(10px);
            min-width: 280px;
        `;

        // 2. AÇIK GÖRÜNÜM
        const fullView = document.createElement("div");
        fullView.style.cssText = `
            padding: 20px; display: flex; flex-direction: column; gap: 15px;
        `;

        // Başlık ve Gizle
        const headerRow = document.createElement("div");
        headerRow.style.cssText = "display: flex; justify-content: space-between; align-items: center;";

        const title = document.createElement("div");
        title.textContent = "LinkedIn Auto v6.0";
        title.style.cssText = "font-weight: 800; font-size: 16px; letter-spacing: 0.5px;";

        const closeBtn = document.createElement("button");
        closeBtn.innerHTML = "&minus;";
        closeBtn.title = "Gizle";
        closeBtn.style.cssText = `
            background: #333; color: #fff; border: none; border-radius: 50%;
            width: 28px; height: 28px; cursor: pointer; font-size: 18px;
            display: flex; align-items: center; justify-content: center;
            transition: background 0.2s;
        `;
        closeBtn.onmouseover = () => closeBtn.style.background = "#555";
        closeBtn.onmouseout = () => closeBtn.style.background = "#333";

        headerRow.append(title, closeBtn);

        // --- SAYAÇ ve TARİH (Reset Özellikli) ---
        const infoRow = document.createElement("div");
        infoRow.style.cssText = `
            text-align: center; color: #ccc; font-size: 12px;
            margin-bottom: 5px; font-variant-numeric: tabular-nums; cursor: pointer;
            border-bottom: 1px solid #444; padding-bottom: 10px;
        `;
        infoRow.title = "Sıfırlamak için tıklayın";

        infoRow.innerHTML = `
            <span style="color:#fff; font-weight:bold;">Toplam: <span id="lnk-counter-val">${totalCount}</span></span>
            <span style="margin: 0 8px; color:#555;">|</span>
            <span>Son: <span id="lnk-last-date" style="color:#fff;">${lastActionDate}</span></span>
        `;

        // --- SIFIRLAMA MANTIĞI BURADA ---
        infoRow.onclick = () => {
            if(confirm('Dikkat: Toplam sayı ve Son işlem tarihi sıfırlansın mı?')) {
                totalCount = 0;
                lastActionDate = '-';
                updateCounterDisplay();
            }
        };

        // KONTROL SATIRLARI
        const rowStyle = "display: flex; gap: 10px; align-items: center;";
        const btnStyle = `
            border: none; border-radius: 6px; padding: 10px;
            cursor: pointer; font-weight: 600; font-size: 13px;
            flex-grow: 1; transition: all 0.2s; text-align: center;
        `;
        const inputStyle = `
            width: 50px; padding: 10px; border-radius: 6px; border: 1px solid #555;
            background: #222; color: #fff; text-align: center; font-family: monospace;
            font-size: 13px; outline: none;
        `;

        // SATIR 1
        const row1 = document.createElement("div");
        row1.style.cssText = rowStyle;
        const noteBtn = document.createElement("button");
        noteBtn.textContent = "Not Kapatıcı: AKTİF";
        noteBtn.style.cssText = btnStyle + "background: #198754; color: #fff;";
        noteBtn.onclick = () => {
            isNoteCloserActive = !isNoteCloserActive;
            if (isNoteCloserActive) {
                noteBtn.textContent = "Not Kapatıcı: AKTİF";
                noteBtn.style.background = "#198754";
            } else {
                noteBtn.textContent = "Not Kapatıcı: PASİF";
                noteBtn.style.background = "#6c757d";
            }
        };
        const noteInput = document.createElement("input");
        noteInput.type = "number";
        noteInput.value = speedPopup;
        noteInput.title = "Popup Hızı (ms)";
        noteInput.placeholder = "ms";
        noteInput.style.cssText = inputStyle;
        noteInput.onchange = (e) => { speedPopup = parseInt(e.target.value) || 100; saveSettings(); };
        row1.append(noteBtn, noteInput);

        // SATIR 2
        const row2 = document.createElement("div");
        row2.style.cssText = rowStyle;
        const startBtn = document.createElement("button");
        startBtn.textContent = "BAŞLAT";
        startBtn.style.cssText = btnStyle + "background: #0d6efd; color: #fff;";
        startBtn.onclick = () => {
            isConnectorRunning = !isConnectorRunning;
            if (isConnectorRunning) {
                startBtn.textContent = "DURDUR";
                startBtn.style.background = "#dc3545";
            } else {
                startBtn.textContent = "BAŞLAT";
                startBtn.style.background = "#0d6efd";
            }
        };
        const startInput = document.createElement("input");
        startInput.type = "number";
        startInput.value = speedConnect;
        startInput.title = "Bağlantı Hızı (ms)";
        startInput.placeholder = "ms";
        startInput.style.cssText = inputStyle;
        startInput.onchange = (e) => { speedConnect = parseInt(e.target.value) || 1000; saveSettings(); };
        row2.append(startBtn, startInput);

        // --- İMZA ---
        const signature = document.createElement("div");
        signature.textContent = "tanersb";
        signature.style.cssText = `
            text-align: right; font-size: 10px; color: #777;
            margin-top: 5px; font-style: italic; opacity: 0.7;
        `;
        signature.onmouseover = () => signature.style.opacity = "1";
        signature.onmouseout = () => signature.style.opacity = "0.7";

        // Ekleme
        fullView.append(headerRow, infoRow, row1, row2, signature);


        // 3. KAPALI GÖRÜNÜM (MINI VIEW)
        const miniView = document.createElement("div");
        miniView.textContent = "@tanersb";
        miniView.title = "Paneli Aç";
        miniView.style.cssText = `
            padding: 20px 20px; cursor: pointer; font-weight: bold;
            display: none; align-items: center; justify-content: center;
            gap: 15px; user-select: none;
        `;

        // Etkileşimler
        closeBtn.onclick = (e) => {
            e.stopPropagation();
            fullView.style.display = "none";
            miniView.style.display = "flex";
            panel.style.minWidth = "auto";
            panel.style.borderRadius = "30px";
        };

        miniView.onclick = () => {
            miniView.style.display = "none";
            fullView.style.display = "flex";
            panel.style.minWidth = "280px";
            panel.style.borderRadius = "12px";
        };

        panel.append(fullView, miniView);
        document.body.appendChild(panel);
    }
    initPanel();
})();
