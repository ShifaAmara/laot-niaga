/* ============================================================
   LAOT NIAGA — CART.JS | Keranjang Belanja
   ============================================================ */

const CART_KEY = 'lnCart';

function getCart() { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); }
function saveCart(cart) { localStorage.setItem(CART_KEY, JSON.stringify(cart)); if (typeof updateCartBadge === 'function') updateCartBadge(); }

function addToCart(product, qty = 1) {
  const cart = getCart();
  const idx = cart.findIndex(i => i.id === product.id);
  if (idx >= 0) cart[idx].qty = (cart[idx].qty || 1) + qty;
  else cart.push({ ...product, qty });
  saveCart(cart);
  showToast(`${product.name} ditambahkan ke keranjang 🛒`, 'success');
}
window.addToCart = addToCart;

function removeFromCart(id) {
  saveCart(getCart().filter(i => i.id !== id));
  if (typeof renderCart === 'function') renderCart();
}
window.removeFromCart = removeFromCart;

function updateQty(id, qty) {
  const cart = getCart();
  const idx = cart.findIndex(i => i.id === id);
  if (idx >= 0) { if (qty < 1) cart.splice(idx, 1); else cart[idx].qty = qty; }
  saveCart(cart);
  if (typeof renderCart === 'function') renderCart();
}
window.updateQty = updateQty;

function getCartTotal() {
  return getCart().reduce((s, i) => s + (i.price * (i.qty || 1)), 0);
}
window.getCartTotal = getCartTotal;

function clearCart() { saveCart([]); }
window.clearCart = clearCart;

/* ─── Wishlist ──────────────────────────────────────────────── */
const WL_KEY = 'lnWishlist';
function getWishlist() { return JSON.parse(localStorage.getItem(WL_KEY) || '[]'); }
function toggleWishlist(product) {
  const wl = getWishlist();
  const idx = wl.findIndex(i => i.id === product.id);
  if (idx >= 0) { wl.splice(idx, 1); showToast('Dihapus dari wishlist', 'info'); }
  else { wl.push(product); showToast(`${product.name} disimpan ke wishlist ❤️`, 'success'); }
  localStorage.setItem(WL_KEY, JSON.stringify(wl));
  return idx < 0;
}
window.toggleWishlist = toggleWishlist;
function isWishlisted(id) { return getWishlist().some(i => i.id === id); }
window.isWishlisted = isWishlisted;
