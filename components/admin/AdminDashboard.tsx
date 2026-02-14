
import React from 'react';
import { ChefProfile, Dish } from '../../types';
import { PlusCircle, ChevronUp, ChevronDown, Edit, Trash, Info, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    TouchSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy
} from '@dnd-kit/sortable';
import { AdminLayout } from './AdminLayout';
import { SortableItem } from './SortableItem';

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
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 250,
                tolerance: 5,
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
            title={`${chefProfile.store_name || '鑫蘴家'} · 管理後台`}
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
                                                    {/* Visibility Indicator */}
                                                    {(dish.is_visible !== false) ? (
                                                        <div className="flex items-center gap-1 ml-auto bg-blue-50 px-1.5 py-0.5 rounded-full border border-blue-100" title="首頁可見">
                                                            <Eye size={10} className="text-blue-500" />
                                                            <span className="text-[10px] font-bold text-blue-600">可見</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-1 ml-auto bg-gray-100 px-1.5 py-0.5 rounded-full border border-gray-200" title="首頁已隱藏">
                                                            <EyeOff size={10} className="text-gray-400" />
                                                            <span className="text-[10px] font-bold text-gray-500">隱藏</span>
                                                        </div>
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
        </AdminLayout >
    );
};
