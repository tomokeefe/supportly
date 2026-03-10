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
    #resolvly-widget * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    #resolvly-bubble {
      position: fixed; ${CONFIG.position === "bottom-left" ? "left: 20px" : "right: 20px"}; bottom: 20px;
      width: 60px; height: 60px; border-radius: 50%;
      background: ${CONFIG.primaryColor}; color: white; border: none; cursor: pointer;
      box-shadow: 0 4px 16px rgba(0,0,0,0.2); z-index: 99999;
      display: flex; align-items: center; justify-content: center;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    #resolvly-bubble:hover { transform: scale(1.08); box-shadow: 0 6px 24px rgba(0,0,0,0.25); }
    #resolvly-bubble svg { width: 28px; height: 28px; }
    #resolvly-window {
      position: fixed; ${CONFIG.position === "bottom-left" ? "left: 20px" : "right: 20px"}; bottom: 92px;
      width: 380px; max-height: 520px; border-radius: 16px;
      background: white; box-shadow: 0 8px 40px rgba(0,0,0,0.16);
      z-index: 99999; display: none; flex-direction: column; overflow: hidden;
    }
    #resolvly-window.open { display: flex; animation: resolvly-slide-up 0.25s ease-out; }
    @keyframes resolvly-slide-up { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
    #resolvly-header {
      background: ${CONFIG.primaryColor}; color: white; padding: 16px 20px;
      display: flex; align-items: center; justify-content: space-between;
    }
    #resolvly-header h3 { font-size: 15px; font-weight: 600; }
    #resolvly-header button { background: none; border: none; color: white; cursor: pointer; font-size: 20px; line-height: 1; opacity: 0.8; }
    #resolvly-header button:hover { opacity: 1; }
    #resolvly-messages {
      flex: 1; overflow-y: auto; padding: 16px; min-height: 300px; max-height: 360px;
      display: flex; flex-direction: column; gap: 12px;
    }
    .resolvly-msg {
      max-width: 85%; padding: 10px 14px; border-radius: 12px; font-size: 14px; line-height: 1.5;
      word-wrap: break-word; white-space: pre-wrap;
    }
    .resolvly-msg.assistant {
      background: #f3f4f6; color: #1f2937; align-self: flex-start; border-bottom-left-radius: 4px;
    }
    .resolvly-msg.user {
      background: ${CONFIG.primaryColor}; color: white; align-self: flex-end; border-bottom-right-radius: 4px;
    }
    .resolvly-msg.system {
      background: #fef3c7; color: #92400e; align-self: center; font-size: 12px;
      border-radius: 8px; text-align: center;
    }
    .resolvly-typing { display: flex; gap: 4px; padding: 12px 14px; align-self: flex-start; }
    .resolvly-typing span {
      width: 8px; height: 8px; border-radius: 50%; background: #d1d5db;
      animation: resolvly-bounce 1.4s ease-in-out infinite;
    }
    .resolvly-typing span:nth-child(2) { animation-delay: 0.2s; }
    .resolvly-typing span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes resolvly-bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }
    #resolvly-input-area {
      padding: 12px 16px; border-top: 1px solid #e5e7eb; display: flex; gap: 8px; align-items: center;
    }
    #resolvly-input {
      flex: 1; border: 1px solid #d1d5db; border-radius: 20px; padding: 8px 16px;
      font-size: 14px; outline: none; transition: border-color 0.2s;
    }
    #resolvly-input:focus { border-color: ${CONFIG.primaryColor}; }
    #resolvly-send {
      width: 36px; height: 36px; border-radius: 50%; border: none;
      background: ${CONFIG.primaryColor}; color: white; cursor: pointer;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    #resolvly-send:disabled { opacity: 0.5; cursor: not-allowed; }
    #resolvly-powered {
      text-align: center; padding: 6px; font-size: 11px; color: #9ca3af;
    }
    #resolvly-powered a { color: #6b7280; text-decoration: none; }
  `;

  // ── Inject Styles ────────────────────────────────────────────────
  var style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  // ── Build DOM ────────────────────────────────────────────────────
  var container = document.createElement("div");
  container.id = "resolvly-widget";
  container.innerHTML = `
    <button id="resolvly-bubble" aria-label="Open chat">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    </button>
    <div id="resolvly-window">
      <div id="resolvly-header">
        <h3>Support Chat</h3>
        <button id="resolvly-close" aria-label="Close chat">&times;</button>
      </div>
      <div id="resolvly-messages"></div>
      <div id="resolvly-input-area">
        <input id="resolvly-input" type="text" placeholder="Type a message..." autocomplete="off" />
        <button id="resolvly-send" aria-label="Send message">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M2 21l21-9L2 3v7l15 2-15 2z"/></svg>
        </button>
      </div>
      <div id="resolvly-powered">Powered by <a href="#">Resolvly</a></div>
    </div>
  `;
  document.body.appendChild(container);

  // ── Elements ─────────────────────────────────────────────────────
  var bubble = document.getElementById("resolvly-bubble");
  var win = document.getElementById("resolvly-window");
  var closeBtn = document.getElementById("resolvly-close");
  var messagesEl = document.getElementById("resolvly-messages");
  var input = document.getElementById("resolvly-input");
  var sendBtn = document.getElementById("resolvly-send");

  // ── Helpers ──────────────────────────────────────────────────────
  function addMessage(role, content) {
    var div = document.createElement("div");
    div.className = "resolvly-msg " + role;
    div.textContent = content;
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function showTyping() {
    var div = document.createElement("div");
    div.className = "resolvly-typing";
    div.id = "resolvly-typing-indicator";
    div.innerHTML = "<span></span><span></span><span></span>";
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function hideTyping() {
    var el = document.getElementById("resolvly-typing-indicator");
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
