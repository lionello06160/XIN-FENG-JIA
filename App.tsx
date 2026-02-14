
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, HashRouter } from 'react-router-dom';
import { ChefProfile, Dish, DishReview, QAItem, AppContextType } from './types';
import { supabase } from './lib/supabase';
import { Loader2 } from 'lucide-react';
import { Toaster, toast } from 'sonner';

// Components
import { MainLayout } from './components/MainLayout';
import { LoginView } from './components/LoginView';
import {
  AdminDashboard,
  EditDish,
  EditProfile,
  AnalyticsDashboard,
  ReviewsManager,
  QAManager,
  EditQAItem,
  ChangePassword
} from './components/admin';

// Context
import { AppContext } from './context/AppContext';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [chefProfile, setChefProfile] = useState<ChefProfile | null>(null);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [reviews, setReviews] = useState<DishReview[]>([]);
  const [qaItems, setQaItems] = useState<QAItem[]>([]);

  // Check existing session on mount
  useEffect(() => {
    const session = localStorage.getItem('chef_session');
    if (session === 'true') {
      setIsAuthenticated(true);
    }
    fetchData();
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    localStorage.setItem('chef_session', 'true');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('chef_session');
  };

  const fetchData = async () => {
    try {
      setLoading(true);

      // Parallel data fetching for performance
      const [profileResult, qaResult, dishesResult, reviewsResult] = await Promise.all([
        supabase.from('chef_profile').select('*').single(),
        supabase.from('qa_items').select('*').order('order_index'),
        supabase.from('dishes').select('*').order('order_index'),
        supabase.from('dish_reviews').select('*').order('created_at', { ascending: false })
      ]);

      if (profileResult.error && profileResult.error.code !== 'PGRST116') {
        console.error('Error fetching profile:', profileResult.error);
      } else if (profileResult.data) {
        // Map flat DB structure to nested ChefProfile interface
        const rawProfile = profileResult.data;
        setChefProfile({
          id: rawProfile.id,
          name: rawProfile.name,
          title: rawProfile.title,
          bio: rawProfile.bio,
          image: rawProfile.image,
          socials: {
            instagram: rawProfile.instagram || '',
            facebook: rawProfile.facebook || '',
            line: rawProfile.line || '',
            email: rawProfile.email || '',
            tiktok: rawProfile.tiktok || ''
          },
          cta_title: rawProfile.cta_title,
          cta_description: rawProfile.cta_description,
          order_link: rawProfile.order_link,
          show_order_button: rawProfile.show_order_button,
          show_qa: rawProfile.show_qa,
          show_cta: rawProfile.show_cta,
          show_reviews: rawProfile.show_reviews,
          store_name: rawProfile.store_name
        });
      } else {
        // Init profile if not exists
        const { data: newProfile } = await supabase.from('chef_profile').insert([{
          name: 'Julian Vane',
          title: 'Executive Chef',
          bio: 'Welcome to my culinary world.',
          image: 'https://images.unsplash.com/photo-1577106263724-2c8e03bfe9cf?auto=format&fit=crop&q=80&w=2000',
          store_name: '鑫蘴家',
          cta_title: 'PRIVATE DINING',
          cta_description: 'Experience a unique culinary journey.',
          show_qa: false,
          show_reviews: true,
          instagram: '',
          facebook: '',
          line: '',
          email: '',
          tiktok: '',
          show_order_button: false,
          booking_link: '',
          order_link: ''
        }]).select().single();

        if (newProfile) {
          setChefProfile({
            id: newProfile.id,
            name: newProfile.name,
            title: newProfile.title,
            bio: newProfile.bio,
            image: newProfile.image,
            socials: {
              instagram: newProfile.instagram || '',
              facebook: newProfile.facebook || '',
              line: newProfile.line || '',
              email: newProfile.email || '',
              tiktok: newProfile.tiktok || ''
            },
            cta_title: newProfile.cta_title,
            cta_description: newProfile.cta_description,
            order_link: newProfile.order_link,
            show_order_button: newProfile.show_order_button,
            show_qa: newProfile.show_qa,
            show_cta: newProfile.show_cta,
            show_reviews: newProfile.show_reviews,
            store_name: newProfile.store_name
          });
        }
      }

      if (qaResult.data) setQaItems(qaResult.data);
      if (dishesResult.data) setDishes(dishesResult.data);
      if (reviewsResult.data) setReviews(reviewsResult.data);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('載入資料發生錯誤');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: Partial<ChefProfile>) => {
    if (!chefProfile?.id) return;

    // Map nested ChefProfile to flat DB structure
    const dbUpdate: any = { ...data };
    if (data.socials) {
      dbUpdate.instagram = data.socials.instagram;
      dbUpdate.facebook = data.socials.facebook;
      dbUpdate.line = data.socials.line;
      dbUpdate.email = data.socials.email;
      dbUpdate.tiktok = data.socials.tiktok;
      delete dbUpdate.socials;
    }

    // Clean undefined values
    Object.keys(dbUpdate).forEach(key => dbUpdate[key] === undefined && delete dbUpdate[key]);

    const { error } = await supabase.from('chef_profile').update(dbUpdate).eq('id', chefProfile.id);

    if (!error) {
      setChefProfile(prev => {
        if (!prev) return null;
        // Deep merge for local state update
        const newProfile = { ...prev, ...data };
        if (data.socials) {
          newProfile.socials = { ...prev.socials, ...data.socials };
        }
        return newProfile;
      });
      toast.success('個人資料已更新');
    } else {
      console.error('Update profile error:', error);
      toast.error('更新失敗');
    }
  };

  const addDish = async (data: Omit<Dish, 'id'>) => {
    if (!chefProfile?.id) return;
    const { data: newDish, error } = await supabase.from('dishes').insert([{ ...data, chef_id: chefProfile.id, order_index: dishes.length }]).select().single();
    if (!error && newDish) {
      setDishes([...dishes, newDish]);
      toast.success('菜色已新增');
    } else {
      toast.error('新增失敗');
    }
  };

  const updateDish = async (id: string, data: Partial<Dish>) => {
    const { error } = await supabase.from('dishes').update(data).eq('id', id);
    if (!error) {
      setDishes(dishes.map(d => d.id === id ? { ...d, ...data } : d));
      toast.success('菜色已更新');
    } else {
      toast.error('更新失敗');
    }
  };

  const deleteDish = async (id: string) => {
    const { error } = await supabase.from('dishes').delete().eq('id', id);
    if (!error) {
      setDishes(dishes.filter(d => d.id !== id));
      toast.success('菜色已刪除');
    } else {
      toast.error('刪除失敗');
    }
  };

  const reorderDishes = async (newDishes: Dish[]) => {
    setDishes(newDishes); // Optimistic update
    const updates = newDishes.map((dish, index) => ({
      id: dish.id,
      order_index: index
    }));

    const { error } = await supabase.from('dishes').upsert(updates);
    if (error) {
      console.error('Reorder error:', error);
      toast.error('排序更新失敗');
      fetchData(); // Revert on error
    }
  };

  const addQA = async (data: Omit<QAItem, 'id'>) => {
    if (!chefProfile?.id) return;
    const { data: newItem, error } = await supabase.from('qa_items').insert([{ ...data, chef_id: chefProfile.id, order_index: qaItems.length }]).select().single();
    if (!error && newItem) {
      setQaItems([...qaItems, newItem]);
      toast.success('問答已新增');
    } else {
      toast.error('新增失敗');
    }
  };

  const updateQA = async (id: string, data: Partial<QAItem>) => {
    const { error } = await supabase.from('qa_items').update(data).eq('id', id);
    if (!error) {
      setQaItems(qaItems.map(item => item.id === id ? { ...item, ...data } : item));
      toast.success('問答已更新');
    } else {
      toast.error('更新失敗');
    }
  };

  const deleteQA = async (id: string) => {
    const { error } = await supabase.from('qa_items').delete().eq('id', id);
    if (!error) {
      setQaItems(qaItems.filter(item => item.id !== id));
      toast.success('問答已刪除');
    } else {
      toast.error('刪除失敗');
    }
  };

  const reorderQA = async (newItems: QAItem[]) => {
    setQaItems(newItems);
    const updates = newItems.map((item, index) => ({
      id: item.id,
      order_index: index
    }));
    const { error } = await supabase.from('qa_items').upsert(updates);
    if (error) {
      toast.error('排序更新失敗');
      fetchData();
    }
  };

  const addReview = async (data: Omit<DishReview, 'id' | 'created_at'>) => {
    const { data: newReview, error } = await supabase.from('dish_reviews').insert([data]).select().single();
    if (!error && newReview) {
      setReviews([newReview, ...reviews]);
      return newReview;
    }
    throw error;
  };

  const replyReview = async (id: string, replyText: string) => {
    const { error } = await supabase.from('dish_reviews').update({
      reply_text: replyText,
      replied_at: new Date().toISOString()
    }).eq('id', id);

    if (!error) {
      setReviews(reviews.map(r => r.id === id ? { ...r, reply_text: replyText, replied_at: new Date().toISOString() } : r));
      toast.success('回覆已送出');
    } else {
      toast.error('回覆失敗');
    }
  };

  const updateReviewStatus = async (id: string, status: 'pending' | 'published') => {
    const { error } = await supabase.from('dish_reviews').update({ status }).eq('id', id);
    if (!error) {
      setReviews(reviews.map(r => r.id === id ? { ...r, status } : r));
      toast.success('狀態已更新');
    } else {
      toast.error('更新失敗');
    }
  };

  const deleteReview = async (id: string) => {
    const { error } = await supabase.from('dish_reviews').update({ is_deleted: true }).eq('id', id);
    if (!error) {
      setReviews(reviews.map(r => r.id === id ? { ...r, is_deleted: true } : r));
      toast.success('評價已刪除');
    } else {
      toast.error('刪除失敗');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#f8f5f2]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-[#8a7560]" size={48} />
          <p className="text-[#8a7560] font-medium tracking-widest text-sm animate-pulse">LOADING...</p>
        </div>
      </div>
    );
  }

  // Provide the context value
  const contextValue: AppContextType = {
    isAuthenticated,
    loading,
    chefProfile,
    dishes,
    reviews,
    qaItems,
    fetchData,
    updateProfile,
    addDish,
    updateDish,
    deleteDish,
    reorderDishes,
    addQA,
    updateQA,
    deleteQA,
    reorderQA,
    addReview,
    replyReview,
    updateReviewStatus,
    deleteReview,
    handleLoginSuccess,
    handleLogout
  };

  return (
    <AppContext.Provider value={contextValue}>
      <Toaster position="top-center" richColors />
      <HashRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<MainLayout />} />
          <Route path="/dish/:id" element={<MainLayout />} />
          <Route path="/login" element={isAuthenticated ? <Navigate to="/admin" /> : <LoginView onLoginSuccess={handleLoginSuccess} storeName={chefProfile?.store_name} />} />

          {/* Admin Routes */}
          {isAuthenticated ? (
            <>
              <Route path="/admin" element={chefProfile ? <AdminDashboard
                chefProfile={chefProfile}
                dishes={dishes}
                onDeleteDish={deleteDish}
                onReorderDishes={reorderDishes}
              /> : <Loader2 />} />
              <Route path="/admin/dish/:id" element={<EditDish
                dishes={dishes}
                onSave={updateDish}
                onAdd={addDish}
              />} />
              <Route path="/admin/profile" element={chefProfile ? <EditProfile
                profile={chefProfile}
                onSave={updateProfile}
              /> : <Loader2 />} />
              <Route path="/admin/analytics" element={<AnalyticsDashboard dishes={dishes} />} />
              <Route path="/admin/reviews" element={<ReviewsManager
                reviews={reviews}
                dishes={dishes}
                onReplyReview={replyReview}
                onUpdateReviewStatus={updateReviewStatus}
                onDeleteReview={deleteReview}
              />} />
              <Route path="/admin/qa" element={<QAManager
                qaItems={qaItems}
                onDeleteQA={deleteQA}
                onReorderQA={reorderQA}
              />} />
              <Route path="/admin/qa/:id" element={<EditQAItem
                qaItems={qaItems}
                onSave={updateQA}
                onAdd={addQA}
              />} />
              <Route path="/admin/security" element={<ChangePassword />} />
            </>
          ) : (
            <Route path="/admin/*" element={<Navigate to="/login" />} />
          )}

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </AppContext.Provider>
  );
}

export default App;
