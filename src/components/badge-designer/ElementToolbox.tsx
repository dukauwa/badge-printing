'use client';

import React from 'react';
import {
  Type,
  QrCode,
  Tag,
} from 'lucide-react';
import { BadgeElementType } from '@/types/badge';

interface ToolboxItem {
  type: BadgeElementType;
  label: string;
  icon: React.ReactNode;
  subType?: string;
}

const toolboxItems: ToolboxItem[] = [
  { type: 'text', label: 'Text', icon: <Type size={18} /> },
  { type: 'dynamic-field', label: 'Dynamic Field', icon: <Tag size={18} /> },
  { type: 'qr-code', label: 'QR Code', icon: <QrCode size={18} /> },
];

interface ElementToolboxProps {
  onAddElement: (type: BadgeElementType, subType?: string) => void;
}

export default function ElementToolbox({ onAddElement }: ElementToolboxProps) {
  const handleDragStart = (e: React.DragEvent, item: ToolboxItem) => {
    e.dataTransfer.setData('element-type', item.type);
    if (item.subType) {
      e.dataTransfer.setData('element-subtype', item.subType);
    }
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div className="p-3">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">
        Elements
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {toolboxItems.map((item, i) => (
          <button
            key={`${item.type}-${item.subType || i}`}
            className="flex flex-col items-center gap-1.5 p-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all cursor-grab active:cursor-grabbing text-gray-600 hover:text-indigo-600"
            draggable
            onDragStart={(e) => handleDragStart(e, item)}
            onClick={() => onAddElement(item.type, item.subType)}
          >
            {item.icon}
            <span className="text-xs">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
