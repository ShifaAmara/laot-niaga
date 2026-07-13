/* ============================================================
   LAOT NIAGA — AI.JS v2 | Backward compat → ai-assistant.js
   ============================================================ */
// Alias lama → fungsi baru
const askAI = prompt => (typeof askNiagaAI === 'function' ? askNiagaAI(prompt) : Promise.resolve(generateFallbackReply(prompt)));