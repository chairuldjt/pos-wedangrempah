'use client';

import { useState, useEffect } from 'react';
import {
    Utensils,
    Plus,
    Edit2,
    Trash2,
    Search,
    X,
    Check,
    Loader2,
    Grid,
    Tag,
    Image as ImageIcon,
    Package,
    AlertCircle,
    Coffee,
    ChevronRight,
    Filter,
    Layers,
    ShoppingCart,
    Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import Notification from '../components/Notification';

interface MenuItem {
    id: number;
    category_id: number;
    category_name: string;
    name: string;
    description: string;
    price: number;
    cost_price: number;
    icon: string;
    is_available: boolean;
    is_popular: boolean;
    stock: number;
}

interface Category {
    id: number;
    name: string;
    description: string;
    icon: string;
    is_active: boolean;
}

export default function MenuManagement() {
    const [activeTab, setActiveTab] = useState<'items' | 'categories'>('items');
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modals
    const [isItemModalOpen, setIsItemModalOpen] = useState(false);
    const [isCatModalOpen, setIsCatModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
    const [editingCat, setEditingCat] = useState<Category | null>(null);

    // Form States
    const [itemForm, setItemForm] = useState({
        category_id: 0,
        name: '',
        description: '',
        price: '',
        cost_price: '',
        icon: '🍵',
        is_available: true,
        is_popular: false,
        stock: 0
    });

    const [catForm, setCatForm] = useState({
        name: '',
        description: '',
        icon: '📦',
        is_active: true
    });

    const [submitting, setSubmitting] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Notification State
    const [notif, setNotif] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: 'success' | 'error' | 'info' | 'confirm';
        onConfirm?: () => void;
    }>({
        isOpen: false,
        title: '',
        message: '',
        type: 'info'
    });

    const showNotif = (title: string, message: string, type: any = 'info', onConfirm?: () => void) => {
        setNotif({ isOpen: true, title, message, type, onConfirm });
    };

    useEffect(() => {
        setMounted(true);
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [itemRes, catRes] = await Promise.all([
                fetch('/api/menu/items'),
                fetch('/api/menu/categories')
            ]);
            const itemData = await itemRes.json();
            const catData = await catRes.json();

            if (Array.isArray(itemData)) setMenuItems(itemData);
            if (Array.isArray(catData)) {
                setCategories(catData);
                if (catData.length > 0 && itemForm.category_id === 0) {
                    setItemForm(prev => ({ ...prev, category_id: catData[0].id }));
                }
            }
        } catch (error) {
            console.error('Error fetching menu data:', error);
            showNotif('Error', 'Gagal memuat data menu', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenItemModal = (item: MenuItem | null = null) => {
        if (item) {
            setEditingItem(item);
            setItemForm({
                category_id: item.category_id,
                name: item.name,
                description: item.description,
                price: item.price.toString(),
                cost_price: item.cost_price.toString(),
                icon: item.icon,
                is_available: item.is_available,
                is_popular: item.is_popular,
                stock: item.stock
            });
        } else {
            setEditingItem(null);
            setItemForm({
                category_id: categories[0]?.id || 0,
                name: '',
                description: '',
                price: '',
                cost_price: '',
                icon: '🍵',
                is_available: true,
                is_popular: false,
                stock: 0
            });
        }
        setIsItemModalOpen(true);
    };

    const handleOpenCatModal = (cat: Category | null = null) => {
        if (cat) {
            setEditingCat(cat);
            setCatForm({
                name: cat.name,
                description: cat.description,
                icon: cat.icon,
                is_active: cat.is_active
            });
        } else {
            setEditingCat(null);
            setCatForm({
                name: '',
                description: '',
                icon: '📦',
                is_active: true
            });
        }
        setIsCatModalOpen(true);
    };

    const handleItemSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const url = editingItem ? `/api/menu/items/${editingItem.id}` : '/api/menu/items';
            const method = editingItem ? 'PATCH' : 'POST';
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(itemForm)
            });
            const result = await res.json();
            if (result.success) {
                setIsItemModalOpen(false);
                fetchData();
                showNotif('Berhasil', editingItem ? 'Menu berhasil diperbarui' : 'Menu baru berhasil ditambahkan', 'success');
            } else showNotif('Gagal', result.error || 'Terjadi kesalahan sistem', 'error');
        } catch (error) {
            console.error('Error saving item:', error);
            showNotif('Error', 'Gagal menyimpan menu', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCatSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const url = editingCat ? `/api/menu/categories/${editingCat.id}` : '/api/menu/categories';
            const method = editingCat ? 'PATCH' : 'POST';
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(catForm)
            });
            const result = await res.json();
            if (result.success) {
                setIsCatModalOpen(false);
                fetchData();
                showNotif('Berhasil', editingCat ? 'Kategori diperbarui' : 'Kategori baru ditambahkan', 'success');
            } else showNotif('Gagal', result.error || 'Terjadi kesalahan sistem', 'error');
        } catch (error) {
            console.error('Error saving category:', error);
            showNotif('Error', 'Gagal menyimpan kategori', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteItem = async (id: number) => {
        showNotif(
            'Konfirmasi Hapus',
            'Apakah Anda yakin ingin menghapus menu ini?',
            'confirm',
            async () => {
                try {
                    const res = await fetch(`/api/menu/items/${id}`, { method: 'DELETE' });
                    const result = await res.json();
                    if (result.success) {
                        fetchData();
                        showNotif('Terhapus', 'Menu telah dihapus', 'success');
                    } else showNotif('Gagal', result.error, 'error');
                } catch (error) { console.error(error); }
            }
        );
    };

    const handleDeleteCat = async (id: number) => {
        showNotif(
            'Konfirmasi Hapus',
            'Hapus kategori ini? Pastikan tidak ada menu yang tersambung.',
            'confirm',
            async () => {
                try {
                    const res = await fetch(`/api/menu/categories/${id}`, { method: 'DELETE' });
                    const result = await res.json();
                    if (result.success) {
                        fetchData();
                        showNotif('Terhapus', 'Kategori telah dihapus', 'success');
                    } else showNotif('Gagal', result.error, 'error');
                } catch (error) { console.error(error); }
            }
        );
    };

    const filteredItems = menuItems.filter(i =>
        i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.category_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredCats = categories.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 pb-20">
            {/* Notification Modal */}
            <Notification
                isOpen={notif.isOpen}
                onClose={() => setNotif({ ...notif, isOpen: false })}
                title={notif.title}
                message={notif.message}
                type={notif.type}
                onConfirm={notif.onConfirm}
            />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center text-accent border border-primary/30 shadow-lg">
                        <Utensils size={28} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-serif font-bold text-gradient tracking-tight">Manajemen Menu</h2>
                        <p className="text-text-muted text-sm font-medium">Atur racikan dan kategori menu Anda</p>
                    </div>
                </div>

                <div className="flex bg-surface-light border border-border/50 p-1.5 rounded-2xl shadow-inner">
                    <button
                        onClick={() => setActiveTab('items')}
                        className={`flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'items' ? 'bg-primary text-white shadow-lg translate-y-[-1px]' : 'text-text-muted hover:text-accent'}`}
                    >
                        <Grid size={14} /> Menu Items
                    </button>
                    <button
                        onClick={() => setActiveTab('categories')}
                        className={`flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'categories' ? 'bg-primary text-white shadow-lg translate-y-[-1px]' : 'text-text-muted hover:text-accent'}`}
                    >
                        <Tag size={14} /> Kategori
                    </button>
                </div>
            </div>

            {/* Main Content Card */}
            <div className="glass-card shadow-2xl border border-border/50 backdrop-blur-3xl">
                <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-surface-light/30 border-b border-border/50">
                    <div className="relative flex-1 max-w-lg">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
                        <input
                            type="text"
                            placeholder={`Cari ${activeTab === 'items' ? 'nama menu atau kategori' : 'nama kategori'}...`}
                            className="input pl-14 !py-3.5 !text-base shadow-sm focus:border-accent"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => activeTab === 'items' ? handleOpenItemModal() : handleOpenCatModal()}
                        className="btn-primary !py-3.5 !px-8 flex items-center gap-3 group whitespace-nowrap"
                    >
                        <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                        <span className="text-sm font-black uppercase tracking-widest">Tambah {activeTab === 'items' ? 'Menu' : 'Kategori'}</span>
                    </button>
                </div>

                <div className="overflow-x-auto">
                    {activeTab === 'items' ? (
                        <table className="modern-table">
                            <thead>
                                <tr className="bg-surface-light/40">
                                    <th className="!py-6 text-[11px] font-black uppercase tracking-[0.2em] text-accent/80 pl-8">Menu Info</th>
                                    <th className="!py-6 text-[11px] font-black uppercase tracking-[0.2em] text-accent/80">Kategori</th>
                                    <th className="!py-6 text-[11px] font-black uppercase tracking-[0.2em] text-accent/80">Harga</th>
                                    <th className="!py-6 text-[11px] font-black uppercase tracking-[0.2em] text-accent/80">Stok</th>
                                    <th className="!py-6 text-[11px] font-black uppercase tracking-[0.2em] text-accent/80">Status</th>
                                    <th className="!py-6 text-[11px] font-black uppercase tracking-[0.2em] text-accent/80 text-right pr-8">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={6} className="py-24 text-center"><Loader2 className="animate-spin mx-auto text-accent mb-4" size={40} /><p className="font-serif italic text-text-muted">Mempersiapkan daftar menu...</p></td></tr>
                                ) : filteredItems.length === 0 ? (
                                    <tr><td colSpan={6} className="py-24 text-center text-text-muted italic">Tidak ada menu yang ditemukan.</td></tr>
                                ) : filteredItems.map(item => (
                                    <tr key={item.id} className="group hover:bg-surface-light/20 transition-all border-b border-border/30 last:border-0">
                                        <td className="py-6 pl-8">
                                            <div className="flex items-center gap-5">
                                                <div className="w-14 h-14 rounded-2xl bg-background border border-border/50 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform shadow-inner">
                                                    {item.icon}
                                                </div>
                                                <div className="overflow-hidden">
                                                    <p className="font-serif font-bold text-lg text-white group-hover:text-accent transition-colors truncate max-w-[200px]">{item.name}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        {item.is_popular && <span className="text-[9px] bg-accent/20 text-accent font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">Terpopuler</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="bg-surface-light px-3 py-1.5 rounded-xl text-xs font-bold text-text-muted border border-border/50 shadow-sm lowercase tracking-tighter italic">#{item.category_name}</span>
                                        </td>
                                        <td>
                                            <p className="font-bold text-accent text-lg">Rp {item.price.toLocaleString('id-ID')}</p>
                                            <p className="text-[10px] text-text-muted opacity-60">Modal: Rp {item.cost_price.toLocaleString('id-ID')}</p>
                                        </td>
                                        <td>
                                            <div className="flex flex-col gap-1">
                                                <div className="w-24 h-1.5 bg-background border border-border/30 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-1000 ${item.stock < 10 ? 'bg-error' : item.stock < 30 ? 'bg-warning' : 'bg-success'}`}
                                                        style={{ width: `${Math.min(item.stock, 100)}%` }}
                                                    />
                                                </div>
                                                <span className={`text-[10px] font-black uppercase ${item.stock < 10 ? 'text-error' : 'text-text-muted'}`}>{item.stock} unit</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${item.is_available ? 'bg-success/20 text-success border border-success/30' : 'bg-error/20 text-error border border-error/30'}`}>
                                                {item.is_available ? 'Tersedia' : 'Nonaktif'}
                                            </span>
                                        </td>
                                        <td className="text-right pr-8">
                                            <div className="flex items-center justify-end gap-3">
                                                <button onClick={() => handleOpenItemModal(item)} className="w-10 h-10 rounded-xl bg-surface-light/50 border border-border/50 text-text-muted hover:text-accent hover:border-accent/50 transition-all hover:scale-105 shadow-lg"><Edit2 size={16} className="mx-auto" /></button>
                                                <button onClick={() => handleDeleteItem(item.id)} className="w-10 h-10 rounded-xl bg-error/10 border border-error/20 text-error/60 hover:text-error hover:border-error/50 transition-all hover:scale-105 shadow-lg"><Trash2 size={16} className="mx-auto" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <table className="modern-table">
                            <thead>
                                <tr className="bg-surface-light/40">
                                    <th className="!py-6 text-[11px] font-black uppercase tracking-[0.2em] text-accent/80 pl-8">Kategori</th>
                                    <th className="!py-6 text-[11px] font-black uppercase tracking-[0.2em] text-accent/80">Deskripsi</th>
                                    <th className="!py-6 text-[11px] font-black uppercase tracking-[0.2em] text-accent/80">Status</th>
                                    <th className="!py-6 text-[11px] font-black uppercase tracking-[0.2em] text-accent/80 text-right pr-8">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={4} className="py-24 text-center"><Loader2 className="animate-spin mx-auto text-accent mb-4" size={40} /></td></tr>
                                ) : filteredCats.length === 0 ? (
                                    <tr><td colSpan={4} className="py-24 text-center text-text-muted italic">Tidak ada kategori.</td></tr>
                                ) : filteredCats.map(cat => (
                                    <tr key={cat.id} className="group hover:bg-surface-light/20 transition-all border-b border-border/30 last:border-0">
                                        <td className="py-6 pl-8">
                                            <div className="flex items-center gap-5">
                                                <div className="w-14 h-14 rounded-2xl bg-background border border-border/50 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform shadow-inner">
                                                    {cat.icon}
                                                </div>
                                                <p className="font-serif font-bold text-lg text-white group-hover:text-accent transition-colors">{cat.name}</p>
                                            </div>
                                        </td>
                                        <td className="text-text-muted text-sm italic max-w-md truncate">{cat.description || '-'}</td>
                                        <td>
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${cat.is_active ? 'bg-success/20 text-success border border-success/30' : 'bg-error/20 text-error border border-error/30'}`}>
                                                {cat.is_active ? 'Aktif' : 'Nonaktif'}
                                            </span>
                                        </td>
                                        <td className="text-right pr-8">
                                            <div className="flex items-center justify-end gap-3">
                                                <button onClick={() => handleOpenCatModal(cat)} className="w-10 h-10 rounded-xl bg-surface-light/50 border border-border/50 text-text-muted hover:text-accent transition-all"><Edit2 size={16} className="mx-auto" /></button>
                                                <button onClick={() => handleDeleteCat(cat.id)} className="w-10 h-10 rounded-xl bg-error/10 border border-error/20 text-error/60 hover:text-error transition-all"><Trash2 size={16} className="mx-auto" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {mounted && createPortal(
                <>
                    {/* Modal Item */}
                    <AnimatePresence>
                        {isItemModalOpen && (
                            <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6 bg-background/80 backdrop-blur-md">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                    className="glass-card w-full max-w-2xl !p-0 overflow-hidden shadow-2xl border-accent/20 flex flex-col max-h-[90vh]"
                                >
                                    <div className="p-6 sm:p-8 border-b border-border/50 flex items-center justify-between bg-surface-light/30 flex-shrink-0">
                                        <h3 className="text-xl sm:text-2xl font-serif font-bold text-accent">{editingItem ? 'Edit Menu' : 'Tambah Menu Baru'}</h3>
                                        <button onClick={() => setIsItemModalOpen(false)} className="w-10 h-10 rounded-full hover:bg-surface-light/50 flex items-center justify-center text-text-muted transition-colors"><X size={24} /></button>
                                    </div>
                                    <form onSubmit={handleItemSubmit} className="p-6 sm:p-8 overflow-y-auto custom-scrollbar flex-1">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-accent uppercase tracking-widest flex items-center gap-2"><ShoppingCart size={12} /> Nama Menu</label>
                                                <input type="text" required className="input" value={itemForm.name} onChange={e => setItemForm({ ...itemForm, name: e.target.value })} placeholder="E.g. Wedang Jahe Susu" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-accent uppercase tracking-widest flex items-center gap-2"><Layers size={12} /> Kategori</label>
                                                <div className="relative">
                                                    <select className="input appearance-none bg-surface-light" value={itemForm.category_id} onChange={e => setItemForm({ ...itemForm, category_id: parseInt(e.target.value) })}>
                                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                                    </select>
                                                    <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-text-muted pointer-events-none" size={16} />
                                                </div>
                                            </div>
                                            <div className="space-y-2 md:col-span-2">
                                                <label className="text-[10px] font-black text-accent uppercase tracking-widest flex items-center gap-2"><Info size={12} /> Deskripsi</label>
                                                <textarea className="input min-h-[80px]" value={itemForm.description} onChange={e => setItemForm({ ...itemForm, description: e.target.value })} placeholder="Penjelasan singkat menu ini..." />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-accent uppercase tracking-widest flex items-center gap-2 font-mono text-success">Rp Harga Jual</label>
                                                <input type="number" required className="input !font-mono text-accent" value={itemForm.price} onChange={e => setItemForm({ ...itemForm, price: e.target.value })} placeholder="8000" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-accent uppercase tracking-widest flex items-center gap-2 font-mono text-text-muted">Rp Harga Modal</label>
                                                <input type="number" className="input !font-mono" value={itemForm.cost_price} onChange={e => setItemForm({ ...itemForm, cost_price: e.target.value })} placeholder="4000" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-accent uppercase tracking-widest flex items-center gap-2"><Package size={12} /> Stok Awal</label>
                                                <input type="number" className="input" value={itemForm.stock} onChange={e => setItemForm({ ...itemForm, stock: parseInt(e.target.value) })} placeholder="100" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-accent uppercase tracking-widest flex items-center gap-2"><Coffee size={12} /> Ikon / Emoji</label>
                                                <input type="text" className="input" value={itemForm.icon} onChange={e => setItemForm({ ...itemForm, icon: e.target.value })} placeholder="🍵" />
                                            </div>
                                            <div className="md:col-span-2 flex flex-col sm:flex-row gap-6 p-4 bg-surface-light/50 border border-border/50 rounded-2xl">
                                                <label className="flex items-center gap-3 cursor-pointer group">
                                                    <input type="checkbox" checked={itemForm.is_available} onChange={e => setItemForm({ ...itemForm, is_available: e.target.checked })} className="w-5 h-5 accent-accent" />
                                                    <span className="text-sm font-bold text-text-muted group-hover:text-accent transition-colors">Tersedia untuk Dijual</span>
                                                </label>
                                                <label className="flex items-center gap-3 cursor-pointer group">
                                                    <input type="checkbox" checked={itemForm.is_popular} onChange={e => setItemForm({ ...itemForm, is_popular: e.target.checked })} className="w-5 h-5 accent-accent" />
                                                    <span className="text-sm font-bold text-text-muted group-hover:text-accent transition-colors">Label Menu Populer</span>
                                                </label>
                                            </div>
                                        </div>
                                        <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-6 mt-6 border-t border-border/50">
                                            <button type="button" onClick={() => setIsItemModalOpen(false)} className="btn-outline !py-3 !px-8 text-xs font-black uppercase tracking-widest order-2 sm:order-1">Batal</button>
                                            <button type="submit" disabled={submitting} className="btn-primary !py-3 !px-10 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest order-1 sm:order-2">
                                                {submitting ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
                                                Simpan Menu
                                            </button>
                                        </div>
                                    </form>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>

                    {/* Modal Category */}
                    <AnimatePresence>
                        {isCatModalOpen && (
                            <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6 bg-background/80 backdrop-blur-md">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 1, scale: 0.95, y: 20 }}
                                    className="glass-card w-full max-w-lg !p-0 overflow-hidden shadow-2xl border-primary/20 flex flex-col max-h-[90vh]"
                                >
                                    <div className="p-6 sm:p-8 border-b border-border/50 flex items-center justify-between bg-surface-light/30 flex-shrink-0">
                                        <h3 className="text-xl sm:text-2xl font-serif font-bold text-accent">{editingCat ? 'Edit Kategori' : 'Tambah Kategori Baru'}</h3>
                                        <button onClick={() => setIsCatModalOpen(false)} className="w-10 h-10 rounded-full hover:bg-surface-light/50 flex items-center justify-center text-text-muted transition-colors"><X size={24} /></button>
                                    </div>
                                    <form onSubmit={handleCatSubmit} className="p-6 sm:p-8 overflow-y-auto custom-scrollbar flex-1">
                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-accent uppercase tracking-widest flex items-center gap-2"><Tag size={12} /> Nama Kategori</label>
                                                <input type="text" required className="input" value={catForm.name} onChange={e => setCatForm({ ...catForm, name: e.target.value })} placeholder="E.g. Minuman Hangat" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-accent uppercase tracking-widest flex items-center gap-2"><Info size={12} /> Deskripsi</label>
                                                <textarea className="input min-h-[100px]" value={catForm.description} onChange={e => setCatForm({ ...catForm, description: e.target.value })} placeholder="Penjelasan singkat..." />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-accent uppercase tracking-widest flex items-center gap-2"><Grid size={12} /> Ikon Representasi</label>
                                                <input type="text" className="input" value={catForm.icon} onChange={e => setCatForm({ ...catForm, icon: e.target.value })} placeholder="📦" />
                                            </div>
                                            <div className="p-4 bg-surface-light/50 border border-border/50 rounded-2xl">
                                                <label className="flex items-center gap-3 cursor-pointer group">
                                                    <input type="checkbox" checked={catForm.is_active} onChange={e => setCatForm({ ...catForm, is_active: e.target.checked })} className="w-5 h-5 accent-accent" />
                                                    <span className="text-sm font-bold text-text-muted group-hover:text-accent transition-colors">Kategori Aktif</span>
                                                </label>
                                            </div>
                                        </div>
                                        <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-6 mt-6 border-t border-border/50">
                                            <button type="button" onClick={() => setIsCatModalOpen(false)} className="btn-outline !py-3 !px-8 text-xs font-black uppercase tracking-widest order-2 sm:order-1">Batal</button>
                                            <button type="submit" disabled={submitting} className="btn-primary !py-3 !px-10 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest order-1 sm:order-2">
                                                {submitting ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
                                                Simpan Kategori
                                            </button>
                                        </div>
                                    </form>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>
                </>, document.body)}
        </div>
    );
}
