'use client';

import { Settings } from 'lucide-react'; // Assuming Settings icon is from lucide-react

export default function PlaceholderPage({ title = "Halaman Menika Saweg Dipun-damel" }) {
    return (
        <div className="glass-card !bg-surface-light border border-primary/20 p-12 text-center">
            <Settings className="w-16 h-16 text-accent mx-auto mb-6 animate-spin-slow" />
            <h2 className="text-3xl font-serif font-bold mb-4 text-gradient">Fitur Dalam Pengembangan</h2>
            <p className="text-text-muted max-w-md mx-auto">
                Mohon maaf, fitur ini masih dalam tahap pengembangan untuk memberikan pengalaman terbaik bagi Anda.
            </p>
        </div>
    );
}
