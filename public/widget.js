(function () {
  "use strict";

  // ── Config ───────────────────────────────────────────────────────
  var script = document.currentScript;
  var CONFIG = {
    orgSlug: script?.getAttribute("data-org") || "sunrise-pm",
    primaryColor: script?.getAttribute("data-color") || "#2563eb",
    position: script?.getAttribute("data-position") || "bottom-right",
    apiUrl: script?.getAttribute("data-api") || window.location.origin,
    greeting:
      script?.getAttribute("data-greeting") ||
      "Hi! How can I help you today?",
  };

  var conversationId = null;
  var isOpen = false;

  // ── Styles ───────────────────────────────────────────────────────
  var css = `
    #supportly-widget * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    #supportly-bubble {
      position: fixed; ${CONFIG.position === "bottom-left" ? "left: 20px" : "right: 20px"}; bottom: 20px;
      width: 60px; height: 60px; border-radius: 50%;
      background: ${CONFIG.primaryColor}; color: white; border: none; cursor: pointer;
      box-shadow: 0 4px 16px rgba(0,0,0,0.2); z-index: 99999;
      display: flex; align-items: center; justify-content: center;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    #supportly-bubble:hover { transform: scale(1.08); box-shadow: 0 6px 24px rgba(0,0,0,0.25); }
    #supportly-bubble svg { width: 28px; height: 28px; }
    #supportly-window {
      position: fixed; ${CONFIG.position === "bottom-left" ? "left: 20px" : "right: 20px"}; bottom: 92px;
      width: 380px; max-height: 520px; border-radius: 16px;
      background: white; box-shadow: 0 8px 40px rgba(0,0,0,0.16);
      z-index: 99999; display: none; flex-direction: column; overflow: hidden;
    }
    #supportly-window.open { display: flex; animation: supportly-slide-up 0.25s ease-out; }
    @keyframes supportly-slide-up { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
    #supportly-header {
      background: ${CONFIG.primaryColor}; color: white; padding: 16px 20px;
      display: flex; align-items: center; justify-content: space-between;
    }
    #supportly-header h3 { font-size: 15px; font-weight: 600; }
    #supportly-header button { background: none; border: none; color: white; cursor: pointer; font-size: 20px; line-height: 1; opacity: 0.8; }
    #supportly-header button:hover { opacity: 1; }
    #supportly-messages {
      flex: 1; overflow-y: auto; padding: 16px; min-height: 300px; max-height: 360px;
      display: flex; flex-direction: column; gap: 12px;
    }
    .supportly-msg {
      max-width: 85%; padding: 10px 14px; border-radius: 12px; font-size: 14px; line-height: 1.5;
      word-wrap: break-word; white-space: pre-wrap;
    }
    .supportly-msg.assistant {
      background: #f3f4f6; color: #1f2937; align-self: flex-start; border-bottom-left-radius: 4px;
    }
    .supportly-msg.user {
      background: ${CONFIG.primaryColor}; color: white; align-self: flex-end; border-bottom-right-radius: 4px;
    }
    .supportly-msg.system {
      background: #fef3c7; color: #92400e; align-self: center; font-size: 12px;
      border-radius: 8px; text-align: center;
    }
    .supportly-typing { display: flex; gap: 4px; padding: 12px 14px; align-self: flex-start; }
    .supportly-typing span {
      width: 8px; height: 8px; border-radius: 50%; background: #d1d5db;
      animation: supportly-bounce 1.4s ease-in-out infinite;
    }
    .supportly-typing span:nth-child(2) { animation-delay: 0.2s; }
    .supportly-typing span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes supportly-bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }
    #supportly-input-area {
      padding: 12px 16px; border-top: 1px solid #e5e7eb; display: flex; gap: 8px; align-items: center;
    }
    #supportly-input {
      flex: 1; border: 1px solid #d1d5db; border-radius: 20px; padding: 8px 16px;
      font-size: 14px; outline: none; transition: border-color 0.2s;
    }
    #supportly-input:focus { border-color: ${CONFIG.primaryColor}; }
    #supportly-send {
      width: 36px; height: 36px; border-radius: 50%; border: none;
      background: ${CONFIG.primaryColor}; color: white; cursor: pointer;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    #supportly-send:disabled { opacity: 0.5; cursor: not-allowed; }
    #supportly-powered {
      text-align: center; padding: 6px; font-size: 11px; color: #9ca3af;
    }
    #supportly-powered a { color: #6b7280; text-decoration: none; }
  `;

  // ── Inject Styles ────────────────────────────────────────────────
  var style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  // ── Build DOM ────────────────────────────────────────────────────
  var container = document.createElement("div");
  container.id = "supportly-widget";
  container.innerHTML = `
    <button id="supportly-bubble" aria-label="Open chat">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    </button>
    <div id="supportly-window">
      <div id="supportly-header">
        <h3>Support Chat</h3>
        <button id="supportly-close" aria-label="Close chat">&times;</button>
      </div>
      <div id="supportly-messages"></div>
      <div id="supportly-input-area">
        <input id="supportly-input" type="text" placeholder="Type a message..." autocomplete="off" />
        <button id="supportly-send" aria-label="Send message">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M2 21l21-9L2 3v7l15 2-15 2z"/></svg>
        </button>
      </div>
      <div id="supportly-powered">Powered by <a href="#">Supportly</a></div>
    </div>
  `;
  document.body.appendChild(container);

  // ── Elements ─────────────────────────────────────────────────────
  var bubble = document.getElementById("supportly-bubble");
  var win = document.getElementById("supportly-window");
  var closeBtn = document.getElementById("supportly-close");
  var messagesEl = document.getElementById("supportly-messages");
  var input = document.getElementById("supportly-input");
  var sendBtn = document.getElementById("supportly-send");

  // ── Helpers ──────────────────────────────────────────────────────
  function addMessage(role, content) {
    var div = document.createElement("div");
    div.className = "supportly-msg " + role;
    div.textContent = content;
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function showTyping() {
    var div = document.createElement("div");
    div.className = "supportly-typing";
    div.id = "supportly-typing-indicator";
    div.innerHTML = "<span></span><span></span><span></span>";
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function hideTyping() {
    var el = document.getElementById("supportly-typing-indicator");
    if (el) el.remove();
  }

  // ── Toggle ───────────────────────────────────────────────────────
  function toggle() {
    isOpen = !isOpen;
    if (isOpen) {
      win.classList.add("open");
      bubble.style.display = "none";
      if (messagesEl.children.length === 0) {
        addMessage("assistant", CONFIG.greeting);
      }
      input.focus();
    } else {
      win.classList.remove("open");
      bubble.style.display = "flex";
    }
  }

  bubble.addEventListener("click", toggle);
  closeBtn.addEventListener("click", toggle);

  // ── Send Message ─────────────────────────────────────────────────
  var sending = false;

  async function sendMessage() {
    var text = input.value.trim();
    if (!text || sending) return;

    sending = true;
    sendBtn.disabled = true;
    input.value = "";
    addMessage("user", text);
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
