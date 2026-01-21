import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { auth } from '@/auth';

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session || (session.user?.role !== 'admin' && session.user?.role !== 'kasir')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = await params;
        const { name, description, icon, is_active } = await request.json();

        await pool.query(
            'UPDATE categories SET name = ?, description = ?, icon = ?, is_active = ? WHERE id = ?',
            [name, description, icon, is_active, id]
        );

        return NextResponse.json({ success: true, message: 'Category updated successfully' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session || (session.user?.role !== 'admin' && session.user?.role !== 'kasir')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = await params;
        // Check if there are menu items in this category
        const [items]: any = await pool.query('SELECT id FROM menu_items WHERE category_id = ? LIMIT 1', [id]);
        if (items.length > 0) {
            return NextResponse.json({ error: 'Category cannot be deleted because it contains menu items' }, { status: 400 });
        }

        await pool.query('DELETE FROM categories WHERE id = ?', [id]);
        return NextResponse.json({ success: true, message: 'Category deleted successfully' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
