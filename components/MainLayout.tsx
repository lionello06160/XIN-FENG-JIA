
import React from 'react';
import { useAppContext } from '../context/AppContext';
import { ClientView } from './ClientView';
import { Loader2 } from 'lucide-react';

export const MainLayout = () => {
    const {
        loading,
        chefProfile,
        dishes,
        qaItems,
        reviews,
        addReview
    } = useAppContext();

    if (loading || !chefProfile) {
        return (
            <div className="flex items-center justify-center h-screen bg-[#181411]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-[#8a7560]" size={48} />
                    <p className="text-[#8a7560] font-medium tracking-widest text-sm animate-pulse">LOADING...</p>
                </div>
            </div>
        );
    }

    return (
        <ClientView
            chefProfile={chefProfile}
            dishes={dishes}
            qaItems={qaItems}
            reviews={reviews}
            onAddReview={addReview}
        />
    );
};
