
import React, { useState } from 'react';
import { Dish } from '../../types';
import { Camera, Save, Loader2, Sparkles, Eye, Utensils, Star, EyeOff } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { uploadImage } from '../../lib/supabase';
import { AdminLayout } from './AdminLayout';

export const EditDish = ({
    dishes,
    onSave,
    onAdd
}: {
    dishes: Dish[];
    onSave: (id: string, data: Partial<Dish>) => Promise<void>;
    onAdd: (data: Omit<Dish, 'id'>) => Promise<void>;
}) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const isNew = id === 'new';

    const existingDish = dishes.find(d => d.id === id);

    const [formData, setFormData] = useState<Partial<Dish>>(
        existingDish || {
            name: '',
            price: 0,
            description: '',
            ingredients: [],
            available: true,
            image: 'https://picsum.photos/800/600', // Placeholder
            inspiration: '',
            show_reviews: true,
            is_visible: true
        }
    );
    const [uploading, setUploading] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const url = await uploadImage(file, 1000);
            setFormData({ ...formData, image: url });
        } catch (err) {
            console.error('Upload error:', err);
            alert('上傳失敗');
        } finally {
            setUploading(false);
        }
    };

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            if (isNew) {
                await onAdd({
                    ...formData,
                    ingredients: Array.isArray(formData.ingredients) ? formData.ingredients : []
                } as Omit<Dish, 'id'>);
            } else if (id) {
                await onSave(id, formData);
            }
            navigate('/admin');
        } catch (error) {
            console.error('Submit horror:', error);
            alert('儲存失敗，請重試');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AdminLayout
            title={isNew ? "新增菜色" : "編輯菜色詳情"}
            backTo="/admin"
        >
            <div className="px-4 py-4">
                {/* Image Upload */}
                <div className="relative group mb-6">
                    <div
                        className="w-full bg-center bg-no-repeat bg-contain flex flex-col justify-end overflow-hidden bg-[#f8f5f2] rounded-xl min-h-[320px] md:min-h-[400px] shadow-inner border border-gray-100"
                        style={{ backgroundImage: `url("${formData.image}")` }}
                    ></div>
                    <div
                        className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-xl transition-opacity cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <div className="bg-white/90 p-3 rounded-full flex items-center gap-2 shadow-lg">
                            {uploading ? (
                                <Loader2 className="text-admin-primary animate-spin" size={20} />
                            ) : (
                                <Camera className="text-admin-primary" size={20} />
                            )}
                            <span className="text-sm font-bold text-gray-800">
                                {uploading ? '正在上傳...' : '更換相片'}
                            </span>
                        </div>
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-48">
                    <div className="space-y-6">
                        <label className="flex flex-col w-full gap-2">
                            <p className="text-[#181411] text-sm font-bold tracking-wider">菜色名稱</p>
                            <input
                                className="flex w-full rounded-xl border border-[#e6e0db] bg-white h-14 placeholder:text-[#8a7560] px-4 text-base focus:border-admin-primary focus:ring-1 focus:ring-admin-primary outline-none transition-all shadow-sm"
                                placeholder="例如：嫩煎干貝佐奶油醬"
                                value={formData.name || ''}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </label>

                        <label className="flex flex-col w-full gap-2">
                            <p className="text-[#181411] text-sm font-bold tracking-wider">價格設定</p>
                            <div className="flex w-full items-stretch rounded-xl shadow-sm overflow-hidden">
                                <div className="text-[#8a7560] flex border border-[#e6e0db] bg-gray-50 items-center justify-center px-5 border-r-0">
                                    <span className="text-base font-bold">NT$</span>
                                </div>
                                <input
                                    className="flex w-full border border-[#e6e0db] bg-white h-14 px-4 text-base focus:border-admin-primary focus:ring-1 focus:ring-admin-primary outline-none"
                                    type="number"
                                    inputMode="numeric"
                                    placeholder="1200"
                                    value={formData.price || 0}
                                    onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                                />
                            </div>
                            <p className="text-[11px] text-[#8a7560] px-1">格式：NT$ 1200</p>
                        </label>

                        <label className="flex flex-col w-full gap-2">
                            <p className="text-[#181411] text-sm font-bold tracking-wider">主廚靈感 / 詳細描述</p>
                            <textarea
                                className="flex w-full rounded-xl border border-[#e6e0db] bg-white min-h-[200px] p-4 text-base focus:border-admin-primary focus:ring-1 focus:ring-admin-primary outline-none resize-none shadow-sm"
                                value={formData.description || ''}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                placeholder="分享這道菜的故事與獨特之處..."
                            />
                        </label>
                    </div>

                    <div className="space-y-6">
                        <label className="flex flex-col w-full gap-2">
                            <p className="text-[#181411] text-sm font-bold tracking-wider">嚴選食材 (以半形逗點分隔)</p>
                            <textarea
                                className="flex w-full rounded-xl border border-[#e6e0db] bg-white min-h-[120px] p-4 text-base focus:border-admin-primary focus:ring-1 focus:ring-admin-primary outline-none resize-none shadow-sm"
                                value={(formData.ingredients || []).join(', ')}
                                onChange={e => setFormData({ ...formData, ingredients: e.target.value.split(',').map(s => s.trim()) })}
                                placeholder="日本生食級干貝, 澳洲海鹽, 新鮮羅勒..."
                            />
                        </label>

                        <div className="flex flex-col w-full gap-3">
                            <p className="text-[#181411] text-sm font-bold tracking-wider">風味標記 - 辣度</p>
                            <div className="grid grid-cols-4 gap-2">
                                {[0, 1, 2, 3].map((level) => (
                                    <button
                                        key={level}
                                        onClick={() => setFormData({ ...formData, spiciness: level })}
                                        className={`py-3 px-2 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${(formData.spiciness || 0) === level
                                            ? 'border-admin-primary bg-admin-primary/5 text-admin-primary'
                                            : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200'
                                            }`}
                                    >
                                        <span className="text-xs font-bold">
                                            {level === 0 ? '不辣' : level === 1 ? '小辣' : level === 2 ? '中辣' : '大辣'}
                                        </span>
                                        <div className="flex gap-0.5 h-4 items-center">
                                            {level === 0 ? (
                                                <span className="text-[10px] font-medium opacity-50">無</span>
                                            ) : (
                                                Array.from({ length: level }).map((_, i) => (
                                                    <span key={i} className="text-sm">🌶️</span>
                                                ))
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4 pt-4">
                            <p className="text-[#181411] text-sm font-bold tracking-wider mb-3 px-1">展示設定</p>
                            <div className="grid grid-cols-1 gap-3">
                                <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gold/10 rounded-lg text-gold">
                                            <Sparkles size={18} />
                                        </div>
                                        <span className="text-[#181411] font-medium">標記為新品 (New)</span>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={formData.is_new || false}
                                            onChange={e => setFormData({ ...formData, is_new: e.target.checked })}
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold"></div>
                                    </label>
                                </div>

                                <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-600">
                                            <Eye size={18} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[#181411] font-medium">於首頁可見</span>
                                            <span className="text-gray-400 text-[10px]">控制此前台是否顯示</span>
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

                                <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-admin-primary/10 rounded-lg text-admin-primary">
                                            <Utensils size={18} />
                                        </div>
                                        <span className="text-[#181411] font-medium">前台顯示為可訂購</span>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={formData.available || false}
                                            onChange={e => setFormData({ ...formData, available: e.target.checked })}
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-admin-primary"></div>
                                    </label>
                                </div>

                                <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gold/10 rounded-lg text-gold">
                                            <Star size={18} />
                                        </div>
                                        <span className="text-[#181411] font-medium">顯示評價區塊</span>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={formData.show_reviews ?? true}
                                            onChange={e => setFormData({ ...formData, show_reviews: e.target.checked })}
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold"></div>
                                    </label>
                                </div>
                            </div>
                        </div>
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
                        {isSubmitting ? '正在處理...' : '儲存菜色資料'}
                    </button>
                </div>
            </div>
        </AdminLayout>
    );
};
