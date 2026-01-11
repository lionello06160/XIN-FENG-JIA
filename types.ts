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
}

export interface AppContextType {
  dishes: Dish[];
  updateDish: (id: string, updatedDish: Partial<Dish>) => void;
  deleteDish: (id: string) => void;
  addDish: (dish: Dish) => void;
  chefProfile: ChefProfile;
  updateChefProfile: (profile: Partial<ChefProfile>) => void;
}
