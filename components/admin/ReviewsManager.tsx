
import React, { useState } from 'react';
import { Dish, DishReview } from '../../types';
import { StarRating } from '../StarRating';
import { formatRelativeTime, getRatingStats } from '../../lib/reviews';
import { Search, MessageSquareText, Clock, CheckCircle2, Trash, Loader2, Calendar } from 'lucide-react';
import { AdminLayout } from './AdminLayout';

export const ReviewsManager = ({
    reviews,
    dishes,
    onReplyReview,
    onUpdateReviewStatus,
    onDeleteReview
}: {
    reviews: DishReview[];
    dishes: Dish[];
    onReplyReview: (id: string, replyText: string) => Promise<void>;
    onUpdateReviewStatus: (id: string, status: 'pending' | 'published') => Promise<void>;
    onDeleteReview: (id: string) => Promise<void>;
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDishId, setSelectedDishId] = useState('all');
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'published'>('all');
    const [showDeleted, setShowDeleted] = useState(false);
    const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
    const [openReplies, setOpenReplies] = useState<Record<string, boolean>>({});
    const [pendingReplyId, setPendingReplyId] = useState<string | null>(null);
    const [pendingStatusId, setPendingStatusId] = useState<string | null>(null);
    const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

    const dishMap = React.useMemo(() => {
        const map: Record<string, Dish> = {};
        dishes.forEach((dish) => {
            map[dish.id] = dish;
        });
        return map;
    }, [dishes]);

    const sortedReviews = React.useMemo(() => {
        return [...reviews].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }, [reviews]);

    const normalizedSearch = searchTerm.trim().toLowerCase();
    const nonDeletedReviews = reviews.filter(review => !review.is_deleted);
    const publishedReviews = nonDeletedReviews.filter(review => review.status === 'published');
    const pendingReviews = nonDeletedReviews.filter(review => review.status !== 'published');
    const ratingStats = getRatingStats(publishedReviews);

    const filteredReviews = sortedReviews.filter((review) => {
        if (!showDeleted && review.is_deleted) return false;
        if (selectedDishId !== 'all' && review.dish_id !== selectedDishId) return false;
        if (statusFilter !== 'all') {
            const reviewStatus = review.status === 'published' ? 'published' : 'pending';
            if (statusFilter !== reviewStatus) return false;
        }
        if (!normalizedSearch) return true;
        const dishName = dishMap[review.dish_id]?.name || '';
        const haystack = `${review.name} ${review.comment} ${review.reply_text || ''} ${dishName}`.toLowerCase();
        return haystack.includes(normalizedSearch);
    });

    const handleReplySubmit = async (reviewId: string) => {
        const replyText = (replyDrafts[reviewId] ?? '').trim();
        if (replyText.length < 2) return;

        setPendingReplyId(reviewId);
        try {
            await onReplyReview(reviewId, replyText);
            setOpenReplies(prev => ({ ...prev, [reviewId]: false }));
        } catch (error) {
            alert('回覆失敗，請稍後再試');
        } finally {
            setPendingReplyId(null);
        }
    };

    const handleStatusChange = async (reviewId: string, status: 'pending' | 'published') => {
        setPendingStatusId(reviewId);
        try {
            await onUpdateReviewStatus(reviewId, status);
        } catch (error) {
            alert('狀態更新失敗，請稍後再試');
        } finally {
            setPendingStatusId(null);
        }
    };

    const handleDelete = async (reviewId: string) => {
        const confirmed = window.confirm('確定要刪除此評價嗎？刪除後前台將不再顯示。');
        if (!confirmed) return;

        setPendingDeleteId(reviewId);
        try {
            await onDeleteReview(reviewId);
        } catch (error) {
            alert('刪除失敗，請稍後再試');
        } finally {
            setPendingDeleteId(null);
        }
    };

    return (
        <AdminLayout title="評價管理">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-6">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-xs text-gray-400 font-semibold tracking-widest uppercase">總評價</p>
                    <p className="text-2xl font-bold text-[#181411] mt-2">{nonDeletedReviews.length}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-xs text-gray-400 font-semibold tracking-widest uppercase">待審評價</p>
                    <p className="text-2xl font-bold text-[#181411] mt-2">{pendingReviews.length}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-xs text-gray-400 font-semibold tracking-widest uppercase">平均星等 (已公開)</p>
                    <div className="mt-2 flex items-center gap-2">
                        <p className="text-2xl font-bold text-[#181411]">
                            {ratingStats.count ? ratingStats.average.toFixed(1) : '—'}
                        </p>
                        {ratingStats.count > 0 && <StarRating rating={ratingStats.average} size={14} />}
                    </div>
                </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-6">
                <div className="grid grid-cols-1 md:grid-cols-[1.1fr,0.9fr,0.6fr,auto] gap-3 items-center">
                    <div className="relative">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            className="w-full rounded-xl border border-[#e6e0db] bg-white h-12 pl-12 pr-4 text-sm focus:border-admin-primary focus:ring-1 focus:ring-admin-primary outline-none"
                            placeholder="搜尋姓名、評語或菜名"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        className="w-full rounded-xl border border-[#e6e0db] bg-white h-12 px-4 text-sm focus:border-admin-primary focus:ring-1 focus:ring-admin-primary outline-none"
                        value={selectedDishId}
                        onChange={e => setSelectedDishId(e.target.value)}
                    >
                        <option value="all">所有菜色</option>
                        {dishes.map(dish => (
                            <option key={dish.id} value={dish.id}>{dish.name}</option>
                        ))}
                    </select>
                    <select
                        className="w-full rounded-xl border border-[#e6e0db] bg-white h-12 px-4 text-sm focus:border-admin-primary focus:ring-1 focus:ring-admin-primary outline-none"
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value as 'all' | 'pending' | 'published')}
                    >
                        <option value="all">全部狀態</option>
                        <option value="pending">待審</option>
                        <option value="published">已公開</option>
                    </select>
                    <div className="flex items-center justify-between md:justify-end gap-3">
                        <span className="text-xs text-gray-400 font-medium">包含已刪除</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={showDeleted}
                                onChange={e => setShowDeleted(e.target.checked)}
                            />
                            <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gold"></div>
                        </label>
                    </div>
                </div>
            </div>

            <div className="space-y-4 pb-40">
                {filteredReviews.length === 0 && (
                    <div className="bg-white p-8 rounded-2xl border border-gray-100 text-center text-gray-400 text-sm">
                        目前沒有符合條件的評價
                    </div>
                )}

                {filteredReviews.map((review) => {
                    const dishName = dishMap[review.dish_id]?.name || '未知菜色';
                    const replyValue = replyDrafts[review.id] ?? review.reply_text ?? '';
                    const canReply = replyValue.trim().length >= 2;
                    const isReplyOpen = !!openReplies[review.id];
                    const isDeleting = pendingDeleteId === review.id;
                    const isReplying = pendingReplyId === review.id;
                    const isPublished = review.status === 'published';
                    const statusLabel = isPublished ? '已公開' : '待審';
                    const statusClass = isPublished
                        ? 'bg-admin-primary/10 text-admin-primary'
                        : 'bg-gray-100 text-gray-500';
                    const isStatusUpdating = pendingStatusId === review.id;

                    return (
                        <div
                            key={review.id}
                            className={`bg-white p-5 rounded-2xl border border-gray-100 shadow-sm ${review.is_deleted ? 'opacity-70' : ''}`}
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <StarRating rating={review.rating} size={14} />
                                        <span className="text-[#181411] font-bold">{review.name}</span>
                                        <span className="text-xs text-gray-400">{dishName}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                                        <Calendar size={14} />
                                        <span>{formatRelativeTime(review.created_at)}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {review.is_deleted ? (
                                        <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-red-50 text-red-500">已刪除</span>
                                    ) : (
                                        <>
                                            <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${statusClass}`}>{statusLabel}</span>
                                            <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${review.reply_text ? 'bg-gold/10 text-gold' : 'bg-gray-100 text-gray-400'}`}>
                                                {review.reply_text ? '已回覆' : '待回覆'}
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>

                            <p className="text-sm text-gray-600 mt-3 leading-relaxed">{review.comment}</p>

                            {review.reply_text && (
                                <div className="mt-3 border-l-2 border-gold/30 pl-3">
                                    <div className="text-xs font-semibold text-gold">主廚回覆</div>
                                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">{review.reply_text}</p>
                                    {review.replied_at && (
                                        <div className="text-[10px] text-gray-400 mt-1">
                                            {formatRelativeTime(review.replied_at)}
                                        </div>
                                    )}
                                </div>
                            )}

                            {!review.is_deleted && (
                                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <button
                                            onClick={() => setOpenReplies(prev => ({ ...prev, [review.id]: !prev[review.id] }))}
                                            className="flex items-center gap-2 text-sm font-bold text-admin-primary bg-admin-primary/10 px-4 py-2 rounded-lg hover:bg-admin-primary/20 transition-colors"
                                        >
                                            <MessageSquareText size={16} />
                                            {review.reply_text ? '編輯回覆' : '回覆'}
                                        </button>
                                        <button
                                            onClick={() => handleStatusChange(review.id, isPublished ? 'pending' : 'published')}
                                            disabled={isStatusUpdating}
                                            className={`flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-lg transition-colors disabled:opacity-50 ${isPublished ? 'bg-gray-100 text-gray-500 hover:bg-gray-200' : 'bg-admin-primary/10 text-admin-primary hover:bg-admin-primary/20'}`}
                                        >
                                            {isStatusUpdating ? (
                                                <Loader2 size={16} className="animate-spin" />
                                            ) : isPublished ? (
                                                <Clock size={16} />
                                            ) : (
                                                <CheckCircle2 size={16} />
                                            )}
                                            {isStatusUpdating ? '更新中...' : isPublished ? '退回待審' : '公開'}
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(review.id)}
                                        disabled={isDeleting}
                                        className="flex items-center gap-2 text-sm font-bold text-red-500 bg-red-50 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                                    >
                                        {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash size={16} />}
                                        {isDeleting ? '刪除中...' : '刪除'}
                                    </button>
                                </div>
                            )}

                            {!review.is_deleted && isReplyOpen && (
                                <div className="mt-4 bg-gray-50 border border-gray-100 rounded-xl p-4 space-y-3">
                                    <textarea
                                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-gold focus:ring-1 focus:ring-gold/40 min-h-[120px] resize-none"
                                        placeholder="輸入主廚回覆內容"
                                        value={replyValue}
                                        onChange={e => setReplyDrafts(prev => ({ ...prev, [review.id]: e.target.value }))}
                                    />
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] text-gray-400">至少 2 字</span>
                                        <button
                                            onClick={() => handleReplySubmit(review.id)}
                                            disabled={!canReply || isReplying}
                                            className="px-4 py-2 rounded-lg bg-gold text-black text-xs font-bold shadow-sm shadow-gold/20 disabled:opacity-40 disabled:cursor-not-allowed"
                                        >
                                            {isReplying ? '送出中...' : review.reply_text ? '更新回覆' : '送出回覆'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </AdminLayout>
    );
};
