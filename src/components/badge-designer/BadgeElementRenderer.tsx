'use client';

import React from 'react';
import { BadgeElement, DYNAMIC_FIELD_OPTIONS } from '@/types/badge';
import { QRCodeSVG } from 'qrcode.react';

interface BadgeElementRendererProps {
  element: BadgeElement;
  isPreview?: boolean;
}

export default function BadgeElementRenderer({ element, isPreview }: BadgeElementRendererProps) {
  const baseStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: element.textAlign === 'left' ? 'flex-start' : element.textAlign === 'right' ? 'flex-end' : 'center',
    backgroundColor: element.backgroundColor || 'transparent',
    borderRadius: element.borderRadius ? `${element.borderRadius}px` : undefined,
    border: element.borderWidth ? `${element.borderWidth}px solid ${element.borderColor || '#000'}` : undefined,
    overflow: 'hidden',
  };

  switch (element.type) {
    case 'text':
      return (
        <div
          style={{
            ...baseStyle,
            fontSize: element.fontSize ? `${element.fontSize}px` : '14px',
            fontWeight: element.fontWeight || 'normal',
            fontFamily: element.fontFamily || 'Inter',
            color: element.color || '#000000',
            textAlign: element.textAlign || 'center',
            textTransform: element.textTransform || 'none',
            padding: '2px 4px',
            lineHeight: 1.3,
            wordBreak: 'break-word',
          }}
        >
          {element.content || 'Text'}
        </div>
      );

    case 'dynamic-field': {
      const field = DYNAMIC_FIELD_OPTIONS.find((f) => f.key === element.dynamicField);
      const displayText = isPreview
        ? (element.content || field?.preview || 'Dynamic Field')
        : `{${field?.label || 'Dynamic Field'}}`;
      return (
        <div
          style={{
            ...baseStyle,
            fontSize: element.fontSize ? `${element.fontSize}px` : '16px',
            fontWeight: element.fontWeight || 'bold',
            fontFamily: element.fontFamily || 'Inter',
            color: element.color || '#000000',
            textAlign: element.textAlign || 'center',
            textTransform: element.textTransform || 'none',
            padding: '2px 4px',
            lineHeight: 1.3,
          }}
        >
          <span className="relative">
            {displayText}
          </span>
        </div>
      );
    }

    case 'image':
      return (
        <div style={baseStyle}>
          {element.imageUrl ? (
            <img
              src={element.imageUrl}
              alt=""
              className="w-full h-full"
              style={{ objectFit: element.imageFit || 'contain' }}
              draggable={false}
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex flex-col items-center justify-center text-gray-400 text-xs gap-1">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="1.5" />
                <circle cx="8.5" cy="8.5" r="1.5" strokeWidth="1.5" />
                <path d="M21 15l-5-5L5 21" strokeWidth="1.5" />
              </svg>
              Image
            </div>
          )}
        </div>
      );

    case 'qr-code': {
      const qrField = DYNAMIC_FIELD_OPTIONS.find((f) => f.key === (element.qrDynamicField || 'registration_id'));
      const qrValue = isPreview
        ? (element.content || qrField?.preview || 'REG-001234')
        : (qrField?.preview || 'REG-001234');
      return (
        <div style={{ ...baseStyle, padding: '4px' }}>
          <QRCodeSVG
            value={qrValue}
            size={200}
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      );
    }

    case 'shape':
      if (element.shapeType === 'circle') {
        return (
          <div
            style={{
              ...baseStyle,
              borderRadius: '50%',
            }}
          />
        );
      }
      if (element.shapeType === 'line') {
        return (
          <div style={{ ...baseStyle, alignItems: 'center' }}>
            <div
              className="w-full"
              style={{
                height: '2px',
                backgroundColor: element.color || '#000000',
              }}
            />
          </div>
        );
      }
      // rectangle
      return <div style={baseStyle} />;

    default:
      return <div style={baseStyle} />;
  }
}
