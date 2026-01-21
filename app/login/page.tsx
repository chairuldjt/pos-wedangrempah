"use client";

import React, { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Coffee, User, Lock, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res: any = await signIn("credentials", {
                username,
                password,
                redirect: false,
            });

            if (res.error) {
                setError("Asma utawi Sandi Kirang Trep");
            } else {
                router.push("/admin");
            }
        } catch (err) {
            setError("Wonten gangguan, cobi malih");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-mesh bg-pattern relative overflow-hidden">
            {/* Decorative Ornaments */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="text-center mb-10">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", damping: 12, delay: 0.2 }}
                        className="w-20 h-20 bg-surface-light border border-primary/30 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl relative"
                    >
                        <div className="absolute inset-0 bg-accent/20 blur-xl rounded-full" />
                        <Coffee className="text-accent w-10 h-10 relative z-10" />
                    </motion.div>
                    <h1 className="text-4xl font-serif font-bold mb-2">Selamat Datang</h1>
                    <p className="text-text-muted">Akses Dashboard Staff & Kasir</p>
                </div>

                <div className="glass-card shadow-2xl !p-8 md:!p-10">
                    {error && (
                        <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-xl flex items-center gap-3 text-error text-sm animate-shake">
                            <AlertCircle size={18} />
                            {error === 'CredentialsSignin' ? 'Nama atau Kata Sandi Salah' : 'Terjadi gangguan sistem'}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-accent uppercase tracking-widest ml-1">Nama Pengguna</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent transition-colors" size={18} />
                                <input
                                    type="text"
                                    className="input pl-12 bg-surface/50 border-border group-focus-within:border-accent"
                                    placeholder="Masukkan nama pengguna..."
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-accent uppercase tracking-widest ml-1">Kata Sandi</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent transition-colors" size={18} />
                                <input
                                    type="password"
                                    className="input pl-12 bg-surface/50 border-border group-focus-within:border-accent"
                                    placeholder="Masukkan kata sandi..."
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full py-4 text-base font-bold shadow-2xl group"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <>
                                    Masuk Sekarang
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Javanese Wisdom / Quote */}
                    <div className="mt-10 pt-8 border-t border-border/50 text-center">
                        <p className="text-xs italic text-text-muted leading-relaxed">
                            &quot;Niat yang tulus di awal hari akan membukakan pintu rezeki dan keberkahan.&quot;
                        </p>
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-8 text-center"
                >
                    <Link href="/" className="text-sm text-text-muted hover:text-accent transition-all inline-flex items-center gap-2">
                        Kembali ke Beranda
                    </Link>
                </motion.div>
            </motion.div>
        </div>
    );
}
