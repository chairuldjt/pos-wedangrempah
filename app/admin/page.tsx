'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
    TrendingUp,
    Users,
    Package,
    DollarSign,
    ArrowRight,
    Plus,
    FileText,
    Clock,
    ChevronRight,
    TrendingDown,
    Activity
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
    const { data: session } = useSession();
    const [stats, setStats] = useState({
        total_revenue: 0,
        total_count: 0,
        avg_transaction: 0,
        total_items: 0
    });
    const [recentTransactions, setRecentTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const today = new Date().toISOString().split('T')[0];
            const res = await fetch(`/api/transactions?date=${today}`);
            const data = await res.json();
            if (data) {
                setStats(data.stats);
                setRecentTransactions(data.transactions.slice(0, 5));
            }
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setLoading(false);
        }
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

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="space-y-8 pb-12">
            {/* Welcome Banner */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card relative overflow-hidden group"
            >
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4 text-accent">
                        <Activity size={20} className="animate-pulse" />
                        <span className="text-[10px] uppercase tracking-widest font-bold">Status Sistem: Normal</span>
                    </div>
                    <h2 className="text-3xl font-serif font-bold animate-slide-right">
                        Selamat Datang, <span className="text-gradient">{session?.user?.name}</span>!
                    </h2>
                    <p className="text-text-muted mt-2 font-medium animate-slide-right delay-100 flex items-center gap-2">
                        Semoga hari ini penuh berkah. Berikut ringkasan penjualan hari ini:
                    </p>
                </div>

                {/* Decorative background element */}
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                    <TrendingUp size={240} className="text-accent" />
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
                    {
                        label: 'Pendapatan Hari Ini',
                        value: `Rp ${Number(stats.total_revenue || 0).toLocaleString('id-ID')}`,
                        icon: <DollarSign size={24} />,
                        trend: '+12%',
                        color: 'primary'
                    },
                    {
                        label: 'Total Transaksi',
                        value: stats.total_count || 0,
                        icon: <TrendingUp size={24} />,
                        trend: '+5%',
                        color: 'accent'
                    },
                    {
                        label: 'Rata-rata Belanja',
                        value: `Rp ${Math.round(stats.avg_transaction || 0).toLocaleString('id-ID')}`,
                        icon: <Activity size={24} />,
                        trend: '-2%',
                        color: 'primary'
                    },
                    {
                        label: 'Item Terjual',
                        value: stats.total_items || 0,
                        icon: <Package size={24} />,
                        trend: '+18%',
                        color: 'accent'
                    }
                ].map((stat, idx) => (
                    <motion.div
                        key={idx}
                        variants={item}
                        className="glass-card !p-6 flex flex-col justify-between hover:translate-y-[-4px] transition-all duration-300"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-12 h-12 rounded-xl bg-${stat.color}/10 border border-${stat.color}/20 flex items-center justify-center text-${stat.color}`}>
                                {stat.icon}
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full ${stat.trend.startsWith('+') ? 'bg-success/10 text-success' : 'bg-error/10 text-error'} font-bold`}>
                                {stat.trend}
                            </span>
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-widest text-text-muted font-bold mb-1">{stat.label}</p>
                            <p className="text-2xl font-serif font-bold text-accent">{stat.value}</p>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Transactions Table */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="lg:col-span-2"
                >
                    <div className="glass-card !p-0 overflow-hidden border border-border/50">
                        <div className="p-4 md:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/50 bg-surface-light/30">
                            <div className="flex items-center gap-3">
                                <Clock className="text-accent" size={20} />
                                <h3 className="text-xl font-serif font-bold">Transaksi Terakhir</h3>
                            </div>
                            <button className="text-xs md:text-sm font-bold text-accent hover:underline flex items-center gap-2 transition-all group">
                                Lihat Semua Transaksi <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="modern-table min-w-[600px] md:min-w-full">
                                <thead>
                                    <tr>
                                        <th className="font-sans text-[10px] uppercase tracking-widest font-bold">Kode</th>
                                        <th className="font-sans text-[10px] uppercase tracking-widest font-bold">Pelanggan</th>
                                        <th className="font-sans text-[10px] uppercase tracking-widest font-bold hidden sm:table-cell">Kasir</th>
                                        <th className="font-sans text-[10px] uppercase tracking-widest font-bold">Total</th>
                                        <th className="font-sans text-[10px] uppercase tracking-widest font-bold">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentTransactions.length > 0 ? recentTransactions.map((trx: any) => (
                                        <tr key={trx.id} className="group">
                                            <td className="font-mono text-xs md:text-sm text-accent group-hover:text-primary transition-colors">#{trx.transaction_code}</td>
                                            <td className="font-medium text-sm">
                                                <div className="flex flex-col">
                                                    <span>{trx.customer_name}</span>
                                                    <span className="text-[10px] text-text-muted sm:hidden mt-1">{trx.kasir_name}</span>
                                                </div>
                                            </td>
                                            <td className="text-text-muted text-sm hidden sm:table-cell">{trx.kasir_name}</td>
                                            <td className="font-bold text-sm">Rp {Number(trx.total_amount).toLocaleString('id-ID')}</td>
                                            <td>
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-success/20 text-success border border-success/30">
                                                    LUNAS
                                                </span>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={5} className="text-center py-20 text-text-muted italic">
                                                Belum ada transaksi hari ini.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </motion.div>

                {/* Quick Actions & Tips */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-8"
                >
                    {/* Action Cards */}
                    <div className="glass-card shadow-lg hover:shadow-primary/5 transition-all">
                        <h3 className="text-lg font-serif font-bold mb-6 text-accent flex items-center gap-2">
                            Aksi Cepat <span className="text-sm font-sans animate-bounce">⚡</span>
                        </h3>
                        <div className="space-y-4">
                            <Link href="/admin/menu" className="block">
                                <button className="btn-primary w-full !justify-start !px-6 group overflow-hidden relative">
                                    <motion.div className="flex items-center gap-3 z-10">
                                        <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
                                        <span>Menu Baru</span>
                                    </motion.div>
                                    <div className="absolute inset-0 bg-white/5 -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                                </button>
                            </Link>
                            <Link href="/admin/laporan" className="block">
                                <button className="btn-outline w-full !justify-start !px-6 group overflow-hidden relative">
                                    <div className="flex items-center gap-3 z-10">
                                        <FileText size={18} />
                                        <span>Laporan Hari Ini</span>
                                    </div>
                                    <div className="absolute inset-0 bg-primary/5 -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                                </button>
                            </Link>
                        </div>
                    </div>

                    {/* Javanese Wisdom Card */}
                    <div className="glass-card bg-primary/5 relative overflow-hidden group border-l-4 border-accent">
                        <h3 className="text-lg font-serif font-bold mb-4 flex items-center gap-2">
                            Tips Admin 💡
                        </h3>
                        <div className="relative z-10">
                            <p className="text-sm italic leading-relaxed text-text/90">
                                &quot;Aja dadi wong sing rumangsa bisa, nanging dadi wong sing bisa rumangsa.&quot;
                            </p>
                            <div className="flex items-center justify-between mt-6">
                                <p className="text-[10px] uppercase tracking-widest font-black text-accent/80">- Filosofi Jawa</p>
                                <TrendingUp size={24} className="text-accent/30" />
                            </div>
                        </div>

                        {/* Background Decoration */}
                        <div className="absolute -bottom-6 -right-6 p-4 opacity-[0.03] group-hover:scale-125 group-hover:rotate-12 transition-all duration-1000">
                            <TrendingUp size={150} />
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
