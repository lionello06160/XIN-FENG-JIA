
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Utensils, BarChart3, User, HelpCircle, MessageSquareText, Lock, ChevronLeft, Loader2 } from 'lucide-react';

const AdminNavIcons: React.FC<{ isActive: boolean, icon: any, label: string, onClick: () => void }> = ({ isActive, icon: Icon, label, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-3 w-full p-3 rounded-2xl transition-all duration-300 group
            ${isActive ? 'bg-admin-primary/10 text-admin-primary lg:px-4' : 'text-[#8a7560] hover:bg-gray-50'}`}
    >
        <div className={`p-2 rounded-xl transition-all duration-300 ${isActive ? 'bg-admin-primary/20 scale-110' : 'group-hover:bg-gray-100'}`}>
            <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
        </div>
        <span className={`text-sm font-bold transition-opacity duration-300 lg:block hidden ${isActive ? 'opacity-100' : 'opacity-80 group-hover:opacity-100'}`}>
            {label}
        </span>
        {isActive && (
            <div className="absolute left-0 w-1 h-8 bg-admin-primary rounded-r-full lg:block hidden" />
        )}
    </button>
);

const AdminNav = () => {
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

    const checkActive = (path: string) => 
        location.pathname === path || (path === '/admin' && (location.pathname === '/admin' || location.pathname.startsWith('/admin/dish')));

    return (
        <aside>
            {/* Desktop Sidebar */}
            <nav className="fixed left-0 top-0 bottom-0 z-50 w-24 lg:w-64 bg-white border-r border-gray-100 hidden md:flex flex-col p-4">
                <div className="flex items-center gap-3 px-2 py-8 mb-4 border-b border-gray-50 lg:justify-start justify-center">
                    <div className="bg-admin-primary rounded-xl p-2.5 text-white shadow-lg shadow-admin-primary/20">
                        <Utensils size={24} />
                    </div>
                    <div className="lg:flex flex-col hidden">
                        <span className="text-[#181411] font-black text-lg tracking-tight">鑫蘴家</span>
                        <span className="text-[#8a7560] text-[10px] font-bold uppercase tracking-widest">管理後台</span>
                    </div>
                </div>

                <div className="flex flex-col gap-2 flex-1">
                    {navItems.map((item) => (
                        <AdminNavIcons
                            key={item.path}
                            icon={item.icon}
                            label={item.label}
                            isActive={checkActive(item.path)}
                            onClick={() => navigate(item.path)}
                        />
                    ))}
                </div>

                <div className="pt-4 border-t border-gray-50">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-3 w-full p-3 rounded-2xl text-[#8a7560] hover:bg-gray-50 transition-all group lg:justify-start justify-center"
                    >
                        <div className="p-2 rounded-xl group-hover:bg-gray-100 transition-all">
                            <Home size={20} />
                        </div>
                        <span className="text-sm font-bold lg:block hidden">返回首頁</span>
                    </button>
                </div>
            </nav>

            {/* Mobile Bottom Nav */}
            <nav className="fixed bottom-0 left-0 right-0 z-[100] bg-white/95 backdrop-blur-md border-t border-gray-100 px-2 pb-safe-area-inset-bottom overflow-x-auto no-scrollbar md:hidden">
                <div className="flex items-center justify-between h-20 min-w-max gap-1 px-4">
                    {navItems.map((item) => {
                        const isActive = checkActive(item.path);
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                className="flex flex-col items-center justify-center px-3 gap-1 group relative h-full min-w-[72px]"
                            >
                                <div className={`p-2 rounded-xl transition-all duration-300 ${isActive ? 'bg-admin-primary/10 scale-110 text-admin-primary' : 'text-[#8a7560]'}`}>
                                    <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                                </div>
                                <span className={`text-[10px] font-bold ${isActive ? 'text-admin-primary' : 'text-[#8a7560]'}`}>
                                    {item.label}
                                </span>
                            </button>
                        );
                    })}
                    <button
                        onClick={() => navigate('/')}
                        className="flex flex-col items-center justify-center px-3 gap-1 text-[#8a7560] h-full min-w-[72px]"
                    >
                        <div className="p-2 rounded-xl">
                            <Home size={20} />
                        </div>
                        <span className="text-[10px] font-bold">首頁</span>
                    </button>
                </div>
            </nav>
        </aside>
    );
};

export const AdminLayout = ({ children, title, backTo, leftAction, rightAction }: { children?: React.ReactNode, title: string, backTo?: string, leftAction?: React.ReactNode, rightAction?: React.ReactNode }) => {
    const navigate = useNavigate();
    return (
        <div className="relative flex h-screen w-full bg-admin-bg font-sans text-[#181411] overflow-hidden">
            <AdminNav />
            
            <div className="flex-1 flex flex-col min-w-0 md:ml-24 lg:ml-64 transition-all duration-300">
                <header className="sticky top-0 z-40 flex items-center bg-white/95 backdrop-blur-md p-4 lg:p-6 justify-between border-b border-gray-100">
                    <div className="flex size-12 shrink-0 items-center">
                        {leftAction ? (
                            leftAction
                        ) : backTo ? (
                            <button onClick={() => navigate(backTo)} className="text-[#181411] flex size-12 shrink-0 items-center justify-center hover:bg-gray-50 rounded-xl transition-colors">
                                <ChevronLeft />
                            </button>
                        ) : (
                            // Mobile only brand reveal
                            <div className="md:hidden flex items-center gap-2">
                                <div className="bg-admin-primary rounded-lg p-1.5 text-white">
                                    <Utensils size={18} />
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <div className="flex flex-col flex-1 px-4 items-center md:items-start text-center md:text-left">
                        <h2 className="text-[#181411] text-lg lg:text-xl font-black leading-tight tracking-tight">
                            {title}
                        </h2>
                        {title.includes("管理後台") && (
                            <p className="text-[#8a7560] text-[10px] font-bold uppercase tracking-widest mt-0.5">主廚管理控制台</p>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        {rightAction}
                        <div className="md:hidden w-2"></div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto pb-32 md:pb-8 p-4 md:p-8 lg:p-10">
                    <div className="max-w-6xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};
