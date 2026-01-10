import { createClient } from '@supabase/supabase-js';
// 之後可以使用 Supabase CLI 生成類型，暫時使用 any

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase URL or Anon Key is missing. Database features will not work.');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

/**
 * Upload an image to Supabase Storage and return the public URL
 */
export const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
    const filePath = `menu/${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file);

    if (uploadError) {
        throw uploadError;
    }

    const { data } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

    return data.publicUrl;
};

// --- Analytics ---

export const trackEvent = async (eventType: 'page_view' | 'dish_click', dishId?: string) => {
    try {
        const { error } = await supabase
            .from('analytics_events')
            .insert([
                { event_type: eventType, dish_id: dishId }
            ]);
        if (error) console.warn('Analytics error:', error.message);
    } catch (err) {
        console.warn('Analytics failed:', err);
    }
};
