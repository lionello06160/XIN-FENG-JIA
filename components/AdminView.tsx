import React, { useState } from 'react';
import { ChefProfile, Dish, QAItem } from '../types';
import {
  ChevronLeft, ChevronUp, ChevronDown, Search, PlusCircle, UserCog, Edit, Trash,
  Info, Utensils, BarChart, BarChart3, User, Settings, Camera, Save, Facebook, Instagram, Link as LinkIcon, Loader2, MessageCircle, ShoppingBag, ArrowLeft, Calendar, Mail, Sparkles, HelpCircle, ChevronRight, Lock, KeyRound, ShieldCheck, CheckCircle2, GripVertical, Home
} from 'lucide-react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { uploadImage, supabase } from '../lib/supabase';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart as RechartsBarChart, Bar, Legend, Cell
} from 'recharts';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  rectSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// --- Shared Components ---

const AdminBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: '菜色管理', icon: Utensils, path: '/admin' },
    { label: '數據分析', icon: BarChart3, path: '/admin/analytics' },
    { label: '個人資料', icon: User, path: '/admin/profile' },
    { label: 'Q&A 管理', icon: HelpCircle, path: '/admin/qa' },
    { label: '帳號安全', icon: Lock, path: '/admin/security' },
  ];

  const handleHome = () => {
    navigate('/');
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[100] bg-white/95 backdrop-blur-md border-t border-gray-100 px-2 pb-safe-area-inset-bottom">
      <div className="max-w-6xl mx-auto flex items-center justify-between h-20">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path === '/admin' && (location.pathname === '/admin' || location.pathname.startsWith('/admin/dish')));
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center flex-1 gap-1.5 transition-colors ${isActive ? 'text-admin-primary' : 'text-[#8a7560]'
                }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-[10px] font-bold ${isActive ? 'text-admin-primary' : 'text-[#8a7560]'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
        <button
          onClick={handleHome}
          className="flex flex-col items-center justify-center flex-1 gap-1.5 text-[#8a7560] hover:text-admin-primary transition-colors"
        >
          <Home size={20} />
          <span className="text-[10px] font-bold">首頁</span>
        </button>
      </div>
    </nav>
  );
};

const AdminLayout = ({ children, title, backTo, leftAction, rightAction }: { children?: React.ReactNode, title: string, backTo?: string, leftAction?: React.ReactNode, rightAction?: React.ReactNode }) => {
  const navigate = useNavigate();
  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-admin-bg font-display text-[#181411]">
      <header className="sticky top-0 z-50 flex items-center bg-white/95 backdrop-blur-md p-4 pb-2 justify-between border-b border-gray-100">
        <div className="flex size-12 shrink-0 items-center">
          {leftAction ? (
            leftAction
          ) : backTo ? (
            <button onClick={() => navigate(backTo)} className="text-[#181411] flex size-12 shrink-0 items-center justify-center hover:bg-gray-50 rounded-full">
              <ChevronLeft />
            </button>
          ) : (
            // Placeholder for logo or spacing
            <div className="w-12"></div>
          )}
        </div>
        <div className="flex flex-col flex-1 px-2 items-center text-center">
          <h2 className="text-[#181411] text-lg font-bold leading-tight tracking-[-0.015em] truncate w-full">
            {title}
          </h2>
          {title === "鑫蘴家 · 管理後台" && (
            <p className="text-[#8a7560] text-xs font-medium uppercase tracking-wider">主廚管理控制台</p>
          )}
        </div>
        <div className="flex w-12 items-center justify-center">
          {rightAction || <div className="w-12"></div>}
        </div>
      </header>
      <main className="flex-1 w-full max-w-6xl mx-auto overflow-y-auto pb-32 px-4 md:px-8">
        {children}
      </main>
      <AdminBottomNav />
    </div>
  );
};

interface SortableItemProps {
  id: string;
  children: React.ReactNode;
  className?: string;
  key?: React.Key;
}

const SortableItem = ({ id, children, className }: SortableItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className={className}>
      <div className="relative group h-full">
        {children}
        <div
          {...attributes}
          {...listeners}
          className="absolute top-2 left-2 p-1.5 bg-white/80 backdrop-blur-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing border border-gray-100 shadow-sm z-10"
          title="拖曳排序"
        >
          <GripVertical size={16} className="text-gray-400" />
        </div>
      </div>
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

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = dishes.findIndex((item) => item.id === active.id);
      const newIndex = dishes.findIndex((item) => item.id === over.id);

      onReorderDishes(arrayMove(dishes, oldIndex, newIndex));
    }
  };

  return (
    <AdminLayout
      title="鑫蘴家 · 管理後台"
      leftAction={
        <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border-2 border-admin-primary" style={{ backgroundImage: `url("${chefProfile.image}")` }}></div>
      }
    >
      {/* Actions */}
      <div className="py-6">
        <Link to="/admin/dish/new" className="flex items-center justify-center rounded-xl h-16 bg-admin-primary text-white gap-3 shadow-lg shadow-admin-primary/20 hover:scale-[0.99] transition-transform active:scale-95 w-full">
          <PlusCircle size={24} />
          <span className="font-bold tracking-wide">新增菜色</span>
        </Link>
      </div>

      {/* List Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <h3 className="text-[#181411] text-xl font-bold leading-tight tracking-tight">菜單列表</h3>
        <span className="bg-admin-primary/10 text-admin-primary px-3 py-1 rounded-full text-xs font-bold">{dishes.length} 項目</span>
      </div>

      {/* List */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={dishes.map(d => d.id)}
          strategy={rectSortingStrategy}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-8">
            {dishes.map((dish, index) => (
              <SortableItem key={dish.id} id={dish.id}>
                <div className="flex flex-col bg-white p-4 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md h-full">
                  <div className="flex items-center gap-3 justify-between mb-4">
                    <div className="flex items-center gap-3 overflow-hidden flex-1 pl-4">

                      {/* Sort Controls (Fallback) */}
                      <div className="flex flex-col gap-1 shrink-0">
                        <button
                          disabled={index === 0}
                          onClick={() => moveDish(index, 'up')}
                          className="p-1.5 rounded-lg bg-gray-50 text-gray-400 hover:bg-admin-primary/10 hover:text-admin-primary disabled:opacity-20 transition-colors"
                          title="上移"
                        >
                          <ChevronUp size={14} />
                        </button>
                        <button
                          disabled={index === dishes.length - 1}
                          onClick={() => moveDish(index, 'down')}
                          className="p-1.5 rounded-lg bg-gray-50 text-gray-400 hover:bg-admin-primary/10 hover:text-admin-primary disabled:opacity-20 transition-colors"
                          title="下移"
                        >
                          <ChevronDown size={14} />
                        </button>
                      </div>

                      <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-xl size-14 shrink-0 bg-gray-200 border border-gray-50" style={{ backgroundImage: `url("${dish.image}")` }}></div>
                      <div className="flex flex-col justify-center overflow-hidden flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 overflow-hidden">
                          <p className="text-[#181411] text-base font-bold leading-tight truncate">{dish.name}</p>
                          {!!dish.spiciness && dish.spiciness > 0 && (
                            <div className="flex shrink-0">
                              {Array.from({ length: dish.spiciness }).map((_, i) => (
                                <span key={i} className="text-[10px]">🌶️</span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <div className={`size-1.5 rounded-full ${dish.available ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <span className={`text-[10px] font-bold ${dish.available ? 'text-green-600' : 'text-red-500'}`}>
                            {dish.available ? '供應中' : '已售罄'}
                          </span>
                          {dish.is_new && (
                            <span className="bg-gold text-black text-[8px] font-black px-1.5 py-0.5 rounded-full border border-gold shadow-sm ml-0.5">
                              NEW
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-4 border-t border-gray-50 mt-auto">
                    <button
                      onClick={() => navigate(`/admin/dish/${dish.id}`)}
                      className="flex items-center justify-center gap-2 rounded-xl h-11 bg-gray-50 text-[#181411] font-bold text-sm hover:bg-admin-primary/10 hover:text-admin-primary transition-all active:scale-95"
                    >
                      <Edit size={16} />
                      <span>編輯</span>
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('確定要刪除這道菜色嗎？')) onDeleteDish(dish.id);
                      }}
                      className="flex items-center justify-center gap-2 rounded-xl h-11 bg-red-50 text-red-500 font-bold text-sm hover:bg-red-100 transition-all active:scale-95"
                    >
                      <Trash size={16} />
                      <span>刪除</span>
                    </button>
                  </div>
                </div>
              </SortableItem>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Info Box */}
      <div className="mx-4 mt-4 px-4 py-3 bg-admin-primary/10 text-admin-primary flex items-center gap-3 rounded-lg">
        <Info size={20} />
        <p className="text-xs font-medium">您可以自由新增更多菜色。</p>
      </div>
    </AdminLayout>
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
            className="w-full bg-center bg-no-repeat bg-contain flex flex-col justify-end overflow-hidden bg-[#f8f5f2] rounded-xl min-h-[320px] md:min-h-[400px] shadow-inner border border-gray-100"
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-48">
          <div className="space-y-6">
            <label className="flex flex-col w-full gap-2">
              <p className="text-[#181411] text-sm font-bold tracking-wider">菜色名稱</p>
              <input
                className="flex w-full rounded-xl border border-[#e6e0db] bg-white h-14 placeholder:text-[#8a7560] px-4 text-base focus:border-admin-primary focus:ring-1 focus:ring-admin-primary outline-none transition-all shadow-sm"
                placeholder="例如：嫩煎干貝佐奶油醬"
                value={formData.name || ''}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </label>

            <label className="flex flex-col w-full gap-2">
              <p className="text-[#181411] text-sm font-bold tracking-wider">價格設定</p>
              <div className="flex w-full items-stretch rounded-xl shadow-sm overflow-hidden">
                <div className="text-[#8a7560] flex border border-[#e6e0db] bg-gray-50 items-center justify-center px-5 border-r-0">
                  <span className="text-base font-bold">NT$</span>
                </div>
                <input
                  className="flex w-full border border-[#e6e0db] bg-white h-14 px-4 text-base focus:border-admin-primary focus:ring-1 focus:ring-admin-primary outline-none"
                  type="number"
                  value={formData.price || 0}
                  onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                />
              </div>
            </label>

            <label className="flex flex-col w-full gap-2">
              <p className="text-[#181411] text-sm font-bold tracking-wider">主廚靈感 / 詳細描述</p>
              <textarea
                className="flex w-full rounded-xl border border-[#e6e0db] bg-white min-h-[200px] p-4 text-base focus:border-admin-primary focus:ring-1 focus:ring-admin-primary outline-none resize-none shadow-sm"
                value={formData.description || ''}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="分享這道菜的故事與獨特之處..."
              />
            </label>
          </div>

          <div className="space-y-6">
            <label className="flex flex-col w-full gap-2">
              <p className="text-[#181411] text-sm font-bold tracking-wider">嚴選食材 (以半形逗點分隔)</p>
              <textarea
                className="flex w-full rounded-xl border border-[#e6e0db] bg-white min-h-[120px] p-4 text-base focus:border-admin-primary focus:ring-1 focus:ring-admin-primary outline-none resize-none shadow-sm"
                value={(formData.ingredients || []).join(', ')}
                onChange={e => setFormData({ ...formData, ingredients: e.target.value.split(',').map(s => s.trim()) })}
                placeholder="日本生食級干貝, 澳洲海鹽, 新鮮羅勒..."
              />
            </label>

            <div className="flex flex-col w-full gap-3">
              <p className="text-[#181411] text-sm font-bold tracking-wider">風味標記 - 辣度</p>
              <div className="grid grid-cols-4 gap-2">
                {[0, 1, 2, 3].map((level) => (
                  <button
                    key={level}
                    onClick={() => setFormData({ ...formData, spiciness: level })}
                    className={`py-3 px-2 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${(formData.spiciness || 0) === level
                      ? 'border-admin-primary bg-admin-primary/5 text-admin-primary'
                      : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200'
                      }`}
                  >
                    <span className="text-xs font-bold">
                      {level === 0 ? '不辣' : level === 1 ? '小辣' : level === 2 ? '中辣' : '大辣'}
                    </span>
                    <div className="flex gap-0.5 h-4 items-center">
                      {level === 0 ? (
                        <span className="text-[10px] font-medium opacity-50">無</span>
                      ) : (
                        Array.from({ length: level }).map((_, i) => (
                          <span key={i} className="text-sm">🌶️</span>
                        ))
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <p className="text-[#181411] text-sm font-bold tracking-wider mb-3 px-1">展示設定</p>
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gold/10 rounded-lg text-gold">
                      <Sparkles size={18} />
                    </div>
                    <span className="text-[#181411] font-medium">標記為新品 (New)</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={formData.is_new || false}
                      onChange={e => setFormData({ ...formData, is_new: e.target.checked })}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-admin-primary/10 rounded-lg text-admin-primary">
                      <Utensils size={18} />
                    </div>
                    <span className="text-[#181411] font-medium">前台顯示為可訂購</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={formData.available || false}
                      onChange={e => setFormData({ ...formData, available: e.target.checked })}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-admin-primary"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 border-t border-gray-100 pt-8 pb-12">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full md:max-w-xs mx-auto bg-admin-primary text-white font-bold py-4 rounded-2xl shadow-xl hover:shadow-admin-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
        >
          <Save size={20} />
          {isSubmitting ? '正在處理...' : '儲存菜色資料'}
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-40">
        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center gap-6 sticky top-24">
            {/* Avatar */}
            <div className="relative group">
              <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-40 border-4 border-white shadow-xl" style={{ backgroundImage: `url("${formData.image}")` }}></div>
              <div
                className="absolute bottom-2 right-2 bg-admin-primary text-white p-3 rounded-full shadow-lg cursor-pointer hover:bg-admin-primary/90 transition-transform hover:scale-110"
                onClick={() => fileInputRef.current?.click()}
              >
                {uploading ? <Loader2 size={20} className="animate-spin" /> : <Camera size={20} />}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
            <div className="text-center">
              <h3 className="text-[#181411] text-xl font-bold">{formData.name || '主廚名稱'}</h3>
              <p className="text-[#8a7560] text-sm mt-1">{formData.title || '尚未設定職銜'}</p>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-admin-primary text-sm font-bold px-6 py-2 bg-admin-primary/5 rounded-full hover:bg-admin-primary/10 transition-colors"
            >
              {uploading ? '正在上傳...' : '更換個人照'}
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <h4 className="text-[#181411] text-lg font-bold border-b border-gray-50 pb-4">基本資料</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <label className="flex flex-col w-full gap-2">
                <p className="text-[#181411] text-sm font-bold px-1">正式姓名</p>
                <input
                  className="flex w-full rounded-xl border border-[#e6e0db] bg-white h-12 px-4 focus:border-admin-primary focus:ring-1 focus:ring-admin-primary outline-none transition-all"
                  value={formData.name || ''}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </label>

              <label className="flex flex-col w-full gap-2">
                <p className="text-[#181411] text-sm font-bold px-1">職銜名稱</p>
                <input
                  className="flex w-full rounded-xl border border-[#e6e0db] bg-white h-12 px-4 focus:border-admin-primary focus:ring-1 focus:ring-admin-primary outline-none transition-all"
                  value={formData.title || ''}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                />
              </label>
            </div>

            <label className="flex flex-col w-full gap-2">
              <p className="text-[#181411] text-sm font-bold px-1">個人簡介 / 品牌故事</p>
              <textarea
                className="flex w-full rounded-xl border border-[#e6e0db] bg-white min-h-[160px] p-4 focus:border-admin-primary focus:ring-1 focus:ring-admin-primary outline-none resize-none leading-relaxed transition-all"
                value={formData.bio || ''}
                onChange={e => setFormData({ ...formData, bio: e.target.value })}
              />
              <div className="flex justify-between items-center px-1">
                <p className="text-[#8a7560] text-xs">建議描述您的烹飪理念與經歷</p>
                <p className="text-[#8a7560] text-xs">{(formData.bio || '').length} / 500 字</p>
              </div>
            </label>
          </div>

          <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <h4 className="text-[#181411] text-lg font-bold border-b border-gray-50 pb-4">首頁底部呼籲 (CTA)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <label className="flex flex-col w-full gap-2">
                <p className="text-[#181411] text-sm font-bold px-1">區塊標題</p>
                <input
                  className="flex w-full rounded-xl border border-[#e6e0db] bg-white h-12 px-4 focus:border-admin-primary focus:ring-1 focus:ring-admin-primary outline-none"
                  value={formData.cta_title || ''}
                  onChange={e => setFormData({ ...formData, cta_title: e.target.value })}
                  placeholder="例如：預約私廚體驗"
                />
              </label>

              <label className="flex flex-col w-full gap-2 md:col-span-2">
                <p className="text-[#181411] text-sm font-bold px-1">詳細描述文字</p>
                <textarea
                  className="flex w-full rounded-xl border border-[#e6e0db] bg-white min-h-[100px] p-4 focus:border-admin-primary focus:ring-1 focus:ring-admin-primary outline-none resize-none leading-relaxed"
                  value={formData.cta_description || ''}
                  onChange={e => setFormData({ ...formData, cta_description: e.target.value })}
                  placeholder="例如：在您的私人寓所中，體驗由主廚親自操刀的 8 道式招牌饗宴。"
                />
              </label>
            </div>
          </div>

          <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <h4 className="text-[#181411] text-lg font-bold border-b border-gray-50 pb-4">功能設定與社群連結</h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <ShoppingBag className="text-admin-primary" size={20} />
                  <div className="flex flex-col">
                    <span className="text-[#181411] text-sm font-bold">顯示訂購按鈕</span>
                    <span className="text-gray-400 text-[10px]">首頁立即預約按鈕</span>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={formData.show_order_button || false}
                    onChange={e => setFormData({ ...formData, show_order_button: e.target.checked })}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-admin-primary"></div>
                </label>
              </div>

              <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <HelpCircle className="text-admin-primary" size={20} />
                  <div className="flex flex-col">
                    <span className="text-[#181411] text-sm font-bold">顯示 Q&A 區塊</span>
                    <span className="text-gray-400 text-[10px]">開啟首頁問答集</span>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={formData.show_qa || false}
                    onChange={e => setFormData({ ...formData, show_qa: e.target.checked })}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-admin-primary"></div>
                </label>
              </div>
            </div>

            {formData.show_order_button && (
              <label className="flex flex-col w-full gap-2">
                <p className="text-[#181411] text-sm font-bold px-1">訂購連結 (URL)</p>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <LinkIcon size={18} />
                  </div>
                  <input
                    className="flex w-full rounded-xl border border-[#e6e0db] bg-white h-12 pl-12 pr-4 focus:border-admin-primary focus:ring-1 focus:ring-admin-primary outline-none"
                    value={formData.order_link || ''}
                    onChange={e => setFormData({ ...formData, order_link: e.target.value })}
                    placeholder="例如：https://order.page/julian"
                  />
                </div>
              </label>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] rounded-lg text-white shrink-0 shadow-sm">
                  <Instagram size={20} />
                </div>
                <input
                  className="flex w-full bg-transparent h-10 px-1 text-sm outline-none"
                  value={formData.socials?.instagram || ''}
                  onChange={e => setFormData({ ...formData, socials: { ...(formData.socials || {}), instagram: e.target.value } })}
                  placeholder="Instagram Link"
                />
              </div>
              <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                <div className="w-10 h-10 flex items-center justify-center bg-[#1877F2] rounded-lg text-white shrink-0 shadow-sm">
                  <Facebook size={20} />
                </div>
                <input
                  className="flex w-full bg-transparent h-10 px-1 text-sm outline-none"
                  value={formData.socials?.facebook || ''}
                  onChange={e => setFormData({ ...formData, socials: { ...(formData.socials || {}), facebook: e.target.value } })}
                  placeholder="Facebook Link"
                />
              </div>
              <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                <div className="w-10 h-10 flex items-center justify-center bg-[#06C755] rounded-lg text-white shrink-0 shadow-sm">
                  <MessageCircle size={20} />
                </div>
                <input
                  className="flex w-full bg-transparent h-10 px-1 text-sm outline-none"
                  value={formData.socials?.line || ''}
                  onChange={e => setFormData({ ...formData, socials: { ...(formData.socials || {}), line: e.target.value } })}
                  placeholder="LINE ID"
                />
              </div>
              <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                <div className="w-10 h-10 flex items-center justify-center bg-gray-600 rounded-lg text-white shrink-0 shadow-sm">
                  <Mail size={20} />
                </div>
                <input
                  type="email"
                  className="flex w-full bg-transparent h-10 px-1 text-sm outline-none"
                  value={formData.socials?.email || ''}
                  onChange={e => setFormData({ ...formData, socials: { ...(formData.socials || {}), email: e.target.value } })}
                  placeholder="Email Address"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 border-t border-gray-100 pt-8">
        <button
          onClick={handleSave}
          disabled={isSubmitting}
          className="w-full md:max-w-xs mx-auto bg-admin-primary text-white font-bold py-4 rounded-2xl shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
        >
          <Save size={20} />
          {isSubmitting ? '正在儲存中...' : '儲存主廚個人資料'}
        </button>
      </div>
    </AdminLayout>
  );
};

// --- Change Password ---

export const ChangePassword = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async () => {
    setError('');
    setSuccess('');

    if (!username || !oldPassword || !newPassword || !confirmPassword) {
      setError('請填寫所有欄位');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('新密碼與確認密碼不符');
      return;
    }

    if (newPassword.length < 6) {
      setError('新密碼長度至少需 6 個字元');
      return;
    }

    setLoading(true);

    try {
      // 1. Verify old password
      const { data: user, error: authError } = await supabase
        .from('admin_auth')
        .select('*')
        .eq('username', username)
        .eq('password', oldPassword)
        .single();

      if (authError || !user) {
        setError('帳號或舊密碼錯誤');
        setLoading(false);
        return;
      }

      // 2. Update password
      const { error: updateError } = await supabase
        .from('admin_auth')
        .update({ password: newPassword })
        .eq('username', username);

      if (updateError) {
        throw updateError;
      }

      setSuccess('密碼修改成功！下次登入請使用新密碼。');
      setUsername('');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');

      // Optional: Redirect after delay
      setTimeout(() => {
        navigate('/admin');
      }, 2000);

    } catch (err) {
      console.error('Password change error:', err);
      setError('修改失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="帳號安全設定" backTo="/admin">
      <div className="p-6 pb-40">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 bg-admin-primary/10 rounded-full flex items-center justify-center mb-4 text-admin-primary">
            <ShieldCheck size={32} />
          </div>
          <h3 className="text-[#181411] text-lg font-bold mb-2">變更管理員密碼</h3>
          <p className="text-gray-500 text-xs">為了您的帳號安全，建議定期更換密碼。請輸入您的帳號及舊密碼以進行驗證。</p>
        </div>

        {success ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center flex flex-col items-center gap-3 animate-fade-in">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
              <CheckCircle2 size={24} />
            </div>
            <h4 className="text-green-800 font-bold">修改成功</h4>
            <p className="text-green-700 text-sm">{success}</p>
            <button
              onClick={() => navigate('/admin')}
              className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg text-sm font-bold shadow-sm active:scale-95 transition-transform"
            >
              返回首頁
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <label className="flex flex-col w-full gap-1">
              <p className="text-[#181411] text-sm font-medium px-1">管理員帳號</p>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <User size={18} />
                </div>
                <input
                  className="flex w-full rounded-lg border border-[#e6e0db] bg-white h-12 pl-11 pr-4 focus:border-admin-primary focus:ring-1 focus:ring-admin-primary outline-none"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="請輸入帳號"
                />
              </div>
            </label>

            <label className="flex flex-col w-full gap-1">
              <p className="text-[#181411] text-sm font-medium px-1">目前舊密碼</p>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <KeyRound size={18} />
                </div>
                <input
                  type="password"
                  className="flex w-full rounded-lg border border-[#e6e0db] bg-white h-12 pl-11 pr-4 focus:border-admin-primary focus:ring-1 focus:ring-admin-primary outline-none"
                  value={oldPassword}
                  onChange={e => setOldPassword(e.target.value)}
                  placeholder="驗證身分用"
                />
              </div>
            </label>

            <div className="h-px bg-gray-100 my-2"></div>

            <label className="flex flex-col w-full gap-1">
              <p className="text-[#181411] text-sm font-medium px-1">新密碼</p>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  className="flex w-full rounded-lg border border-[#e6e0db] bg-white h-12 pl-11 pr-4 focus:border-admin-primary focus:ring-1 focus:ring-admin-primary outline-none"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="請設定新密碼"
                />
              </div>
            </label>

            <label className="flex flex-col w-full gap-1">
              <p className="text-[#181411] text-sm font-medium px-1">確認新密碼</p>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  className="flex w-full rounded-lg border border-[#e6e0db] bg-white h-12 pl-11 pr-4 focus:border-admin-primary focus:ring-1 focus:ring-admin-primary outline-none"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="再次輸入新密碼"
                />
              </div>
            </label>

            {error && (
              <div className="p-3 bg-red-50 text-red-500 text-sm rounded-lg text-center font-bold animate-pulse">
                {error}
              </div>
            )}
          </div>
        )}
      </div>

      {!success && (
        <div className="mt-8">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-admin-primary text-white font-bold py-4 rounded-xl shadow-lg active:scale-[0.98] transition-transform flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            {loading ? '處理中...' : '確認修改密碼'}
          </button>
        </div>
      )}
    </AdminLayout>
  );
};

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
    <AdminLayout title="數據分析報表" backTo="/admin">
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
            {dishStats.slice(0, 5).map((stat, idx) => (
              <div key={stat.name} className="flex items-center gap-4">
                <span className={`text-sm font-black w-6 ${idx < 3 ? 'text-admin-primary' : 'text-gray-300'}`}>{String(idx + 1).padStart(2, '0')}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-bold truncate">{stat.name}</span>
                    <span className="text-sm font-bold">{stat.count} 次點擊</span>
                  </div>
                  <div className="w-full bg-gray-50 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-admin-primary h-full rounded-full transition-all duration-1000"
                      style={{ width: `${(stat.count / (dishStats[0]?.count || 1)) * 100}%` }}
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

// --- Q&A Manager ---

export const QAManager = ({
  qaItems,
  onDeleteQA,
  onReorderQA
}: {
  qaItems: QAItem[];
  onDeleteQA: (id: string) => void;
  onReorderQA: (items: QAItem[]) => void;
}) => {
  const navigate = useNavigate();

  const moveQA = (index: number, direction: 'up' | 'down') => {
    const newItems = [...qaItems];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;
    [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
    onReorderQA(newItems);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = qaItems.findIndex((item) => item.id === active.id);
      const newIndex = qaItems.findIndex((item) => item.id === over.id);
      onReorderQA(arrayMove(qaItems, oldIndex, newIndex));
    }
  };

  return (
    <AdminLayout title="Q&A 管理" backTo="/admin">
      <div className="px-4 py-4">
        <Link to="/admin/qa/new" className="flex items-center justify-center rounded-xl h-16 bg-admin-primary text-white gap-3 shadow-lg shadow-admin-primary/20 hover:scale-[0.99] transition-transform active:scale-95 w-full">
          <PlusCircle size={24} />
          <span className="font-bold tracking-wide">新增 Q&A</span>
        </Link>
      </div>

      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <h3 className="text-[#181411] text-xl font-bold leading-tight tracking-tight">Q&A 列表</h3>
        <span className="bg-admin-primary/10 text-admin-primary px-3 py-1 rounded-full text-xs font-bold">{qaItems.length} 項目</span>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={qaItems.map(item => item.id)}
          strategy={rectSortingStrategy}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-4 pb-8">
            {qaItems.map((item, index) => (
              <SortableItem key={item.id} id={item.id}>
                <div className="flex flex-col bg-white p-4 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md h-full">
                  <div className="flex items-center gap-3 justify-between mb-4">
                    <div className="flex items-center gap-3 overflow-hidden flex-1 pl-4">
                      <div className="flex flex-col gap-1 shrink-0">
                        <button
                          disabled={index === 0}
                          onClick={() => moveQA(index, 'up')}
                          className="p-1.5 rounded-lg bg-gray-50 text-gray-400 hover:bg-admin-primary/10 hover:text-admin-primary disabled:opacity-20 transition-colors"
                        >
                          <ChevronUp size={14} />
                        </button>
                        <button
                          disabled={index === qaItems.length - 1}
                          onClick={() => moveQA(index, 'down')}
                          className="p-1.5 rounded-lg bg-gray-50 text-gray-400 hover:bg-admin-primary/10 hover:text-admin-primary disabled:opacity-20 transition-colors"
                        >
                          <ChevronDown size={14} />
                        </button>
                      </div>

                      <div className="flex flex-col justify-center overflow-hidden flex-1 min-w-0">
                        <p className="text-[#8a7560] text-[10px] font-medium mb-0.5">問題 Q{index + 1}</p>
                        <p className="text-[#181411] text-base font-bold leading-tight truncate">{item.question}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-4 border-t border-gray-50 mt-auto">
                    <button
                      onClick={() => navigate(`/admin/qa/${item.id}`)}
                      className="flex items-center justify-center gap-2 rounded-xl h-11 bg-gray-50 text-[#181411] font-bold text-sm hover:bg-admin-primary/10 hover:text-admin-primary transition-all active:scale-95"
                    >
                      <Edit size={16} />
                      <span>編輯</span>
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('確定要刪除這項 Q&A 嗎？')) onDeleteQA(item.id);
                      }}
                      className="flex items-center justify-center gap-2 rounded-xl h-11 bg-red-50 text-red-500 font-bold text-sm hover:bg-red-100 transition-all active:scale-95"
                    >
                      <Trash size={16} />
                      <span>刪除</span>
                    </button>
                  </div>
                </div>
              </SortableItem>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </AdminLayout>
  );
};

// --- Edit Q&A Item ---

export const EditQAItem = ({
  qaItems,
  onSave,
  onAdd
}: {
  qaItems: QAItem[];
  onSave: (id: string, data: Partial<QAItem>) => Promise<void>;
  onAdd: (data: Omit<QAItem, 'id'>) => Promise<void>;
}) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new';
  const existingItem = qaItems.find(q => q.id === id);

  const [formData, setFormData] = useState<Partial<QAItem>>(
    existingItem || {
      question: '',
      answer: '',
      order_index: qaItems.length
    }
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!formData.question || !formData.answer) {
      alert('請填寫完整內容');
      return;
    }
    setIsSubmitting(true);
    try {
      if (isNew) {
        await onAdd(formData as Omit<QAItem, 'id'>);
      } else if (id) {
        await onSave(id, formData);
      }
      navigate('/admin/qa');
    } catch (error) {
      alert('儲存失敗');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout title={isNew ? "新增 Q&A" : "編輯 Q&A"} backTo="/admin/qa">
      <div className="px-4 py-6 space-y-6 pb-40">
        <label className="flex flex-col w-full gap-2">
          <p className="text-[#181411] text-sm font-bold tracking-wider">問題內容</p>
          <textarea
            className="flex w-full rounded-lg border border-[#e6e0db] bg-white min-h-24 p-4 text-base focus:border-admin-primary focus:ring-1 focus:ring-admin-primary outline-none resize-none"
            placeholder="例如：如何預約您的私廚服務？"
            value={formData.question}
            onChange={e => setFormData({ ...formData, question: e.target.value })}
          />
        </label>

        <label className="flex flex-col w-full gap-2">
          <p className="text-[#181411] text-sm font-bold tracking-wider">回答內容</p>
          <textarea
            className="flex w-full rounded-lg border border-[#e6e0db] bg-white min-h-48 p-4 text-base focus:border-admin-primary focus:ring-1 focus:ring-admin-primary outline-none resize-none leading-relaxed"
            placeholder="例如：您可以透過首頁的 LINE 或 Facebook 連結直接聯繫主廚..."
            value={formData.answer}
            onChange={e => setFormData({ ...formData, answer: e.target.value })}
          />
        </label>

        <div className="pt-4">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full bg-admin-primary text-white font-bold py-4 rounded-xl shadow-lg active:scale-[0.98] transition-transform flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Save size={20} />
            {isSubmitting ? '處理中...' : '儲存 Q&A'}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
};
