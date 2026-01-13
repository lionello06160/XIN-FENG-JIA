import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ClientView } from './components/ClientView';
import { AdminDashboard, EditDish, EditProfile, AnalyticsDashboard, QAManager, EditQAItem, ChangePassword } from './components/AdminView';
import { INITIAL_CHEF_PROFILE, INITIAL_DISHES } from './constants';
import { ChefProfile, Dish, QAItem } from './types';
import { supabase } from './lib/supabase';
import { LoginView } from './components/LoginView';
import { Analytics } from "@vercel/analytics/react"

const App: React.FC = () => {
  // Centralized State
  const [chefProfile, setChefProfile] = useState<ChefProfile>(INITIAL_CHEF_PROFILE);
  const [dishes, setDishes] = useState<Dish[]>(INITIAL_DISHES);
  const [qaItems, setQaItems] = useState<QAItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check existing session
  useEffect(() => {
    const session = localStorage.getItem('chef_session');
    if (session === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    localStorage.setItem('chef_session', 'true');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('chef_session');
  };

  // Fetch initial data
  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch Chef Profile
      const { data: profileData, error: profileError } = await supabase
        .from('chef_profile')
        .select('*')
        .eq('id', 1)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
      } else if (profileData) {
        setChefProfile({
          name: profileData.name,
          title: profileData.title,
          bio: profileData.bio,
          image: profileData.image,
          socials: {
            instagram: profileData.instagram || '',
            facebook: profileData.facebook || '',
            line: profileData.line || '',
            email: profileData.email || ''
          },
          cta_title: profileData.cta_title || '預約私廚體驗',
          cta_description: profileData.cta_description || '在您的私人寓所中，體驗由主廚親自操刀的 8 道式招牌饗宴。',
          order_link: profileData.order_link || '',
          show_order_button: !!profileData.show_order_button,
          show_qa: !!profileData.show_qa,
          show_cta: profileData.show_cta !== false,
          store_name: profileData.store_name ?? ''
        });
      }

      // Fetch QA Items
      const { data: qaData, error: qaError } = await supabase
        .from('qa_items')
        .select('*')
        .order('order_index', { ascending: true });

      if (qaError) {
        console.error('Error fetching QA:', qaError);
      } else if (qaData) {
        setQaItems(qaData as QAItem[]);
      }

      // Fetch Dishes
      const { data: dishesData, error: dishesError } = await supabase
        .from('dishes')
        .select('*')
        .order('order_index', { ascending: true });

      if (dishesError) {
        console.error('Error fetching dishes:', dishesError);
      } else if (dishesData) {
        setDishes(dishesData as Dish[]);
      }
    } catch (err) {
      console.error('Data loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Actions
  const handleUpdateDish = async (id: string, updatedData: Partial<Dish>) => {
    const { error } = await supabase
      .from('dishes')
      .update(updatedData)
      .eq('id', id);

    if (error) {
      console.error('Error updating dish:', error);
      return;
    }
    setDishes(prev => prev.map(d => d.id === id ? { ...d, ...updatedData } : d));
  };

  const handleAddDish = async (newDish: Omit<Dish, 'id'>) => {
    const { data, error } = await supabase
      .from('dishes')
      .insert([{ ...newDish, order_index: dishes.length }])
      .select()
      .single();

    if (error) {
      console.error('Error adding dish:', error);
      return;
    }
    if (data) {
      setDishes(prev => [data as Dish, ...prev]);
    }
  };

  const handleDeleteDish = async (id: string) => {
    const { error } = await supabase
      .from('dishes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting dish:', error);
      return;
    }
    setDishes(prev => prev.filter(d => d.id !== id));
  };

  const handleReorderDishes = async (newDishes: Dish[]) => {
    // 1. 同步 index 到物件中
    const reorderedWithIndex = newDishes.map((dish, index) => ({
      ...dish,
      order_index: index
    }));

    // Optimistic update
    setDishes(reorderedWithIndex);

    // 2. 更新資料庫
    const { error } = await supabase
      .from('dishes')
      .upsert(reorderedWithIndex);

    if (error) {
      console.error('Error reordering dishes:', error);
      alert('排序儲存失敗：' + error.message);
      // 可選擇在此處恢復舊的排序狀態，但我們先讓用戶看到錯誤
    }
  };

  const handleUpdateProfile = async (updatedProfile: Partial<ChefProfile>) => {
    const flatProfile = {
      name: updatedProfile.name,
      title: updatedProfile.title,
      bio: updatedProfile.bio,
      image: updatedProfile.image,
      instagram: updatedProfile.socials?.instagram,
      facebook: updatedProfile.socials?.facebook,
      line: updatedProfile.socials?.line,
      email: updatedProfile.socials?.email,
      cta_title: updatedProfile.cta_title,
      cta_description: updatedProfile.cta_description,
      order_link: updatedProfile.order_link,
      show_order_button: updatedProfile.show_order_button,
      show_qa: updatedProfile.show_qa,
      show_cta: updatedProfile.show_cta,
      store_name: updatedProfile.store_name
    };

    // Remove undefined fields
    Object.keys(flatProfile).forEach(key => (flatProfile as any)[key] === undefined && delete (flatProfile as any)[key]);

    const { error } = await supabase
      .from('chef_profile')
      .update(flatProfile)
      .eq('id', 1);

    if (error) {
      console.error('Error updating profile:', error);
      throw error; // 拋出錯誤以便 AdminView 捕捉並顯示 alert
    }
    setChefProfile(prev => ({ ...prev, ...updatedProfile }));
  };

  const handleUpdateQA = async (id: string, updatedData: Partial<QAItem>) => {
    const { error } = await supabase
      .from('qa_items')
      .update(updatedData)
      .eq('id', id);

    if (error) {
      console.error('Error updating QA:', error);
      return;
    }
    setQaItems(prev => prev.map(q => q.id === id ? { ...q, ...updatedData } : q));
  };

  const handleAddQA = async (newQA: Omit<QAItem, 'id'>) => {
    const { data, error } = await supabase
      .from('qa_items')
      .insert([{ ...newQA, order_index: qaItems.length }])
      .select()
      .single();

    if (error) {
      console.error('Error adding QA:', error);
      return;
    }
    if (data) {
      setQaItems(prev => [...prev, data as QAItem]);
    }
  };

  const handleDeleteQA = async (id: string) => {
    const { error } = await supabase
      .from('qa_items')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting QA:', error);
      return;
    }
    setQaItems(prev => prev.filter(q => q.id !== id));
  };

  const handleReorderQA = async (newQA: QAItem[]) => {
    const reorderedWithIndex = newQA.map((item, index) => ({
      ...item,
      order_index: index
    }));
    setQaItems(reorderedWithIndex);
    const { error } = await supabase
      .from('qa_items')
      .upsert(reorderedWithIndex);

    if (error) {
      console.error('Error reordering QA:', error);
      alert('排序儲存失敗：' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#181411] text-white font-sans">
        <div className="relative flex flex-col items-center">
          {chefProfile.store_name && (
            <div className="absolute bottom-full mb-4 text-[#a67c52] text-xl font-bold tracking-[0.4em] uppercase">
              {chefProfile.store_name}
            </div>
          )}
          <div className="loading-flow text-xl font-light tracking-[0.2em] uppercase">LOADING.....</div>
        </div>
      </div>
    );
  }

  return (
    <HashRouter>
      <Analytics />
      <Routes>
        {/* Client Side Routes */}
        <Route path="/" element={<ClientView chefProfile={chefProfile} dishes={dishes} qaItems={qaItems} />} />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            isAuthenticated ? (
              <AdminDashboard chefProfile={chefProfile} dishes={dishes} onDeleteDish={handleDeleteDish} onReorderDishes={handleReorderDishes} />
            ) : (
              <LoginView onLoginSuccess={handleLoginSuccess} storeName={chefProfile.store_name || '鑫蘴家'} />
            )
          }
        />
        <Route
          path="/admin/dish/:id"
          element={
            isAuthenticated ? (
              <EditDish dishes={dishes} onSave={handleUpdateDish} onAdd={handleAddDish} />
            ) : (
              <Navigate to="/admin" replace />
            )
          }
        />
        <Route
          path="/admin/profile"
          element={
            isAuthenticated ? (
              <EditProfile profile={chefProfile} onSave={handleUpdateProfile} />
            ) : (
              <Navigate to="/admin" replace />
            )
          }
        />
        <Route
          path="/admin/analytics"
          element={
            isAuthenticated ? (
              <AnalyticsDashboard dishes={dishes} />
            ) : (
              <Navigate to="/admin" replace />
            )
          }
        />
        <Route
          path="/admin/qa"
          element={
            isAuthenticated ? (
              <QAManager qaItems={qaItems} onDeleteQA={handleDeleteQA} onReorderQA={handleReorderQA} />
            ) : (
              <Navigate to="/admin" replace />
            )
          }
        />
        <Route
          path="/admin/qa/:id"
          element={
            isAuthenticated ? (
              <EditQAItem qaItems={qaItems} onSave={handleUpdateQA} onAdd={handleAddQA} />
            ) : (
              <Navigate to="/admin" replace />
            )
          }
        />
        <Route
          path="/admin/security"
          element={
            isAuthenticated ? (
              <ChangePassword />
            ) : (
              <Navigate to="/admin" replace />
            )
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
