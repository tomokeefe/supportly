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
    headerTitle: script?.getAttribute("data-header-title") || "Support Chat",
    placeholder:
      script?.getAttribute("data-placeholder") || "Type a message...",
    poweredBy: script?.getAttribute("data-powered-by") || "Resolvly",
    pageContext: script?.getAttribute("data-page-context") === "true",
  };

  var conversationId = null;
  var isOpen = false;

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

  // ── Styles ───────────────────────────────────────────────────────
  var css = `
    #resolvly-widget * { box-sizing: border-box; margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
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
      max-width: 85%; padding: 10px 18px; border-radius: 12px; font-size: 14px; line-height: 1.5;
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
    .resolvly-suggestions {
      display: flex; flex-wrap: wrap; gap: 6px; align-self: flex-start; max-width: 90%;
      animation: resolvly-slide-up 0.2s ease-out;
    }
    .resolvly-chip {
      background: white; color: ${CONFIG.primaryColor}; border: 1px solid ${CONFIG.primaryColor};
      border-radius: 16px; padding: 6px 14px; font-size: 12px; cursor: pointer;
      transition: background 0.15s, color 0.15s; line-height: 1.3;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    .resolvly-chip:hover {
      background: ${CONFIG.primaryColor}; color: white;
    }
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
        <h3>${CONFIG.headerTitle}</h3>
        <button id="resolvly-close" aria-label="Close chat">&times;</button>
      </div>
      <div id="resolvly-messages"></div>
      <div id="resolvly-input-area">
        <input id="resolvly-input" type="text" placeholder="${CONFIG.placeholder}" autocomplete="off" />
        <button id="resolvly-send" aria-label="Send message">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M2 21l21-9L2 3v7l15 2-15 2z"/></svg>
        </button>
      </div>
      <div id="resolvly-powered">Powered by <a href="#">${CONFIG.poweredBy}</a></div>
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
    return div;
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

  // ── Send Message (Streaming) ────────────────────────────────────
  var sending = false;

  async function sendMessage() {
    var text = input.value.trim();
    if (!text || sending) return;

    sending = true;
    sendBtn.disabled = true;
    input.value = "";
    addMessage("user", text);

    // Remove any existing suggestion chips
    var existingChips = messagesEl.querySelectorAll(".resolvly-suggestions");
    existingChips.forEach(function (el) { el.remove(); });

    // Create empty assistant bubble for streaming
    var assistantDiv = addMessage("assistant", "");
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
        assistantDiv.remove();
        await sendMessageLegacy(text);
        return;
      }

      var reader = res.body.getReader();
      var decoder = new TextDecoder();
      var buffer = "";
      var currentEvent = "";

      while (true) {
        var result = await reader.read();
        if (result.done) break;

        buffer += decoder.decode(result.value, { stream: true });
        var lines = buffer.split("\n");
        buffer = lines.pop() || "";

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
                assistantDiv.textContent = streamedText;
                messagesEl.scrollTop = messagesEl.scrollHeight;
              } else if (currentEvent === "done") {
                // Replace with clean content (strips metadata tokens)
                assistantDiv.textContent = data.content || streamedText;
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
                assistantDiv.textContent =
                  "Something went wrong. Please try again.";
                assistantDiv.className = "resolvly-msg system";
              }
            } catch (e) {
              // Ignore JSON parse errors for partial data
            }
            currentEvent = "";
          }
        }
      }

      // If no done event was received, ensure content is shown
      if (!assistantDiv.textContent && streamedText) {
        assistantDiv.textContent = streamedText;
      }
    } catch (err) {
      // Streaming failed — try legacy endpoint
      if (!assistantDiv.textContent) {
        assistantDiv.remove();
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
