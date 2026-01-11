import React, { useState } from 'react';
import { ChefProfile, Dish } from '../types';
import {
  ChevronLeft, ChevronUp, ChevronDown, Search, PlusCircle, UserCog, Edit, Trash,
  Info, Utensils, BarChart, User, Settings, Camera, Save, Facebook, Instagram, Link as LinkIcon, Loader2, MessageCircle, ShoppingBag, ArrowLeft, Calendar, Mail
} from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { uploadImage, supabase } from '../lib/supabase';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart as RechartsBarChart, Bar, Legend, Cell
} from 'recharts';

// --- Shared Components ---

const AdminLayout = ({ children, title, backTo, rightAction }: { children?: React.ReactNode, title: string, backTo?: string, rightAction?: React.ReactNode }) => {
  const navigate = useNavigate();
  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-admin-bg font-display text-[#181411]">
      <header className="sticky top-0 z-50 flex items-center bg-white/95 backdrop-blur-md p-4 pb-2 justify-between border-b border-gray-100">
        <div className="flex size-12 shrink-0 items-center">
          {backTo ? (
            <button onClick={() => navigate(backTo)} className="text-[#181411] flex size-12 shrink-0 items-center justify-center hover:bg-gray-50 rounded-full">
              <ChevronLeft />
            </button>
          ) : (
            // Placeholder for logo or spacing
            <div className="w-12"></div>
          )}
        </div>
        <h2 className="text-[#181411] text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center truncate px-2">
          {title}
        </h2>
        <div className="flex w-12 items-center justify-center">
          {rightAction || <div className="w-12"></div>}
        </div>
      </header>
      <main className="flex-1 w-full max-w-md mx-auto overflow-y-auto pb-24">
        {children}
      </main>
    </div>
  );
};

// --- Dashboard ---

export const AdminDashboard = ({
  chefProfile,
  dishes,
  onDeleteDish,
  onReorderDishes
}: {
  chefProfile: ChefProfile;
  dishes: Dish[];
  onDeleteDish: (id: string) => void;
  onReorderDishes: (newDishes: Dish[]) => void;
}) => {
  const navigate = useNavigate();

  const moveDish = (index: number, direction: 'up' | 'down') => {
    const newDishes = [...dishes];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newDishes.length) return;

    // Swap
    [newDishes[index], newDishes[targetIndex]] = [newDishes[targetIndex], newDishes[index]];

    onReorderDishes(newDishes);
  };

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-admin-bg font-display text-[#181411]">
      {/* Dashboard Header */}
      <header className="sticky top-0 z-50 flex items-center bg-white/95 backdrop-blur-md p-4 pb-2 justify-between border-b border-gray-100">
        <div className="flex size-12 shrink-0 items-center">
          <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border-2 border-admin-primary" style={{ backgroundImage: `url("${chefProfile.image}")` }}></div>
        </div>
        <div className="flex flex-col flex-1 px-2">
          <h2 className="text-[#181411] text-lg font-bold leading-tight tracking-[-0.015em]">鑫蘴家 · 管理後台</h2>
          <p className="text-[#8a7560] text-xs font-medium uppercase tracking-wider">主廚管理控制台</p>
        </div>
        <div className="flex w-12 items-center justify-end">
          {/* Search removed */}
        </div>
      </header>

      <main className="flex-1 w-full max-w-md mx-auto pb-24">
        {/* Actions */}
        <div className="px-4 py-4">
          <Link to="/admin/dish/new" className="flex items-center justify-center rounded-xl h-16 bg-admin-primary text-white gap-3 shadow-lg shadow-admin-primary/20 hover:scale-[0.99] transition-transform active:scale-95 w-full">
            <PlusCircle size={24} />
            <span className="font-bold tracking-wide">新增菜色</span>
          </Link>
        </div>

        {/* List Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <h3 className="text-[#181411] text-xl font-bold leading-tight tracking-tight">菜單列表</h3>
          <span className="bg-admin-primary/10 text-admin-primary px-3 py-1 rounded-full text-xs font-bold">{dishes.length} / 20 項目</span>
        </div>

        {/* List */}
        <div className="flex flex-col gap-px bg-gray-100 pb-4">
          {dishes.map((dish, index) => (
            <div key={dish.id} className="flex flex-col bg-white px-4 py-4 border-b border-gray-50">
              <div className="flex items-center gap-3 justify-between">
                <div className="flex items-center gap-3 overflow-hidden flex-1">

                  {/* Sort Controls */}
                  <div className="flex flex-col gap-1 shrink-0">
                    <button
                      disabled={index === 0}
                      onClick={() => moveDish(index, 'up')}
                      className="p-1 rounded bg-gray-50 text-gray-400 hover:bg-admin-primary/10 hover:text-admin-primary disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-gray-400 transition-colors"
                      title="上移"
                    >
                      <ChevronUp size={14} />
                    </button>
                    <button
                      disabled={index === dishes.length - 1}
                      onClick={() => moveDish(index, 'down')}
                      className="p-1 rounded bg-gray-50 text-gray-400 hover:bg-admin-primary/10 hover:text-admin-primary disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-gray-400 transition-colors"
                      title="下移"
                    >
                      <ChevronDown size={14} />
                    </button>
                  </div>

                  <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-xl size-16 shrink-0 bg-gray-200" style={{ backgroundImage: `url("${dish.image}")` }}></div>
                  <div className="flex flex-col justify-center overflow-hidden flex-1 min-w-0">
                    <p className="text-[#8a7560] text-[10px] font-medium mb-0.5">菜名</p>
                    <p className="text-[#181411] text-base font-bold leading-tight truncate">{dish.name}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <p className="text-[#8a7560] text-xs font-normal">可訂購狀態:</p>
                      <span className={`text-xs font-bold ${dish.available ? 'text-green-600' : 'text-red-500'}`}>
                        {dish.available ? '供應中' : '已售罄'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => navigate(`/admin/dish/${dish.id}`)}
                    className="flex flex-col items-center justify-center rounded-lg h-12 w-12 bg-[#f5f2f0] text-[#181411] hover:bg-admin-primary/20 transition-colors"
                  >
                    <Edit size={20} />
                    <span className="text-[10px] font-bold">編輯</span>
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('確定要刪除這道菜色嗎？')) onDeleteDish(dish.id);
                    }}
                    className="flex flex-col items-center justify-center rounded-lg h-12 w-12 bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                  >
                    <Trash size={20} />
                    <span className="text-[10px] font-bold">刪除</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Info Box */}
        <div className="mx-4 mt-4 px-4 py-3 bg-admin-primary/10 text-admin-primary flex items-center gap-3 rounded-lg">
          <Info size={20} />
          <p className="text-xs font-medium">您可以繼續新增菜色，直到達到上限。</p>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full max-w-md mx-auto left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-100 flex justify-around items-center h-16 pb-2">
        <button className="flex flex-col items-center gap-1 text-admin-primary">
          <Utensils size={24} fill="currentColor" />
          <span className="text-[10px] font-bold">菜色管理</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-[#8a7560]" onClick={() => navigate('/admin/analytics')}>
          <BarChart size={24} />
          <span className="text-[10px] font-medium">數據分析</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-[#8a7560]" onClick={() => navigate('/admin/profile')}>
          <User size={24} />
          <span className="text-[10px] font-medium">個人資料</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-[#8a7560]" onClick={() => navigate('/')}>
          <Settings size={24} />
          <span className="text-[10px] font-medium">返回前台</span>
        </button>
      </nav>
    </div>
  );
};

// --- Edit/Add Dish ---

export const EditDish = ({
  dishes,
  onSave,
  onAdd
}: {
  dishes: Dish[];
  onSave: (id: string, data: Partial<Dish>) => Promise<void>;
  onAdd: (data: Omit<Dish, 'id'>) => Promise<void>;
}) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const isNew = id === 'new';

  const existingDish = dishes.find(d => d.id === id);

  const [formData, setFormData] = useState<Partial<Dish>>(
    existingDish || {
      name: '',
      price: 0,
      description: '',
      ingredients: [],
      available: true,
      image: 'https://picsum.photos/800/600', // Placeholder
      inspiration: ''
    }
  );
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadImage(file);
      setFormData({ ...formData, image: url });
    } catch (err) {
      console.error('Upload error:', err);
      alert('上傳失敗');
    } finally {
      setUploading(false);
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (isNew) {
        await onAdd({
          ...formData,
          ingredients: Array.isArray(formData.ingredients) ? formData.ingredients : []
        } as Omit<Dish, 'id'>);
      } else if (id) {
        await onSave(id, formData);
      }
      navigate('/admin');
    } catch (error) {
      console.error('Submit horror:', error);
      alert('儲存失敗，請重試');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout
      title={isNew ? "新增菜色" : "編輯菜色詳情"}
      backTo="/admin"
    >
      <div className="px-4 py-4">
        {/* Image Upload */}
        <div className="relative group mb-6">
          <div
            className="w-full bg-center bg-no-repeat bg-cover flex flex-col justify-end overflow-hidden bg-gray-200 rounded-xl min-h-64 shadow-sm border border-gray-100"
            style={{ backgroundImage: `url("${formData.image}")` }}
          ></div>
          <div
            className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-xl transition-opacity cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="bg-white/90 p-3 rounded-full flex items-center gap-2 shadow-lg">
              {uploading ? (
                <Loader2 className="text-admin-primary animate-spin" size={20} />
              ) : (
                <Camera className="text-admin-primary" size={20} />
              )}
              <span className="text-sm font-bold text-gray-800">
                {uploading ? '正在上傳...' : '更換相片'}
              </span>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        <div className="flex flex-col gap-6">
          <label className="flex flex-col w-full gap-2">
            <p className="text-[#181411] text-sm font-bold tracking-wider">菜色名稱</p>
            <input
              className="flex w-full rounded-lg border border-[#e6e0db] bg-white h-14 placeholder:text-[#8a7560] px-4 text-base focus:border-admin-primary focus:ring-1 focus:ring-admin-primary outline-none"
              placeholder="例如：嫩煎干貝佐奶油醬"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </label>

          <label className="flex flex-col w-full gap-2">
            <p className="text-[#181411] text-sm font-bold tracking-wider">價格</p>
            <div className="flex w-full items-stretch rounded-lg shadow-sm">
              <div className="text-[#8a7560] flex border border-[#e6e0db] bg-white items-center justify-center px-4 rounded-l-lg border-r-0">
                <span className="text-base font-bold">NT$</span>
              </div>
              <input
                className="flex w-full rounded-r-lg border border-[#e6e0db] border-l-0 bg-white h-14 px-4 text-base focus:border-admin-primary focus:ring-1 focus:ring-admin-primary outline-none"
                type="number"
                value={formData.price}
                onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
              />
            </div>
          </label>

          <label className="flex flex-col w-full gap-2">
            <p className="text-[#181411] text-sm font-bold tracking-wider">詳細描述</p>
            <textarea
              className="flex w-full rounded-lg border border-[#e6e0db] bg-white min-h-32 p-4 text-base focus:border-admin-primary focus:ring-1 focus:ring-admin-primary outline-none resize-none"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </label>

          <label className="flex flex-col w-full gap-2">
            <p className="text-[#181411] text-sm font-bold tracking-wider">嚴選食材 (以逗號分隔)</p>
            <textarea
              className="flex w-full rounded-lg border border-[#e6e0db] bg-white min-h-24 p-4 text-base focus:border-admin-primary focus:ring-1 focus:ring-admin-primary outline-none resize-none"
              value={formData.ingredients?.join(', ')}
              onChange={e => setFormData({ ...formData, ingredients: e.target.value.split(',').map(s => s.trim()) })}
            />
          </label>

          <div>
            <p className="text-[#181411] text-sm font-bold tracking-wider mb-3">供應狀態</p>
            <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3">
                <Utensils className="text-admin-primary" size={20} />
                <span className="text-[#181411] font-medium">顯示為可訂購</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={formData.available}
                  onChange={e => setFormData({ ...formData, available: e.target.checked })}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-admin-primary"></div>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-4 bg-white/80 backdrop-blur-md border-t border-gray-100">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full bg-admin-primary text-white font-bold py-4 rounded-xl shadow-lg active:scale-[0.98] transition-transform flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Save size={20} />
          {isSubmitting ? '處理中...' : '儲存變更'}
        </button>
      </div>
    </AdminLayout>
  );
};

// --- Edit Profile ---

export const EditProfile = ({
  profile,
  onSave
}: {
  profile: ChefProfile;
  onSave: (data: Partial<ChefProfile>) => Promise<void>;
}) => {
  const navigate = useNavigate();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState(profile);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadImage(file);
      setFormData({ ...formData, image: url });
    } catch (err) {
      console.error('Upload error:', err);
      alert('上傳失敗');
    } finally {
      setUploading(false);
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      await onSave(formData);
      navigate('/admin');
    } catch (error) {
      alert('更新個人資料失敗');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout title="主廚個人資料管理" backTo="/admin">
      <div className="p-6 flex flex-col items-center gap-4">
        {/* Avatar */}
        <div className="relative group">
          <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-32 border-4 border-white shadow-md" style={{ backgroundImage: `url("${formData.image}")` }}></div>
          <div
            className="absolute bottom-1 right-1 bg-admin-primary text-white p-2 rounded-full shadow-lg cursor-pointer hover:bg-admin-primary/90"
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
        <p className="text-admin-primary text-sm font-bold cursor-pointer" onClick={() => fileInputRef.current?.click()}>
          {uploading ? '正在上傳...' : '更換個人照'}
        </p>
      </div>

      <div className="px-4 space-y-4">
        <label className="flex flex-col w-full gap-1">
          <p className="text-[#181411] text-sm font-medium px-1">姓名</p>
          <input
            className="flex w-full rounded-lg border border-[#e6e0db] bg-white h-12 px-4 focus:border-admin-primary focus:ring-1 focus:ring-admin-primary outline-none"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
          />
        </label>

        <label className="flex flex-col w-full gap-1">
          <p className="text-[#181411] text-sm font-medium px-1">職銜</p>
          <input
            className="flex w-full rounded-lg border border-[#e6e0db] bg-white h-12 px-4 focus:border-admin-primary focus:ring-1 focus:ring-admin-primary outline-none"
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
          />
        </label>

        <label className="flex flex-col w-full gap-1">
          <p className="text-[#181411] text-sm font-medium px-1">個人簡介</p>
          <textarea
            className="flex w-full rounded-lg border border-[#e6e0db] bg-white min-h-36 p-4 focus:border-admin-primary focus:ring-1 focus:ring-admin-primary outline-none resize-none leading-relaxed"
            value={formData.bio}
            onChange={e => setFormData({ ...formData, bio: e.target.value })}
          />
          <p className="text-right text-[#8a7560] text-xs pt-1">{formData.bio.length} / 500 字</p>
        </label>

        <label className="flex flex-col w-full gap-1">
          <p className="text-[#181411] text-sm font-medium px-1">底部 CTA 標題</p>
          <input
            className="flex w-full rounded-lg border border-[#e6e0db] bg-white h-12 px-4 focus:border-admin-primary focus:ring-1 focus:ring-admin-primary outline-none"
            value={formData.cta_title}
            onChange={e => setFormData({ ...formData, cta_title: e.target.value })}
            placeholder="例如：預約私廚體驗"
          />
        </label>

        <label className="flex flex-col w-full gap-1">
          <p className="text-[#181411] text-sm font-medium px-1">底部 CTA 描述</p>
          <textarea
            className="flex w-full rounded-lg border border-[#e6e0db] bg-white min-h-24 p-4 focus:border-admin-primary focus:ring-1 focus:ring-admin-primary outline-none resize-none leading-relaxed"
            value={formData.cta_description}
            onChange={e => setFormData({ ...formData, cta_description: e.target.value })}
            placeholder="例如：在您的私人寓所中，體驗由主廚親自操刀的 8 道式招牌饗宴。"
          />
        </label>

        <div className="flex flex-col gap-4 pt-2">
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3">
              <ShoppingBag className="text-admin-primary" size={20} />
              <div className="flex flex-col">
                <span className="text-[#181411] font-medium">顯示立即訂購按鈕</span>
                <span className="text-gray-400 text-xs">開啟後首頁將出現訂購按鈕</span>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={formData.show_order_button}
                onChange={e => setFormData({ ...formData, show_order_button: e.target.checked })}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-admin-primary"></div>
            </label>
          </div>

          {formData.show_order_button && (
            <label className="flex flex-col w-full gap-1">
              <p className="text-[#181411] text-sm font-medium px-1">訂購連結 (URL)</p>
              <input
                className="flex w-full rounded-lg border border-[#e6e0db] bg-white h-12 px-4 focus:border-admin-primary focus:ring-1 focus:ring-admin-primary outline-none"
                value={formData.order_link}
                onChange={e => setFormData({ ...formData, order_link: e.target.value })}
                placeholder="例如：https://order.page/julian"
              />
            </label>
          )}
        </div>
      </div>

      <div className="mt-8 px-4">
        <h3 className="text-[#181411] text-base font-bold mb-4 px-1">社群連結</h3>
        <div className="space-y-3 bg-white p-4 rounded-xl border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] rounded-lg text-white shrink-0">
              <Instagram size={20} />
            </div>
            <input
              className="flex w-full rounded-lg border border-[#e6e0db] bg-white h-10 px-3 text-sm focus:border-admin-primary focus:ring-1 focus:ring-admin-primary outline-none"
              value={formData.socials.instagram}
              onChange={e => setFormData({ ...formData, socials: { ...formData.socials, instagram: e.target.value } })}
              placeholder="Instagram Link"
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center bg-[#1877F2] rounded-lg text-white shrink-0">
              <Facebook size={20} />
            </div>
            <input
              className="flex w-full rounded-lg border border-[#e6e0db] bg-white h-10 px-3 text-sm focus:border-admin-primary focus:ring-1 focus:ring-admin-primary outline-none"
              value={formData.socials.facebook}
              onChange={e => setFormData({ ...formData, socials: { ...formData.socials, facebook: e.target.value } })}
              placeholder="Facebook Link"
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center bg-[#06C755] rounded-lg text-white shrink-0">
              <MessageCircle size={20} />
            </div>
            <input
              className="flex w-full rounded-lg border border-[#e6e0db] bg-white h-10 px-3 text-sm focus:border-admin-primary focus:ring-1 focus:ring-admin-primary outline-none"
              value={formData.socials.line}
              onChange={e => setFormData({ ...formData, socials: { ...formData.socials, line: e.target.value } })}
              placeholder="LINE ID 或連結"
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center bg-gray-600 rounded-lg text-white shrink-0">
              <Mail size={20} />
            </div>
            <input
              type="email"
              className="flex w-full rounded-lg border border-[#e6e0db] bg-white h-10 px-3 text-sm focus:border-admin-primary focus:ring-1 focus:ring-admin-primary outline-none"
              value={formData.socials.email}
              onChange={e => setFormData({ ...formData, socials: { ...formData.socials, email: e.target.value } })}
              placeholder="電子郵件 (例如: chef@example.com)"
            />
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-4 bg-white/80 backdrop-blur-md border-t border-gray-100">
        <button
          onClick={handleSave}
          disabled={isSubmitting}
          className="w-full bg-admin-primary text-white font-bold py-4 rounded-xl shadow-lg active:scale-[0.98] transition-transform flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Save size={20} />
          {isSubmitting ? '處理中...' : '儲存個人資料'}
        </button>
      </div>
    </AdminLayout>
  );
};

// --- Analytics Dashboard Component ---

export const AnalyticsDashboard = ({ dishes }: { dishes: Dish[] }) => {
  const navigate = useNavigate();
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

    return Object.entries(stats)
      .map(([id, count]) => {
        const dish = dishes.find(d => d.id === id);
        return { name: dish?.name || '未知菜色', count };
      })
      .sort((a, b) => b.count - a.count);
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
    <div className="min-h-screen bg-admin-bg font-display text-[#181411]">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md p-4 flex items-center gap-3 border-b border-gray-100">
        <button onClick={() => navigate('/admin')} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-lg font-bold">數據分析報表</h2>
      </header>

      <main className="max-w-md mx-auto p-4 flex flex-col gap-6 pb-24">
        {/* Time Range Selector */}
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

        {/* Dish Clicks Ranking */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">各產品點擊分析</h3>
          <div className="flex flex-col gap-3">
            {dishStats.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-8">目前尚無點擊數據</p>
            ) : (
              dishStats.map((stat, idx) => (
                <div key={idx} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className={`size-6 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 ${idx === 0 ? 'bg-admin-primary text-white' : 'bg-gray-100 text-gray-500'
                      }`}>
                      {idx + 1}
                    </div>
                    <span className="text-sm font-medium truncate">{stat.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 bg-gray-100 rounded-full w-24 overflow-hidden hidden sm:block">
                      <div
                        className="h-full bg-admin-primary rounded-full transition-all duration-1000"
                        style={{ width: `${(stat.count / dishStats[0].count) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold tabular-nums min-w-[32px] text-right">{stat.count}次</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
