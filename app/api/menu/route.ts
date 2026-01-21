import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
    try {
        const [rows]: any = await pool.query(`
      SELECT m.*, c.name as category_name 
      FROM menu_items m 
      JOIN categories c ON m.category_id = c.id 
      WHERE m.is_available = true
    `);

        const [categories]: any = await pool.query("SELECT * FROM categories WHERE is_active = true");

        return NextResponse.json({
            items: rows,
            categories: categories
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
