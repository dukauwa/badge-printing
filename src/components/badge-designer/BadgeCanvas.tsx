'use client';

import React, { useRef, useCallback, useEffect, useState } from 'react';
import { BadgeElement, BadgeSide, BadgePanelBackground, BADGE_LAYOUTS, DYNAMIC_FIELD_OPTIONS } from '@/types/badge';
import BadgeElementRenderer from './BadgeElementRenderer';
import ResizeHandles from './ResizeHandles';

interface BadgeCanvasProps {
  elements: BadgeElement[];
  activeSide: BadgeSide;
  selectedElementId: string | null;
  zoom: number;
  showGrid: boolean;
  panelBackgrounds?: Partial<Record<BadgeSide, BadgePanelBackground>>;
  previewAttendee?: Record<string, string> | null;
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (id: string, updates: Partial<BadgeElement>) => void;
  onDropNewElement?: (type: BadgeElement['type'], x: number, y: number) => void;
}

// Inline editing state – kept outside to avoid re-renders on every keystroke
interface InlineEditState {
  elementId: string;
  value: string;
}

export default function BadgeCanvas({
  elements,
  activeSide,
  selectedElementId,
  zoom,
  showGrid,
  panelBackgrounds,
  previewAttendee,
  onSelectElement,
  onUpdateElement,
  onDropNewElement,
}: BadgeCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });
  const [dragging, setDragging] = useState<{
    elementId: string;
    startX: number;
    startY: number;
    elStartX: number;
    elStartY: number;
  } | null>(null);
  const [resizing, setResizing] = useState<{
    elementId: string;
    handle: string;
    startX: number;
    startY: number;
    elStartX: number;
    elStartY: number;
    elStartW: number;
    elStartH: number;
  } | null>(null);

  const [inlineEdit, setInlineEdit] = useState<InlineEditState | null>(null);

  const layoutConfig = BADGE_LAYOUTS[0]; // Only foldable-badge now

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerSize({
          w: entry.contentRect.width,
          h: entry.contentRect.height,
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Calculate scale — show single panel (105 x 148.5mm)
  const padding = 48;
  const availableW = containerSize.w - padding * 2;
  const availableH = containerSize.h - padding * 2;
  const panelWmm = layoutConfig.panelWidth;
  const panelHmm = layoutConfig.panelHeight;

  let baseScale = 1;
  if (availableW > 0 && availableH > 0) {
    const scaleX = availableW / panelWmm;
    const scaleY = availableH / panelHmm;
    baseScale = Math.min(scaleX, scaleY);
  } else {
    baseScale = 3;
  }

  const pxPerMm = baseScale * zoom;
  const panelW = panelWmm * pxPerMm;
  const panelH = panelHmm * pxPerMm;

  // Get visible elements for active side
  const visibleElements = elements.filter((el) => el.side === activeSide && el.visible);
  const bg = panelBackgrounds?.[activeSide];

  const isPreview = !!previewAttendee;

  const getActiveCanvasSize = useCallback(() => {
    return { w: panelW, h: panelH };
  }, [panelW, panelH]);

  const handleElementMouseDown = useCallback(
    (e: React.MouseEvent, element: BadgeElement) => {
      if (element.locked || isPreview) return;
      // Don't start drag if we're inline-editing this element
      if (inlineEdit?.elementId === element.id) return;
      e.stopPropagation();
      onSelectElement(element.id);
      setDragging({
        elementId: element.id,
        startX: e.clientX,
        startY: e.clientY,
        elStartX: element.x,
        elStartY: element.y,
      });
    },
    [onSelectElement, isPreview, inlineEdit]
  );

  const handleElementDoubleClick = useCallback(
    (e: React.MouseEvent, element: BadgeElement) => {
      if (element.locked || isPreview) return;
      if (element.type !== 'text') return;
      e.stopPropagation();
      setDragging(null);
      setInlineEdit({ elementId: element.id, value: element.content || '' });
    },
    [isPreview]
  );

  const commitInlineEdit = useCallback(() => {
    if (!inlineEdit) return;
    onUpdateElement(inlineEdit.elementId, { content: inlineEdit.value });
    setInlineEdit(null);
  }, [inlineEdit, onUpdateElement]);

  const handleResizeStart = useCallback(
    (e: React.MouseEvent, elementId: string, handle: string) => {
      if (isPreview) return;
      e.stopPropagation();
      e.preventDefault();
      const el = elements.find((el) => el.id === elementId);
      if (!el || el.locked) return;
      setResizing({
        elementId,
        handle,
        startX: e.clientX,
        startY: e.clientY,
        elStartX: el.x,
        elStartY: el.y,
        elStartW: el.width,
        elStartH: el.height,
      });
    },
    [elements, isPreview]
  );

  useEffect(() => {
    const { w, h } = getActiveCanvasSize();

    const handleMouseMove = (e: MouseEvent) => {
      if (dragging) {
        const dx = ((e.clientX - dragging.startX) / w) * 100;
        const dy = ((e.clientY - dragging.startY) / h) * 100;
        const newX = Math.max(0, Math.min(95, dragging.elStartX + dx));
        const newY = Math.max(0, Math.min(95, dragging.elStartY + dy));
        onUpdateElement(dragging.elementId, { x: newX, y: newY });
      }
      if (resizing) {
        const dx = ((e.clientX - resizing.startX) / w) * 100;
        const dy = ((e.clientY - resizing.startY) / h) * 100;
        const { handle, elStartX, elStartY, elStartW, elStartH } = resizing;

        let newX = elStartX;
        let newY = elStartY;
        let newW = elStartW;
        let newH = elStartH;

        if (handle.includes('e')) newW = Math.max(5, elStartW + dx);
        if (handle.includes('w')) { newW = Math.max(5, elStartW - dx); newX = elStartX + dx; }
        if (handle.includes('s')) newH = Math.max(3, elStartH + dy);
        if (handle.includes('n')) { newH = Math.max(3, elStartH - dy); newY = elStartY + dy; }

        onUpdateElement(resizing.elementId, {
          x: Math.max(0, newX),
          y: Math.max(0, newY),
          width: Math.min(100, newW),
          height: Math.min(100, newH),
        });
      }
    };

    const handleMouseUp = () => {
      setDragging(null);
      setResizing(null);
    };

    if (dragging || resizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, resizing, getActiveCanvasSize, onUpdateElement]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (isPreview) return;
      const type = e.dataTransfer.getData('element-type') as BadgeElement['type'];
      if (type && onDropNewElement) {
        if (!canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        onDropNewElement(type, Math.max(0, x - 10), Math.max(0, y - 5));
      }
    },
    [onDropNewElement, isPreview]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const gridOverlay = showGrid ? (
    <div
      className="absolute inset-0 pointer-events-none opacity-[0.03]"
      style={{
        backgroundImage:
          'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
        backgroundSize: `${pxPerMm * 5}px ${pxPerMm * 5}px`,
      }}
    />
  ) : null;

  // Resolve dynamic fields for preview
  const resolveContent = (element: BadgeElement): string => {
    if (element.type === 'qr-code' && element.qrContentSource === 'dynamic-field' && element.qrDynamicField) {
      if (isPreview && previewAttendee) {
        return previewAttendee[element.qrDynamicField] || element.content || '';
      }
      // In editor mode, show the preview text from DYNAMIC_FIELD_OPTIONS
      const fieldOption = DYNAMIC_FIELD_OPTIONS.find((f) => f.key === element.qrDynamicField);
      return fieldOption?.preview || element.content || '';
    }
    if (isPreview && element.type === 'dynamic-field' && element.dynamicField && previewAttendee) {
      return previewAttendee[element.dynamicField] || element.content || '';
    }
    return element.content || '';
  };

  return (
    <div ref={containerRef} className="flex items-center justify-center w-full h-full bg-gray-100">
      <div
        ref={canvasRef}
        className="relative bg-white shadow-lg border border-gray-200 overflow-hidden"
        style={{ width: panelW, height: panelH }}
        onClick={(e) => {
          if (e.target === canvasRef.current && !isPreview) {
            if (inlineEdit) commitInlineEdit();
            onSelectElement(null);
          }
        }}
        onDrop={!isPreview ? handleDrop : undefined}
        onDragOver={!isPreview ? handleDragOver : undefined}
      >
        {/* Background image */}
        {bg?.imageUrl && (
          <div className="absolute inset-0 pointer-events-none">
            <img
              src={bg.imageUrl}
              alt=""
              className="w-full h-full"
              style={{ objectFit: bg.fit || 'cover' }}
              draggable={false}
            />
          </div>
        )}

        {/* Grid overlay */}
        {gridOverlay}

        {/* Elements */}
        {visibleElements.map((element) => {
          const isSelected = !isPreview && element.id === selectedElementId;
          const resolvedContent = resolveContent(element);
          const isInlineEditing = inlineEdit?.elementId === element.id;

          return (
            <div
              key={element.id}
              className={`badge-element ${isSelected ? 'selected' : ''} ${element.locked ? 'locked' : ''}`}
              style={{
                left: `${element.x}%`,
                top: `${element.y}%`,
                width: `${element.width}%`,
                height: `${element.height}%`,
                transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined,
                opacity: element.opacity ?? 1,
                zIndex: isSelected ? 50 : isInlineEditing ? 50 : undefined,
              }}
              onMouseDown={!isPreview ? (e) => handleElementMouseDown(e, element) : undefined}
              onDoubleClick={!isPreview ? (e) => handleElementDoubleClick(e, element) : undefined}
            >
              {isInlineEditing ? (
                <textarea
                  autoFocus
                  value={inlineEdit.value}
                  onChange={(e) => setInlineEdit({ ...inlineEdit, value: e.target.value })}
                  onBlur={commitInlineEdit}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); commitInlineEdit(); }
                    if (e.key === 'Escape') setInlineEdit(null);
                  }}
                  className="w-full h-full border-none outline-none resize-none bg-white/80 p-[2px_4px]"
                  style={{
                    fontSize: element.fontSize ? `${element.fontSize}px` : '14px',
                    fontWeight: element.fontWeight || 'normal',
                    fontFamily: element.fontFamily || 'Inter',
                    color: element.color || '#000000',
                    textAlign: element.textAlign || 'center',
                    lineHeight: 1.3,
                  }}
                />
              ) : (
                <div className="pointer-events-none w-full h-full">
                  <BadgeElementRenderer element={{ ...element, content: resolvedContent }} isPreview={isPreview} />
                </div>
              )}
              {isSelected && !element.locked && !isInlineEditing && (
                <ResizeHandles elementId={element.id} onResizeStart={handleResizeStart} />
              )}
            </div>
          );
        })}

        {/* Empty state */}
        {visibleElements.length === 0 && !isPreview && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs pointer-events-none">
            Drag elements here
          </div>
        )}
      </div>
    </div>
  );
}
