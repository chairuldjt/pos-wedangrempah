"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
  Coffee,
  Leaf,
  ShieldCheck,
  MapPin,
  Phone,
  Clock,
  Instagram,
  Facebook,
  ChevronRight,
  ArrowRight,
  User,
  LogOut,
  LayoutDashboard,
  Star,
  Award,
  Zap
} from "lucide-react";
import { motion } from "framer-motion";

export default function LandingPage() {
  const { data: session } = useSession();

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: "easeOut" }
  };

  const [storeInfo, setStoreInfo] = useState({
    store_name: "Wedang Rempah Ben Berkah",
    store_address: "Jl. Rempah Sari No. 45, Yogyakarta, Indonesia",
    store_phone: "+62 812 3456 7890",
    store_hours: "Setiap Hari: 16:00 - 23:00 WIB",
    store_website: ""
  });

  useEffect(() => {
    fetch("/api/settings/public")
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          setStoreInfo(prev => ({ ...prev, ...data }));
        }
      })
      .catch(err => console.error("Failed to fetch store info:", err));
  }, []);

  const menuItems = [
    {
      id: 1,
      name: "Wedang Uwuh",
      desc: "Rempah lengkap dari Yogyakarta, menghangatkan badan.",
      price: "15.000",
      image: "/menu/wedang-uwuh.png",
      icon: <Leaf className="w-6 h-6" />,
      tag: "Terlaris"
    },
    {
      id: 2,
      name: "Susu Jahe Rempah",
      desc: "Kombinasi susu murni dan jahe emprit pilihan.",
      price: "12.000",
      image: "/menu/susu-jahe.png",
      icon: <Coffee className="w-6 h-6" />,
      tag: "Favorit"
    },
    {
      id: 3,
      name: "Wedang Secang",
      desc: "Kayu secang murni, menambah stamina dan segar.",
      price: "10.000",
      image: "/menu/wedang-secang.png",
      icon: <Award className="w-6 h-6" />,
      tag: "Klasik"
    }
  ];

  return (
    <div className="min-h-screen bg-mesh bg-pattern">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center border border-primary/30">
              <Coffee className="text-accent w-6 h-6" />
            </div>
            <span className="font-serif text-xl font-bold tracking-tight text-accent">
              {storeInfo.store_name.split(' ').slice(0, 2).join(' ')} <span className="text-text-muted font-sans font-normal text-sm block -mt-1">{storeInfo.store_name.split(' ').slice(2).join(' ')}</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <Link href="#beranda" className="nav-link">Beranda</Link>
            <Link href="#menu" className="nav-link">Menu</Link>
            <Link href="#tentang" className="nav-link">Tentang</Link>
            <Link href="#kontak" className="nav-link">Kontak</Link>
          </div>

          <div className="flex items-center gap-4">
            {session ? (
              <div className="flex items-center gap-3">
                <Link href="/admin" className="btn-primary py-2 px-5 text-sm">
                  <LayoutDashboard size={16} />
                  Dashboard
                </Link>
                <button
                  onClick={() => signOut()}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface-light border border-border text-text-muted hover:text-error hover:border-error/50 transition-all"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <Link href="/login" className="btn-primary py-2 px-6 text-sm">
                <User size={16} />
                Login Staff
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header id="beranda" className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative z-10"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-accent text-sm font-semibold mb-6">
              ✨ Tradisi Warisan Leluhur
            </span>
            <h1 className="text-6xl md:text-7xl font-serif font-extrabold mb-6 leading-tight">
              Tradisi Suci <br />
              <span className="text-gradient">Dari Hati</span>
            </h1>
            <p className="text-xl text-text-muted mb-8 max-w-lg">
              Nikmati kehangatan rempah pilihan asli Nusantara. Diracik khusus dengan resep turun temurun untuk kesehatan dan keberkahan setiap tegukan.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="#menu" className="btn-primary text-lg">
                Lihat Menu <ArrowRight className="ml-2" />
              </Link>
              <Link href="#kontak" className="btn-outline text-lg">
                Mampir Ke Kedai
              </Link>
            </div>

            <div className="mt-12 grid grid-cols-3 gap-8 border-t border-border/50 pt-8">
              <div>
                <div className="text-2xl font-serif font-bold text-accent">100%</div>
                <div className="text-sm text-text-muted">Bahan Alami</div>
              </div>
              <div>
                <div className="text-2xl font-serif font-bold text-accent">30+</div>
                <div className="text-sm text-text-muted">Rempah Pilihan</div>
              </div>
              <div>
                <div className="text-2xl font-serif font-bold text-accent">5.0</div>
                <div className="text-sm text-text-muted">Rating Pelanggan</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="relative"
          >
            <div className="relative aspect-square max-w-md mx-auto">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl glow-pulse" />
              <div className="relative z-10 w-full h-full rounded-full border-2 border-primary/20 p-8">
                <div className="w-full h-full rounded-full bg-surface-light shadow-2xl overflow-hidden flex items-center justify-center p-12">
                  <Coffee size={120} className="text-accent opacity-50 animate-float" />
                </div>
              </div>

              {/* Floating Cards */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-4 -right-4 glass-card p-4 rounded-2xl flex items-center gap-4"
              >
                <div className="w-10 h-10 bg-success/20 rounded-lg flex items-center justify-center">
                  <ShieldCheck className="text-success w-6 h-6" />
                </div>
                <div>
                  <div className="font-bold text-sm">Sehat & Segar</div>
                  <div className="text-xs text-text-muted">Tanpa Pengawet</div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute -bottom-8 -left-8 glass-card p-4 rounded-2xl flex items-center gap-4"
              >
                <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                  <Star className="text-orange-500 w-6 h-6" />
                </div>
                <div>
                  <div className="font-bold text-sm">Rasa Autentik</div>
                  <div className="text-xs text-text-muted">Resep Klasik</div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Menu Section */}
      <section id="menu" className="section-padding relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-primary/5 -skew-y-3 origin-top-left -z-10" />
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-accent font-semibold tracking-wider uppercase text-sm">Menu Unggulan</span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold mt-2">Pilihan Kesehatan <span className="text-gradient">Untuk Anda</span></h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {menuItems.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="glass-card group hover:translate-y-[-8px] transition-all duration-300"
              >
                <div className="relative mb-6 h-64 rounded-xl bg-surface-light flex items-center justify-center overflow-hidden border border-border/50">
                  <div className="absolute top-4 right-4 z-20 bg-accent text-background text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider shadow-lg">
                    {item.tag}
                  </div>
                  {(item as any).image ? (
                    <>
                      <img
                        src={(item as any).image}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                    </>
                  ) : (
                    <div className="text-accent group-hover:scale-110 transition-transform duration-500">
                      {React.cloneElement(item.icon as React.ReactElement<any>, { size: 64 })}
                    </div>
                  )}
                </div>
                <h3 className="text-2xl font-serif font-bold mb-2">{item.name}</h3>
                <p className="text-sm text-text-muted mb-6">{item.desc}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-accent">Rp {item.price}</span>
                  <button className="w-10 h-10 rounded-full border border-primary/30 flex items-center justify-center text-accent hover:bg-primary hover:text-white transition-all">
                    <ChevronRight size={20} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <p className="text-text-muted mb-6">Menu lainnya dapat dilihat langsung melalui kasir atau di kedai.</p>
            <div className="p-8 border border-dashed border-primary/30 rounded-2xl bg-surface/30 max-w-3xl mx-auto flex items-center gap-6">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex-shrink-0 flex items-center justify-center">
                <Info size={32} className="text-accent" />
              </div>
              <div className="text-left">
                <h4 className="text-xl font-bold text-accent mb-1">Menerima Pesanan Partai Besar</h4>
                <p className="text-sm">Untuk acara hajatan, pertemuan, atau acara kantor. Hubungi admin untuk negosiasi harga.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="tentang" className="section-padding bg-surface/30">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <div className="aspect-[4/5] rounded-3xl overflow-hidden glass-card p-2 border-2 border-primary/10">
              <div className="w-full h-full rounded-2xl bg-surface-light bg-[url('/spices-bg.jpg')] bg-cover bg-center flex items-center justify-center">
                <div className="text-center p-8 bg-background/60 backdrop-blur-md rounded-2xl mx-6">
                  <p className="italic text-accent mb-4 font-serif text-lg leading-relaxed">
                    &quot;Kesehatan adalah kekayaan yang paling utama. Maka dari itu, jagalah kesehatan dengan rempah alami.&quot;
                  </p>
                  <div className="h-px w-12 bg-accent mx-auto mb-4" />
                  <span className="text-sm font-bold uppercase tracking-widest">- Tradisi Nusantara -</span>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-accent/10 rounded-full blur-3xl -z-10" />
            <div className="absolute -top-10 -left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10" />
          </div>

          <div>
            <span className="text-accent font-semibold tracking-wider uppercase text-sm">Filosofi Kami</span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold mt-2 mb-6">Membangun Tradisi <br /> <span className="text-gradient">Dari Warisan Luhur</span></h2>
            <div className="space-y-6">
              <p className="text-lg">
                Wedang Rempah Ben Berkah tidak hanya menjual minuman, tetapi juga melestarikan budaya rempah asli Nusantara. Kami percaya bahwa alam telah menyediakan segala sesuatu untuk kesehatan kita.
              </p>

              <div className="grid sm:grid-cols-2 gap-6 pt-4">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex-shrink-0 flex items-center justify-center text-accent font-bold text-xl">
                    1
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Kualitas Bersih</h4>
                    <p className="text-sm text-text-muted">Proses olah rempah dengan teliti dan bersih.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex-shrink-0 flex items-center justify-center text-accent font-bold text-xl">
                    2
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Rempah Murni</h4>
                    <p className="text-sm text-text-muted">Tidak menggunakan pengawet atau pewarna buatan.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex-shrink-0 flex items-center justify-center text-accent font-bold text-xl">
                    3
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Harga Saudara</h4>
                    <p className="text-sm text-text-muted">Harga yang terjangkau untuk semua kalangan.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex-shrink-0 flex items-center justify-center text-accent font-bold text-xl">
                    4
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Pelayanan Ramah</h4>
                    <p className="text-sm text-text-muted">Mengutamakan kesantunan dan kekeluargaan.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="kontak" className="section-padding relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="glass-card overflow-hidden !p-0">
            <div className="grid lg:grid-cols-2">
              <div className="p-8 md:p-12 lg:p-16 bg-surface-light">
                <h2 className="text-4xl font-serif font-bold mb-8">Mari Mampir Ke <span className="text-gradient">Kedai Kami</span></h2>

                <div className="space-y-8">
                  <div className="flex gap-6">
                    <div className="w-12 h-12 rounded-2xl bg-primary/20 flex-shrink-0 flex items-center justify-center text-accent">
                      <MapPin size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-1 text-accent">Alamat Kedai</h4>
                      <p className="text-text-muted">{storeInfo.store_address}</p>
                    </div>
                  </div>

                  <div className="flex gap-6">
                    <div className="w-12 h-12 rounded-2xl bg-primary/20 flex-shrink-0 flex items-center justify-center text-accent">
                      <Phone size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-1 text-accent">Hubungi Kami</h4>
                      <p className="text-text-muted">{storeInfo.store_phone}</p>
                    </div>
                  </div>

                  <div className="flex gap-6">
                    <div className="w-12 h-12 rounded-2xl bg-primary/20 flex-shrink-0 flex items-center justify-center text-accent">
                      <Clock size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-1 text-accent">Jam Operasional</h4>
                      <p className="text-text-muted">{storeInfo.store_hours}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-12 flex gap-4">
                  <a href="#" className="w-12 h-12 rounded-xl bg-surface border border-border flex items-center justify-center text-text-muted hover:text-accent hover:border-accent/50 transition-all">
                    <Instagram size={20} />
                  </a>
                  <a href="#" className="w-12 h-12 rounded-xl bg-surface border border-border flex items-center justify-center text-text-muted hover:text-accent hover:border-accent/50 transition-all">
                    <Facebook size={20} />
                  </a>
                  <a href="#" className="w-12 h-12 rounded-xl bg-surface border border-border flex items-center justify-center text-text-muted hover:text-accent hover:border-accent/50 transition-all">
                    <TikTok size={20} />
                  </a>
                </div>
              </div>

              <div className="p-8 md:p-12 lg:p-16 border-t lg:border-t-0 lg:border-l border-border bg-surface/50 backdrop-blur-md relative">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <Zap size={200} className="text-accent" />
                </div>
                <h3 className="text-2xl font-serif font-bold mb-6">Kirim Pesan Untuk Kami</h3>
                <form className="space-y-4 relative z-10">
                  <div className="grid md:grid-cols-2 gap-4">
                    <input type="text" placeholder="Nama Anda" className="input" />
                    <input type="email" placeholder="Email (Opsional)" className="input" />
                  </div>
                  <input type="text" placeholder="Subjek Pesan" className="input" />
                  <textarea placeholder="Pesan Anda..." rows={5} className="input"></textarea>
                  <button type="submit" className="btn-primary w-full mt-4">Kirim Terima Kasih</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border bg-background">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <Coffee className="text-accent w-6 h-6" />
            <span className="font-serif text-lg font-bold text-accent">{storeInfo.store_name}</span>
          </div>

          <div className="text-sm text-text-muted">
            &copy; {new Date().getFullYear()} {storeInfo.store_name}. Semua Hak Dilindungi.
          </div>

          <div className="flex gap-8 text-sm font-medium">
            <Link href="#" className="hover:text-accent transition-colors">Syarat & Ketentuan</Link>
            <Link href="#" className="hover:text-accent transition-colors">Privasi</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Info(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
}

function TikTok(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
  );
}
