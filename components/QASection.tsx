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
        <div className="w-full bg-[#f9f9f9] py-8 px-4">
            <div className="max-w-md mx-auto">
                <div className="bg-white border border-gray-200 py-3 mb-8 text-center">
                    <h2 className="text-[#181411] text-xl font-bold tracking-[0.2em] uppercase">Q & A</h2>
                </div>

                <div className="space-y-4">
                    {items.map((item, index) => {
                        const isOpen = openId === item.id;
                        return (
                            <div
                                key={item.id}
                                className="bg-white border-b border-gray-100 last:border-0 overflow-hidden transition-all duration-300"
                            >
                                <button
                                    onClick={() => setOpenId(isOpen ? null : item.id)}
                                    className="w-full flex items-center justify-between py-5 text-left focus:outline-none group"
                                >
                                    <div className="flex items-start gap-2 pr-4">
                                        <span className="text-admin-primary font-bold whitespace-nowrap">Q{index + 1}:</span>
                                        <span className="text-[#181411] font-medium leading-relaxed">{item.question}</span>
                                    </div>
                                    <div className={`shrink-0 w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center transition-colors group-hover:border-admin-primary ${isOpen ? 'bg-admin-primary border-admin-primary' : 'bg-white'}`}>
                                        {isOpen ? (
                                            <Minus size={14} className="text-white" />
                                        ) : (
                                            <Plus size={14} className="text-gray-400 group-hover:text-admin-primary" />
                                        )}
                                    </div>
                                </button>

                                <div
                                    className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 pb-6' : 'max-h-0'}`}
                                >
                                    <p className="text-gray-500 text-sm leading-relaxed pl-8">
                                        {item.answer}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
