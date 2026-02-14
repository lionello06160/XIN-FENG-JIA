
export interface Dish {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  inspiration: string;
  ingredients: string[];
  image: string;
  available: boolean;
  soldOut?: boolean;
  order_index?: number;
  spiciness?: number;
  is_new?: boolean;
  show_reviews?: boolean;
  is_visible?: boolean;
}

export interface QAItem {
  id: string;
  created_at?: string;
  question: string;
  answer: string;
  order_index: number;
}

export interface DishReview {
  id: string;
  dish_id: string;
  name: string;
  rating: number;
  comment: string;
  created_at: string;
  reply_text?: string;
  replied_at?: string;
  is_deleted?: boolean;
  deleted_at?: string;
  status?: 'pending' | 'published';
  published_at?: string;
}

export interface ChefProfile {
  id?: string;
  name: string;
  title: string;
  bio: string;
  image: string;
  socials: {
    instagram: string;
    facebook: string;
    line: string;
    email: string;
    tiktok: string;
  };
  cta_title?: string;
  cta_description?: string;
  order_link?: string;
  show_order_button?: boolean;
  show_qa?: boolean;
  show_cta?: boolean;
  show_reviews?: boolean;
  store_name?: string;
}

export interface AppContextType {
  isAuthenticated: boolean;
  loading: boolean;
  chefProfile: ChefProfile | null;
  dishes: Dish[];
  reviews: DishReview[];
  qaItems: QAItem[];
  fetchData: () => Promise<void>;
  updateProfile: (data: Partial<ChefProfile>) => Promise<void>;
  addDish: (data: Omit<Dish, 'id'>) => Promise<void>;
  updateDish: (id: string, data: Partial<Dish>) => Promise<void>;
  deleteDish: (id: string) => Promise<void>;
  reorderDishes: (newDishes: Dish[]) => Promise<void>;
  addQA: (data: Omit<QAItem, 'id'>) => Promise<void>;
  updateQA: (id: string, data: Partial<QAItem>) => Promise<void>;
  deleteQA: (id: string) => Promise<void>;
  reorderQA: (newItems: QAItem[]) => Promise<void>;
  addReview: (data: Omit<DishReview, 'id' | 'created_at'>) => Promise<DishReview>;
  replyReview: (id: string, replyText: string) => Promise<void>;
  updateReviewStatus: (id: string, status: 'pending' | 'published') => Promise<void>;
  deleteReview: (id: string) => Promise<void>;
  handleLoginSuccess: () => void;
  handleLogout: () => void;
}
