(function () {
  "use strict";

  // ── Config ───────────────────────────────────────────────────────
  var script = document.currentScript;
  var CONFIG = {
    orgSlug: script?.getAttribute("data-org") || "sunrise-pm",
    primaryColor: script?.getAttribute("data-color") || "#2563eb",
    position: script?.getAttribute("data-position") || "bottom-right",
    apiUrl: script?.getAttribute("data-api") || "https://www.resolvly.ai",
    greeting:
      script?.getAttribute("data-greeting") ||
      "Hi! How can I help you today?",
    headerTitle: script?.getAttribute("data-header-title") || "Support",
    agentName: script?.getAttribute("data-agent-name") || "AI Assistant",
    placeholder:
      script?.getAttribute("data-placeholder") || "Type a message...",
    poweredBy: script?.getAttribute("data-powered-by") || "Resolvly",
    pageContext: script?.getAttribute("data-page-context") === "true",
    questions: script?.getAttribute("data-questions")
      ? script.getAttribute("data-questions").split("|").map(function (q) { return q.trim(); }).filter(Boolean)
      : [],
  };

  var conversationId = null;
  var isOpen = false;
  var hasInteracted = false; // true once user has sent a message

  // ── Color Utilities ────────────────────────────────────────────
  function hexToRgb(hex) {
    var r = parseInt(hex.slice(1, 3), 16);
    var g = parseInt(hex.slice(3, 5), 16);
    var b = parseInt(hex.slice(5, 7), 16);
    return { r: r, g: g, b: b };
  }

  // Determine if the brand color is light or dark using relative luminance
  function isLightColor(hex) {
    var c = hexToRgb(hex);
    // sRGB relative luminance formula
    var luminance = (0.299 * c.r + 0.587 * c.g + 0.114 * c.b) / 255;
    return luminance > 0.55;
  }

  var rgb = hexToRgb(CONFIG.primaryColor);
  var primaryLight = "rgba(" + rgb.r + "," + rgb.g + "," + rgb.b + ",0.08)";
  var primaryMedium = "rgba(" + rgb.r + "," + rgb.g + "," + rgb.b + ",0.15)";
  var primaryDark = "rgba(" + rgb.r + "," + rgb.g + "," + rgb.b + ",0.9)";
  var brandIsLight = isLightColor(CONFIG.primaryColor);
  var onBrandColor = brandIsLight ? "#1a1a1a" : "white";
  var onBrandColorSoft = brandIsLight ? "rgba(0,0,0,0.65)" : "rgba(255,255,255,0.85)";

  // ── Visitor ID (localStorage) ───────────────────────────────────
  var visitorId = null;
  try {
    visitorId = localStorage.getItem("resolvly_visitor_id");
    if (!visitorId) {
      visitorId =
        "v_" +
        Math.random().toString(36).substring(2) +
        Date.now().toString(36);
      localStorage.setItem("resolvly_visitor_id", visitorId);
    }
  } catch (e) {
    // localStorage unavailable
  }

  // ── SVG Icons ─────────────────────────────────────────────────
  var avatarSvg = '<svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">' +
    '<rect width="36" height="36" rx="12" fill="' + CONFIG.primaryColor + '"/>' +
    '<path d="M18 10c-1.5 0-2.7 1.2-2.7 2.7s1.2 2.7 2.7 2.7 2.7-1.2 2.7-2.7S19.5 10 18 10z" fill="' + onBrandColor + '" opacity="0.9"/>' +
    '<path d="M11 22.5c0-2.5 2-4.5 4.5-4.5h5c2.5 0 4.5 2 4.5 4.5v1a1.5 1.5 0 01-1.5 1.5h-11A1.5 1.5 0 0111 23.5v-1z" fill="' + onBrandColor + '" opacity="0.9"/>' +
    '</svg>';

  var chatIconSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>' +
    '</svg>';

  var closeIconSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">' +
    '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>' +
    '</svg>';

  // ── Styles ───────────────────────────────────────────────────────
  var posLeft = CONFIG.position === "bottom-left";
  var css = `
    #resolvly-widget * { box-sizing: border-box; margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif; -webkit-font-smoothing: antialiased; }

    /* ── Bubble ── */
    #resolvly-bubble {
      position: fixed; ${posLeft ? "left: 20px" : "right: 20px"}; bottom: 20px;
      width: 56px; height: 56px; border-radius: 16px;
      background: ${CONFIG.primaryColor}; color: ${onBrandColor}; border: none; cursor: pointer;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15), 0 0 0 0 ${primaryMedium};
      z-index: 99999;
      display: flex; align-items: center; justify-content: center;
      transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s;
      animation: resolvly-pulse 3s ease-in-out infinite;
    }
    #resolvly-bubble:hover {
      transform: scale(1.06);
      box-shadow: 0 6px 28px rgba(0,0,0,0.2);
      animation: none;
    }
    #resolvly-bubble svg { width: 24px; height: 24px; transition: transform 0.2s ease; }
    #resolvly-bubble.resolvly-close-mode {
      animation: none;
      border-radius: 14px;
    }
    #resolvly-bubble.resolvly-close-mode svg { transform: rotate(0deg); }
    @keyframes resolvly-pulse {
      0%, 100% { box-shadow: 0 4px 20px rgba(0,0,0,0.15), 0 0 0 0 ${primaryMedium}; }
      50% { box-shadow: 0 4px 20px rgba(0,0,0,0.15), 0 0 0 8px rgba(0,0,0,0); }
    }
    /* Online dot */
    #resolvly-bubble-dot {
      position: absolute; top: -2px; right: -2px;
      width: 14px; height: 14px; border-radius: 50%;
      background: #22c55e; border: 2.5px solid white;
      transition: opacity 0.2s;
    }
    #resolvly-bubble.resolvly-close-mode #resolvly-bubble-dot { opacity: 0; }

    /* ── Window ── */
    #resolvly-window {
      position: fixed; ${posLeft ? "left: 20px" : "right: 20px"}; bottom: 88px;
      width: 380px; max-height: 560px; border-radius: 20px;
      background: #ffffff;
      box-shadow: 0 12px 48px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06);
      z-index: 99998; display: none; flex-direction: column; overflow: hidden;
      border: 1px solid rgba(0,0,0,0.06);
    }
    #resolvly-window.open {
      display: flex;
      animation: resolvly-slide-up 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    @keyframes resolvly-slide-up {
      from { opacity: 0; transform: translateY(16px) scale(0.97); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    /* ── Header ── */
    #resolvly-header {
      background: linear-gradient(135deg, ${CONFIG.primaryColor}, ${primaryDark});
      color: ${onBrandColor}; padding: 18px 20px;
      display: flex; align-items: center; gap: 12px;
      position: relative;
      flex-shrink: 0;
    }
    #resolvly-header-avatar {
      width: 36px; height: 36px; border-radius: 12px;
      flex-shrink: 0; position: relative;
    }
    #resolvly-header-avatar svg { width: 36px; height: 36px; }
    #resolvly-header-status {
      position: absolute; bottom: -1px; right: -1px;
      width: 10px; height: 10px; border-radius: 50%;
      background: #22c55e; border: 2px solid ${brandIsLight ? "rgba(0,0,0,0.1)" : CONFIG.primaryColor};
    }
    #resolvly-header-info { flex: 1; min-width: 0; }
    #resolvly-header-info h3 { font-size: 15px; font-weight: 600; letter-spacing: -0.01em; }
    #resolvly-header-info p { font-size: 12px; color: ${onBrandColorSoft}; margin-top: 1px; }

    /* ── Messages ── */
    #resolvly-messages {
      flex: 1; overflow-y: auto; padding: 16px; min-height: 0; max-height: 380px;
      display: flex; flex-direction: column; gap: 6px;
      background: #fafafa;
    }
    #resolvly-messages::-webkit-scrollbar { width: 4px; }
    #resolvly-messages::-webkit-scrollbar-track { background: transparent; }
    #resolvly-messages::-webkit-scrollbar-thumb { background: #d4d4d4; border-radius: 4px; }

    /* Message row (avatar + bubble) */
    .resolvly-msg-row {
      display: flex; gap: 8px; align-items: flex-end;
      animation: resolvly-msg-in 0.25s ease-out;
    }
    .resolvly-msg-row.user { flex-direction: row-reverse; }
    @keyframes resolvly-msg-in {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Mini avatar on assistant messages */
    .resolvly-msg-avatar {
      width: 24px; height: 24px; border-radius: 8px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 2px;
    }
    .resolvly-msg-avatar svg { width: 24px; height: 24px; }

    /* Bubble + timestamp wrapper */
    .resolvly-msg-bubble-wrap { max-width: 80%; display: flex; flex-direction: column; }
    .resolvly-msg-row.user .resolvly-msg-bubble-wrap { align-items: flex-end; }

    .resolvly-msg {
      padding: 10px 14px; font-size: 14px; line-height: 1.55;
      word-wrap: break-word; white-space: pre-wrap;
    }
    .resolvly-msg.assistant {
      background: #ffffff; color: #1f2937;
      border-radius: 16px 16px 16px 4px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
    }
    .resolvly-msg.user {
      background: ${CONFIG.primaryColor}; color: ${onBrandColor};
      border-radius: 16px 16px 4px 16px;
    }
    .resolvly-msg.system {
      background: #fef3c7; color: #92400e;
      align-self: center; font-size: 12px;
      border-radius: 10px; text-align: center;
      padding: 8px 14px; max-width: 90%;
      animation: resolvly-msg-in 0.25s ease-out;
    }

    /* Timestamp */
    .resolvly-msg-time {
      font-size: 10px; color: #a1a1aa; margin-top: 3px; padding: 0 4px;
    }
    .resolvly-msg-row.user .resolvly-msg-time { text-align: right; }

    /* ── Typing indicator ── */
    .resolvly-typing-row {
      display: flex; gap: 8px; align-items: flex-end;
      animation: resolvly-msg-in 0.25s ease-out;
    }
    .resolvly-typing {
      display: flex; gap: 5px; padding: 12px 16px;
      background: #ffffff; border-radius: 16px 16px 16px 4px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
    }
    .resolvly-typing span {
      width: 7px; height: 7px; border-radius: 50%; background: #c4c4c4;
      animation: resolvly-bounce 1.4s ease-in-out infinite;
    }
    .resolvly-typing span:nth-child(2) { animation-delay: 0.16s; }
    .resolvly-typing span:nth-child(3) { animation-delay: 0.32s; }
    @keyframes resolvly-bounce { 0%, 80%, 100% { transform: scale(0.4); opacity: 0.4; } 40% { transform: scale(1); opacity: 1; } }

    /* ── Quick-ask starter questions ── */
    .resolvly-starters {
      display: flex; flex-direction: column; gap: 0; padding: 0 16px 8px 16px;
      animation: resolvly-msg-in 0.3s ease-out;
    }
    .resolvly-starter {
      background: none; border: none; border-bottom: 1px solid #f0f0f0;
      color: #374151; padding: 11px 4px; font-size: 13.5px; cursor: pointer;
      text-align: left; line-height: 1.4; transition: color 0.15s, background 0.15s;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex; align-items: center; justify-content: space-between; gap: 8px;
    }
    .resolvly-starter:last-child { border-bottom: none; }
    .resolvly-starter:hover { color: ${CONFIG.primaryColor}; background: ${primaryLight}; border-radius: 8px; }
    .resolvly-starter-arrow {
      flex-shrink: 0; width: 16px; height: 16px; opacity: 0.3; transition: opacity 0.15s, transform 0.15s;
    }
    .resolvly-starter:hover .resolvly-starter-arrow { opacity: 0.7; transform: translateX(2px); }

    /* ── Suggestion chips ── */
    .resolvly-suggestions {
      display: flex; flex-wrap: wrap; gap: 6px; padding-left: 32px;
      animation: resolvly-msg-in 0.2s ease-out;
    }
    .resolvly-chip {
      background: white; color: ${CONFIG.primaryColor};
      border: 1px solid ${primaryMedium};
      border-radius: 20px; padding: 6px 14px; font-size: 12px; cursor: pointer;
      transition: all 0.15s; line-height: 1.3;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      box-shadow: 0 1px 2px rgba(0,0,0,0.04);
    }
    .resolvly-chip:hover {
      background: ${primaryLight}; border-color: ${CONFIG.primaryColor};
      transform: translateY(-1px); box-shadow: 0 2px 6px rgba(0,0,0,0.08);
    }

    /* ── Input area ── */
    #resolvly-input-area {
      padding: 12px 16px; border-top: 1px solid #f0f0f0;
      display: flex; gap: 8px; align-items: center;
      background: #ffffff;
      flex-shrink: 0;
    }
    #resolvly-input {
      flex: 1; border: 1px solid #e5e5e5; border-radius: 22px; padding: 9px 16px;
      font-size: 14px; outline: none; transition: border-color 0.2s, box-shadow 0.2s;
      background: #fafafa;
    }
    #resolvly-input:focus {
      border-color: ${CONFIG.primaryColor};
      box-shadow: 0 0 0 3px ${primaryLight};
      background: #ffffff;
    }
    #resolvly-send {
      width: 36px; height: 36px; border-radius: 50%; border: none;
      background: ${CONFIG.primaryColor}; color: ${onBrandColor}; cursor: pointer;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      transition: transform 0.15s, opacity 0.15s;
    }
    #resolvly-send:hover { transform: scale(1.06); }
    #resolvly-send:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

    /* ── Powered by ── */
    #resolvly-powered {
      text-align: center; padding: 8px; font-size: 11px; color: #b4b4b4;
      background: #ffffff; letter-spacing: 0.01em;
      flex-shrink: 0;
    }
    #resolvly-powered a { color: #8a8a8a; text-decoration: none; font-weight: 500; }
    #resolvly-powered a:hover { color: ${CONFIG.primaryColor}; }

    /* ── Markdown in messages ── */
    .resolvly-msg strong { font-weight: 600; }
    .resolvly-msg em { font-style: italic; }
    .resolvly-msg p { margin: 0 0 8px 0; }
    .resolvly-msg p:last-child { margin-bottom: 0; }
    .resolvly-msg ol, .resolvly-msg ul { margin: 4px 0 8px 0; padding-left: 20px; }
    .resolvly-msg li { margin-bottom: 4px; }

    /* ── Mobile responsive ── */
    @media (max-width: 420px) {
      #resolvly-window {
        width: calc(100vw - 16px); ${posLeft ? "left: 8px" : "right: 8px"}; bottom: 80px;
        max-height: calc(100vh - 100px); border-radius: 16px;
      }
    }
  `;

  // ── Inject Styles ────────────────────────────────────────────────
  var style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  // ── Build DOM ────────────────────────────────────────────────────
  var arrowSvg = '<svg class="resolvly-starter-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>';

  var container = document.createElement("div");
  container.id = "resolvly-widget";
  container.innerHTML = `
    <button id="resolvly-bubble" aria-label="Open chat">
      <span id="resolvly-bubble-icon">${chatIconSvg}</span>
      <span id="resolvly-bubble-dot"></span>
    </button>
    <div id="resolvly-window">
      <div id="resolvly-header">
        <div id="resolvly-header-avatar">
          ${avatarSvg}
          <span id="resolvly-header-status"></span>
        </div>
        <div id="resolvly-header-info">
          <h3>${CONFIG.headerTitle}</h3>
          <p>${CONFIG.agentName} · Online</p>
        </div>
      </div>
      <div id="resolvly-messages"></div>
      <div id="resolvly-starters" class="resolvly-starters" style="display:none"></div>
      <div id="resolvly-input-area">
        <input id="resolvly-input" type="text" placeholder="${CONFIG.placeholder}" autocomplete="off" />
        <button id="resolvly-send" aria-label="Send message">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
      <div id="resolvly-powered">Powered by <a href="https://www.resolvly.ai" target="_blank" rel="noopener">${CONFIG.poweredBy}</a></div>
    </div>
  `;
  document.body.appendChild(container);

  // ── Elements ─────────────────────────────────────────────────────
  var bubble = document.getElementById("resolvly-bubble");
  var bubbleIcon = document.getElementById("resolvly-bubble-icon");
  var win = document.getElementById("resolvly-window");
  var messagesEl = document.getElementById("resolvly-messages");
  var startersEl = document.getElementById("resolvly-starters");
  var input = document.getElementById("resolvly-input");
  var sendBtn = document.getElementById("resolvly-send");

  // ── Build starter questions ──────────────────────────────────────
  function buildStarters() {
    if (CONFIG.questions.length === 0 || hasInteracted) return;
    startersEl.innerHTML = "";
    CONFIG.questions.forEach(function (q) {
      var btn = document.createElement("button");
      btn.className = "resolvly-starter";
      btn.innerHTML = '<span>' + q + '</span>' + arrowSvg;
      btn.addEventListener("click", function () {
        hideStarters();
        input.value = q;
        sendMessage();
      });
      startersEl.appendChild(btn);
    });
    startersEl.style.display = "flex";
  }

  function hideStarters() {
    startersEl.style.display = "none";
    hasInteracted = true;
  }

  // ── Time Formatter ────────────────────────────────────────────
  function getTime() {
    var d = new Date();
    var h = d.getHours();
    var m = d.getMinutes();
    var ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return h + ":" + (m < 10 ? "0" : "") + m + " " + ampm;
  }

  // ── Markdown Renderer ────────────────────────────────────────────
  function renderMarkdown(text) {
    if (!text) return "";
    // Escape HTML entities first
    var html = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    // Bold: **text** or __text__
    html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/__(.+?)__/g, "<strong>$1</strong>");
    // Italic: *text* or _text_ (but not inside bold)
    html = html.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, "<em>$1</em>");
    // Split into paragraphs on double newlines
    var blocks = html.split(/\n\n+/);
    var result = [];
    for (var b = 0; b < blocks.length; b++) {
      var block = blocks[b].trim();
      if (!block) continue;
      // Check if block is a numbered list
      var listLines = block.split("\n");
      var isNumberedList = listLines.every(function (l) {
        return /^\d+[\.\)]\s/.test(l.trim()) || !l.trim();
      });
      if (isNumberedList && listLines.length > 1) {
        var items = listLines
          .map(function (l) { return l.trim().replace(/^\d+[\.\)]\s*/, ""); })
          .filter(function (l) { return l; });
        result.push("<ol>" + items.map(function (li) { return "<li>" + li + "</li>"; }).join("") + "</ol>");
      } else {
        // Convert single newlines to <br>
        result.push("<p>" + block.replace(/\n/g, "<br>") + "</p>");
      }
    }
    return result.join("");
  }

  // ── Helpers ──────────────────────────────────────────────────────
  function addMessage(role, content) {
    if (role === "system") {
      var sysDiv = document.createElement("div");
      sysDiv.className = "resolvly-msg system";
      sysDiv.textContent = content;
      messagesEl.appendChild(sysDiv);
      messagesEl.scrollTop = messagesEl.scrollHeight;
      return sysDiv;
    }

    var row = document.createElement("div");
    row.className = "resolvly-msg-row " + role;

    var html = "";

    // Avatar for assistant messages
    if (role === "assistant") {
      html += '<div class="resolvly-msg-avatar">' + avatarSvg + '</div>';
    }

    html += '<div class="resolvly-msg-bubble-wrap">';
    html += '<div class="resolvly-msg ' + role + '"></div>';
    html += '<span class="resolvly-msg-time">' + getTime() + '</span>';
    html += '</div>';

    row.innerHTML = html;

    var msgEl = row.querySelector(".resolvly-msg");
    if (role === "assistant" && content) {
      msgEl.innerHTML = renderMarkdown(content);
    } else {
      msgEl.textContent = content;
    }

    messagesEl.appendChild(row);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return msgEl;
  }

  function addSuggestions(suggestions) {
    if (!suggestions || suggestions.length === 0) return;
    var row = document.createElement("div");
    row.className = "resolvly-suggestions";
    suggestions.forEach(function (text) {
      var chip = document.createElement("button");
      chip.className = "resolvly-chip";
      chip.textContent = text;
      chip.addEventListener("click", function () {
        row.remove();
        input.value = text;
        sendMessage();
      });
      row.appendChild(chip);
    });
    messagesEl.appendChild(row);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function showTyping() {
    var row = document.createElement("div");
    row.className = "resolvly-typing-row";
    row.id = "resolvly-typing-indicator";
    row.innerHTML = '<div class="resolvly-msg-avatar">' + avatarSvg + '</div>' +
      '<div class="resolvly-typing"><span></span><span></span><span></span></div>';
    messagesEl.appendChild(row);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function hideTyping() {
    var el = document.getElementById("resolvly-typing-indicator");
    if (el) el.remove();
  }

  function getPageContext() {
    if (!CONFIG.pageContext) return undefined;
    return {
      title: document.title || undefined,
      url: window.location.href || undefined,
      referrer: document.referrer || undefined,
    };
  }

  // ── Toggle ───────────────────────────────────────────────────────
  function toggle() {
    isOpen = !isOpen;
    if (isOpen) {
      win.classList.add("open");
      // Switch bubble to X icon (Drift-style)
      bubble.classList.add("resolvly-close-mode");
      bubbleIcon.innerHTML = closeIconSvg;
      bubble.setAttribute("aria-label", "Close chat");
      if (messagesEl.children.length === 0) {
        addMessage("assistant", CONFIG.greeting);
        buildStarters();
      }
      input.focus();
    } else {
      win.classList.remove("open");
      // Switch bubble back to chat icon
      bubble.classList.remove("resolvly-close-mode");
      bubbleIcon.innerHTML = chatIconSvg;
      bubble.setAttribute("aria-label", "Open chat");
    }
  }

  bubble.addEventListener("click", toggle);

  // ── Send Message (Streaming) ────────────────────────────────────
  var sending = false;

  async function sendMessage() {
    var text = input.value.trim();
    if (!text || sending) return;

    // Hide starter questions once user sends a message
    if (!hasInteracted) hideStarters();

    sending = true;
    sendBtn.disabled = true;
    input.value = "";
    addMessage("user", text);

    // Remove any existing suggestion chips
    var existingChips = messagesEl.querySelectorAll(".resolvly-suggestions");
    existingChips.forEach(function (el) { el.remove(); });

    // Create empty assistant message for streaming
    var assistantEl = addMessage("assistant", "");
    var streamedText = "";

    try {
      var requestBody = {
        message: text,
        conversationId: conversationId,
        orgSlug: CONFIG.orgSlug,
        channel: "chat",
      };

      var pageCtx = getPageContext();
      if (pageCtx) requestBody.pageContext = pageCtx;
      if (visitorId) requestBody.visitorId = visitorId;

      var res = await fetch(CONFIG.apiUrl + "/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      // If streaming endpoint fails, fall back to legacy
      if (!res.ok || !res.body) {
        assistantEl.closest(".resolvly-msg-row").remove();
        await sendMessageLegacy(text);
        return;
      }

      var reader = res.body.getReader();
      var decoder = new TextDecoder();
      var buffer = "";
      var currentEvent = "";

      // Strip metadata tokens from display text during streaming
      function stripMetaTokens(text) {
        return text
          .replace(/\[CONFIDENCE:\s*[\d.]+\]/g, "")
          .replace(/\[SUGGESTIONS:\s*[^\]]*\]/g, "")
          .replace(/\[SENTIMENT:\s*\w+\]/g, "")
          .replace(/\[LANGUAGE:\s*\w+\]/g, "")
          .replace(/\n{2,}$/g, "\n")
          .trim();
      }

      function processSSELines(lines) {
        for (var i = 0; i < lines.length; i++) {
          var line = lines[i].trim();
          if (line.startsWith("event: ")) {
            currentEvent = line.substring(7);
          } else if (line.startsWith("data: ")) {
            var dataStr = line.substring(6);
            try {
              var data = JSON.parse(dataStr);
              if (currentEvent === "meta" && data.conversationId) {
                conversationId = data.conversationId;
              } else if (currentEvent === "delta" && data.text) {
                streamedText += data.text;
                // Strip metadata tokens and render markdown progressively
                var displayText = stripMetaTokens(streamedText);
                if (displayText) {
                  assistantEl.innerHTML = renderMarkdown(displayText);
                }
                messagesEl.scrollTop = messagesEl.scrollHeight;
              } else if (currentEvent === "done") {
                // Final render with clean content from server
                assistantEl.innerHTML = renderMarkdown(data.content || stripMetaTokens(streamedText));
                if (data.suggestions) {
                  addSuggestions(data.suggestions);
                }
                if (data.shouldEscalate) {
                  addMessage(
                    "system",
                    "I've connected you with a human agent. They'll be with you shortly."
                  );
                }
              } else if (currentEvent === "error") {
                assistantEl.textContent =
                  "Something went wrong. Please try again.";
                assistantEl.className = "resolvly-msg system";
              }
            } catch (e) {
              // Ignore JSON parse errors for partial data
            }
            currentEvent = "";
          }
        }
      }

      while (true) {
        var result = await reader.read();
        if (result.done) break;

        buffer += decoder.decode(result.value, { stream: true });
        var lines = buffer.split("\n");
        buffer = lines.pop() || "";
        processSSELines(lines);
      }

      // Flush any remaining buffer after stream ends
      if (buffer.trim()) {
        processSSELines(buffer.split("\n"));
      }
    } catch (err) {
      // Streaming failed — try legacy endpoint
      if (!assistantEl.textContent) {
        assistantEl.closest(".resolvly-msg-row").remove();
        await sendMessageLegacy(text);
        return;
      }
    }

    sending = false;
    sendBtn.disabled = false;
    input.focus();
  }

  // ── Legacy Fallback (non-streaming) ─────────────────────────────
  async function sendMessageLegacy(text) {
    showTyping();

    try {
      var res = await fetch(CONFIG.apiUrl + "/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          conversationId: conversationId,
          orgSlug: CONFIG.orgSlug,
          channel: "chat",
        }),
      });

      var data = await res.json();
      hideTyping();

      if (data.error) {
        addMessage("system", "Something went wrong. Please try again.");
      } else {
        conversationId = data.conversationId;
        addMessage("assistant", data.message.content);

        if (data.suggestions) {
          addSuggestions(data.suggestions);
        }

        if (data.shouldEscalate) {
          addMessage(
            "system",
            "I've connected you with a human agent. They'll be with you shortly."
          );
        }
      }
    } catch (err) {
      hideTyping();
      addMessage("system", "Connection error. Please try again.");
    }

    sending = false;
    sendBtn.disabled = false;
    input.focus();
  }

  sendBtn.addEventListener("click", sendMessage);
  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
})();
