'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSession } from "next-auth/react";
import {
    Search,
    ShoppingCart,
    Plus,
    Minus,
    Trash2,
    CheckCircle2,
    AlertCircle,
    Coffee,
    Leaf,
    Wind,
    Zap,
    User,
    Package,
    ChevronRight,
    CreditCard,
    Ban,
    Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Notification from '../components/Notification';

interface MenuItem {
    id: number;
    name: string;
    price: number;
    category_id: number;
    category_name: string;
    icon: string;
    stock: number;
}

interface Category {
    id: number;
    name: string;
    icon: string;
}

interface CartItem extends MenuItem {
    quantity: number;
}

export default function POSPage() {
    const { data: session } = useSession();

    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [selectedCategory, setSelectedCategory] = useState('Semua');
    const [searchQuery, setSearchQuery] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [paymentAmount, setPaymentAmount] = useState('');
    const [showPayment, setShowPayment] = useState(false);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState<{ show: boolean, name: string } | null>(null);
    const [mounted, setMounted] = useState(false);

    // Notification State
    const [notif, setNotif] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: 'success' | 'error' | 'info' | 'confirm';
    }>({
        isOpen: false,
        title: '',
        message: '',
        type: 'info'
    });

    const showNotif = (title: string, message: string, type: any = 'info') => {
        setNotif({ isOpen: true, title, message, type });
    };

    useEffect(() => {
        setMounted(true);
        fetchMenu();
    }, []);

    const fetchMenu = async () => {
        try {
            const res = await fetch('/api/menu');
            const data = await res.json();
            if (data.items) {
                setMenuItems(data.items);
                setCategories(data.categories);
            }
        } catch (error) {
            console.error("Failed to fetch menu:", error);
            showNotif('Error', 'Gagal memuat daftar menu dari server', 'error');
        } finally {
            setLoading(false);
        }
    };

    const filteredItems = menuItems.filter(item => {
        const matchesCategory = selectedCategory === 'Semua' || item.category_name === selectedCategory;
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const triggerToast = (name: string) => {
        setToast({ show: true, name });
        setTimeout(() => setToast(null), 2000);
    };

    const addToCart = (item: MenuItem) => {
        if (item.stock <= 0) return;

        const existingItem = cart.find(cartItem => cartItem.id === item.id);
        if (existingItem) {
            if (existingItem.quantity >= item.stock) {
                showNotif('Stok Terbatas', `Maaf, stok ${item.name} hanya tinggal ${item.stock} porsi.`, 'info');
                return;
            }
            setCart(cart.map(cartItem =>
                cartItem.id === item.id
                    ? { ...cartItem, quantity: cartItem.quantity + 1 }
                    : cartItem
            ));
        } else {
            setCart([...cart, { ...item, quantity: 1 }]);
        }

        triggerToast(item.name);
    };

    const updateQuantity = (id: number, change: number) => {
        setCart(cart.map(item => {
            if (item.id === id) {
                const newQuantity = item.quantity + change;
                const menuItem = menuItems.find(m => m.id === id);
                if (menuItem && newQuantity > menuItem.stock) {
                    showNotif('Stok Terlampaui', `Stok ${menuItem.name} tidak mencukupi untuk jumlah ini.`, 'info');
                    return item;
                }
                return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
            }
            return item;
        }).filter(item => item.quantity > 0));
    };

    const removeFromCart = (id: number) => {
        setCart(cart.filter(item => item.id !== id));
    };

    const getTotal = () => {
        return cart.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
    };

    const getChange = () => {
        const payment = parseInt(paymentAmount) || 0;
        return payment - getTotal();
    };

    const processPayment = async () => {
        const payment = parseInt(paymentAmount) || 0;
        if (payment < getTotal()) {
            showNotif('Pembayaran Kurang', 'Jumlah bayar tidak boleh lebih kecil dari total belanja.', 'error');
            return;
        }

        try {
            const res = await fetch('/api/transactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customer_name: customerName || 'Pelanggan Umum',
                    total_amount: getTotal(),
                    payment_amount: payment,
                    change_amount: getChange(),
                    items: cart
                })
            });

            const data = await res.json();

            if (data.success) {
                setCart([]);
                setCustomerName('');
                setPaymentAmount('');
                setShowPayment(false);
                showNotif('Transaksi Sukses', 'Pesanan telah dicatat dan stok telah diperbarui. Maturnuwun!', 'success');
                fetchMenu();
            } else {
                showNotif('Transaksi Gagal', data.error || 'Terjadi kesalahan saat menyimpan transaksi.', 'error');
            }
        } catch (error) {
            console.error('Error processing payment:', error);
            showNotif('System Error', 'Gagal menyambung ke server. Periksa koneksi internet Anda.', 'error');
        }
    };

    const getCategoryIcon = (iconStr: string) => {
        if (iconStr.includes('🫖') || iconStr.includes('🍵')) return <Coffee size={18} />;
        if (iconStr.includes('🍃')) return <Leaf size={18} />;
        if (iconStr.includes('🪵')) return <Wind size={18} />;
        return <Package size={18} />;
    };

    return (
        <>
            {/* Global UI Elements using Portals */}
            {mounted && createPortal(
                <>
                    {/* Mobile Floating Cart Button */}
                    <div className="fixed bottom-8 right-8 z-[1000] lg:hidden pointer-events-auto">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.9 }}
                            initial={{ scale: 0, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            onClick={() => {
                                const cartElement = document.getElementById('cart-section');
                                if (cartElement) cartElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }}
                            className="w-16 h-16 rounded-2xl bg-[#94703a] text-white shadow-[0_15px_30px_rgba(0,0,0,0.4)] flex items-center justify-center relative border border-white/10 active:bg-[#b48a4d] transition-colors"
                        >
                            <ShoppingCart size={28} />
                            {cart.length > 0 && (
                                <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute -top-2 -right-2 min-w-[28px] h-7 bg-[#ff4d4d] text-white rounded-full border-[3px] border-[#1a120b] text-[10px] font-black flex items-center justify-center shadow-lg px-1"
                                >
                                    {cart.reduce((s, i) => s + i.quantity, 0)}
                                </motion.span>
                            )}
                        </motion.button>
                    </div>

                    {/* Item Added Toast - Refined Top-Center Pill */}
                    <AnimatePresence>
                        {toast?.show && (
                            <div className="fixed top-8 left-0 right-0 z-[2000] flex justify-center pointer-events-none">
                                <motion.div
                                    initial={{ opacity: 0, y: -20, scale: 0.9 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -20, scale: 0.9, transition: { duration: 0.2 } }}
                                    className="bg-accent/90 backdrop-blur-md text-secondary px-4 py-2 rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.3)] border border-white/20 flex items-center gap-2.5"
                                >
                                    <div className="w-5 h-5 rounded-full bg-secondary/20 flex items-center justify-center">
                                        <Plus size={12} className="text-secondary" />
                                    </div>
                                    <span className="text-xs font-bold tracking-wide">{toast.name} ditambah</span>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>

                    {/* Notification Modal */}
                    <Notification
                        isOpen={notif.isOpen}
                        onClose={() => setNotif({ ...notif, isOpen: false })}
                        title={notif.title}
                        message={notif.message}
                        type={notif.type}
                    />
                </>,
                document.body
            )}

            <div className="flex flex-col lg:flex-row gap-8 min-h-[calc(100vh-12rem)] pb-20 lg:pb-0">
                {/* Menu Section */}
                <div className="flex-1 space-y-6">
                    {/* Search and Categories */}
                    <div className="glass-card !p-4 flex flex-col xl:flex-row gap-6 items-center border border-border/50">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                            <input
                                type="text"
                                placeholder="Cari menu (wedang, jahe, dsb)..."
                                className="input pl-12"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        {/* Categories Scrollable Row */}
                        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto custom-scrollbar">
                            <button
                                onClick={() => setSelectedCategory('Semua')}
                                className={`px-5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${selectedCategory === 'Semua'
                                    ? 'bg-primary text-white border border-primary/50 shadow-lg'
                                    : 'bg-surface-light border border-border text-text-muted hover:border-primary/50'
                                    }`}
                            >
                                📦 Semua
                            </button>
                            {categories.map(category => (
                                <button
                                    key={category.id}
                                    onClick={() => setSelectedCategory(category.name)}
                                    className={`px-5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${selectedCategory === category.name
                                        ? 'bg-primary text-white border border-primary/50 shadow-lg'
                                        : 'bg-surface-light border border-border text-text-muted hover:border-primary/50'
                                        }`}
                                >
                                    {getCategoryIcon(category.icon)} {category.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center py-32 gap-4">
                            <div className="w-12 h-12 rounded-full border-4 border-t-accent border-r-transparent border-b-primary border-l-transparent animate-spin"></div>
                            <p className="text-accent font-serif animate-pulse">Menyiapkan menu dari dapur...</p>
                        </div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
                        >
                            {filteredItems.map((item) => (
                                <motion.div
                                    key={item.id}
                                    whileHover={{ y: -5 }}
                                    className={`glass-card group cursor-pointer relative overflow-hidden transition-all duration-300 border border-border/50 ${item.stock <= 0 ? 'opacity-60 grayscale' : 'hover:border-primary/50 hover:shadow-glow'}`}
                                    onClick={() => addToCart(item)}
                                >
                                    {item.stock <= 0 && (
                                        <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/60 backdrop-blur-[2px]">
                                            <div className="bg-error/20 border border-error/30 text-error text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-tighter flex items-center gap-2">
                                                <Ban size={12} /> Habis
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-500">
                                            {item.icon}
                                        </div>
                                        <div className="text-right">
                                            <span className={`text-[10px] uppercase tracking-widest font-bold ${item.stock < 10 ? 'text-error' : 'text-accent'}`}>
                                                Stok: {item.stock}
                                            </span>
                                            <p className="text-[10px] text-text-muted uppercase tracking-tighter font-medium">{item.category_name}</p>
                                        </div>
                                    </div>

                                    <h3 className="text-lg font-serif font-bold text-text mb-2 group-hover:text-accent transition-colors truncate">{item.name}</h3>

                                    <div className="flex items-center justify-between mt-4">
                                        <span className="text-xl font-bold text-gradient">
                                            Rp {Number(item.price).toLocaleString('id-ID')}
                                        </span>
                                        <div className="w-9 h-9 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-accent group-hover:bg-primary group-hover:text-white transition-all shadow-lg active:scale-90">
                                            <Plus size={18} />
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </div>

                {/* Cart Section */}
                <div id="cart-section" className="w-full lg:w-[400px] scroll-mt-24">
                    <div className="glass-card flex flex-col h-[700px] border border-border/50 sticky top-32 overflow-hidden !p-0">
                        {/* Cart Header */}
                        <div className="p-6 border-b border-border/50 flex items-center justify-between bg-surface-light/30">
                            <div className="flex items-center gap-3">
                                <ShoppingCart className="text-accent" size={20} />
                                <h2 className="text-xl font-serif font-bold text-gradient">Keranjang</h2>
                            </div>
                            <button
                                onClick={() => setCart([])}
                                className="text-[10px] font-bold text-error/60 hover:text-error uppercase tracking-widest transition-colors flex items-center gap-1"
                            >
                                <Trash2 size={12} /> Bersihkan
                            </button>
                        </div>

                        {/* Customer Name */}
                        <div className="p-6 border-b border-border/30">
                            <label className="block text-[10px] font-bold text-accent uppercase tracking-widest mb-2 flex items-center gap-2">
                                <User size={12} /> Nama Pelanggan
                            </label>
                            <input
                                type="text"
                                placeholder="Siapa namanya? (Opsional)"
                                className="input !py-2.5 !text-sm"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                            />
                        </div>

                        {/* Cart Items List */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                            <AnimatePresence mode="popLayout">
                                {cart.length === 0 ? (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 0.3 }}
                                        className="h-full flex flex-col items-center justify-center"
                                    >
                                        <ShoppingCart size={80} className="mb-4 text-text-muted" />
                                        <p className="text-sm italic font-serif">Keranjang belanja Anda masih kosong...</p>
                                    </motion.div>
                                ) : cart.map(item => (
                                    <motion.div
                                        key={item.id}
                                        layout
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="bg-surface-light/40 rounded-2xl p-4 border border-border/30 hover:border-primary/20 transition-all group"
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex gap-3">
                                                <div className="text-2xl w-10 h-10 rounded-xl bg-background flex items-center justify-center border border-border/50">
                                                    {item.icon}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-sm text-text truncate max-w-[140px]">{item.name}</h4>
                                                    <p className="text-[10px] text-accent font-bold">Rp {Number(item.price).toLocaleString('id-ID')}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => removeFromCart(item.id)}
                                                className="text-text-muted hover:text-error transition-colors p-1"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                        <div className="flex justify-between items-center mt-2">
                                            <div className="flex items-center gap-1 bg-background rounded-xl p-1 border border-border/50">
                                                <button
                                                    onClick={() => updateQuantity(item.id, -1)}
                                                    className="w-8 h-8 rounded-lg hover:bg-surface-light flex items-center justify-center text-text-muted hover:text-accent transition-all"
                                                >
                                                    <Minus size={14} />
                                                </button>
                                                <span className="w-8 text-center font-bold text-text text-sm">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, 1)}
                                                    className="w-8 h-8 rounded-lg hover:bg-surface-light flex items-center justify-center text-text-muted hover:text-accent transition-all"
                                                >
                                                    <Plus size={14} />
                                                </button>
                                            </div>
                                            <span className="font-bold text-sm text-accent">Rp {(Number(item.price) * item.quantity).toLocaleString('id-ID')}</span>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        {/* Cart Footer / Checkout */}
                        {cart.length > 0 && (
                            <div className="p-6 bg-surface-light/50 border-t border-border/50 space-y-4 backdrop-blur-md">
                                <div className="flex justify-between items-end">
                                    <span className="text-xs uppercase tracking-widest font-bold text-text-muted">Total Bayar:</span>
                                    <span className="text-3xl font-serif font-bold text-accent">Rp {getTotal().toLocaleString('id-ID')}</span>
                                </div>

                                {!showPayment ? (
                                    <button
                                        onClick={() => setShowPayment(true)}
                                        className="btn-primary w-full py-4 font-bold text-lg group"
                                    >
                                        Bayar Sekarang <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="space-y-4 pt-2"
                                    >
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-accent font-bold">Rp</div>
                                            <input
                                                type="number"
                                                className="input !pl-12 !text-2xl !font-bold !bg-background !border-accent/30 focus:!border-accent shadow-inner"
                                                value={paymentAmount}
                                                onChange={(e) => setPaymentAmount(e.target.value)}
                                                autoFocus
                                                placeholder="0"
                                            />
                                        </div>

                                        <div className="grid grid-cols-4 gap-2">
                                            {[10, 20, 50, 100].map(k => (
                                                <button
                                                    key={k}
                                                    onClick={() => setPaymentAmount((k * 1000).toString())}
                                                    className="py-2.5 rounded-xl text-[10px] font-bold border border-border bg-background text-accent hover:bg-primary/10 hover:border-primary/30 transition-all font-mono"
                                                >{k}K</button>
                                            ))}
                                        </div>

                                        {paymentAmount && (
                                            <div className="flex justify-between items-center px-2 py-2 rounded-xl bg-background/50 border border-border/30">
                                                <span className="text-xs text-text-muted font-bold uppercase tracking-widest">Kembalian:</span>
                                                <span className={`text-xl font-bold font-serif ${getChange() >= 0 ? 'text-success' : 'text-error'}`}>
                                                    Rp {Math.abs(getChange()).toLocaleString('id-ID')}
                                                </span>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-2 gap-4">
                                            <button
                                                onClick={() => setShowPayment(false)}
                                                className="btn-outline !py-3 !text-xs !px-2 flex items-center justify-center gap-1"
                                            >
                                                <Ban size={14} /> Batal
                                            </button>
                                            <button
                                                onClick={processPayment}
                                                disabled={getChange() < 0 || !paymentAmount}
                                                className={`btn-primary !py-3 !text-xs !px-2 flex items-center justify-center gap-1 ${getChange() < 0 ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                                            >
                                                {getChange() < 0 ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />}
                                                Proses Bayar
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
