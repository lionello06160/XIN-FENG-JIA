import React, { useState } from 'react';
import { ChefProfile, Dish, QAItem, DishReview } from '../types';
import { QASection } from './QASection';
import { StarRating } from './StarRating';
import { formatRelativeTime, getRatingStats } from '../lib/reviews';
import { Camera, Globe, Mail, Utensils, User, X, CheckCircle, Clock, Instagram, Facebook, MessageCircle, ShoppingCart, Sparkles, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { trackEvent } from '../lib/supabase';

interface ClientViewProps {
  chefProfile: ChefProfile;
  dishes: Dish[];
  qaItems: QAItem[];
  reviews: DishReview[];
  onAddReview: (dishId: string, review: { name: string; rating: number; comment: string }) => Promise<void>;
}




const ratingLabels: Record<number, string> = {
  1: '需要改進',
  2: '尚可',
  3: '不錯',
  4: '很滿意',
  5: '極致滿意'
};

const DishModal = ({
  dish,
  reviews,
  showReviews,
  onAddReview,
  onClose
}: {
  dish: Dish;
  reviews: DishReview[];
  showReviews: boolean;
  onAddReview: (dishId: string, review: { name: string; rating: number; comment: string }) => Promise<void>;
  onClose: () => void;
}) => {
  if (!dish) return null;
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewerName, setReviewerName] = useState('');
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [visibleCount, setVisibleCount] = useState(3);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  React.useEffect(() => {
    setRating(0);
    setHoverRating(0);
    setReviewerName('');
    setComment('');
    setSubmitted(false);
    setSubmitError('');
    setIsSubmitting(false);
    setVisibleCount(3);
    setIsLoadingMore(false);
  }, [dish.id]);

  const ratingStats = getRatingStats(reviews);
  const averageDisplay = ratingStats.count ? ratingStats.average.toFixed(1) : '—';
  const ratingLabel = ratingLabels[hoverRating || rating] || '點選星等';
  const canSubmit = rating > 0 && reviewerName.trim().length >= 2 && comment.trim().length >= 6;
  const maxRatingCount = Math.max(1, ...ratingStats.ratingCounts);
  const latestReviews = [...reviews]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const visibleReviews = latestReviews.slice(0, visibleCount);
  const hasMoreReviews = visibleCount < latestReviews.length;

  const handleLoadMore = () => {
    if (!hasMoreReviews || isLoadingMore) return;
    setIsLoadingMore(true);
    window.setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + 3, latestReviews.length));
      setIsLoadingMore(false);
    }, 350);
  };

  const handleSubmitReview = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    setIsSubmitting(true);
    setSubmitError('');

    try {
      await onAddReview(dish.id, {
        name: reviewerName.trim(),
        rating,
        comment: comment.trim()
      });
      setSubmitted(true);
      setReviewerName('');
      setComment('');
      setRating(0);
      setHoverRating(0);
      window.setTimeout(() => setSubmitted(false), 1600);
    } catch (error) {
      setSubmitError('送出失敗，請稍後再試');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-white dark:bg-[#2d241a] rounded-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-zoom-in duration-300 motion-reduce:animate-none motion-reduce:transition-none" role="dialog" aria-modal="true" aria-label={`${dish.name} 詳細內容`}>

        {/* Close Button */}
        <div className="absolute top-4 right-4 z-30">
          <button onClick={onClose} className="flex items-center justify-center w-10 h-10 rounded-full bg-black/20 backdrop-blur-md text-white border border-white/20 transition-colors motion-reduce:transition-none hover:bg-black/40">
            <X size={20} />
          </button>
        </div>

        {/* Hero Image */}
        <div className="relative w-full aspect-[4/3] shrink-0 overflow-hidden">
          <img
            src={dish.image}
            alt={`菜色圖片：${dish.name}`}
            className="w-full h-full object-cover animate-scale-down"
            style={{ animationDuration: '1.5s' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 bg-white">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {dish.available ? (
                <div className="flex items-center gap-2 px-3 py-1 bg-admin-primary/10 rounded-full">
                  <div className="w-2 h-2 rounded-full bg-admin-primary"></div>
                  <span className="text-admin-primary text-xs font-bold tracking-wider uppercase">目前可預訂</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-1 bg-red-500/10 rounded-full border border-red-500/20">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <span className="text-red-500 text-xs font-bold tracking-wider uppercase">售罄</span>
                </div>
              )}
              {dish.is_new && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-gold/10 rounded-full border border-gold/20">
                  <Sparkles size={12} className="text-gold" />
                  <span className="text-gold text-xs font-bold tracking-wider uppercase">新品上市</span>
                </div>
              )}
            </div>
          </div>

          <div className="mb-6 animate-fade-in-up" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
            <div className="flex items-center gap-2">
              <h1 className="text-[#181411] text-3xl font-bold leading-tight font-display">{dish.name}</h1>
              {!!dish.spiciness && dish.spiciness > 0 && (
                <div className="flex gap-0.5 mb-1">
                  {Array.from({ length: dish.spiciness }).map((_, i) => (
                    <span key={i} className="text-xl">🌶️</span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-admin-primary text-2xl font-bold">NT$ {dish.price.toLocaleString()}</span>
              {dish.originalPrice && (
                <span className="text-gray-400 text-sm line-through">NT$ {dish.originalPrice.toLocaleString()}</span>
              )}
            </div>
          </div>

          <div className="h-px bg-gray-100 mb-6"></div>

          <div className="space-y-8 pb-8">
            <section className="animate-fade-in-up" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
              <h3 className="text-[#181411] font-bold text-lg mb-3 flex items-center gap-2">
                <Utensils className="text-admin-primary" size={20} />
                主廚靈感
              </h3>
              <p className="text-gray-600 leading-relaxed text-base">
                {dish.inspiration || dish.description}
              </p>
            </section>

            <section className="animate-fade-in-up" style={{ animationDelay: '300ms', animationFillMode: 'both' }}>
              <h3 className="text-[#181411] font-bold text-lg mb-3 flex items-center gap-2">
                <CheckCircle className="text-admin-primary" size={20} />
                嚴選食材
              </h3>
              <ul className="grid grid-cols-2 gap-3">
                {dish.ingredients.map((ing, idx) => (
                  <li key={idx} className="flex items-center gap-2 bg-admin-bg p-3 rounded-lg border border-gray-100">
                    <CheckCircle className="text-gray-400" size={16} />
                    <span className="text-sm text-gray-700">{ing}</span>
                  </li>
                ))}
              </ul>
            </section>

            {showReviews && (
              <section className="animate-fade-in-up" style={{ animationDelay: '400ms', animationFillMode: 'both' }}>
                <h3 className="text-[#181411] font-bold text-lg mb-3 flex items-center gap-2">
                  <Star className="text-gold" size={20} />
                  食客評價
                </h3>

                <div className="bg-admin-bg border border-gray-100 rounded-xl p-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-[auto,1fr] gap-4 items-center">
                    <div>
                      <div className="text-3xl font-bold text-[#181411]">{averageDisplay}</div>
                      <StarRating rating={ratingStats.average} size={16} />
                      <div className="text-xs text-gray-500 mt-1">
                        {ratingStats.count ? `${ratingStats.count} 則評價` : '尚無評價'}
                      </div>
                    </div>
                    <div className="space-y-2">
                      {[5, 4, 3, 2, 1].map((star) => {
                        const count = ratingStats.ratingCounts[star - 1] || 0;
                        const width = (count / maxRatingCount) * 100;
                        return (
                          <div key={star} className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-gray-500 w-10">{star} 星</span>
                            <div className="flex-1 h-2 bg-white rounded-full border border-gray-100 overflow-hidden">
                              <div
                                className="h-full bg-gold/70 transition-all duration-500 motion-reduce:transition-none"
                                style={{ width: `${width}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-400 w-6 text-right">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <form className="mt-4 space-y-4" onSubmit={handleSubmitReview}>
                  <div className="space-y-2">
                    <div className="text-sm font-semibold text-[#181411]">評分</div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1" role="radiogroup" aria-label="評分">
                        {[1, 2, 3, 4, 5].map((value) => {
                          const activeRating = hoverRating || rating;
                          const isActive = value <= activeRating;
                          return (
                            <button
                              key={value}
                              type="button"
                              role="radio"
                              aria-checked={rating === value}
                              className="p-1 rounded-md transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
                              onMouseEnter={() => setHoverRating(value)}
                              onMouseLeave={() => setHoverRating(0)}
                              onFocus={() => setHoverRating(value)}
                              onBlur={() => setHoverRating(0)}
                              onClick={() => setRating(value)}
                            >
                              <Star size={20} className={isActive ? 'text-gold' : 'text-gold/30'} fill={isActive ? 'currentColor' : 'none'} />
                            </button>
                          );
                        })}
                      </div>
                      <span className="text-xs text-gray-500">{ratingLabel}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <label className="flex flex-col gap-2">
                      <span className="text-sm font-semibold text-[#181411]">姓名</span>
                      <input
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-[#181411] placeholder:text-gray-400 outline-none focus:border-gold focus:ring-1 focus:ring-gold/40"
                        placeholder="請輸入姓名"
                        value={reviewerName}
                        onChange={(event) => setReviewerName(event.target.value)}
                      />
                    </label>
                    <label className="flex flex-col gap-2 md:col-span-2">
                      <span className="text-sm font-semibold text-[#181411]">評語</span>
                      <textarea
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-[#181411] placeholder:text-gray-400 outline-none focus:border-gold focus:ring-1 focus:ring-gold/40 min-h-[120px] resize-none"
                        placeholder="分享您對這道料理的感受"
                        value={comment}
                        onChange={(event) => setComment(event.target.value)}
                      />
                    </label>
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <span className="text-xs text-gray-500">請填寫 2 字以上姓名與 6 字以上評語</span>
                    <div className="flex items-center gap-3">
                      {submitError && (
                        <span className="text-xs text-red-500 font-semibold">{submitError}</span>
                      )}
                      {submitted && !submitError && (
                        <span className="text-xs text-green-600 font-semibold">已送出，待審核後顯示</span>
                      )}
                      <button
                        type="submit"
                        disabled={!canSubmit || isSubmitting}
                        className="px-5 py-2 rounded-lg bg-gold text-black text-sm font-bold shadow-sm shadow-gold/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all motion-reduce:transition-none"
                      >
                        {isSubmitting ? '送出中...' : '送出評價'}
                      </button>
                    </div>
                  </div>
                </form>

                <div className="mt-6 space-y-3">
                  <div className="text-sm font-semibold text-[#181411]">最新評價</div>
                  {latestReviews.length ? (
                    <>
                      <div className="text-[11px] text-gray-400">
                        已顯示 {Math.min(visibleReviews.length, latestReviews.length)} / {latestReviews.length}
                      </div>
                      {visibleReviews.map((review, idx) => (
                        <div key={review.id} className="bg-admin-bg border border-gray-100 rounded-xl p-4 animate-fade-in-up" style={{ animationDelay: `${idx * 100 + 500}ms`, animationFillMode: 'both' }}>
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <StarRating rating={review.rating} size={14} />
                              <span className="text-sm font-semibold text-[#181411]">{review.name}</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-400">
                              <Clock size={14} />
                              <span>{formatRelativeTime(review.created_at)}</span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mt-2 leading-relaxed">{review.comment}</p>
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
                        </div>
                      ))}
                      {hasMoreReviews && (
                        <div className="flex justify-center pt-2">
                          <button
                            type="button"
                            onClick={handleLoadMore}
                            disabled={isLoadingMore}
                            className="px-4 py-2 text-xs font-bold text-gold bg-gold/10 rounded-full border border-gold/30 hover:bg-gold hover:text-black transition-all disabled:opacity-50"
                          >
                            {isLoadingMore ? '載入中...' : '載入更多'}
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-sm text-gray-400">成為第一位評論的人</div>
                  )}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const ClientView: React.FC<ClientViewProps> = ({ chefProfile, dishes, qaItems, reviews, onAddReview }) => {
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const showOrderCta = chefProfile.show_order_button && !!chefProfile.order_link;
  const showCtaBlock = chefProfile.show_cta !== false;
  const showReviews = chefProfile.show_reviews !== false;

  React.useEffect(() => {
    trackEvent('page_view');
  }, []);

  const handleDishClick = (dish: Dish) => {
    setSelectedDish(dish);
    trackEvent('dish_click', dish.id);
  };

  const reviewsByDish = React.useMemo(() => {
    const grouped: Record<string, DishReview[]> = {};
    reviews.forEach((review) => {
      if (review.is_deleted) return;
      if (review.status !== 'published') return;
      if (!grouped[review.dish_id]) grouped[review.dish_id] = [];
      grouped[review.dish_id].push(review);
    });
    return grouped;
  }, [reviews]);

  const getReviewsForDish = (dishId: string) => reviewsByDish[dishId] || [];

  return (
    <div className="min-h-screen bg-luxury-dark text-white font-sans selection:bg-gold selection:text-black">
      {/* Sticky Navigation */}
      <nav className="sticky top-0 z-40 bg-luxury-dark/90 backdrop-blur-md border-b border-gold/20">
        <div className="flex items-center p-4 justify-between max-w-6xl mx-auto">
          <div className="text-gold flex w-10 md:w-32 shrink-0 items-center justify-center md:justify-start">
            <Utensils size={24} />
          </div>
          <h1 className="text-gold text-lg md:text-xl font-bold leading-tight tracking-widest flex-1 text-center uppercase">
            {chefProfile.store_name || '鑫蘴家'}
          </h1>
          <div className="flex w-10 md:w-32 items-center justify-end">
            <Link to="/admin" className="text-gold hover:text-white transition-colors">
              <User size={24} />
            </Link>
          </div>
        </div>
      </nav>

      <main className={`max-w-6xl mx-auto ${showOrderCta ? 'pb-24' : 'pb-12'} px-4 md:px-8`}>

        {/* Hero Section */}
        <div className="py-6 md:py-10 animate-fade-in">
          <div
            className="relative flex flex-col justify-end overflow-hidden rounded-2xl min-h-[420px] md:min-h-[500px] shadow-2xl border border-gold/10 isolate"
          >
            {/* Background Image */}
            <img
              src={chefProfile.image}
              alt={`主廚形象照：${chefProfile.name}`}
              className="absolute inset-0 w-full h-full object-cover animate-zoom-in -z-10"
              style={{
                animationDuration: '1.5s',
                objectPosition: 'center 20%'
              }}
              // @ts-ignore - React 19 / Modern browsers support this
              fetchPriority="high"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/40 to-transparent -z-10"></div>

            <div className="flex flex-col p-6 md:p-12 gap-3 md:max-w-2xl animate-fade-in-up" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
              <h2 className="text-white text-4xl md:text-5xl font-black leading-tight drop-shadow-md font-display">{chefProfile.name}</h2>
              {chefProfile.title && (
                <p className="text-gold/90 text-sm md:text-base font-semibold tracking-[0.2em] uppercase">
                  {chefProfile.title}
                </p>
              )}
              <p className="text-white/80 text-sm md:text-base font-light leading-relaxed max-w-md">
                {chefProfile.bio}
              </p>
            </div>
          </div>
        </div>

        {/* Menu Section Header */}
        <div className="flex items-center justify-center gap-6 px-4 pt-8 pb-4">
          <div className="h-[1px] flex-1 bg-gold/30 rounded-full"></div>
          <h3 className="text-white text-2xl font-bold tracking-[0.2em] text-center whitespace-nowrap uppercase font-display">主廚精選</h3>
          <div className="h-[1px] flex-1 bg-gold/30 rounded-full"></div>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 py-4">
          {dishes.map((dish, index) => {
            const reviews = getReviewsForDish(dish.id);
            const ratingStats = getRatingStats(reviews);
            const showDishReviews = showReviews && dish.show_reviews !== false;
            return (
              <div
                key={dish.id}
                className="flex flex-col bg-luxury-card rounded-2xl overflow-hidden border border-white/5 shadow-lg group animate-fade-in-up"
                style={{ animationDelay: `${index * 150}ms`, animationFillMode: 'both' }}
              >
                <div className="relative aspect-[16/9] overflow-hidden">
                  <img
                    src={dish.image}
                    alt={`菜色圖片：${dish.name}`}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 motion-reduce:transition-none"
                  />
                  {dish.is_new && (
                    <div className="absolute top-3 left-3 bg-white/20 backdrop-blur-md border border-white/30 px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-xl animate-fade-in motion-reduce:animate-none">
                      <span className="text-xs font-bold text-white drop-shadow-md tracking-wider">✨ 新品上市</span>
                    </div>
                  )}
                  {!dish.available && (
                    <div className="absolute top-3 right-3 bg-red-600/90 text-white text-xs font-bold px-3 py-1.5 rounded-full border-2 border-gold/70 shadow-lg">
                      已售罄
                    </div>
                  )}
                </div>
                <div className="p-4 flex flex-col gap-3 relative bg-luxury-card">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] text-gold font-bold tracking-widest uppercase mb-1 block">名稱</span>
                      <div className="flex items-center gap-2">
                        <p className="text-white text-lg font-bold leading-tight">{dish.name}</p>
                        {!!dish.spiciness && dish.spiciness > 0 && (
                          <div className="flex gap-0.5">
                            {Array.from({ length: dish.spiciness }).map((_, i) => (
                              <span key={i} className="text-sm">🌶️</span>
                            ))}
                          </div>
                        )}
                      </div>
                      {showDishReviews && (
                        <div className="mt-1">
                          {ratingStats.count ? (
                            <div className="flex items-center gap-2 text-xs text-white/80">
                              <StarRating rating={ratingStats.average} size={14} />
                              <span className="font-semibold text-white">{ratingStats.average.toFixed(1)}</span>
                              <span className="text-white/50">({ratingStats.count})</span>
                            </div>
                          ) : (
                            <span className="text-[10px] text-white/40">尚無評價</span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-gold font-bold tracking-widest uppercase mb-1 block">價格</span>
                      <p className="text-gold font-bold text-lg">NT$ {dish.price.toLocaleString()}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDishClick(dish)}
                    className="w-full py-3 bg-gold/10 border border-gold/30 text-gold rounded-xl text-sm font-bold active:bg-gold active:text-black hover:bg-gold hover:text-black transition-all motion-reduce:transition-none"
                  >
                    查看詳情
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA Section */}
        {showCtaBlock && (
          <div className="px-4 py-8">
            <div className="bg-gold/5 rounded-2xl p-8 border border-gold/20 flex flex-col items-center text-center">
              <h4 className="text-xl font-bold mb-3 text-gold">{chefProfile.cta_title}</h4>
              <p className="text-sm text-white/80">{chefProfile.cta_description}</p>
            </div>
          </div>
        )}

        {showOrderCta && (
          <div className={`px-2 ${showCtaBlock ? 'pt-0 md:pt-2' : 'py-8'} hidden md:block`}>
            <a
              href={chefProfile.order_link}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gold text-black font-black py-4 px-10 rounded-xl w-full shadow-lg shadow-gold/20 hover:scale-[1.02] active:scale-[0.98] transition-all motion-reduce:transition-none uppercase tracking-widest flex items-center justify-center gap-2"
            >
              <ShoppingCart size={18} />
              立即訂購
            </a>
          </div>
        )}

        {/* Q&A Section */}
        {chefProfile.show_qa && qaItems.length > 0 && (
          <div className="mt-8">
            <QASection items={qaItems} />
          </div>
        )}

        <footer className="mt-8 border-t border-white/5 pt-10 pb-20 px-4 text-center">
          <div className="flex justify-center gap-6 mb-8">
            {chefProfile.socials.instagram && (
              <a href={chefProfile.socials.instagram} target="_blank" rel="noopener noreferrer" className="bg-luxury-card p-3 rounded-full shadow-sm border border-gold/20 text-gold hover:bg-gold hover:text-black transition-colors">
                <Instagram size={24} />
              </a>
            )}
            {chefProfile.socials.facebook && (
              <a href={chefProfile.socials.facebook} target="_blank" rel="noopener noreferrer" className="bg-luxury-card p-3 rounded-full shadow-sm border border-gold/20 text-gold hover:bg-gold hover:text-black transition-colors">
                <Facebook size={24} />
              </a>
            )}
            {chefProfile.socials.line && (
              <a href={chefProfile.socials.line} target="_blank" rel="noopener noreferrer" className="bg-luxury-card p-3 rounded-full shadow-sm border border-gold/20 text-gold hover:bg-gold hover:text-black transition-colors">
                <MessageCircle size={24} />
              </a>
            )}
            {chefProfile.socials.email && (
              <a href={`mailto:${chefProfile.socials.email}`} className="bg-luxury-card p-3 rounded-full shadow-sm border border-gold/20 text-gold hover:bg-gold hover:text-black transition-colors">
                <Mail size={24} />
              </a>
            )}
          </div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-bold">
            © 2019 {chefProfile.store_name || '鑫蘴家'}
          </p>
          <div className="mt-8 flex justify-center">
            <div className="w-32 h-1 bg-white/10 rounded-full"></div>
          </div>
        </footer>
      </main >

      {showOrderCta && (
        <div className="fixed bottom-0 inset-x-0 z-50 md:hidden">
          <div className="bg-luxury-dark/95 backdrop-blur-md border-t border-gold/20 px-4 pt-3 pb-4" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 0.75rem)' }}>
            <a
              href={chefProfile.order_link}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-gold text-black font-black py-3 rounded-xl shadow-lg shadow-gold/20 active:scale-[0.98] transition-all motion-reduce:transition-none uppercase tracking-widest flex items-center justify-center gap-2"
            >
              <ShoppingCart size={18} />
              立即訂購
            </a>
          </div>
        </div>
      )}

      {/* Modal Overlay */}
      {
        selectedDish && (
          <DishModal
            dish={selectedDish}
            reviews={getReviewsForDish(selectedDish.id)}
            showReviews={showReviews && selectedDish.show_reviews !== false}
            onAddReview={onAddReview}
            onClose={() => setSelectedDish(null)}
          />
        )
      }
    </div >
  );
};
