import { DishReview } from '../types';

export const formatRelativeTime = (value: string) => {
  const timestamp = new Date(value).getTime();
  if (!Number.isFinite(timestamp)) return '';
  const diff = Date.now() - timestamp;
  const hour = 1000 * 60 * 60;
  const day = hour * 24;
  const week = day * 7;
  const month = day * 30;
  const year = day * 365;

  if (diff < hour) return '剛剛';
  if (diff < day) return `${Math.max(1, Math.floor(diff / hour))} 小時前`;
  if (diff < week) return `${Math.max(1, Math.floor(diff / day))} 天前`;
  if (diff < month) return `${Math.max(1, Math.floor(diff / week))} 週前`;
  if (diff < year) return `${Math.max(1, Math.floor(diff / month))} 個月前`;
  return `${Math.max(1, Math.floor(diff / year))} 年前`;
};

export const getRatingStats = (reviews: DishReview[]) => {
  const ratingCounts = [0, 0, 0, 0, 0];
  let total = 0;

  reviews.forEach((review) => {
    if (review.rating < 1 || review.rating > 5) return;
    ratingCounts[review.rating - 1] += 1;
    total += review.rating;
  });

  const count = ratingCounts.reduce((sum, value) => sum + value, 0);
  const average = count ? total / count : 0;
  return { average, count, ratingCounts };
};
