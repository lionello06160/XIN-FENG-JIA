
import React, { useState } from 'react';
import { QAItem } from '../../types';
import { Save, HelpCircle, Eye } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { AdminLayout } from './AdminLayout';

export const EditQAItem = ({
    qaItems,
    onSave,
    onAdd
}: {
    qaItems: QAItem[];
    onSave: (id: string, data: Partial<QAItem>) => Promise<void>;
    onAdd: (data: Omit<QAItem, 'id'>) => Promise<void>;
}) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isNew = id === 'new';

    const existingItem = qaItems.find(item => item.id === id);

    const [formData, setFormData] = useState<Partial<QAItem>>(
        existingItem || {
            question: '',
            answer: '',
            is_visible: true,
            order_index: qaItems.length
        }
    );
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!formData.question || !formData.answer) {
            alert('請填寫完整問答內容');
            return;
        }

        setIsSubmitting(true);
        try {
            if (isNew) {
                await onAdd(formData as Omit<QAItem, 'id'>);
            } else if (id) {
                await onSave(id, formData);
            }
            navigate('/admin/qa');
        } catch (error) {
            console.error('Submit error:', error);
            alert('儲存失敗，請重試');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AdminLayout
            title={isNew ? "新增問答" : "編輯問答"}
            backTo="/admin/qa"
        >
            <div className="max-w-3xl mx-auto space-y-6 py-6">
                <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                    <label className="flex flex-col w-full gap-2">
                        <p className="text-[#181411] text-sm font-bold px-1">問題內容 (Question)</p>
                        <div className="relative">
                            <div className="absolute left-4 top-4 text-admin-primary">
                                <HelpCircle size={20} />
                            </div>
                            <textarea
                                className="flex w-full rounded-xl border border-[#e6e0db] bg-white min-h-[100px] pl-12 pr-4 py-4 text-lg font-bold focus:border-admin-primary focus:ring-1 focus:ring-admin-primary outline-none resize-none shadow-sm"
                                value={formData.question || ''}
                                onChange={e => setFormData({ ...formData, question: e.target.value })}
                                placeholder="例如：請問可以預約包場嗎？"
                            />
                        </div>
                    </label>

                    <label className="flex flex-col w-full gap-2">
                        <p className="text-[#181411] text-sm font-bold px-1">回答內容 (Answer)</p>
                        <textarea
                            className="flex w-full rounded-xl border border-[#e6e0db] bg-white min-h-[200px] p-4 text-base focus:border-admin-primary focus:ring-1 focus:ring-admin-primary outline-none resize-none shadow-sm leading-relaxed"
                            value={formData.answer || ''}
                            onChange={e => setFormData({ ...formData, answer: e.target.value })}
                            placeholder="詳細回覆客人的疑問..."
                        />
                    </label>

                    <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-600">
                                <Eye size={20} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[#181411] text-sm font-bold">於前台顯示</span>
                                <span className="text-gray-400 text-[10px]">控制此問答是否公開</span>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={formData.is_visible ?? true}
                                onChange={e => setFormData({ ...formData, is_visible: e.target.checked })}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                </div>
            </div>

            <div className="sticky bottom-24 z-40 mt-10 -mx-4 md:-mx-8">
                <div className="bg-white/95 backdrop-blur-md border-t border-gray-100 px-4 md:px-8 py-4 shadow-[0_-10px_30px_-20px_rgba(0,0,0,0.35)]">
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="w-full md:max-w-xs mx-auto bg-admin-primary text-white font-bold py-4 rounded-2xl shadow-xl hover:shadow-admin-primary/20 active:scale-[0.98] transition-all motion-reduce:transition-none flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        <Save size={20} />
                        {isSubmitting ? '儲存中...' : '儲存問答'}
                    </button>
                </div>
            </div>
        </AdminLayout>
    );
};
