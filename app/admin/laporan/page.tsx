'use client';

import { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import {
    Calendar,
    FileDown,
    BarChart3,
    Clock,
    User,
    TrendingUp,
    DollarSign,
    Package,
    Award,
    ChevronRight,
    Coffee,
    CalendarDays,
    Activity,
    ArrowUpRight,
    Trash2,
    Check,
    X,
    Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import Notification from '../components/Notification';

interface Transaction {
    id: number;
    transaction_code: string;
    transaction_date: string;
    customer_name: string;
    total_amount: number;
    payment_amount: number;
    change_amount: number;
    items: { name: string; quantity: number; price: number }[];
    kasir_name: string;
}

interface Stats {
    total_count: number;
    total_revenue: number;
    avg_transaction: number;
    total_items: number;
}

export default function LaporanPage() {
    const { data: session } = useSession();
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [stats, setStats] = useState<Stats>({
        total_count: 0,
        total_revenue: 0,
        avg_transaction: 0,
        total_items: 0
    });
    const [bestSelling, setBestSelling] = useState<{ name: string; count: number }[]>([]);
    const [loading, setLoading] = useState(true);
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
        fetchReports();
    }, [selectedDate]);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/transactions?date=${selectedDate}`);
            const data = await res.json();
            if (data.transactions) {
                setTransactions(data.transactions);
                setStats(data.stats);
                setBestSelling(data.bestSelling);
            }
        } catch (error) {
            console.error("Failed to fetch reports:", error);
            showNotif('Error', 'Gagal memuat data laporan', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteTransaction = async (id: number, code: string) => {
        showNotif(
            'Konfirmasi Hapus',
            `Apakah Anda yakin ingin menghapus transaksi ${code}? Stok item akan dikembalikan secara otomatis.`,
            'confirm',
            async () => {
                try {
                    const res = await fetch(`/api/transactions/${id}`, {
                        method: 'DELETE'
                    });
                    const result = await res.json();

                    if (result.success) {
                        showNotif('Berhasil', 'Transaksi telah dihapus dan stok dikembalikan.', 'success');
                        fetchReports();
                    } else {
                        showNotif('Gagal', result.error || 'Gagal menghapus transaksi', 'error');
                    }
                } catch (error) {
                    console.error('Delete transaction error:', error);
                    showNotif('Error', 'Terjadi kesalahan sistem', 'error');
                }
            }
        );
    };

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    };

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemAnim = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="space-y-8 pb-12">
            {/* Toolbar Area */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card !p-6 flex flex-col md:flex-row justify-between items-center gap-6 border border-border/50"
            >
                <div className="flex items-center gap-5 w-full md:w-auto">
                    <div className="w-12 h-12 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center text-accent">
                        <CalendarDays size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] text-accent font-bold uppercase tracking-widest mb-1">Pilih Tanggal Laporan</p>
                        <input
                            type="date"
                            className="bg-transparent text-text font-serif font-bold text-xl outline-none border-b border-border/30 focus:border-accent transition-colors cursor-pointer"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    <button className="btn-outline !py-2.5 !px-5 !text-xs flex items-center gap-2 group">
                        <FileDown size={14} className="group-hover:translate-y-0.5 transition-transform" />
                        Export PDF
                    </button>
                    <button className="btn-primary !py-2.5 !px-5 !text-xs flex items-center gap-2">
                        <BarChart3 size={14} /> Statistik Lengkap
                    </button>
                </div>
            </motion.div>

            {/* Quick Stats Grid */}
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
                {[
                    { label: 'Pendapatan', value: `Rp ${(Number(stats.total_revenue) || 0).toLocaleString('id-ID')}`, icon: <DollarSign size={20} />, color: 'primary' },
                    { label: 'Transaksi', value: stats.total_count, icon: <TrendingUp size={20} />, color: 'accent' },
                    { label: 'Rata-rata', value: `Rp ${(Number(stats.avg_transaction) || 0).toLocaleString('id-ID')}`, icon: <Activity size={20} />, color: 'primary' },
                    { label: 'Item Terjual', value: stats.total_items || 0, icon: <Package size={20} />, color: 'accent' }
                ].map((stat, idx) => (
                    <motion.div key={idx} variants={itemAnim} className="glass-card !p-5 group hover:translate-y-[-4px] transition-all">
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-lg group-hover:shadow-glow`}>
                                {stat.icon}
                            </div>
                            <div>
                                <p className="text-[10px] text-text-muted uppercase tracking-widest font-bold mb-0.5">{stat.label}</p>
                                <p className="text-xl font-serif font-bold text-accent">{stat.value}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Transactions History */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="lg:col-span-2 space-y-6"
                >
                    <div className="glass-card !p-0 overflow-hidden border border-border/50 shadow-2xl">
                        <div className="p-8 border-b border-border/50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Clock className="text-accent" size={20} />
                                <h3 className="text-xl font-serif font-bold text-gradient">Riwayat Transaksi</h3>
                            </div>
                            <span className="text-xs bg-surface-light border border-border px-3 py-1 rounded-full text-text-muted font-bold">
                                {transactions.length} Transaksi Terdeteksi
                            </span>
                        </div>

                        <div className="p-4 sm:p-8 space-y-6 max-h-[800px] overflow-y-auto custom-scrollbar">
                            {loading ? (
                                <div className="flex flex-col items-center py-32 gap-4">
                                    <div className="w-10 h-10 rounded-full border-4 border-t-accent border-transparent animate-spin"></div>
                                    <p className="text-accent font-serif animate-pulse">Mencari data riwayat hari ini...</p>
                                </div>
                            ) : transactions.length === 0 ? (
                                <div className="text-center py-32 flex flex-col items-center gap-6 opacity-30 grayscale saturate-0">
                                    <Coffee size={80} className="text-text-muted" />
                                    <p className="text-lg italic font-serif">Belum ada transaksi hari ini.</p>
                                </div>
                            ) : (
                                <AnimatePresence mode="popLayout">
                                    {transactions.map((trx, idx) => (
                                        <motion.div
                                            key={trx.id}
                                            layout
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: -100 }}
                                            className="group bg-surface-light/30 rounded-3xl p-6 border border-border/50 hover:border-primary/40 transition-all cursor-pointer relative overflow-hidden"
                                        >
                                            {/* Delete Action - Admin Only */}
                                            {session?.user?.role === 'admin' && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteTransaction(trx.id, trx.transaction_code);
                                                    }}
                                                    className="absolute top-6 right-6 p-2 rounded-xl bg-error/10 border border-error/20 text-error/40 hover:text-error hover:bg-error/20 hover:border-error/40 transition-all z-20 group/btn"
                                                    title="Hapus Transaksi"
                                                >
                                                    <Trash2 size={16} className="group-hover/btn:scale-110 transition-transform" />
                                                </button>
                                            )}

                                            <div className="relative z-10">
                                                <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-6 pr-10">
                                                    <div>
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <span className="font-mono font-bold text-accent text-lg">#{trx.transaction_code}</span>
                                                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-accent text-[10px] font-bold uppercase">
                                                                <Clock size={10} /> {formatTime(trx.transaction_date)}
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-wrap gap-4 text-xs text-text-muted">
                                                            <span className="flex items-center gap-1.5">
                                                                <User size={12} className="text-primary" /> {trx.customer_name}
                                                            </span>
                                                            <span className="flex items-center gap-1.5">
                                                                <Activity size={12} className="text-primary" /> Kasir: {trx.kasir_name}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="text-left sm:text-right">
                                                        <p className="text-3xl font-serif font-bold text-accent drop-shadow-sm">
                                                            Rp {Number(trx.total_amount).toLocaleString('id-ID')}
                                                        </p>
                                                        <p className="text-[10px] text-success font-bold uppercase tracking-widest mt-1">Status: Lunas ✅</p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-5 border-t border-border/30">
                                                    {trx.items.map((item, idx) => (
                                                        <div key={idx} className="flex items-center justify-between text-xs bg-background/50 p-3 rounded-2xl border border-border/30 group-hover:border-primary/20 transition-all">
                                                            <span className="text-text/80 font-medium">
                                                                {item.name} <span className="text-accent text-xs font-bold bg-accent/10 px-1.5 py-0.5 rounded ml-1">x{item.quantity}</span>
                                                            </span>
                                                            <span className="text-accent font-bold">
                                                                Rp {(Number(item.price) * item.quantity).toLocaleString('id-ID')}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            {/* Decorative batik-like accent */}
                                            <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-bl-full -z-0 translate-x-12 -translate-y-12 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-700 opacity-50"></div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Leaderboard - Best Selling */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="lg:col-span-1"
                >
                    <div className="glass-card !p-0 overflow-hidden sticky top-32 border border-border/50 shadow-xl">
                        <div className="p-8 border-b border-border/50 flex items-center gap-3">
                            <Award className="text-accent" size={24} />
                            <h3 className="text-xl font-serif font-bold text-gradient">Menu Terlaris</h3>
                        </div>

                        <div className="p-6 space-y-4">
                            {loading ? (
                                <div className="text-center py-20 text-text-muted text-sm italic">Menghitung menu...</div>
                            ) : bestSelling.length === 0 ? (
                                <div className="text-center py-20 text-text-muted text-sm italic opacity-50">Belum ada menu terlaris.</div>
                            ) : (
                                bestSelling.map((item, index) => (
                                    <motion.div
                                        key={item.name}
                                        layout
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.5 + (index * 0.1) }}
                                        className="bg-surface-light/40 rounded-2xl p-4 flex items-center gap-5 border border-border/30 hover:border-accent/40 hover:bg-surface-light group transition-all"
                                    >
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-serif font-bold text-xl shadow-lg relative ${index === 0 ? 'bg-accent text-secondary' :
                                            index === 1 ? 'bg-primary-light text-secondary' :
                                                index === 2 ? 'bg-primary-dark text-white' :
                                                    'bg-surface-light text-text-muted border border-border'
                                            }`}>
                                            {index + 1}
                                            {index < 3 && <ArrowUpRight size={10} className="absolute top-1 right-1 opacity-50" />}
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                            <p className="font-bold text-text group-hover:text-accent transition-colors truncate">{item.name}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className="w-full bg-background h-1.5 rounded-full overflow-hidden border border-border/20">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${(item.count / bestSelling[0].count) * 100}%` }}
                                                        transition={{ duration: 1, delay: 0.8 }}
                                                        className="h-full bg-accent"
                                                    />
                                                </div>
                                                <span className="text-[10px] text-accent font-bold whitespace-nowrap">{item.count} Order</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>

                        {/* Javanese Wisdom Quote */}
                        <div className="mx-6 mb-8 mt-4 p-6 rounded-3xl bg-secondary/80 border border-primary/20 relative overflow-hidden group shadow-2xl">
                            <div className="absolute top-[-20%] left-[-20%] w-32 h-32 bg-primary/20 rounded-full blur-3xl opacity-50 group-hover:scale-150 transition-transform duration-1000"></div>
                            <h4 className="text-[10px] font-bold text-accent mb-3 uppercase tracking-widest relative z-10 flex items-center gap-2">
                                <Activity size={12} /> Wawasan Hari Ini
                            </h4>
                            <p className="text-xs text-text/80 leading-relaxed italic relative z-10 font-serif">
                                &quot;Penjualan ingkang paling sae punika dipundadosaken saking pelayanan ingkang istimewa.&quot;
                            </p>
                            <div className="mt-4 flex justify-end relative z-10">
                                <span className="text-[10px] text-primary font-bold uppercase tracking-tight">Filosofi Kasir — Ben Berkah</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {mounted && createPortal(
                <Notification
                    isOpen={notif.isOpen}
                    onClose={() => setNotif({ ...notif, isOpen: false })}
                    title={notif.title}
                    message={notif.message}
                    type={notif.type}
                    onConfirm={notif.onConfirm}
                />
                , document.body)}
        </div>
    );
}
