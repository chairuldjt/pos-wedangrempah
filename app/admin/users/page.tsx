'use client';

import { useState, useEffect } from 'react';
import {
    Users,
    UserPlus,
    Edit2,
    Trash2,
    Shield,
    User,
    Search,
    X,
    Check,
    AlertCircle,
    Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import Notification from '../components/Notification';

interface UserData {
    id: number;
    username: string;
    email: string;
    full_name: string;
    role: 'admin' | 'kasir';
    is_active: boolean;
    created_at: string;
}

export default function UserManagement() {
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserData | null>(null);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        full_name: '',
        role: 'kasir' as 'admin' | 'kasir',
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
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/users');
            const data = await res.json();
            if (Array.isArray(data)) {
                setUsers(data);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            showNotif('Error', 'Gagal memuat daftar user', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (user: UserData | null = null) => {
        if (user) {
            setEditingUser(user);
            setFormData({
                username: user.username,
                email: user.email,
                password: '',
                full_name: user.full_name,
                role: user.role,
                is_active: user.is_active
            });
        } else {
            setEditingUser(null);
            setFormData({
                username: '',
                email: '',
                password: '',
                full_name: '',
                role: 'kasir',
                is_active: true
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const url = editingUser ? `/api/users/${editingUser.id}` : '/api/users';
            const method = editingUser ? 'PATCH' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const result = await res.json();
            if (result.success) {
                setIsModalOpen(false);
                fetchUsers();
                showNotif('Berhasil', editingUser ? 'Data user diperbarui' : 'User baru telah terdaftar', 'success');
            } else {
                showNotif('Gagal', result.error || 'Terjadi kesalahan sistem', 'error');
            }
        } catch (error) {
            console.error('Error saving user:', error);
            showNotif('Error', 'Gagal memproses data user', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        showNotif(
            'Konfirmasi Hapus',
            'Apakah Anda yakin ingin menghapus user ini secara permanen?',
            'confirm',
            async () => {
                try {
                    const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
                    const result = await res.json();
                    if (result.success) {
                        fetchUsers();
                        showNotif('Terhapus', 'User telah dihapus dari sistem', 'success');
                    } else {
                        showNotif('Gagal', result.error, 'error');
                    }
                } catch (error) {
                    console.error('Error deleting user:', error);
                    showNotif('Error', 'Gagal menghapus user', 'error');
                }
            }
        );
    };

    const filteredUsers = users.filter(u =>
        u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-accent border border-primary/30">
                        <Users size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-serif font-bold text-gradient">Manajemen User</h2>
                        <p className="text-text-muted text-sm capitalize">Atur hak akses dan kelola tim kasir Anda</p>
                    </div>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="btn-primary !py-2.5 !px-6 flex items-center gap-2 group"
                >
                    <UserPlus size={18} className="group-hover:scale-110 transition-transform" />
                    <span>Tambah User</span>
                </button>
            </div>

            <div className="glass-card shadow-lg border border-border/50">
                <div className="p-6 border-b border-border/50 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-light/30">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                        <input
                            type="text"
                            placeholder="Cari user (nama, username, email)..."
                            className="input pl-12 !py-2.5"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-text-muted">
                        <span className="flex items-center gap-1.5"><Shield size={14} className="text-accent" /> Admin</span>
                        <span className="w-1 h-1 rounded-full bg-border" />
                        <span className="flex items-center gap-1.5"><User size={14} className="text-primary" /> Kasir</span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="modern-table">
                        <thead>
                            <tr>
                                <th className="!bg-transparent text-[10px] uppercase tracking-widest font-black">Identitas</th>
                                <th className="!bg-transparent text-[10px] uppercase tracking-widest font-black">Username / Email</th>
                                <th className="!bg-transparent text-[10px] uppercase tracking-widest font-black">Role</th>
                                <th className="!bg-transparent text-[10px] uppercase tracking-widest font-black">Status</th>
                                <th className="!bg-transparent text-[10px] uppercase tracking-widest font-black text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <Loader2 className="animate-spin text-accent" size={32} />
                                            <p className="text-text-muted font-serif italic">Mengambil data user...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-20 text-center text-text-muted italic">
                                        Tidak ada user yang ditemukan.
                                    </td>
                                </tr>
                            ) : filteredUsers.map(user => (
                                <tr key={user.id} className="group hover:bg-surface-light/10 transition-colors">
                                    <td className="py-5">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg border ${user.role === 'admin'
                                                ? 'bg-accent/10 border-accent/30 text-accent'
                                                : 'bg-primary/10 border-primary/30 text-primary'
                                                }`}>
                                                {user.full_name[0]}
                                            </div>
                                            <div>
                                                <p className="font-bold text-white group-hover:text-accent transition-colors">{user.full_name}</p>
                                                <p className="text-[10px] text-text-muted uppercase tracking-widest mt-0.5">ID: {user.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <p className="font-mono text-sm text-accent/80">{user.username}</p>
                                        <p className="text-xs text-text-muted">{user.email}</p>
                                    </td>
                                    <td>
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${user.role === 'admin'
                                            ? 'bg-accent/20 text-accent border border-accent/20'
                                            : 'bg-primary/20 text-primary border border-primary/20'
                                            }`}>
                                            {user.role === 'admin' ? <Shield size={10} /> : <User size={10} />}
                                            {user.role}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${user.is_active ? 'bg-success animate-pulse' : 'bg-error'}`} />
                                            <span className={`text-[10px] font-bold uppercase tracking-widest ${user.is_active ? 'text-success' : 'text-error'}`}>
                                                {user.is_active ? 'Aktif' : 'Nonaktif'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="text-right">
                                        <div className="flex items-center justify-end gap-2 pr-4">
                                            <button
                                                onClick={() => handleOpenModal(user)}
                                                className="w-9 h-9 rounded-xl flex items-center justify-center bg-surface-light/50 border border-border/50 text-text-muted hover:text-accent hover:border-accent/40 transition-all hover:scale-110 shadow-sm"
                                                title="Edit User"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user.id)}
                                                className="w-9 h-9 rounded-xl flex items-center justify-center bg-error/10 border border-error/20 text-error/60 hover:text-error hover:border-error/40 transition-all hover:scale-110 shadow-sm"
                                                title="Hapus User"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Notification Modal */}
            <Notification
                isOpen={notif.isOpen}
                onClose={() => setNotif({ ...notif, isOpen: false })}
                title={notif.title}
                message={notif.message}
                type={notif.type}
                onConfirm={notif.onConfirm}
            />

            {mounted && createPortal(
                <AnimatePresence>
                    {isModalOpen && (
                        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6 bg-background/80 backdrop-blur-md">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="glass-card w-full max-w-xl !p-0 overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.5)] border-[#d4af37]/30 flex flex-col max-h-[90vh]"
                            >
                                <div className="p-6 sm:p-8 border-b border-border/50 flex items-center justify-between bg-surface-light/30 flex-shrink-0">
                                    <div>
                                        <h3 className="text-xl sm:text-2xl font-serif font-bold text-accent">{editingUser ? 'Edit Detail User' : 'Tambah User Anyar'}</h3>
                                        <p className="text-text-muted text-[9px] sm:text-xs uppercase tracking-[0.2em] font-bold mt-1">Lengkapi informasi di bawah ini</p>
                                    </div>
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="w-10 h-10 rounded-full hover:bg-surface-light flex items-center justify-center text-text-muted transition-colors"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 overflow-y-auto custom-scrollbar">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-accent uppercase tracking-widest flex items-center gap-2">
                                                <User size={14} /> Nama Lengkap
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                className="input !py-3 !text-sm"
                                                value={formData.full_name}
                                                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                                placeholder="E.g. Bagus Rahadi"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-accent uppercase tracking-widest flex items-center gap-2">
                                                <Shield size={14} /> Role
                                            </label>
                                            <select
                                                className="input !py-3 !text-sm appearance-none bg-surface-light"
                                                value={formData.role}
                                                onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                                            >
                                                <option value="kasir">Kasir (Staff Operasional)</option>
                                                <option value="admin">Administrator (Full Akses)</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-accent uppercase tracking-widest flex items-center gap-2">
                                                <AlertCircle size={14} /> Username
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                className="input !py-3 !text-sm"
                                                value={formData.username}
                                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                                placeholder="username123"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-accent uppercase tracking-widest flex items-center gap-2">
                                                <X size={14} className="rotate-45" /> Email
                                            </label>
                                            <input
                                                type="email"
                                                required
                                                className="input !py-3 !text-sm"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                placeholder="email@example.com"
                                            />
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-[10px] font-black text-accent uppercase tracking-widest flex items-center gap-2">
                                                <Shield size={14} /> Kata Sandi {editingUser && '(Kosongkan jika tidak diganti)'}
                                            </label>
                                            <input
                                                type="password"
                                                required={!editingUser}
                                                className="input !py-3 !text-sm"
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 p-4 bg-surface-light border border-border/50 rounded-2xl">
                                        <input
                                            type="checkbox"
                                            id="is_active"
                                            className="w-5 h-5 accent-accent"
                                            checked={formData.is_active}
                                            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                        />
                                        <label htmlFor="is_active" className="text-sm font-medium text-text select-none text-text-muted">Tandai sebagai user aktif</label>
                                    </div>

                                    <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-4 border-t border-border/50 flex-shrink-0">
                                        <button
                                            type="button"
                                            onClick={() => setIsModalOpen(false)}
                                            className="btn-outline !py-3 !px-8 text-xs uppercase tracking-widest font-black order-2 sm:order-1"
                                        >
                                            Batal
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="btn-primary !py-3 !px-10 text-xs uppercase tracking-widest font-black flex items-center justify-center gap-2 order-1 sm:order-2"
                                        >
                                            {submitting ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
                                            {editingUser ? 'Simpan Perubahan' : 'Daftarkan User'}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
                , document.body)}
        </div>
    );
}
