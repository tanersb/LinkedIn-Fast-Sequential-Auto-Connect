// ==UserScript==
// @name         LinkedIn Auto Connect
// @namespace    https://github.com/tanersb/LinkedIn-Fast-Sequential-Auto-Connect
// @version      4.7
// @description  Shadow DOM fix + Modern UI + Perfect Position. Accesses #interop-outlet.
// @author       tanersb
// @match        https://www.linkedin.com/*
// @updateURL    https://raw.githubusercontent.com/tanersb/LinkedIn-Fast-Sequential-Auto-Connect/main/linkedin-fast-sequential.user.js
// @downloadURL  https://raw.githubusercontent.com/tanersb/LinkedIn-Fast-Sequential-Auto-Connect/main/linkedin-fast-sequential.user.js
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // --- AYARLAR ---
    let isConnectorRunning = false;
    let isNoteCloserActive = true;

    // --- MANTIK KISMI (SHADOW DOM DELİCİ) ---
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

    // 1. POPUP KAPATICI
    setInterval(() => {
        if (!isNoteCloserActive) return;
        const sendBtn = findInShadows('button[aria-label="Not olmadan gönderin"]');
        if (sendBtn && !sendBtn.disabled) {
            console.log('>>> [Shadow] Gizli buton bulundu ve tıklandı!');
            nativeClick(sendBtn);
        }
    }, 5);

    // 2. BAĞLANTI BOTU
    setInterval(() => {
        if (!isConnectorRunning) return;
        const isPopupOpen = findInShadows('div[role="dialog"]') || findInShadows('.artdeco-modal');
        if (isPopupOpen) return;

        const allButtons = document.querySelectorAll('button, span');
        for (let el of allButtons) {
            if (el.innerText && el.innerText.trim() === "Bağlantı kur") {
                const btn = el.closest('button') || el;
                if (btn && !btn.disabled) {
                    btn.click();
                    break;
                }
            }
        }
    }, 100);


    // --- MODERN ARAYÜZ (PERFECT POSITION - v4.7) ---
    function initPanel() {
        if (!document.body) return setTimeout(initPanel, 500);

        const old = document.getElementById('lnk-modern-panel');
        if(old) old.remove();

        // 1. ANA ÇERÇEVE
        const panel = document.createElement("div");
        panel.id = "lnk-modern-panel";

        // DEĞİŞİKLİK BURADA: 'top' iptal edildi.
        // 'bottom: 85px' yapıldı. Bu tam mesaj kutusu başlığının (yaklaşık 50px) biraz üstüdür.
        panel.style.cssText = `
            position: fixed;
            bottom: 85px; /* Mesajlaşma çubuğunun hemen üstü */
            right: 25px;
            z-index: 2147483647;
            background: rgba(20, 20, 20, 0.95);
            border: 1px solid #555; box-shadow: 0 10px 30px rgba(0,0,0,0.7);
            border-radius: 12px; color: #fff;
            font-family: system-ui, -apple-system, sans-serif;
            transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
            backdrop-filter: blur(10px);
            min-width: 240px;
        `;

        // 2. AÇIK GÖRÜNÜM (FULL VIEW)
        const fullView = document.createElement("div");
        fullView.style.cssText = `
            padding: 20px; display: flex; flex-direction: column; gap: 15px;
        `;

        // Başlık ve Kapat Butonu
        const headerRow = document.createElement("div");
        headerRow.style.cssText = "display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;";

        const title = document.createElement("div");
        title.textContent = "LinkedIn Auto v4.7";
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

        // Butonlar
        const btnStyle = `
            border: none; border-radius: 6px; padding: 12px;
            cursor: pointer; font-weight: 600; font-size: 13px;
            width: 100%; transition: all 0.2s; text-align: center;
        `;

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

        const startBtn = document.createElement("button");
        startBtn.textContent = "BAĞLANTIYI BAŞLAT";
        startBtn.style.cssText = btnStyle + "background: #0d6efd; color: #fff;";

        startBtn.onclick = () => {
            isConnectorRunning = !isConnectorRunning;
            if (isConnectorRunning) {
                startBtn.textContent = "DURDUR";
                startBtn.style.background = "#dc3545";
            } else {
                startBtn.textContent = "BAĞLANTIYI BAŞLAT";
                startBtn.style.background = "#0d6efd";
            }
        };

        fullView.append(headerRow, noteBtn, startBtn);

        // 3. KAPALI GÖRÜNÜM (MINI VIEW)
        const miniView = document.createElement("div");
        miniView.textContent = "🤖 Bot";
        miniView.title = "Paneli Aç";
        miniView.style.cssText = `
            padding: 10px 15px; cursor: pointer; font-weight: bold;
            display: none; align-items: center; justify-content: center;
            gap: 5px; user-select: none;
        `;

        // --- MANTIK ---

        closeBtn.onclick = (e) => {
            e.stopPropagation();
            fullView.style.display = "none";
            miniView.style.display = "flex";
            panel.style.minWidth = "auto";
            panel.style.borderRadius = "30px";
            // Kapanınca konum değişmesin diye bottom'u sabit tutuyoruz
        };

        miniView.onclick = () => {
            miniView.style.display = "none";
            fullView.style.display = "flex";
            panel.style.minWidth = "240px";
            panel.style.borderRadius = "12px";
        };

        panel.append(fullView, miniView);
        document.body.appendChild(panel);
    }
    initPanel();
})();
