import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET - Fetch restaurant status for date range
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start');
    const endDate = searchParams.get('end');

    let query = supabase
      .from('closed_dates')
      .select('date, is_closed, reason, opening_time, closing_time, created_at, updated_at')
      .order('date', { ascending: true });

    // Add date filters if provided
    if (startDate) {
      query = query.gte('date', startDate);
    }
    if (endDate) {
      query = query.lte('date', endDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des données' },
        { status: 500 }
      );
    }

    // Transform data to include all requested dates (even if not in DB)
    const result = data || [];
    
    // If date range is specified, include all dates in range with default status
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const existingDates = new Set(result.map(item => item.date));
      
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        if (!existingDates.has(dateStr)) {
          result.push({
            date: dateStr,
            is_closed: false,
            reason: null,
            opening_time: '10:00',
            closing_time: '20:00',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }
      }
      
      // Sort by date
      result.sort((a, b) => a.date.localeCompare(b.date));
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// POST - Update restaurant status for a specific date
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, is_closed, reason, opening_time, closing_time } = body;
    
    console.log('POST /api/admin/restaurant-status received:', { date, is_closed, reason, opening_time, closing_time });

    // Validate required fields
    if (!date || typeof is_closed !== 'boolean') {
      return NextResponse.json(
        { error: 'Date et statut requis' },
        { status: 400 }
      );
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return NextResponse.json(
        { error: 'Format de date invalide (YYYY-MM-DD requis)' },
        { status: 400 }
      );
    }

    // Check if date already exists
    const { data: existingData } = await supabase
      .from('closed_dates')
      .select('*')
      .eq('date', date)
      .single();

    let result;

    if (existingData) {
      // Update existing record
      const shouldKeepRecord = is_closed || 
        (opening_time && opening_time !== '10:00') || 
        (closing_time && closing_time !== '20:00');

      if (shouldKeepRecord) {
        // Update the record (for closed dates or custom hours)
        const { data, error } = await supabase
          .from('closed_dates')
          .update({
            is_closed,
            reason: reason || null,
            opening_time: opening_time || '10:00',
            closing_time: closing_time || '20:00',
            updated_at: new Date().toISOString(),
          })
          .eq('date', date)
          .select()
          .single();

        if (error) {
          console.error('Database update error:', error);
          return NextResponse.json(
            { error: 'Erreur lors de la mise à jour' },
            { status: 500 }
          );
        }

        result = data;
      } else {
        // If setting to open with default hours, delete the record
        const { error } = await supabase
          .from('closed_dates')
          .delete()
          .eq('date', date);

        if (error) {
          console.error('Database delete error:', error);
          return NextResponse.json(
            { error: 'Erreur lors de la suppression' },
            { status: 500 }
          );
        }

        result = {
          date,
          is_closed: false,
          reason: null,
          opening_time: '10:00',
          closing_time: '20:00',
          created_at: null,
          updated_at: null,
        };
      }
    } else {
      // Create new record
      const shouldCreateRecord = is_closed || 
        (opening_time && opening_time !== '10:00') || 
        (closing_time && closing_time !== '20:00');

      if (shouldCreateRecord) {
        const { data, error } = await supabase
          .from('closed_dates')
          .insert({
            date,
            is_closed,
            reason: reason || null,
            opening_time: opening_time || '10:00',
            closing_time: closing_time || '20:00',
          })
          .select()
          .single();

        if (error) {
          console.error('Database insert error:', error);
          return NextResponse.json(
            { error: 'Erreur lors de la création' },
            { status: 500 }
          );
        }

        result = data;
      } else {
        // Date doesn't exist and we're setting to open with default hours
        result = {
          date,
          is_closed: false,
          reason: null,
          opening_time: '10:00',
          closing_time: '20:00',
          created_at: null,
          updated_at: null,
        };
      }
    }

    console.log('POST /api/admin/restaurant-status returning:', result);
    return NextResponse.json(result);
  } catch (error) {
    console.error('POST /api/admin/restaurant-status error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// DELETE - Remove a specific date status (set back to default open)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json(
        { error: 'Date requise' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('closed_dates')
      .delete()
      .eq('date', date);

    if (error) {
      console.error('Database delete error:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la suppression' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      date,
      is_closed: false,
      reason: null,
      opening_time: '10:00',
      closing_time: '20:00',
      deleted: true,
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
