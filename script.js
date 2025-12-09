document.addEventListener('DOMContentLoaded', () => {
    // --- Konfigurasi Dasar ---
    // ⚠️ GANTI DENGAN NOMOR WA ASLI ANDA!
    const ADMIN_WA_NUMBER = '6281617024659'; 
    let cart = [];

    // --- Elemen DOM Utama ---
    const elements = {
        openCartBtn: document.getElementById('open-cart-btn'),
        closeCartBtn: document.getElementById('close-cart-btn'),
        cartDrawer: document.getElementById('cart-drawer'),
        overlay: document.getElementById('overlay'),
        cartItemsContainer: document.getElementById('cart-items'),
        cartCountElement: document.getElementById('cart-count'),
        cartTotalElement: document.getElementById('cart-total-price'),
        emptyMessage: document.getElementById('empty-cart-message'),
        checkoutWaBtn: document.getElementById('checkout-wa-btn'),
        productGrid: document.querySelector('.product-grid')
    };

    // --- Fungsi Utilitas ---
    const formatRupiah = (number) => {
        // Menggunakan Intl.NumberFormat untuk format Rupiah yang benar
        return 'Rp' + number.toLocaleString('id-ID');
    };

    // --- Fungsi Buka/Tutup Keranjang ---
    const toggleCart = () => {
        elements.cartDrawer.classList.toggle('open');
        elements.overlay.classList.toggle('active');
    };

    // --- Fungsi Perbarui UI Keranjang ---
    const updateCartSummary = () => {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        elements.cartCountElement.textContent = totalItems;
        elements.cartTotalElement.textContent = formatRupiah(totalPrice);
        elements.emptyMessage.style.display = cart.length === 0 ? 'block' : 'none';
        
        // Atur tombol checkout
        elements.checkoutWaBtn.disabled = cart.length === 0;
        elements.checkoutWaBtn.textContent = cart.length === 0 ? 'Keranjang Kosong' : 'Checkout via WhatsApp';
    };

    // --- Fungsi Render Keranjang ---
    const renderCart = () => {
        elements.cartItemsContainer.innerHTML = '';
        
        if (cart.length === 0) {
            elements.cartItemsContainer.appendChild(elements.emptyMessage);
        } else {
            cart.forEach(item => {
                const itemElement = document.createElement('div');
                itemElement.classList.add('cart-item');
                
                // Menggunakan string HTML template
                itemElement.innerHTML = `
                    <div class="cart-item-info">
                        <span class="cart-item-name">${item.name}</span>
                        <span class="cart-item-price">${formatRupiah(item.price)} @</span>
                    </div>
                    <div class="item-actions">
                        <div class="quantity-control">
                            <button class="decrease-qty" data-id="${item.id}">-</button>
                            <span>${item.quantity}</span>
                            <button class="increase-qty" data-id="${item.id}">+</button>
                        </div>
                        <button class="remove-item-btn" data-id="${item.id}">Hapus</button>
                    </div>
                `;
                elements.cartItemsContainer.appendChild(itemElement);
            });
        }
        updateCartSummary();
    };

    // --- Aksi Menambah Item ke Keranjang ---
    const addItemToCart = (itemData) => {
        const existingItem = cart.find(item => item.id === itemData.id);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: itemData.id,
                name: itemData.name,
                price: itemData.price,
                quantity: 1,
            });
        }
        renderCart();
    };

    // --- Aksi Mengubah Kuantitas Item ---
    const changeItemQuantity = (itemId, change) => {
        const item = cart.find(i => i.id === itemId);
        if (item) {
            item.quantity += change;
            if (item.quantity <= 0) {
                cart = cart.filter(i => i.id !== itemId);
            }
            renderCart();
        }
    };
    
    // --- Aksi Checkout WhatsApp ---
    const checkoutWa = () => {
        if (cart.length === 0) return;

        let message = `*Pesanan Baru dari Toko Flora Unyu Unyu*\n\n`;
        message += `Daftar Produk (${cart.length} item):\n`;
        
        cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            // Membuat baris pesan per item
            message += `${index + 1}. ${item.name} (x${item.quantity})\n   > Subtotal: ${formatRupiah(itemTotal)}\n`;
        });

        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        message += `\n*TOTAL PEMBAYARAN:* ${formatRupiah(total)}\n\n`;
        message += "Mohon konfirmasi ketersediaan stok dan total biaya termasuk ongkos kirim. Terima kasih!";

        const encodedMessage = encodeURIComponent(message);
        const waUrl = `https://wa.me/${ADMIN_WA_NUMBER}?text=${encodedMessage}`;
        
        window.open(waUrl, '_blank');
        
        // Opsional: kosongkan keranjang
        // cart = [];
        // renderCart();
        // toggleCart();
    };


    // --- Event Listeners ---
    
    // 1. Tombol Buka/Tutup
    elements.openCartBtn.addEventListener('click', toggleCart);
    elements.closeCartBtn.addEventListener('click', toggleCart);
    elements.overlay.addEventListener('click', toggleCart);

    // 2. Tombol "Tambah ke Keranjang" (Delegasi di Product Grid)
    elements.productGrid.addEventListener('click', (e) => {
        const target = e.target.closest('.add-to-cart-btn');
        if (target) {
            const productCard = target.closest('.product-card');
            if (productCard) {
                const itemData = {
                    id: productCard.getAttribute('data-id'),
                    name: productCard.getAttribute('data-name'),
                    price: parseInt(productCard.getAttribute('data-price')), 
                };
                addItemToCart(itemData);
            }
        }
    });

    // 3. Aksi di dalam Keranjang (Delegasi untuk Ubah Kuantitas/Hapus)
    elements.cartItemsContainer.addEventListener('click', (e) => {
        const target = e.target;
        const itemId = target.getAttribute('data-id');

        if (target.classList.contains('remove-item-btn')) {
            changeItemQuantity(itemId, -Infinity); // Hapus item
        } else if (target.classList.contains('increase-qty')) {
            changeItemQuantity(itemId, 1);
        } else if (target.classList.contains('decrease-qty')) {
            changeItemQuantity(itemId, -1);
        }
    });
    
    // 4. Tombol Checkout
    elements.checkoutWaBtn.addEventListener('click', checkoutWa);

    // --- Inisialisasi ---
    renderCart();
});