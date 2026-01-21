import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { auth } from '@/auth';

export async function GET() {
    const session = await auth();
    if (!session || (session.user?.role !== 'admin' && session.user?.role !== 'kasir')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const [rows] = await pool.query(`
            SELECT m.*, c.name as category_name 
            FROM menu_items m 
            JOIN categories c ON m.category_id = c.id 
            ORDER BY c.name ASC, m.name ASC
        `);
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
        const body = await request.json();
        const {
            category_id, name, description, price, cost_price,
            icon, is_available, is_popular, stock
        } = body;

        if (!category_id || !name || price === undefined) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const [result]: any = await pool.query(
            `INSERT INTO menu_items 
            (category_id, name, description, price, cost_price, icon, is_available, is_popular, stock) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [category_id, name, description || '', price, cost_price || 0, icon || '📦', is_available, is_popular, stock || 0]
        );

        return NextResponse.json({ success: true, id: result.insertId });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
