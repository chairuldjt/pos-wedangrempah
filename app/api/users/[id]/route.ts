import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';
import { auth } from '@/auth';

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session || session.user?.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = await params;
        const data = await request.json();
        const { username, email, password, full_name, role, is_active } = data;

        let query = 'UPDATE users SET username = ?, email = ?, full_name = ?, role = ?, is_active = ?';
        let params_list = [username, email, full_name, role, is_active];

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            query += ', password = ?';
            params_list.push(hashedPassword);
        }

        query += ' WHERE id = ?';
        params_list.push(id);

        await pool.query(query, params_list);

        return NextResponse.json({ success: true, message: 'User updated successfully' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session || session.user?.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = await params;
        // In a real POS, we might want to deactivate instead of delete if they have transactions
        // But for now, let's allow deletion if requested, or maybe just set is_active = false
        await pool.query('DELETE FROM users WHERE id = ?', [id]);
        return NextResponse.json({ success: true, message: 'User deleted successfully' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
