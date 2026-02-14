
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Utensils, BarChart3, User, HelpCircle, MessageSquareText, Lock, ChevronLeft, Loader2 } from 'lucide-react';

const AdminBottomNav = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const navItems = [
        { label: '菜色管理', icon: Utensils, path: '/admin' },
        { label: '數據分析', icon: BarChart3, path: '/admin/analytics' },
        { label: '個人資料', icon: User, path: '/admin/profile' },
        { label: 'Q&A 管理', icon: HelpCircle, path: '/admin/qa' },
        { label: '評價管理', icon: MessageSquareText, path: '/admin/reviews' },
        { label: '帳號安全', icon: Lock, path: '/admin/security' },
    ];

    const handleHome = () => {
        navigate('/');
    };

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-[100] bg-white/95 backdrop-blur-md border-t border-gray-100 px-2 pb-safe-area-inset-bottom">
            <div className="max-w-6xl mx-auto flex items-center justify-between h-20">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path || (item.path === '/admin' && (location.pathname === '/admin' || location.pathname.startsWith('/admin/dish')));
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className="flex flex-col items-center justify-center flex-1 gap-1 group relative h-full"
                        >
                            <div className={`p-2 rounded-xl transition-all duration-300 ${isActive ? 'bg-admin-primary/10 scale-110 text-admin-primary' : 'text-[#8a7560] group-hover:bg-gray-50'
                                }`}>
                                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} className="transition-transform duration-300" />
                            </div>
                            <span className={`text-[10px] font-bold transition-colors duration-300 ${isActive ? 'text-admin-primary' : 'text-[#8a7560]'}`}>
                                {item.label}
                            </span>
                            {isActive && (
                                <div className="absolute bottom-1 w-1 h-1 bg-admin-primary rounded-full animate-in fade-in zoom-in duration-300" />
                            )}
                        </button>
                    );
                })}
                <button
                    onClick={handleHome}
                    className="flex flex-col items-center justify-center flex-1 gap-1 text-[#8a7560] group relative h-full"
                >
                    <div className="p-2 rounded-xl transition-all group-hover:bg-gray-50 group-hover:scale-110 group-hover:text-admin-primary">
                        <Home size={20} />
                    </div>
                    <span className="text-[10px] font-bold group-hover:text-admin-primary transition-colors">首頁</span>
                </button>
            </div>
        </nav>
    );
};

export const AdminLayout = ({ children, title, backTo, leftAction, rightAction }: { children?: React.ReactNode, title: string, backTo?: string, leftAction?: React.ReactNode, rightAction?: React.ReactNode }) => {
    const navigate = useNavigate();
    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col bg-admin-bg font-sans text-[#181411]">
            <header className="sticky top-0 z-50 flex items-center bg-white/95 backdrop-blur-md p-4 pb-2 justify-between border-b border-gray-100">
                <div className="flex size-12 shrink-0 items-center">
                    {leftAction ? (
                        leftAction
                    ) : backTo ? (
                        <button onClick={() => navigate(backTo)} className="text-[#181411] flex size-12 shrink-0 items-center justify-center hover:bg-gray-50 rounded-full">
                            <ChevronLeft />
                        </button>
                    ) : (
                        // Placeholder for logo or spacing
                        <div className="w-12"></div>
                    )}
                </div>
                <div className="flex flex-col flex-1 px-2 items-center text-center">
                    <h2 className="text-[#181411] text-lg font-bold leading-tight tracking-[-0.015em] truncate w-full">
                        {title}
                    </h2>
                    {title.includes("管理後台") && (
                        <p className="text-[#8a7560] text-xs font-medium uppercase tracking-wider">主廚管理控制台</p>
                    )}
                </div>
                <div className="flex w-12 items-center justify-center">
                    {rightAction || <div className="w-12"></div>}
                </div>
            </header>
            <main className="flex-1 w-full max-w-6xl mx-auto overflow-y-auto pb-32 px-4 md:px-8">
                {children}
            </main>
            <AdminBottomNav />
        </div>
    );
};
