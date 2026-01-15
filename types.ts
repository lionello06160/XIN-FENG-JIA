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
  name: string;
  title: string;
  bio: string;
  image: string;
  socials: {
    instagram: string;
    facebook: string;
    line: string;
    email: string;
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
  dishes: Dish[];
  updateDish: (id: string, updatedDish: Partial<Dish>) => void;
  deleteDish: (id: string) => void;
  addDish: (dish: Dish) => void;
  chefProfile: ChefProfile;
  updateChefProfile: (profile: Partial<ChefProfile>) => void;
}
