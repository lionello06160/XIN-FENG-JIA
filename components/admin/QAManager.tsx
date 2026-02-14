
import React from 'react';
import { QAItem } from '../../types';
import { PlusCircle, HelpCircle, ChevronUp, ChevronDown, Edit, Trash, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
    verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { AdminLayout } from './AdminLayout';
import { SortableItem } from './SortableItem';

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

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = qaItems.findIndex((item) => item.id === active.id);
            const newIndex = qaItems.findIndex((item) => item.id === over.id);
            onReorderQA(arrayMove(qaItems, oldIndex, newIndex));
        }
    };

    const moveItem = (index: number, direction: 'up' | 'down') => {
        const newItems = [...qaItems];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newItems.length) return;
        [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
        onReorderQA(newItems);
    };

    return (
        <AdminLayout title="Q&A 常見問答管理">
            <div className="py-6">
                <button
                    onClick={() => navigate('/admin/qa/new')}
                    className="flex items-center justify-center rounded-xl h-16 bg-admin-primary text-white gap-3 shadow-lg shadow-admin-primary/20 hover:scale-[0.99] transition-transform active:scale-95 w-full"
                >
                    <PlusCircle size={24} />
                    <span className="font-bold tracking-wide">新增問答</span>
                </button>
            </div>

            <div className="flex items-center justify-between px-4 pt-4 pb-2">
                <h3 className="text-[#181411] text-xl font-bold leading-tight tracking-tight">問答列表</h3>
                <span className="bg-admin-primary/10 text-admin-primary px-3 py-1 rounded-full text-xs font-bold">{qaItems.length} 項目</span>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={qaItems.map(item => item.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="space-y-4 pb-24">
                        {qaItems.map((item, index) => (
                            <SortableItem key={item.id} id={item.id}>
                                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
                                    <div className="flex items-start gap-4">
                                        <div className="flex flex-col gap-1 shrink-0 pt-1">
                                            <button
                                                disabled={index === 0}
                                                onClick={() => moveItem(index, 'up')}
                                                className="p-1.5 rounded-lg bg-gray-50 text-gray-400 hover:bg-admin-primary/10 hover:text-admin-primary disabled:opacity-20 transition-colors"
                                            >
                                                <ChevronUp size={14} />
                                            </button>
                                            <button
                                                disabled={index === qaItems.length - 1}
                                                onClick={() => moveItem(index, 'down')}
                                                className="p-1.5 rounded-lg bg-gray-50 text-gray-400 hover:bg-admin-primary/10 hover:text-admin-primary disabled:opacity-20 transition-colors"
                                            >
                                                <ChevronDown size={14} />
                                            </button>
                                        </div>

                                        <div className="flex-1 min-w-0 space-y-2">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex items-center gap-2">
                                                    <HelpCircle size={18} className="text-admin-primary shrink-0" />
                                                    <h4 className="text-[#181411] font-bold text-lg leading-tight">{item.question}</h4>
                                                </div>
                                                {item.is_visible ? (
                                                    <span className="bg-green-50 text-green-600 text-[10px] font-bold px-2 py-1 rounded-full shrink-0 flex items-center gap-1">
                                                        <Eye size={10} /> 顯示中
                                                    </span>
                                                ) : (
                                                    <span className="bg-gray-100 text-gray-400 text-[10px] font-bold px-2 py-1 rounded-full shrink-0 flex items-center gap-1">
                                                        <EyeOff size={10} /> 已隱藏
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-gray-500 text-sm leading-relaxed pl-7">{item.answer}</p>
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-50">
                                        <button
                                            onClick={() => navigate(`/admin/qa/${item.id}`)}
                                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-50 text-[#181411] text-xs font-bold hover:bg-admin-primary/10 hover:text-admin-primary transition-colors"
                                        >
                                            <Edit size={14} /> 編輯
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (window.confirm('確定要刪除此問答嗎？')) onDeleteQA(item.id);
                                            }}
                                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 text-red-500 text-xs font-bold hover:bg-red-100 transition-colors"
                                        >
                                            <Trash size={14} /> 刪除
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
