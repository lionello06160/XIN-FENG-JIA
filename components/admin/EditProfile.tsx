
import React, { useState } from 'react';
import { ChefProfile } from '../../types';
import { Camera, Save, Loader2, Instagram, Facebook, MessageCircle, Mail, Sparkles, ShoppingBag, Star, HelpCircle, Link as LinkIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { uploadImage } from '../../lib/supabase';
import { AdminLayout } from './AdminLayout';

export const EditProfile = ({
    profile,
    onSave
}: {
    profile: ChefProfile;
    onSave: (data: Partial<ChefProfile>) => Promise<void>;
}) => {
    const navigate = useNavigate();
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [formData, setFormData] = useState(profile);
    const [uploading, setUploading] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const url = await uploadImage(file, 1400);
            setFormData({ ...formData, image: url });
        } catch (err) {
            console.error('Upload error:', err);
            alert('上傳失敗');
        } finally {
            setUploading(false);
        }
    };

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSave = async () => {
        setIsSubmitting(true);
        try {
            await onSave(formData);
            alert('個人資料已成功儲存');
        } catch (error) {
            alert('更新個人資料失敗');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AdminLayout title="主廚個人資料管理">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-40">
                <div className="lg:col-span-1">
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center gap-6 sticky top-24">
                        {/* Avatar */}
                        <div className="relative group">
                            <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-40 border-4 border-white shadow-xl" style={{ backgroundImage: `url("${formData.image}")` }}></div>
                            <div
                                className="absolute bottom-2 right-2 bg-admin-primary text-white p-3 rounded-full shadow-lg cursor-pointer hover:bg-admin-primary/90 transition-transform hover:scale-110"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {uploading ? <Loader2 size={20} className="animate-spin" /> : <Camera size={20} />}
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                        </div>
                        <div className="text-center">
                            <h3 className="text-[#181411] text-xl font-bold">{formData.name || '主廚名稱'}</h3>
                            <p className="text-[#8a7560] text-sm mt-1">{formData.title || '尚未設定職銜'}</p>
                        </div>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="text-admin-primary text-sm font-bold px-6 py-2 bg-admin-primary/5 rounded-full hover:bg-admin-primary/10 transition-colors"
                        >
                            {uploading ? '正在上傳...' : '更換個人照'}
                        </button>
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                        <h4 className="text-[#181411] text-lg font-bold border-b border-gray-50 pb-4">基本資料</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <label className="flex flex-col w-full gap-2 md:col-span-2">
                                <p className="text-[#181411] text-sm font-bold px-1">店舖名稱 (顯示於首頁與登入頁)</p>
                                <input
                                    className="flex w-full rounded-xl border border-[#e6e0db] bg-white h-12 px-4 focus:border-admin-primary focus:ring-1 focus:ring-admin-primary outline-none transition-all"
                                    value={formData.store_name || ''}
                                    onChange={e => setFormData({ ...formData, store_name: e.target.value })}
                                    placeholder="例如：鑫蘴家"
                                />
                            </label>

                            <label className="flex flex-col w-full gap-2">
                                <p className="text-[#181411] text-sm font-bold px-1">廚師姓名</p>
                                <input
                                    className="flex w-full rounded-xl border border-[#e6e0db] bg-white h-12 px-4 focus:border-admin-primary focus:ring-1 focus:ring-admin-primary outline-none transition-all"
                                    value={formData.name || ''}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </label>

                            <label className="flex flex-col w-full gap-2">
                                <p className="text-[#181411] text-sm font-bold px-1">職銜名稱</p>
                                <input
                                    className="flex w-full rounded-xl border border-[#e6e0db] bg-white h-12 px-4 focus:border-admin-primary focus:ring-1 focus:ring-admin-primary outline-none transition-all"
                                    value={formData.title || ''}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                />
                            </label>
                        </div>

                        <label className="flex flex-col w-full gap-2">
                            <p className="text-[#181411] text-sm font-bold px-1">個人簡介 / 品牌故事</p>
                            <textarea
                                className="flex w-full rounded-xl border border-[#e6e0db] bg-white min-h-[160px] p-4 focus:border-admin-primary focus:ring-1 focus:ring-admin-primary outline-none resize-none leading-relaxed transition-all"
                                value={formData.bio || ''}
                                onChange={e => setFormData({ ...formData, bio: e.target.value })}
                            />
                            <div className="flex justify-between items-center px-1">
                                <p className="text-[#8a7560] text-xs">建議描述您的烹飪理念與經歷</p>
                                <p className="text-[#8a7560] text-xs">{(formData.bio || '').length} / 500 字</p>
                            </div>
                        </label>
                    </div>

                    <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                        <h4 className="text-[#181411] text-lg font-bold border-b border-gray-50 pb-4">首頁底部呼籲 (CTA)</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <label className="flex flex-col w-full gap-2">
                                <p className="text-[#181411] text-sm font-bold px-1">區塊標題</p>
                                <input
                                    className="flex w-full rounded-xl border border-[#e6e0db] bg-white h-12 px-4 focus:border-admin-primary focus:ring-1 focus:ring-admin-primary outline-none"
                                    value={formData.cta_title || ''}
                                    onChange={e => setFormData({ ...formData, cta_title: e.target.value })}
                                    placeholder="例如：預約私廚體驗"
                                />
                            </label>

                            <label className="flex flex-col w-full gap-2 md:col-span-2">
                                <p className="text-[#181411] text-sm font-bold px-1">詳細描述文字</p>
                                <textarea
                                    className="flex w-full rounded-xl border border-[#e6e0db] bg-white min-h-[100px] p-4 focus:border-admin-primary focus:ring-1 focus:ring-admin-primary outline-none resize-none leading-relaxed"
                                    value={formData.cta_description || ''}
                                    onChange={e => setFormData({ ...formData, cta_description: e.target.value })}
                                    placeholder="例如：在您的私人寓所中，體驗由主廚親自操刀的 8 道式招牌饗宴。"
                                />
                            </label>
                        </div>
                    </div>

                    <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                        <h4 className="text-[#181411] text-lg font-bold border-b border-gray-50 pb-4">功能設定與社群連結</h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gold/10 rounded-lg text-gold">
                                        <Sparkles size={20} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[#181411] text-sm font-bold">顯示首頁 CTA 區塊</span>
                                        <span className="text-gray-400 text-[10px]">標題與描述區塊</span>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={formData.show_cta ?? true}
                                        onChange={e => setFormData({ ...formData, show_cta: e.target.checked })}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <div className="flex items-center gap-3">
                                    <ShoppingBag className="text-admin-primary" size={20} />
                                    <div className="flex flex-col">
                                        <span className="text-[#181411] text-sm font-bold">顯示訂購按鈕</span>
                                        <span className="text-gray-400 text-[10px]">首頁立即預約按鈕</span>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={formData.show_order_button || false}
                                        onChange={e => setFormData({ ...formData, show_order_button: e.target.checked })}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-admin-primary"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <div className="flex items-center gap-3">
                                    <Star className="text-gold" size={20} />
                                    <div className="flex flex-col">
                                        <span className="text-[#181411] text-sm font-bold">顯示評價區塊</span>
                                        <span className="text-gray-400 text-[10px]">首頁與菜色詳情評價</span>
                                    </div>
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

                            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <div className="flex items-center gap-3">
                                    <HelpCircle className="text-admin-primary" size={20} />
                                    <div className="flex flex-col">
                                        <span className="text-[#181411] text-sm font-bold">顯示 Q&A 區塊</span>
                                        <span className="text-gray-400 text-[10px]">開啟首頁問答集</span>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={formData.show_qa || false}
                                        onChange={e => setFormData({ ...formData, show_qa: e.target.checked })}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-admin-primary"></div>
                                </label>
                            </div>
                        </div>

                        <label className="flex flex-col w-full gap-2">
                            <p className="text-[#181411] text-sm font-bold px-1">訂購連結 (URL)</p>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <LinkIcon size={18} />
                                </div>
                                <input
                                    className="flex w-full rounded-xl border border-[#e6e0db] bg-white h-12 pl-12 pr-4 focus:border-admin-primary focus:ring-1 focus:ring-admin-primary outline-none"
                                    value={formData.order_link || ''}
                                    onChange={e => setFormData({ ...formData, order_link: e.target.value })}
                                    placeholder="例如：https://order.page/julian"
                                />
                            </div>
                        </label>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] rounded-lg text-white shrink-0 shadow-sm">
                                    <Instagram size={20} />
                                </div>
                                <input
                                    className="flex w-full bg-transparent h-10 px-1 text-sm outline-none"
                                    value={formData.socials?.instagram || ''}
                                    onChange={e => setFormData({ ...formData, socials: { ...(formData.socials || {}), instagram: e.target.value } })}
                                    placeholder="Instagram Link"
                                />
                            </div>
                            <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                <div className="w-10 h-10 flex items-center justify-center bg-[#1877F2] rounded-lg text-white shrink-0 shadow-sm">
                                    <Facebook size={20} />
                                </div>
                                <input
                                    className="flex w-full bg-transparent h-10 px-1 text-sm outline-none"
                                    value={formData.socials?.facebook || ''}
                                    onChange={e => setFormData({ ...formData, socials: { ...(formData.socials || {}), facebook: e.target.value } })}
                                    placeholder="Facebook Link"
                                />
                            </div>
                            <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                <div className="w-10 h-10 flex items-center justify-center bg-[#06C755] rounded-lg text-white shrink-0 shadow-sm">
                                    <MessageCircle size={20} />
                                </div>
                                <input
                                    className="flex w-full bg-transparent h-10 px-1 text-sm outline-none"
                                    value={formData.socials?.line || ''}
                                    onChange={e => setFormData({ ...formData, socials: { ...(formData.socials || {}), line: e.target.value } })}
                                    placeholder="LINE ID"
                                />
                            </div>
                            <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                <div className="w-10 h-10 flex items-center justify-center bg-gray-600 rounded-lg text-white shrink-0 shadow-sm">
                                    <Mail size={20} />
                                </div>
                                <input
                                    type="email"
                                    className="flex w-full bg-transparent h-10 px-1 text-sm outline-none"
                                    value={formData.socials?.email || ''}
                                    onChange={e => setFormData({ ...formData, socials: { ...(formData.socials || {}), email: e.target.value } })}
                                    placeholder="Email Address"
                                />
                            </div>
                            <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                <div className="w-10 h-10 flex items-center justify-center bg-black rounded-lg text-white shrink-0 shadow-sm">
                                    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                                    </svg>
                                </div>
                                <input
                                    className="flex w-full bg-transparent h-10 px-1 text-sm outline-none"
                                    value={formData.socials?.tiktok || ''}
                                    onChange={e => setFormData({ ...formData, socials: { ...(formData.socials || {}), tiktok: e.target.value } })}
                                    placeholder="TikTok Link"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="sticky bottom-24 z-40 mt-10 -mx-4 md:-mx-8">
                <div className="bg-white/95 backdrop-blur-md border-t border-gray-100 px-4 md:px-8 py-4 shadow-[0_-10px_30px_-20px_rgba(0,0,0,0.35)]">
                    <button
                        onClick={handleSave}
                        disabled={isSubmitting}
                        className="w-full md:max-w-xs mx-auto bg-admin-primary text-white font-bold py-4 rounded-2xl shadow-xl active:scale-[0.98] transition-all motion-reduce:transition-none flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        <Save size={20} />
                        {isSubmitting ? '正在儲存中...' : '儲存主廚個人資料'}
                    </button>
                </div>
            </div>
        </AdminLayout>
    );
};
