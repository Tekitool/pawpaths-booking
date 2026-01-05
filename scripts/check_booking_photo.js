import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role to bypass RLS for checking

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkBooking() {
    const bookingNumber = 'PP-2026-0002';
    console.log(`Checking booking: ${bookingNumber}`);

    const { data: booking, error } = await supabase
        .from('bookings')
        .select('id, booking_number, pet_photo_path, created_at')
        .eq('booking_number', bookingNumber)
        .single();

    if (error) {
        console.error('Error fetching booking:', error);
        return;
    }

    console.log('Booking Data:', booking);

    if (booking.pet_photo_path) {
        console.log(`\nFound pet_photo_path: ${booking.pet_photo_path}`);

        // Check if we can generate a public URL (just to verify path format)
        const { data } = supabase.storage
            .from('photos')
            .getPublicUrl(booking.pet_photo_path);

        console.log(`Public URL would be: ${data.publicUrl}`);

        // Attempt to list files in the folder to see if it exists
        // The path is likely 'enquiries/SESSION_ID/photos/FILENAME'
        // We can try to list the folder 'enquiries/SESSION_ID/photos'
        const pathParts = booking.pet_photo_path.split('/');
        if (pathParts.length > 1) {
            const folderPath = pathParts.slice(0, -1).join('/');
            console.log(`\nListing contents of folder: ${folderPath}`);

            const { data: files, error: listError } = await supabase.storage
                .from('photos')
                .list(folderPath);

            if (listError) {
                console.error('Error listing files:', listError);
            } else {
                console.log('Files in folder:', files);
                const fileExists = files.some(f => f.name === pathParts[pathParts.length - 1]);
                console.log(`File '${pathParts[pathParts.length - 1]}' exists in bucket? ${fileExists}`);
            }
        }
    } else {
        console.log('\nWARNING: pet_photo_path is NULL or empty.');
    }
}

checkBooking();
