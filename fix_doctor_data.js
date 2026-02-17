
const { createClient } = require('@supabase/supabase-js');

// Hardcoded for this script to run easily
const supabaseUrl = 'https://lmqisoemsspfrifnkcqi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtcWlzb2Vtc3NwZnJpZm5rY3FpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExMDMwMDcsImV4cCI6MjA4NjY3OTAwN30._PIxPNW2xod5TUCN9QmeaG2-3BsfaQNWq-4ULj_qZp8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDoctors() {
    console.log("Checking profiles with role 'doctor'...");

    const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select(`
            id, 
            full_name, 
            email, 
            role,
            doctors (id, specialization)
        `)
        .eq('role', 'doctor');

    if (profileError) {
        console.error("Error fetching profiles:", profileError);
        return;
    }

    console.log(`Found ${profiles.length} doctor profiles.`);

    const missingDetails = profiles.filter(p => !p.doctors || (Array.isArray(p.doctors) && p.doctors.length === 0));

    console.log(`Profiles missing doctor details: ${missingDetails.length}`);

    if (missingDetails.length > 0) {
        console.log("Fixing missing doctor details...");

        for (const profile of missingDetails) {
            console.log(`Creating doctor entry for ${profile.full_name} (${profile.id})`);
            const { error: insertError } = await supabase
                .from('doctors')
                .insert([
                    {
                        id: profile.id,
                        specialization: 'General Physician',
                        experience_years: 0,
                        consultation_fee: 50,
                        rating: 0
                    }
                ]);

            if (insertError) {
                console.error(`Failed to insert doctor for ${profile.id}:`, insertError);
            } else {
                console.log(`Success!`);
            }
        }
    } else {
        console.log("All doctor profiles have corresponding doctor entries.");
    }
}

checkDoctors();
