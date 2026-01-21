import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { auth } from '@/auth';

export async function GET() {
    const session = await auth();
    if (!session || (session.user?.role !== 'admin' && session.user?.role !== 'kasir')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const [rows] = await pool.query('SELECT * FROM categories ORDER BY name ASC');
        return NextResponse.json(rows);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await auth();
    if (!session || (session.user?.role !== 'admin' && session.user?.role !== 'kasir')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { name, description, icon, is_active } = await request.json();

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        const [result]: any = await pool.query(
            'INSERT INTO categories (name, description, icon, is_active) VALUES (?, ?, ?, ?)',
            [name, description || '', icon || '📦', is_active !== undefined ? is_active : true]
        );

        return NextResponse.json({ success: true, id: result.insertId });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
