'use client';

import { useState, useEffect } from 'react';
import {
    Settings,
    Store,
    Printer,
    Bell,
    Shield,
    HelpCircle,
    Check,
    Loader2,
    Save,
    Smartphone,
    MapPin,
    Phone,
    Globe,
    Clock
} from 'lucide-react';
import { motion } from 'framer-motion';
import Notification from '../components/Notification';

export default function SettingsPage() {
    const [settings, setSettings] = useState<any>({
        store_name: 'Wedang Rempah Ben Berkah',
        store_address: '',
        store_phone: '',
        receipt_header: 'Maturnuwun Sanget',
        receipt_footer: 'Sampun Rawuh ing Wedang Rempah',
        tax_rate: '0',
        currency_symbol: 'Rp',
        store_hours: 'Setiap Hari: 16:00 - 23:00 WIB'
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeSection, setActiveSection] = useState('umum');

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
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/settings');
            const data = await res.json();
            if (data && !data.error) {
                setSettings((prev: any) => ({ ...prev, ...data }));
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
            showNotif('Error', 'Gagal memuat pengaturan', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });
            const result = await res.json();
            if (result.success) {
                showNotif('Berhasil', 'Pengaturan telah disimpan dengan aman', 'success');
            } else {
                showNotif('Gagal', result.error || 'Terjadi kesalahan sistem', 'error');
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            showNotif('Error', 'Gagal memproses data pengaturan', 'error');
        } finally {
            setSaving(false);
        }
    };

    const navItems = [
        { id: 'umum', label: 'Umum', icon: <Store size={18} /> },
        { id: 'struk', label: 'Struk & Cetak', icon: <Printer size={18} /> },
        { id: 'notif', label: 'Notifikasi', icon: <Bell size={18} /> },
        { id: 'keamanan', label: 'Keamanan', icon: <Shield size={18} /> },
    ];

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-20">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-accent border border-primary/30 shadow-lg">
                    <Settings size={28} />
                </div>
                <div>
                    <h2 className="text-3xl font-serif font-bold text-gradient">Setelan Sistem</h2>
                    <p className="text-text-muted text-sm capitalize">Kelola identitas toko dan konfigurasi aplikasi</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Fixed Navigation Sidebar for Settings */}
                <div className="md:col-span-1 space-y-2">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveSection(item.id)}
                            className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-sm font-bold transition-all border ${activeSection === item.id
                                ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20 translate-x-1'
                                : 'text-text-muted hover:text-accent hover:bg-surface-light border-transparent'
                                }`}
                        >
                            {item.icon}
                            {item.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="md:col-span-3">
                    {loading ? (
                        <div className="glass-card flex flex-col items-center justify-center py-32 gap-4">
                            <Loader2 className="animate-spin text-accent" size={40} />
                            <p className="text-text-muted italic animate-pulse font-serif">Memuat data setelan...</p>
                        </div>
                    ) : (
                        <motion.form
                            key={activeSection}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            onSubmit={handleSave}
                            className="glass-card shadow-2xl border border-border/50"
                        >
                            <div className="p-8 space-y-8">
                                {activeSection === 'umum' && (
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3 border-b border-border/50 pb-4">
                                            <Store className="text-accent" size={20} />
                                            <h3 className="text-xl font-serif font-bold">Informasi Toko</h3>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-accent uppercase tracking-widest flex items-center gap-2">
                                                    <Store size={14} /> Nama Toko
                                                </label>
                                                <input
                                                    type="text"
                                                    className="input"
                                                    value={settings.store_name}
                                                    onChange={e => setSettings({ ...settings, store_name: e.target.value })}
                                                    placeholder="E.g. Wedang Rempah Ben Berkah"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-accent uppercase tracking-widest flex items-center gap-2">
                                                    <MapPin size={14} /> Alamat Lengkap
                                                </label>
                                                <textarea
                                                    className="input min-h-[100px]"
                                                    value={settings.store_address}
                                                    onChange={e => setSettings({ ...settings, store_address: e.target.value })}
                                                    placeholder="Jl. Rempah No. 123, Yogyakarta"
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-accent uppercase tracking-widest flex items-center gap-2">
                                                        <Phone size={14} /> Nomor Telepon
                                                    </label>
                                                    <input
                                                        type="text"
                                                        className="input"
                                                        value={settings.store_phone}
                                                        onChange={e => setSettings({ ...settings, store_phone: e.target.value })}
                                                        placeholder="0812-3456-7890"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-accent uppercase tracking-widest flex items-center gap-2">
                                                        <Globe size={14} /> Website/Media Sosial
                                                    </label>
                                                    <input
                                                        type="text"
                                                        className="input"
                                                        value={settings.store_website}
                                                        onChange={e => setSettings({ ...settings, store_website: e.target.value })}
                                                        placeholder="www.wedangrempah.com"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-accent uppercase tracking-widest flex items-center gap-2">
                                                    <Clock size={14} /> Jam Operasional
                                                </label>
                                                <textarea
                                                    className="input min-h-[80px]"
                                                    value={settings.store_hours}
                                                    onChange={e => setSettings({ ...settings, store_hours: e.target.value })}
                                                    placeholder="Setiap Hari: 16:00 - 23:00 WIB"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeSection === 'struk' && (
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3 border-b border-border/50 pb-4">
                                            <Printer className="text-accent" size={20} />
                                            <h3 className="text-xl font-serif font-bold">Pengaturan Struk</h3>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-accent uppercase tracking-widest">Header Struk (Pesan Pembuka)</label>
                                                <input
                                                    type="text"
                                                    className="input"
                                                    value={settings.receipt_header}
                                                    onChange={e => setSettings({ ...settings, receipt_header: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-accent uppercase tracking-widest">Footer Struk (Pesan Penutup)</label>
                                                <textarea
                                                    className="input min-h-[80px]"
                                                    value={settings.receipt_footer}
                                                    onChange={e => setSettings({ ...settings, receipt_footer: e.target.value })}
                                                />
                                            </div>

                                            <div className="p-4 bg-primary/5 rounded-2xl border border-primary/20 space-y-3">
                                                <div className="flex items-center gap-2 text-accent">
                                                    <HelpCircle size={16} />
                                                    <span className="text-xs font-bold uppercase tracking-widest">Pratinjau Teks Struk</span>
                                                </div>
                                                <div className="bg-white/95 p-6 rounded-xl text-center shadow-inner font-mono text-zinc-800 text-xs">
                                                    <p className="font-bold underline mb-4">*** {settings.store_name} ***</p>
                                                    <p className="mb-4">{settings.receipt_header}</p>
                                                    <div className="border-t border-dashed border-zinc-400 my-2" />
                                                    <p className="text-left">Wedang Jahe ......... Rp 8.000</p>
                                                    <div className="border-t border-dashed border-zinc-400 my-2" />
                                                    <p className="font-bold">TOTAL: Rp 8.000</p>
                                                    <div className="border-t border-dashed border-zinc-400 my-2" />
                                                    <p className="mt-4 italic">{settings.receipt_footer}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeSection === 'notif' && (
                                    <div className="py-20 text-center space-y-4">
                                        <Bell className="mx-auto text-text-muted opacity-20" size={64} />
                                        <p className="text-text-muted font-serif italic">Fitur notifikasi real-time sedang dipersiapkan...</p>
                                    </div>
                                )}

                                {activeSection === 'keamanan' && (
                                    <div className="py-20 text-center space-y-4">
                                        <Shield className="mx-auto text-text-muted opacity-20" size={64} />
                                        <p className="text-text-muted font-serif italic">Pengaturan keamanan mendalam akan segera tersedia...</p>
                                    </div>
                                )}

                                <div className="pt-8 border-t border-border/50 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="btn-primary !py-4 !px-12 flex items-center gap-3 shadow-glow"
                                    >
                                        {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                                        <span className="font-black uppercase tracking-[0.2em] text-sm">Simpan Setelan</span>
                                    </button>
                                </div>
                            </div>
                        </motion.form>
                    )}
                </div>
            </div>

            {/* Notification Modal */}
            <Notification
                isOpen={notif.isOpen}
                onClose={() => setNotif({ ...notif, isOpen: false })}
                title={notif.title}
                message={notif.message}
                type={notif.type}
            />
        </div>
    );
}
