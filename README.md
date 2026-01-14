# LinkedIn Fast Sequential Auto Connect 🚀

![Version](https://img.shields.io/badge/version-6.0-blue)
![Status](https://img.shields.io/badge/status-active-success)
![License](https://img.shields.io/badge/license-MIT-green)

A sophisticated, safe, and modern userscript designed to automate connection requests on LinkedIn. It features **Shadow DOM support**, **Human-Like behavior simulation**, and a fully interactive **GUI**.

---

## ⚠️ Disclaimer & Educational Purpose
**This software is developed strictly for educational and research purposes.** The goal of this project is to demonstrate:
1.  How to interact with complex DOM structures (Shadow DOM) using JavaScript.
2.  How to simulate native browser events (`EventDispatch`).
3.  How to create modern overlays (GUI) without external libraries.

**Use at your own risk.** The author (@tanersb) is not responsible for any account restrictions or bans resulting from the use of this tool. While the script is designed to be undetectable and mimics human behavior, automation always carries a risk.

---

## ✨ Key Features

### 🛡️ Anti-Detection & Safety
* **Human-Like Interaction:** Unlike standard bots that use simple `.click()`, this script uses **Native Event Dispatching** (`mouseover` -> `mousedown` -> `mouseup` -> `click`) to mimic real human mouse interaction.
* **Shadow DOM Penetration:** Successfully identifies and clicks buttons hidden inside LinkedIn's `#interop-outlet` (Shadow Root), specifically the "Send without note" button.

### 🎛️ Modern UI & Controls
* **Interactive Panel:** A clean, dark-themed control panel placed conveniently above the messaging tab.
* **Dynamic Speed Control:** Adjust `Popup Delay` and `Connection Speed` in milliseconds on the fly.
* **Counters & Timestamps:** Tracks total connections sent and records the exact time of the last action.
* **Chat-Safe Position:** intelligently positioned to avoid overlapping with LinkedIn chat windows.
* **Mini Mode:** Can be minimized to a small `@tanersb` badge to save screen space.

### 💾 Smart Persistence
* **Auto-Save:** Remembers your speed settings, total count, and last activity date even after refreshing the page.
* **Full Reset:** Features a hidden reset function to clear counters and history.

---

## 📥 Installation

1.  Install a userscript manager:
    * **Tampermonkey** (Recommended)
    * Violentmonkey
2.  [Click Here to Install the Script](#) *(https://github.com/tanersb/LinkedIn-Fast-Sequential-Auto-Connect/raw/refs/heads/main/linkedin-fast-sequential.user.js)*
    * *Or manually copy the script content into a new Tampermonkey script.*
3.  Go to LinkedIn "People" search results (e.g., Search "HR Manager" -> Filter by People).
4.  The panel will appear automatically on the bottom right.

---

## ⚙️ How to Use

1.  **Not Kapatıcı (Note Closer):**
    * **Status:** `ACTIVE` (Default).
    * **Function:** Automatically detects the "Add a note" popup and clicks "Send without note" instantly.
    * **Speed:** Default 100ms (Adjustable).

2.  **Bağlantıyı Başlat (Start Connector):**
    * **Status:** Click to `START`.
    * **Function:** Scans the page for "Connect" (Bağlantı kur) buttons and clicks them sequentially.
    * **Speed:** Default 1000ms (Adjustable).

3.  **Reset Data:**
    * Click on the **"Total: X | Last: ..."** text area to reset your session counters.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
Feel free to check the [issues page](https://github.com/tanersb/LinkedIn-Fast-Sequential-Auto-Connect/issues).

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

---
*Designed by **tanersb***
