let menuData = [];
let cart = [];

// 内嵌菜单数据 - 作为 fallback，避免 file:// 协议下无法 fetch
const FALLBACK_MENU = [
  { id: 1, name: "经典美式", desc: "浓郁醇厚,黑咖纯粹的本真味道", basePrice: 22, image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600" },
  { id: 2, name: "意式浓缩", desc: "Espresso · 一杯精华,咖啡之魂", basePrice: 18, image: "https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=600" },
  { id: 3, name: "拿铁咖啡", desc: "浓缩与丝滑奶泡的完美邂逅", basePrice: 28, image: "https://images.unsplash.com/photo-1561882468-9110e03e0f78?w=600" },
  { id: 4, name: "馥芮白", desc: "Flat White · 浓郁咖啡感,澳式经典", basePrice: 28, image: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=600" },
  { id: 5, name: "卡布奇诺", desc: "1:1:1 经典比例,奶泡轻盈柔软", basePrice: 28, image: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=600" },
  { id: 6, name: "焦糖玛奇朵", desc: "香甜焦糖与浓缩的浪漫交织", basePrice: 32, image: "https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=600" },
  { id: 7, name: "摩卡咖啡", desc: "巧克力与咖啡的甜蜜碰撞", basePrice: 32, image: "https://images.unsplash.com/photo-1534778101976-62847782c213?w=600" },
  { id: 8, name: "香草拿铁", desc: "马达加斯加香草荚,温柔甜香", basePrice: 30, image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600" },
  { id: 9, name: "榛果拿铁", desc: "意大利榛果糖浆,坚果香气满溢", basePrice: 30, image: "https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=600" },
  { id: 10, name: "燕麦拿铁", desc: "OatSide 燕麦奶,植物基轻负担", basePrice: 32, image: "https://images.unsplash.com/photo-1551030173-122aabc4489c?w=600" },
  { id: 11, name: "海盐椰拿铁", desc: "椰浆 + 海盐,层次清爽回甘", basePrice: 32, image: "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=600" },
  { id: 12, name: "Dirty 脏咖啡", desc: "浓缩猛地撞入冰牛奶,层次分明", basePrice: 32, image: "https://images.unsplash.com/photo-1572286258217-215cf8e9d99e?w=600" },
  { id: 13, name: "冷萃咖啡", desc: "12 小时低温萃取,清爽顺滑", basePrice: 30, image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600" },
  { id: 14, name: "鸳鸯咖啡", desc: "港式经典,咖啡与丝袜奶茶的相遇", basePrice: 26, image: "https://images.unsplash.com/photo-1551606016-22b4f3a8a786?w=600" }
];

// ===== 初始化 =====
document.addEventListener('DOMContentLoaded', () => {
  loadMenu();
  setupEventListeners();
  loadCartFromStorage();
});

// ===== 菜单数据加载 =====
async function loadMenu() {
  try {
    // file:// 协议下 fetch 会失败，直接使用内嵌数据
    if (location.protocol === 'file:') {
      menuData = FALLBACK_MENU;
    } else {
      const response = await fetch('menu.json');
      if (!response.ok) throw new Error('menu.json 加载失败');
      menuData = await response.json();
    }
  } catch (error) {
    console.warn('使用内嵌菜单数据:', error);
    menuData = FALLBACK_MENU;
  }
  renderMenuCards();
  // 卡片渲染完成后再启用滚动渐入观察器
  setupIntersectionObserver();
}

// ===== 动态渲染菜单卡片 =====
function renderMenuCards() {
  const menuGrid = document.getElementById('menu-grid');
  menuGrid.innerHTML = menuData.map(item => `
    <div class="card" data-id="${item.id}">
      <div class="card-img">
        <img src="${item.image}" alt="${item.name}" loading="lazy">
      </div>
      <div class="card-body">
        <h3>${item.name}</h3>
        <p>${item.desc}</p>

        <div class="specs-section">
          <div class="spec-row">
            <span class="spec-label">杯型:</span>
            ${['S', 'M', 'L'].map(size => `
              <button class="spec-btn size-btn${size === 'M' ? ' active' : ''}" data-size="${size}" data-price-adjust="${size === 'S' ? -2 : size === 'L' ? 2 : 0}">
                ${size}
              </button>
            `).join('')}
          </div>

          <div class="spec-row">
            <span class="spec-label">温度:</span>
            ${['热', '冰'].map(temp => `
              <button class="spec-btn temp-btn${temp === '热' ? ' active' : ''}" data-temp="${temp}">
                ${temp}
              </button>
            `).join('')}
          </div>

          <div class="spec-row">
            <span class="spec-label">糖度:</span>
            ${['无糖', '少糖', '正常', '加糖'].map((sugar, idx) => `
              <button class="spec-btn sugar-btn${idx === 2 ? ' active' : ''}" data-sugar="${sugar}">
                ${sugar}
              </button>
            `).join('')}
          </div>
        </div>

        <div class="price-row">
          <span class="price" data-base-price="${item.basePrice}">¥${item.basePrice}</span>
          <button class="add-btn" data-item-id="${item.id}">加入购物车</button>
        </div>
      </div>
    </div>
  `).join('');

  // 规格选择器事件处理
  document.querySelectorAll('.spec-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.target.closest('.card');
      const specType = e.target.classList.contains('size-btn') ? 'size' :
                       e.target.classList.contains('temp-btn') ? 'temp' : 'sugar';

      // 同类型的 active 只有一个
      card.querySelectorAll(`.${specType}-btn`).forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');

      updatePrice(card);
    });
  });

  // 加入购物车按钮
  document.querySelectorAll('.add-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.target.closest('.card');
      const itemId = parseInt(e.target.dataset.itemId);
      const item = menuData.find(m => m.id === itemId);

      const size = card.querySelector('.size-btn.active')?.dataset.size || 'M';
      const temp = card.querySelector('.temp-btn.active')?.dataset.temp || '热';
      const sugar = card.querySelector('.sugar-btn.active')?.dataset.sugar || '正常';
      const finalPrice = parseInt(card.querySelector('.price').textContent.substring(1));

      addToCart({
        id: itemId,
        name: item.name,
        size,
        temp,
        sugar,
        basePrice: item.basePrice,
        finalPrice,
        qty: 1
      });
    });
  });
}

// ===== 更新价格 =====
function updatePrice(card) {
  const basePriceEl = card.querySelector('[data-base-price]');
  const basePrice = parseInt(basePriceEl.dataset.basePrice);
  const sizeAdjust = parseInt(card.querySelector('.size-btn.active')?.dataset.priceAdjust || 0);
  const finalPrice = basePrice + sizeAdjust;
  basePriceEl.textContent = `¥${finalPrice}`;
}

// ===== 购物车函数 =====
function addToCart(item) {
  const existingItem = cart.find(
    c => c.id === item.id && c.size === item.size && c.temp === item.temp && c.sugar === item.sugar
  );

  if (existingItem) {
    existingItem.qty += 1;
  } else {
    cart.push(item);
  }

  saveCartToStorage();
  updateCartUI();
  showToast(`${item.name}(${item.size}/${item.temp}) 已加入购物车`);
}

function removeFromCart(index) {
  cart.splice(index, 1);
  saveCartToStorage();
  updateCartUI();
  showToast('已从购物车移除');
}

function updateQty(index, qty) {
  if (qty > 0) {
    cart[index].qty = qty;
  } else {
    removeFromCart(index);
  }
  saveCartToStorage();
  updateCartUI();
}

function clearCart() {
  cart = [];
  saveCartToStorage();
  updateCartUI();
}

// ===== 购物车 UI =====
function updateCartUI() {
  const cartBtn = document.getElementById('cart-btn');
  const badgeEl = document.getElementById('cart-count');
  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);

  badgeEl.textContent = totalQty;

  const cartBody = document.getElementById('cart-body');

  if (cart.length === 0) {
    cartBody.innerHTML = '<div class="cart-empty">购物车为空,去挑一杯好咖啡吧</div>';
  } else {
    cartBody.innerHTML = cart.map((item, idx) => {
      const itemTotal = item.finalPrice * item.qty;
      return `
        <div class="cart-item">
          <div class="cart-item-title">${item.name}</div>
          <div class="cart-item-spec">${item.size}杯 · ${item.temp} · ${item.sugar}</div>
          <div class="cart-item-controls">
            <div class="qty-control">
              <button class="qty-btn" onclick="updateQty(${idx}, ${item.qty - 1})">−</button>
              <span style="min-width: 24px; text-align: center;">${item.qty}</span>
              <button class="qty-btn" onclick="updateQty(${idx}, ${item.qty + 1})">+</button>
            </div>
            <div class="cart-item-price">¥${itemTotal}</div>
            <button class="cart-item-remove" onclick="removeFromCart(${idx})">✕</button>
          </div>
        </div>
      `;
    }).join('');
  }

  // 更新合计
  const total = cart.reduce((sum, item) => sum + item.finalPrice * item.qty, 0);
  document.getElementById('cart-total').textContent = `¥${total}`;
  document.getElementById('checkout-btn').disabled = cart.length === 0;
}

// ===== 事件监听器 =====
function setupEventListeners() {
  // 购物车开关
  document.getElementById('cart-btn').addEventListener('click', toggleCart);
  document.getElementById('cart-overlay').addEventListener('click', closeCart);
  document.getElementById('cart-close').addEventListener('click', closeCart);

  // 表单
  document.getElementById('checkout-btn').addEventListener('click', openCheckout);
  document.getElementById('modal-close').addEventListener('click', closeCheckout);
  document.getElementById('order-form').addEventListener('submit', submitOrder);
}

function toggleCart() {
  const drawer = document.getElementById('cart-drawer');
  const overlay = document.getElementById('cart-overlay');
  drawer.classList.toggle('active');
  overlay.classList.toggle('active');
}

function closeCart() {
  document.getElementById('cart-drawer').classList.remove('active');
  document.getElementById('cart-overlay').classList.remove('active');
}

// ===== 订单表单 =====
function openCheckout() {
  if (cart.length === 0) {
    showToast('购物车为空');
    return;
  }
  document.getElementById('modal-overlay').classList.add('active');
}

function closeCheckout() {
  document.getElementById('modal-overlay').classList.remove('active');
}

function submitOrder(e) {
  e.preventDefault();

  const name = document.getElementById('customer-name').value.trim();
  const phone = document.getElementById('customer-phone').value.trim();
  const time = document.getElementById('pickup-time').value;
  const method = document.getElementById('delivery-method').value;

  if (!name || !phone || !time || !method) {
    showToast('请填写所有信息');
    return;
  }

  if (!/^\d{10,11}$/.test(phone.replace(/\D/g, ''))) {
    showToast('请输入有效的电话号码');
    return;
  }

  const orderSummary = cart.map(
    item => `${item.name}(${item.size}/${item.temp}) x${item.qty} = ¥${item.finalPrice * item.qty}`
  ).join('\n');

  const total = cart.reduce((sum, item) => sum + item.finalPrice * item.qty, 0);

  alert(`✅ 订单已提交!\n\n客户: ${name}\n电话: ${phone}\n取餐时间: ${time}\n配送方式: ${method}\n\n${orderSummary}\n\n合计: ¥${total}\n\n感谢您的订单!`);

  clearCart();
  closeCheckout();
  document.getElementById('order-form').reset();
  closeCart();
  showToast('订单已提交,谢谢光临!');
}

// ===== Toast 通知 =====
function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 2000);
}

// ===== 滚动渐入动画 =====
function setupIntersectionObserver() {
  const cards = document.querySelectorAll('.card');

  // 不支持 IntersectionObserver 或用户偏好减少动画时,直接显示
  if (!('IntersectionObserver' in window) ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    cards.forEach(card => card.classList.add('in-view'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.05,
    rootMargin: '0px 0px 80px 0px'
  });

  cards.forEach(card => observer.observe(card));

  // 兜底:1.5 秒后强制显示所有未触发的卡片(防止 observer 异常)
  setTimeout(() => {
    cards.forEach(card => {
      if (!card.classList.contains('in-view')) {
        card.classList.add('in-view');
      }
    });
  }, 1500);
}

// ===== 本地存储 =====
function saveCartToStorage() {
  localStorage.setItem('coffee-shop-cart', JSON.stringify(cart));
}

function loadCartFromStorage() {
  const stored = localStorage.getItem('coffee-shop-cart');
  if (stored) {
    cart = JSON.parse(stored);
    updateCartUI();
  }
}
