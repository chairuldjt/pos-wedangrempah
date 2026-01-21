import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
    try {
        const publicKeys = ['store_name', 'store_address', 'store_phone', 'store_hours', 'store_website'];
        const [rows]: any = await pool.query(
            'SELECT setting_key, setting_value FROM settings WHERE setting_key IN (?)',
            [publicKeys]
        );

        const settings = rows.reduce((acc: any, row: any) => {
            acc[row.setting_key] = row.setting_value;
            return acc;
        }, {});

        return NextResponse.json(settings);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
