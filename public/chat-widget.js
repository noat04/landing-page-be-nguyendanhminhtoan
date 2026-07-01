(function initMiniCommerceChat() {
  const currentScript = document.currentScript;
  const apiBase = currentScript?.dataset.apiBase || window.location.origin;
  const productId = currentScript?.dataset.productId || "";
  const history = [];

  const toggle = document.createElement("button");
  toggle.className = "mc-chat-toggle";
  toggle.type = "button";
  toggle.setAttribute("aria-label", "Mo chat tu van");
  toggle.textContent = "?";

  const panel = document.createElement("section");
  panel.className = "mc-chat-panel";
  panel.setAttribute("aria-label", "Chat tu van san pham");
  panel.innerHTML = `
    <header class="mc-chat-header">
      <h2 class="mc-chat-title">Tu van san pham</h2>
      <button class="mc-chat-close" type="button" aria-label="Dong chat">&times;</button>
    </header>
    <div class="mc-chat-messages"></div>
    <form class="mc-chat-form">
      <input class="mc-chat-input" name="message" autocomplete="off" placeholder="Nhap cau hoi..." />
      <button class="mc-chat-send" type="submit">Gui</button>
    </form>
  `;

  document.body.append(toggle, panel);

  const messages = panel.querySelector(".mc-chat-messages");
  const form = panel.querySelector(".mc-chat-form");
  const input = panel.querySelector(".mc-chat-input");

  function appendMessage(role, text) {
    const bubble = document.createElement("div");
    bubble.className = `mc-chat-bubble ${role}`;
    bubble.textContent = text;
    messages.appendChild(bubble);
    messages.scrollTop = messages.scrollHeight;
  }

  function setOpen(isOpen) {
    panel.classList.toggle("is-open", isOpen);
    if (isOpen) input.focus();
  }

  toggle.addEventListener("click", () => setOpen(!panel.classList.contains("is-open")));
  panel.querySelector(".mc-chat-close").addEventListener("click", () => setOpen(false));

  appendMessage("assistant", "Chao ban, minh co the tu van gia, ton kho va thong tin san pham.");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const message = input.value.trim();
    if (!message) return;

    input.value = "";
    appendMessage("user", message);
    history.push({ role: "user", content: message });

    const pending = document.createElement("div");
    pending.className = "mc-chat-bubble assistant";
    pending.textContent = "Dang tra loi...";
    messages.appendChild(pending);
    messages.scrollTop = messages.scrollHeight;

    try {
      const response = await fetch(`${apiBase}/api/chatbot/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ message, productId, history: history.slice(-8) })
      });

      const data = await response.json();
      const reply = data.reply || data.message || "Minh chua co cau tra loi phu hop.";
      pending.textContent = reply;
      history.push({ role: "assistant", content: reply });
    } catch (_error) {
      pending.textContent = "Ket noi chatbot dang gian doan. Ban vui long thu lai sau.";
    }
  });
})();
