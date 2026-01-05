'use server';

import { createClient } from '@/lib/supabase/server';

export async function getAllTasks() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('tasks')
        .select(`
            *,
            booking:bookings(booking_number, customer:entities!customer_id(display_name))
        `)
        .order('due_date', { ascending: true });

    if (error) {
        console.error('Error fetching all tasks:', error);
        return { tasks: [], error: error.message };
    }

    const tasks = data.map(task => ({
        ...task,
        bookingReference: task.booking?.booking_number || 'Unknown',
        customerName: task.booking?.customer?.display_name || 'Unknown'
    }));

    return { tasks, error: null };
}
