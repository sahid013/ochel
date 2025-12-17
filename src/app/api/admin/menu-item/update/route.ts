import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
    try {
        // Parse request body
        const { id, model_3d_url, redirect_3d_url } = await request.json();

        // Validate required fields
        if (!id) {
            return NextResponse.json(
                { error: 'Menu Item ID is required' },
                { status: 400 }
            );
        }

        // Initialize Supabase Admin Client
        // Note: Using Service Role Key to bypass RLS policies
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        );

        // Perform the update
        const { data, error } = await supabaseAdmin
            .from('menu_items')
            .update({
                model_3d_url: model_3d_url || null,
                redirect_3d_url: redirect_3d_url || null,
                // Optionally update status if needed, but current logic relies on URL presence
            })
            .eq('id', id)
            .select() // Select to confirm update and return data
            .single();

        if (error) {
            console.error('Supabase update error:', error);
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data
        });

    } catch (error) {
        console.error('Server error updating menu item:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
