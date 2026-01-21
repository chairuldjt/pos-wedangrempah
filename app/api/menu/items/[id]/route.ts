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
        const body = await request.json();
        const {
            category_id, name, description, price, cost_price,
            icon, is_available, is_popular, stock
        } = body;

        await pool.query(
            `UPDATE menu_items SET 
                category_id = ?, name = ?, description = ?, price = ?, cost_price = ?, 
                icon = ?, is_available = ?, is_popular = ?, stock = ? 
            WHERE id = ?`,
            [category_id, name, description, price, cost_price, icon, is_available, is_popular, stock, id]
        );

        return NextResponse.json({ success: true, message: 'Menu item updated successfully' });
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
        // Check if there are transactions for this item
        const [trans]: any = await pool.query('SELECT id FROM transaction_items WHERE menu_item_id = ? LIMIT 1', [id]);
        if (trans.length > 0) {
            // Deciding to soft delete or prevent deletion
            // For now, let's just make it unavailable instead of hard delete to preserve history
            await pool.query('UPDATE menu_items SET is_available = false WHERE id = ?', [id]);
            return NextResponse.json({ success: true, message: 'Item made unavailable due to existing transactions' });
        }

        await pool.query('DELETE FROM menu_items WHERE id = ?', [id]);
        return NextResponse.json({ success: true, message: 'Menu item deleted successfully' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
