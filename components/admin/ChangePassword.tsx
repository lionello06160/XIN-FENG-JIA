
import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Lock, Eye, EyeOff, Save, Loader2, ShieldCheck } from 'lucide-react';
import { AdminLayout } from './AdminLayout';

export const ChangePassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState({ type: '', content: '' });

    const handleUpdatePassword = async () => {
        if (password !== confirmPassword) {
            setMessage({ type: 'error', content: '兩次輸入的密碼不一致' });
            return;
        }
        if (password.length < 6) {
            setMessage({ type: 'error', content: '密碼長度需至少 6 碼' });
            return;
        }

        setLoading(true);
        setMessage({ type: '', content: '' });

        const { error } = await supabase.auth.updateUser({ password });

        if (error) {
            setMessage({ type: 'error', content: error.message });
        } else {
            setMessage({ type: 'success', content: '密碼已成功更新！' });
            setPassword('');
            setConfirmPassword('');
        }
        setLoading(false);
    };

    return (
        <AdminLayout title="帳號安全設定">
            <div className="max-w-xl mx-auto py-10 px-4">
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center">
                    <div className="w-16 h-16 bg-admin-primary/10 rounded-full flex items-center justify-center text-admin-primary mb-6">
                        <ShieldCheck size={32} />
                    </div>

                    <h3 className="text-[#181411] text-xl font-bold mb-2">更改管理員密碼</h3>
                    <p className="text-gray-400 text-sm mb-8 text-center">為了您的帳號安全，建議定期更換高強度的密碼。</p>

                    <div className="w-full space-y-6">
                        <div className="space-y-4">
                            <label className="flex flex-col w-full gap-2">
                                <p className="text-[#181411] text-sm font-bold px-1">新密碼</p>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        className="flex w-full rounded-xl border border-[#e6e0db] bg-white h-12 pl-12 pr-12 focus:border-admin-primary focus:ring-1 focus:ring-admin-primary outline-none transition-all"
                                        placeholder="輸入新密碼"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </label>

                            <label className="flex flex-col w-full gap-2">
                                <p className="text-[#181411] text-sm font-bold px-1">確認新密碼</p>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        className="flex w-full rounded-xl border border-[#e6e0db] bg-white h-12 pl-12 pr-12 focus:border-admin-primary focus:ring-1 focus:ring-admin-primary outline-none transition-all"
                                        placeholder="再次輸入新密碼"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                </div>
                            </label>
                        </div>

                        {message.content && (
                            <div className={`p-4 rounded-xl text-sm font-bold text-center animate-in fade-in slide-in-from-top-2 ${message.type === 'error' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'
                                }`}>
                                {message.content}
                            </div>
                        )}

                        <button
                            onClick={handleUpdatePassword}
                            disabled={loading}
                            className="w-full bg-admin-primary text-white font-bold h-14 rounded-xl shadow-lg shadow-admin-primary/20 hover:scale-[0.99] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                            <span>{loading ? '更新中...' : '確認修改'}</span>
                        </button>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};
