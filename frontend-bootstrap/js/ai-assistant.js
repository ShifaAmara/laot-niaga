/* ============================================================
   LAOT NIAGA — AI-ASSISTANT.JS | Floating AI Bot
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  if (!document.querySelector('.ai-float-btn')) injectAIFloat();
});

function injectAIFloat() {
  const el = document.createElement('div');
  el.innerHTML = `
    <button class="ai-float-btn" id="aiFloatBtn" title="Tanya NiagaAI">
      <i class="bi bi-stars"></i>
    </button>
    <div class="ai-float-panel" id="aiFloatPanel">
      <div class="ai-panel-header">
        <div class="ai-avatar-sm"><i class="bi bi-robot"></i></div>
        <div>
          <div style="font-weight:700;font-size:.88rem">NiagaAI</div>
          <div style="font-size:.7rem;opacity:.8">🟢 Online</div>
        </div>
        <button style="margin-left:auto;background:none;border:none;color:#fff;font-size:1.1rem" id="aiCloseBtn">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>
      <div class="ai-panel-messages" id="aiMessages">
        <div class="ai-msg bot">Halo! 👋 Saya <b>NiagaAI</b> — asisten cerdas Laot Niaga.<br>Saya siap membantu kamu mencari produk, branding UMKM, atau menjawab pertanyaan!</div>
      </div>
      <div class="ai-quick-btns">
        <button class="ai-quick-btn" data-prompt="Rekomendasikan produk ikan terbaik">🐟 Rekomendasi</button>
        <button class="ai-quick-btn" data-prompt="Bantu saya buat nama merek UMKM laut">✨ Branding</button>
        <button class="ai-quick-btn" data-prompt="Produk apa yang paling laris di Laot Niaga?">🔥 Terlaris</button>
        <button class="ai-quick-btn" data-prompt="Cara checkout dan pembayaran di Laot Niaga">🛒 Cara Beli</button>
      </div>
      <div class="ai-panel-input">
        <input type="text" id="aiInput" placeholder="Tanya sesuatu...">
        <button class="ai-send" id="aiSendBtn"><i class="bi bi-send-fill"></i></button>
      </div>
    </div>
  `;
  document.body.appendChild(el);
  initAIFloat();
}

function initAIFloat() {
  const btn = document.getElementById('aiFloatBtn');
  const panel = document.getElementById('aiFloatPanel');
  const close = document.getElementById('aiCloseBtn');
  const input = document.getElementById('aiInput');
  const send = document.getElementById('aiSendBtn');
  const msgs = document.getElementById('aiMessages');

  if (!btn) return;

  btn.addEventListener('click', () => {
    panel.classList.toggle('open');
    if (panel.classList.contains('open')) input?.focus();
  });
  close?.addEventListener('click', () => panel.classList.remove('open'));

  async function sendMsg() {
    const text = input.value.trim();
    if (!text) return;
    appendMsg(text, 'user');
    input.value = '';
    const typing = appendTyping();
    try {
      const reply = typeof askNiagaAI === 'function' ? await askNiagaAI(text) : generateFallbackReply(text);
      typing.remove();
      appendMsg(reply, 'bot');
    } catch {
      typing.remove();
      appendMsg('Maaf, terjadi gangguan. Coba lagi nanti ya! 🙏', 'bot');
    }
  }

  send?.addEventListener('click', sendMsg);
  input?.addEventListener('keypress', e => { if (e.key === 'Enter') sendMsg(); });

  document.querySelectorAll('.ai-quick-btn').forEach(b => {
    b.addEventListener('click', () => {
      if (input) { input.value = b.dataset.prompt; sendMsg(); }
    });
  });

  function appendMsg(text, type) {
    const div = document.createElement('div');
    div.className = `ai-msg ${type}`;
    div.innerHTML = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
    msgs?.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
    return div;
  }

  function appendTyping() {
    const div = document.createElement('div');
    div.className = 'ai-msg bot';
    div.innerHTML = '<div class="typing-indicator"><span></span><span></span><span></span></div>';
    msgs?.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
    return div;
  }
}
