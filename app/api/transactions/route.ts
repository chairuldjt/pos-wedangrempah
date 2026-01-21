import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { auth } from '@/auth';

export async function POST(req: Request) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const connection = await pool.getConnection();
    try {
        const {
            customer_name,
            total_amount,
            payment_amount,
            change_amount,
            items
        } = await req.json();

        // Generate transaction code: TRX-timestamp
        const transaction_code = `TRX-${Date.now()}`;
        const user_id = session.user.id;

        await connection.beginTransaction();

        // Insert transaction
        const [result]: any = await connection.query(
            `INSERT INTO transactions 
      (transaction_code, user_id, customer_name, total_amount, payment_amount, change_amount) 
      VALUES (?, ?, ?, ?, ?, ?)`,
            [transaction_code, user_id, customer_name, total_amount, payment_amount, change_amount]
        );

        const transaction_id = result.insertId;

        // Insert items
        for (const item of items) {
            await connection.query(
                `INSERT INTO transaction_items 
        (transaction_id, menu_item_id, quantity, price, subtotal) 
        VALUES (?, ?, ?, ?, ?)`,
                [transaction_id, item.id, item.quantity, item.price, item.price * item.quantity]
            );

            // Reduce stock (optional logic)
            await connection.query(
                "UPDATE menu_items SET stock = stock - ? WHERE id = ?",
                [item.quantity, item.id]
            );
        }

        await connection.commit();

        return NextResponse.json({
            success: true,
            transaction_id,
            transaction_code
        });
    } catch (error: any) {
        await connection.rollback();
        return NextResponse.json({ error: error.message }, { status: 500 });
    } finally {
        connection.release();
    }
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const dateStr = searchParams.get('date') || new Date().toISOString().split('T')[0];

    try {
        // Get transactions for the day
        const [transactions]: any = await pool.query(`
      SELECT t.*, u.full_name as kasir_name 
      FROM transactions t
      JOIN users u ON t.user_id = u.id
      WHERE DATE(t.transaction_date) = ?
      ORDER BY t.transaction_date DESC
    `, [dateStr]);

        // Get items for these transactions
        for (let trx of transactions) {
            const [items]: any = await pool.query(`
        SELECT ti.*, m.name
        FROM transaction_items ti
        JOIN menu_items m ON ti.menu_item_id = m.id
        WHERE ti.transaction_id = ?
      `, [trx.id]);
            trx.items = items;
        }

        // Get summary stats
        const [stats]: any = await pool.query(`
      SELECT 
        COUNT(*) as total_count,
        SUM(total_amount) as total_revenue,
        AVG(total_amount) as avg_transaction,
        SUM((SELECT SUM(quantity) FROM transaction_items WHERE transaction_id = transactions.id)) as total_items
      FROM transactions
      WHERE DATE(transaction_date) = ?
    `, [dateStr]);

        // Best selling items
        const [bestSelling]: any = await pool.query(`
      SELECT m.name, SUM(ti.quantity) as count
      FROM transaction_items ti
      JOIN menu_items m ON ti.menu_item_id = m.id
      JOIN transactions t ON ti.transaction_id = t.id
      WHERE DATE(t.transaction_date) = ?
      GROUP BY m.id
      ORDER BY count DESC
      LIMIT 5
    `, [dateStr]);

        return NextResponse.json({
            transactions,
            stats: stats[0] || { total_count: 0, total_revenue: 0, avg_transaction: 0, total_items: 0 },
            bestSelling
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
