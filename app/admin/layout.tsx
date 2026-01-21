'use client';

import { useSession, signOut } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
    LayoutDashboard,
    ShoppingCart,
    ClipboardList,
    Utensils,
    Users,
    Settings,
    LogOut,
    Menu as MenuIcon,
    ChevronLeft,
    ChevronRight,
    Globe,
    Bell,
    Coffee
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const pathname = usePathname();
    const router = useRouter();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 1024;
            setIsMobile(mobile);
            if (mobile) setIsSidebarOpen(false);
            else setIsSidebarOpen(true);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    // Auto close sidebar on mobile when navigating
    useEffect(() => {
        if (isMobile) {
            setIsSidebarOpen(false);
        }
    }, [pathname, isMobile]);

    if (status === "loading" || status === "unauthenticated") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full border-4 border-t-accent border-r-transparent border-b-primary border-l-transparent animate-spin"></div>
                    <p className="text-accent font-medium animate-pulse font-serif">
                        {status === "unauthenticated" ? "Mengalihkan..." : "Menunggu sebentar..."}
                    </p>
                </div>
            </div>
        );
    }

    const menuItems = [
        { name: 'Ringkasan', path: '/admin', icon: <LayoutDashboard size={20} /> },
        { name: 'Kasir (POS)', path: '/admin/pos', icon: <ShoppingCart size={20} /> },
        { name: 'Laporan', path: '/admin/laporan', icon: <ClipboardList size={20} /> },
        { name: 'Manajemen Menu', path: '/admin/menu', icon: <Utensils size={20} /> },
        { name: 'Manajemen User', path: '/admin/users', icon: <Users size={20} />, role: 'admin' },
        { name: 'Setelan', path: '/admin/settings', icon: <Settings size={20} />, role: 'admin' },
    ].filter(item => !item.role || session?.user?.role === item.role);

    return (
        <div className="min-h-screen bg-background text-text bg-mesh overflow-x-hidden">
            {/* Sidebar Overlay (Mobile only) */}
            <AnimatePresence>
                {isMobile && isSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsSidebarOpen(false)}
                        className="fixed inset-0 bg-background/60 backdrop-blur-sm z-[45] lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{
                    width: isSidebarOpen ? 280 : (isMobile ? 0 : 80),
                    x: isMobile && !isSidebarOpen ? -280 : 0
                }}
                transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 30,
                    mass: 0.8
                }}
                className={`fixed left-0 top-0 h-screen bg-surface border-r border-border z-50 flex flex-col shadow-2xl ${isMobile && !isSidebarOpen ? 'pointer-events-none overflow-hidden' : ''}`}
            >
                {/* Logo Section */}
                <div className="p-6 flex items-center gap-4 border-b border-border/50">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0 border border-primary/30">
                        <Coffee className="text-accent" size={24} />
                    </div>
                    {isSidebarOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="overflow-hidden whitespace-nowrap"
                        >
                            <h1 className="text-lg font-bold font-serif text-accent leading-none">Ben Berkah</h1>
                            <p className="text-[10px] text-text-muted mt-1 uppercase tracking-widest font-semibold">Admin Panel</p>
                        </motion.div>
                    )}
                </div>

                {/* Navigation */}
                <nav className="mt-6 flex-1 px-4 space-y-2">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                href={item.path}
                                className={`
                                    flex items-center gap-4 p-4 rounded-xl transition-all duration-300 group
                                    ${isActive
                                        ? 'bg-primary/10 text-accent border border-primary/20 shadow-lg'
                                        : 'text-text-muted hover:text-accent hover:bg-surface-light hover:translate-x-1'
                                    }
                                    ${!isSidebarOpen ? 'justify-center p-4' : ''}
                                `}
                                title={!isSidebarOpen ? item.name : ''}
                            >
                                <span className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                                    {item.icon}
                                </span>
                                {isSidebarOpen && (
                                    <motion.span
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="font-medium whitespace-nowrap"
                                    >
                                        {item.name}
                                    </motion.span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer / User Profile */}
                <div className="p-4 border-t border-border/50 bg-surface-light/30">
                    <div className={`p-2 flex items-center gap-3 rounded-2xl ${isSidebarOpen ? 'bg-surface/50 border border-border/30' : 'justify-center'}`}>
                        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0 text-accent font-bold border border-primary/20 shadow-inner">
                            {session?.user?.name?.[0] || 'U'}
                        </div>
                        {isSidebarOpen && (
                            <div className="flex-1 overflow-hidden">
                                <p className="text-sm font-bold text-accent truncate">{session?.user?.name}</p>
                                <p className="text-[10px] text-text-muted truncate uppercase tracking-tighter">{session?.user?.role || 'Staff'}</p>
                            </div>
                        )}
                        {isSidebarOpen && (
                            <button
                                onClick={() => signOut()}
                                className="p-2 text-text-muted hover:text-error transition-colors rounded-lg hover:bg-error/10"
                                title="Keluar (Logout)"
                            >
                                <LogOut size={18} />
                            </button>
                        )}
                    </div>
                    {!isSidebarOpen && (
                        <button
                            onClick={() => signOut()}
                            className="mt-4 w-10 h-10 flex items-center justify-center text-text-muted hover:text-error transition-colors rounded-xl hover:bg-error/10 mx-auto"
                            title="Keluar (Logout)"
                        >
                            <LogOut size={20} />
                        </button>
                    )}
                </div>
            </motion.aside>

            {/* Main Content Area */}
            <motion.main
                initial={false}
                animate={{
                    marginLeft: isMobile ? 0 : (isSidebarOpen ? 280 : 80)
                }}
                transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 30,
                    mass: 0.8
                }}
                className="min-h-screen"
            >
                {/* Header Navigation */}
                <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 h-20 px-8 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="w-10 h-10 rounded-xl border border-border flex items-center justify-center hover:border-primary/50 hover:bg-surface-light transition-all text-text-muted"
                        >
                            {isSidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                        </button>
                        <div>
                            <h2 className="text-2xl font-serif font-bold text-accent hidden md:block">
                                {menuItems.find(m => m.path === pathname)?.name || 'Dashboard'}
                            </h2>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="hidden lg:flex flex-col text-right">
                            <span className="text-[10px] uppercase tracking-widest text-text-muted font-bold">Waktu Sekarang</span>
                            <span className="text-sm font-medium text-accent">
                                {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </span>
                        </div>

                        <div className="flex items-center gap-3">
                            <button className="w-10 h-10 rounded-xl border border-border flex items-center justify-center text-text-muted hover:text-accent hover:border-accent/30 transition-all relative">
                                <Bell size={18} />
                                <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-background"></span>
                            </button>
                            <Link href="/" className="btn-outline !py-2 !px-4 text-xs !rounded-lg flex items-center gap-2">
                                <Globe size={14} />
                                <span className="hidden sm:inline">Lihat Web</span>
                            </Link>
                        </div>
                    </div>
                </header>

                <div className="p-8 animate-up">
                    {children}
                </div>
            </motion.main>
        </div>
    );
}
