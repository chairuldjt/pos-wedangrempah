import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { auth } from '@/auth';

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session || session.user?.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const connection = await pool.getConnection();
    try {
        const { id } = await params;

        await connection.beginTransaction();

        // 1. Get items to return stock
        const [items]: any = await connection.query(
            'SELECT menu_item_id, quantity FROM transaction_items WHERE transaction_id = ?',
            [id]
        );

        // 2. Return stock to menu_items
        for (const item of items) {
            await connection.query(
                'UPDATE menu_items SET stock = stock + ? WHERE id = ?',
                [item.quantity, item.menu_item_id]
            );
        }

        // 3. Delete transaction items (cascade should ideally handle this, but let's be explicit if not)
        await connection.query('DELETE FROM transaction_items WHERE transaction_id = ?', [id]);

        // 4. Delete the transaction
        const [result]: any = await connection.query('DELETE FROM transactions WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            throw new Error('Transaction not found');
        }

        await connection.commit();
        return NextResponse.json({ success: true, message: 'Transaction deleted and stock restored' });
    } catch (error: any) {
        await connection.rollback();
        console.error('Delete transaction error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    } finally {
        connection.release();
    }
}
