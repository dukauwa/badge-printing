'use client';

import React from 'react';
import {
  Eye,
  EyeOff,
  Lock,
  Unlock,
  GripVertical,
  Type,
  Image,
  QrCode,
  Square,
  Tag,
} from 'lucide-react';
import { BadgeElement, BadgeSide } from '@/types/badge';

interface LayersPanelProps {
  elements: BadgeElement[];
  activeSide: BadgeSide;
  selectedElementId: string | null;
  onSelectElement: (id: string) => void;
  onUpdateElement: (id: string, updates: Partial<BadgeElement>) => void;
  onReorderElements: (fromIndex: number, toIndex: number) => void;
}

function getElementIcon(type: BadgeElement['type']) {
  switch (type) {
    case 'text':
      return <Type size={14} />;
    case 'dynamic-field':
      return <Tag size={14} />;
    case 'image':
      return <Image size={14} />;
    case 'qr-code':
      return <QrCode size={14} />;
    case 'shape':
      return <Square size={14} />;
    default:
      return <Square size={14} />;
  }
}

function getElementLabel(element: BadgeElement): string {
  switch (element.type) {
    case 'text':
      return element.content?.slice(0, 20) || 'Text';
    case 'dynamic-field':
      return element.dynamicField?.replace(/_/g, ' ') || 'Dynamic Field';
    case 'image':
      return 'Image';
    case 'qr-code':
      return 'QR Code';
    case 'shape':
      return element.shapeType || 'Shape';
    default:
      return element.type;
  }
}

export default function LayersPanel({
  elements,
  activeSide,
  selectedElementId,
  onSelectElement,
  onUpdateElement,
  onReorderElements,
}: LayersPanelProps) {
  const sideElements = elements.filter((el) => el.side === activeSide);
  const [dragIndex, setDragIndex] = React.useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex !== null && dragIndex !== index) {
      onReorderElements(dragIndex, index);
      setDragIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDragIndex(null);
  };

  return (
    <div className="p-3">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">
        Layers ({sideElements.length})
      </h3>
      {sideElements.length === 0 ? (
        <p className="text-xs text-gray-400 px-1">No elements on this side</p>
      ) : (
        <div className="space-y-0.5">
          {sideElements.map((element, idx) => (
            <div
              key={element.id}
              className={`flex items-center gap-1 px-2 py-1.5 rounded cursor-pointer transition-colors group ${
                element.id === selectedElementId
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'hover:bg-gray-50 text-gray-700'
              }`}
              onClick={() => onSelectElement(element.id)}
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDragEnd={handleDragEnd}
            >
              <GripVertical
                size={12}
                className="text-gray-300 cursor-grab shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
              />
              <span className="shrink-0">{getElementIcon(element.type)}</span>
              <span className="text-xs truncate flex-1 capitalize">
                {getElementLabel(element)}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateElement(element.id, { visible: !element.visible });
                }}
                className="p-0.5 rounded hover:bg-gray-200/50 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                {element.visible ? (
                  <Eye size={12} className="text-gray-400" />
                ) : (
                  <EyeOff size={12} className="text-gray-300" />
                )}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateElement(element.id, { locked: !element.locked });
                }}
                className="p-0.5 rounded hover:bg-gray-200/50 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                {element.locked ? (
                  <Lock size={12} className="text-gray-400" />
                ) : (
                  <Unlock size={12} className="text-gray-300" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
