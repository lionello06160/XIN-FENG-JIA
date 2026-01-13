import React, { useState } from 'react';
import { ChefProfile, Dish, QAItem } from '../types';
import { QASection } from './QASection';
import { Camera, Globe, Mail, Utensils, User, X, CheckCircle, Clock, Instagram, Facebook, MessageCircle, ShoppingCart, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { trackEvent } from '../lib/supabase';

interface ClientViewProps {
  chefProfile: ChefProfile;
  dishes: Dish[];
  qaItems: QAItem[];
}

const DishModal = ({ dish, onClose }: { dish: Dish; onClose: () => void }) => {
  if (!dish) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-white dark:bg-[#2d241a] rounded-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-300 motion-reduce:animate-none motion-reduce:transition-none" role="dialog" aria-modal="true" aria-label={`${dish.name} 詳細內容`}>

        {/* Close Button */}
        <div className="absolute top-4 right-4 z-30">
          <button onClick={onClose} className="flex items-center justify-center w-10 h-10 rounded-full bg-black/20 backdrop-blur-md text-white border border-white/20 transition-colors motion-reduce:transition-none hover:bg-black/40">
            <X size={20} />
          </button>
        </div>

        {/* Hero Image */}
        <div className="relative w-full aspect-[4/3] shrink-0">
          <div className="w-full h-full bg-center bg-no-repeat bg-cover" style={{ backgroundImage: `url("${dish.image}")` }} role="img" aria-label={`菜色圖片：${dish.name}`}></div>
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

          <div className="mb-6">
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
            <section>
              <h3 className="text-[#181411] font-bold text-lg mb-3 flex items-center gap-2">
                <Utensils className="text-admin-primary" size={20} />
                主廚靈感
              </h3>
              <p className="text-gray-600 leading-relaxed text-base">
                {dish.inspiration || dish.description}
              </p>
            </section>

            <section>
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
          </div>
        </div>
      </div>
    </div>
  );
};

export const ClientView: React.FC<ClientViewProps> = ({ chefProfile, dishes, qaItems }) => {
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const showOrderCta = chefProfile.show_order_button && !!chefProfile.order_link;

  React.useEffect(() => {
    trackEvent('page_view');
  }, []);

  const handleDishClick = (dish: Dish) => {
    setSelectedDish(dish);
    trackEvent('dish_click', dish.id);
  };

  return (
    <div className="min-h-screen bg-luxury-dark text-white font-sans selection:bg-gold selection:text-black">
      {/* Sticky Navigation */}
      <nav className="sticky top-0 z-40 bg-luxury-dark/90 backdrop-blur-md border-b border-gold/20">
        <div className="flex items-center p-4 justify-between max-w-6xl mx-auto">
          <div className="text-gold flex w-10 md:w-32 shrink-0 items-center justify-center md:justify-start">
            <Utensils size={24} />
          </div>
          <h1 className="text-gold text-lg md:text-xl font-bold leading-tight tracking-widest flex-1 text-center uppercase">
            鑫蘴家
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
        <div className="py-6 md:py-10">
          <div
            className="bg-cover bg-[center_20%] flex flex-col justify-end overflow-hidden rounded-2xl min-h-[420px] md:min-h-[500px] shadow-2xl relative border border-gold/10"
            style={{
              backgroundImage: `linear-gradient(0deg, rgba(18, 18, 18, 1) 0%, rgba(18, 18, 18, 0.4) 40%, rgba(0, 0, 0, 0) 70%), url("${chefProfile.image}")`
            }}
            role="img"
            aria-label={`主廚形象照：${chefProfile.name}`}
          >
            <div className="flex flex-col p-6 md:p-12 gap-3 md:max-w-2xl">
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
          {dishes.map((dish) => (
            <div key={dish.id} className="flex flex-col bg-luxury-card rounded-2xl overflow-hidden border border-white/5 shadow-lg group">
              <div
                className="bg-cover bg-center aspect-[16/9] transition-transform duration-700 group-hover:scale-105 motion-reduce:transition-none relative"
                style={{ backgroundImage: `url("${dish.image}")` }}
                role="img"
                aria-label={`菜色圖片：${dish.name}`}
              >
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
          ))}
        </div>

        {/* CTA Section */}
        {chefProfile.show_cta !== false && (
          <div className="px-4 py-8">
            <div className="bg-gold/5 rounded-2xl p-8 border border-gold/20 flex flex-col items-center text-center">
              <h4 className="text-xl font-bold mb-3 text-gold">{chefProfile.cta_title}</h4>
              <p className="text-sm text-white/70">{chefProfile.cta_description}</p>
            </div>

            {chefProfile.show_order_button && chefProfile.order_link && (
              <div className="px-2 pt-6">
                <a
                  href={chefProfile.order_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gold text-black font-black py-4 px-10 rounded-xl w-full shadow-lg shadow-gold/20 hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  <ShoppingCart size={18} />
                  立即訂購
                </a>
              </div>
            )}
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
            © 2019 鑫蘴家
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
          <DishModal dish={selectedDish} onClose={() => setSelectedDish(null)} />
        )
      }
    </div >
  );
};
