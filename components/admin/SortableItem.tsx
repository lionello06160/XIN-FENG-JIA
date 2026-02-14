
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

interface SortableItemProps {
    id: string;
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties; // Allow overriding styles
}

export const SortableItem = ({ id, children, className, style: propStyle }: SortableItemProps) => {
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
        ...propStyle // Merge prop styles
    };

    return (
        <div ref={setNodeRef} style={style} className={className}>
            <div className="relative group h-full">
                {children}
                <div
                    {...attributes}
                    {...listeners}
                    className="absolute top-2 left-2 p-1.5 bg-white/80 backdrop-blur-sm rounded-lg opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity motion-reduce:transition-none cursor-grab active:cursor-grabbing border border-gray-100 shadow-sm z-10"
                    title="拖曳排序"
                >
                    <GripVertical size={16} className="text-gray-400" />
                </div>
            </div>
        </div>
    );
};
