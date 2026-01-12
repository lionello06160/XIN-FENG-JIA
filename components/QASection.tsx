import React, { useState } from 'react';
import { QAItem } from '../types';
import { Plus, Minus } from 'lucide-react';

interface QASectionProps {
    items: QAItem[];
}

export const QASection: React.FC<QASectionProps> = ({ items }) => {
    const [openId, setOpenId] = useState<string | null>(null);

    if (!items || items.length === 0) return null;

    return (
        <div className="w-full px-4 pb-12">
            <div className="max-w-md mx-auto">
                <div className="flex items-center justify-center gap-4 pt-0 pb-8">
                    <div className="h-[1px] flex-1 bg-gold/30 rounded-full"></div>
                    <h3 className="text-white text-2xl font-bold tracking-tight whitespace-nowrap">Q & A</h3>
                    <div className="h-[1px] flex-1 bg-gold/30 rounded-full"></div>
                </div>

                <div className="space-y-4">
                    {items.map((item, index) => {
                        const isOpen = openId === item.id;
                        return (
                            <div
                                key={item.id}
                                className="bg-luxury-card rounded-2xl border border-white/5 overflow-hidden transition-all duration-300 shadow-lg"
                            >
                                <button
                                    onClick={() => setOpenId(isOpen ? null : item.id)}
                                    className="w-full flex items-center justify-between p-5 text-left focus:outline-none group"
                                >
                                    <div className="flex items-start gap-2 pr-4">
                                        <span className="text-gold font-bold whitespace-nowrap">Q{index + 1}:</span>
                                        <span className="text-white font-medium leading-relaxed">{item.question}</span>
                                    </div>
                                    <div className={`shrink-0 w-8 h-8 rounded-full border border-gold/20 flex items-center justify-center transition-all duration-300 ${isOpen ? 'bg-gold border-gold scale-110' : 'bg-gold/5 group-hover:bg-gold/20'}`}>
                                        {isOpen ? (
                                            <Minus size={16} className="text-black" />
                                        ) : (
                                            <Plus size={16} className="text-gold" />
                                        )}
                                    </div>
                                </button>

                                <div
                                    className={`transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
                                >
                                    <div className="p-5 mt-1 flex items-center">
                                        <p className="text-gray-300 text-sm leading-relaxed pl-7">
                                            {item.answer}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
