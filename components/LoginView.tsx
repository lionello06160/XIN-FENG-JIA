import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

interface LoginViewProps {
    onLoginSuccess: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { data, error: authError } = await supabase
                .from('admin_auth')
                .select('*')
                .eq('username', username)
                .eq('password', password)
                .single();

            if (authError || !data) {
                setError('帳號或密碼錯誤');
            } else {
                // Simple success handling
                onLoginSuccess();
            }
        } catch (err) {
            setError('登入過程發生錯誤');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative flex h-screen w-full flex-col justify-center items-center overflow-hidden bg-[#221910] font-['Manrope']">
            {/* Background */}
            <div className="absolute inset-0 z-0">
                <div
                    className="w-full h-full bg-center bg-no-repeat bg-cover"
                    style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBi86jYbjNEvJP50S1kx5Dk6wHTzhn8tQnWIj3KcIdR7kp3zwPES50E0DKJkw9iSJk-y5GQHAQgBM52xoljV3CI0RVBFA_Ich4lP1dfKy5AcQeVSa2dinvfzWUAIdzgUjiA9rIXpDNOjXpxW3oxGcvchuN86wZGAW0nAK5_axiwESy8irN7QbH7haJmDGMcrasf5QKNJ9c8KbOOME6QVAvDUmhxbN19b7c5aOKyhB0W5lc72_MB56R-PmNiDA8RayumVWFbI3NGsDf_")' }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-[#221910]/80 to-[#221910]/95"></div>
            </div>

            <div className="relative z-10 w-full max-w-[480px] px-6 flex flex-col items-center">
                <div className="mb-10 text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-[#f27f0d]/10 rounded-full mb-6 border border-[#f27f0d]/20">
                        <span className="material-symbols-outlined text-[#f27f0d] text-5xl">restaurant_menu</span>
                    </div>
                    <h1 className="text-white tracking-tight text-3xl font-bold leading-tight px-4 text-center">
                        主廚管理系統
                    </h1>
                    <p className="text-[#baab9c] mt-2 text-sm font-light tracking-widest uppercase">Professional Chef Portal</p>
                </div>

                <div className="bg-[#221910]/85 backdrop-blur-xl border border-[#f27f0d]/10 w-full rounded-xl p-8 shadow-2xl">
                    <form className="space-y-6" onSubmit={handleLogin}>
                        <div className="flex flex-col gap-2">
                            <label className="flex flex-col flex-1">
                                <p className="text-white text-sm font-medium leading-normal pb-1 ml-1">帳號</p>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center text-[#f27f0d] pointer-events-none">
                                        <span className="material-symbols-outlined text-xl">account_circle</span>
                                    </div>
                                    <input
                                        className="flex w-full min-w-0 flex-1 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-[#f27f0d] border border-[#54473b] bg-[#221910]/50 h-14 placeholder:text-[#baab9c]/50 pl-12 pr-4 text-base font-normal leading-normal transition-all"
                                        placeholder="請輸入您的帳號"
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                    />
                                </div>
                            </label>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="flex flex-col flex-1">
                                <p className="text-white text-sm font-medium leading-normal pb-1 ml-1">密碼</p>
                                <div className="relative group w-full flex items-center">
                                    <div className="absolute left-4 flex items-center justify-center text-[#f27f0d] pointer-events-none z-10">
                                        <span className="material-symbols-outlined text-xl">lock</span>
                                    </div>
                                    <input
                                        className="flex w-full min-w-0 flex-1 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-[#f27f0d] border border-[#54473b] bg-[#221910]/50 h-14 placeholder:text-[#baab9c]/50 pl-12 pr-12 text-base font-normal leading-normal transition-all"
                                        placeholder="請輸入您的密碼"
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <div
                                        className="absolute right-4 flex items-center justify-center text-[#baab9c] cursor-pointer hover:text-white transition-colors z-10"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        <span className="material-symbols-outlined text-[22px]">
                                            {showPassword ? 'visibility_off' : 'visibility'}
                                        </span>
                                    </div>
                                </div>
                            </label>
                        </div>

                        {error && (
                            <p className="text-red-500 text-sm text-center font-medium animate-pulse">{error}</p>
                        )}

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-14 px-5 bg-[#f27f0d] text-[#221910] text-lg font-bold leading-normal tracking-wider transition-transform active:scale-95 shadow-lg shadow-[#f27f0d]/20 disabled:opacity-50"
                            >
                                <span className="truncate">{loading ? '登入中...' : '登入系統'}</span>
                            </button>
                        </div>
                    </form>
                </div>

                <div className="mt-12 text-center">
                    <p className="text-[#baab9c]/40 text-xs tracking-widest font-display">
                        PREMIUM CULINARY ENGINE v2.4.0
                    </p>
                    <div className="h-8"></div>
                </div>
            </div>
        </div>
    );
};
