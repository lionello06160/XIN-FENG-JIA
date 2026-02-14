
import React from 'react';
import { Dish } from '../../types';
import { supabase } from '../../lib/supabase';
import { AdminLayout } from './AdminLayout';
import { Loader2 } from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

export const AnalyticsDashboard = ({ dishes }: { dishes: Dish[] }) => {
    const [events, setEvents] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [timeRange, setTimeRange] = React.useState<'day' | 'month' | 'year'>('day');

    React.useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('analytics_events')
            .select('*')
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching analytics:', error);
        } else {
            setEvents(data || []);
        }
        setLoading(false);
    };

    const processChartData = () => {
        const counts: Record<string, { pageViews: number; dishClicks: number }> = {};

        events.forEach(event => {
            const date = new Date(event.created_at);
            let key = '';

            if (timeRange === 'day') {
                key = date.toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' });
            } else if (timeRange === 'month') {
                key = date.toLocaleDateString('zh-TW', { year: 'numeric', month: 'numeric' });
            } else {
                key = date.getFullYear().toString();
            }

            if (!counts[key]) counts[key] = { pageViews: 0, dishClicks: 0 };
            if (event.event_type === 'page_view') counts[key].pageViews++;
            if (event.event_type === 'dish_click') counts[key].dishClicks++;
        });

        return Object.entries(counts).map(([name, data]) => ({ name, ...data }));
    };

    const getDishStats = () => {
        const stats: Record<string, number> = {};
        events.forEach(event => {
            if (event.event_type === 'dish_click' && event.dish_id) {
                stats[event.dish_id] = (stats[event.dish_id] || 0) + 1;
            }
        });

        const rankedDishes = dishes.map(dish => ({
            id: dish.id,
            name: dish.name,
            count: stats[dish.id] || 0,
            orderIndex: dish.order_index ?? 0
        }));

        const unknownDishes = Object.entries(stats)
            .filter(([id]) => !dishes.find(dish => dish.id === id))
            .map(([id, count]) => ({
                id,
                name: '未知菜色',
                count,
                orderIndex: Number.MAX_SAFE_INTEGER
            }));

        return [...rankedDishes, ...unknownDishes].sort((a, b) => {
            if (b.count !== a.count) return b.count - a.count;
            if (a.orderIndex !== b.orderIndex) return a.orderIndex - b.orderIndex;
            return a.name.localeCompare(b.name, 'zh-Hant');
        });
    };

    const chartData = processChartData();
    const dishStats = getDishStats();

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-admin-bg">
                <Loader2 className="animate-spin text-admin-primary" size={48} />
            </div>
        );
    }

    return (
        <AdminLayout title="數據分析報表">
            <main className="max-w-6xl mx-auto p-4 md:p-8 flex flex-col lg:grid lg:grid-cols-2 gap-6 pb-24">
                {/* Time Range Selector */}
                <div className="col-span-full">
                    <div className="flex bg-white p-1 rounded-xl border border-gray-100 shadow-sm">
                        {(['day', 'month', 'year'] as const).map(range => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range)}
                                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${timeRange === range ? 'bg-admin-primary text-white' : 'text-gray-400 hover:text-[#181411]'
                                    }`}
                            >
                                {range === 'day' ? '日' : range === 'month' ? '月' : '年'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Global Stats Chart */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">流量趨勢</h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#8a7560' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#8a7560' }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
                                />
                                <Legend verticalAlign="top" align="right" height={40} iconType="circle" />
                                <Line name="瀏覽量" type="monotone" dataKey="pageViews" stroke="#a67c52" strokeWidth={3} dot={{ r: 4, fill: '#a67c52' }} activeDot={{ r: 6 }} />
                                <Line name="點擊數" type="monotone" dataKey="dishClicks" stroke="#181411" strokeWidth={3} dot={{ r: 4, fill: '#181411' }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Dish Ranking */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">熱門菜色排名</h3>
                    <div className="flex flex-col gap-4">
                        {dishStats.map((stat, idx) => (
                            <div key={stat.id} className="flex items-center gap-4">
                                <span className={`text-sm font-black w-6 ${idx < 3 ? 'text-admin-primary' : 'text-gray-300'}`}>{String(idx + 1).padStart(2, '0')}</span>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between mb-1">
                                        <span className="text-sm font-bold truncate">{stat.name}</span>
                                        <span className="text-sm font-bold">{stat.count} 次點擊</span>
                                    </div>
                                    <div className="w-full bg-gray-50 h-2 rounded-full overflow-hidden">
                                        <div
                                            className="bg-admin-primary h-full rounded-full transition-all duration-1000"
                                            style={{ width: `${dishStats[0]?.count ? (stat.count / dishStats[0].count) * 100 : 0}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {dishStats.length === 0 && (
                            <div className="text-center py-8 text-gray-400 text-sm italic">暫無點擊數據</div>
                        )}
                    </div>
                </div>
            </main>
        </AdminLayout>
    );
};
