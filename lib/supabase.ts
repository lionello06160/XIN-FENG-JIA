import { createClient } from '@supabase/supabase-js';
// 之後可以使用 Supabase CLI 生成類型，暫時使用 any

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase URL or Anon Key is missing. Database features will not work.');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

/**
 * Process image before upload:
 * 1. Convert to WebP format
 * 2. If width > maxWidth, resize to maxWidth (maintain aspect ratio)
 * 3. Never upscale image
 */
const processImage = async (file: File, maxWidth: number = 1400): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Only downscale if width > maxWidth
                if (width > maxWidth) {
                    const ratio = maxWidth / width;
                    width = maxWidth;
                    height = height * ratio;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Failed to get canvas context'));
                    return;
                }

                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            resolve(blob);
                        } else {
                            reject(new Error('Canvas to Blob failed'));
                        }
                    },
                    'image/webp',
                    0.8 // Quality
                );
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
};

/**
 * Upload an image to Supabase Storage and return the public URL
 */
export const uploadImage = async (file: File, maxWidth: number = 1400): Promise<string> => {
    try {
        // 1. Process image (Resize & Convert to WebP)
        const processedBlob = await processImage(file, maxWidth);

        // 2. Prepare upload details (Force .webp extension)
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.webp`;
        const filePath = `menu/${fileName}`;

        // 3. Upload processed blob
        const { error: uploadError } = await supabase.storage
            .from('images')
            .upload(filePath, processedBlob, {
                contentType: 'image/webp',
                upsert: true
            });

        if (uploadError) {
            throw uploadError;
        }

        // 4. Get Public URL
        const { data } = supabase.storage
            .from('images')
            .getPublicUrl(filePath);

        return data.publicUrl;
    } catch (error) {
        console.error('Error in uploadImage:', error);
        throw error;
    }
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
