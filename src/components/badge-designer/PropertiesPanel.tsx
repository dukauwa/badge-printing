'use client';

import React from 'react';
import {
  Trash2,
  Copy,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  ChevronDown,
} from 'lucide-react';
import { BadgeElement, DYNAMIC_FIELD_OPTIONS, DynamicFieldKey } from '@/types/badge';

const FONT_OPTIONS = [
  { value: 'Inter', label: 'Inter' },
  { value: 'Arial', label: 'Arial' },
  { value: 'Helvetica', label: 'Helvetica' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Courier New', label: 'Courier New' },
  { value: 'Verdana', label: 'Verdana' },
  { value: 'Trebuchet MS', label: 'Trebuchet MS' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Open Sans', label: 'Open Sans' },
  { value: 'Lato', label: 'Lato' },
  { value: 'Montserrat', label: 'Montserrat' },
  { value: 'Poppins', label: 'Poppins' },
  { value: 'Raleway', label: 'Raleway' },
  { value: 'Playfair Display', label: 'Playfair Display' },
  { value: 'Oswald', label: 'Oswald' },
  { value: 'Nunito', label: 'Nunito' },
  { value: 'Source Sans 3', label: 'Source Sans 3' },
];

interface PropertiesPanelProps {
  element: BadgeElement | null;
  onUpdate: (updates: Partial<BadgeElement>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

export default function PropertiesPanel({
  element,
  onUpdate,
  onDelete,
  onDuplicate,
}: PropertiesPanelProps) {
  if (!element) {
    return (
      <div className="p-4 text-center text-gray-400 text-sm">
        Select an element to edit its properties
      </div>
    );
  }

  return (
    <div className="p-3 space-y-4 text-sm">
      {/* Header actions */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 capitalize">
          {element.type.replace('-', ' ')}
        </h3>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onUpdate({ locked: !element.locked })}
            className="p-1.5 rounded hover:bg-gray-100"
            title={element.locked ? 'Unlock' : 'Lock'}
          >
            {element.locked ? <Lock size={14} /> : <Unlock size={14} />}
          </button>
          <button
            onClick={() => onUpdate({ visible: !element.visible })}
            className="p-1.5 rounded hover:bg-gray-100"
            title={element.visible ? 'Hide' : 'Show'}
          >
            {element.visible ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>
          <button
            onClick={onDuplicate}
            className="p-1.5 rounded hover:bg-gray-100"
            title="Duplicate"
          >
            <Copy size={14} />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded hover:bg-red-50 text-red-500"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Position & Size */}
      <Section title="Position & Size">
        <div className="grid grid-cols-2 gap-2">
          <NumberInput label="X %" value={element.x} onChange={(v) => onUpdate({ x: v })} min={0} max={100} step={0.5} />
          <NumberInput label="Y %" value={element.y} onChange={(v) => onUpdate({ y: v })} min={0} max={100} step={0.5} />
          <NumberInput label="W %" value={element.width} onChange={(v) => onUpdate({ width: v })} min={1} max={100} step={0.5} />
          <NumberInput label="H %" value={element.height} onChange={(v) => onUpdate({ height: v })} min={1} max={100} step={0.5} />
        </div>
        <NumberInput label="Rotation" value={element.rotation} onChange={(v) => onUpdate({ rotation: v })} min={-180} max={180} step={1} suffix="deg" />
        <NumberInput label="Opacity" value={(element.opacity ?? 1) * 100} onChange={(v) => onUpdate({ opacity: v / 100 })} min={0} max={100} step={5} suffix="%" />
      </Section>

      {/* Dynamic field selector */}
      {element.type === 'dynamic-field' && (
        <Section title="Dynamic Field">
          <select
            value={element.dynamicField || 'attendee_name'}
            onChange={(e) => {
              const key = e.target.value as DynamicFieldKey;
              const field = DYNAMIC_FIELD_OPTIONS.find((f) => f.key === key);
              onUpdate({ dynamicField: key, content: field?.preview });
            }}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
          >
            {DYNAMIC_FIELD_OPTIONS.map((f) => (
              <option key={f.key} value={f.key}>
                {f.label}
              </option>
            ))}
          </select>
        </Section>
      )}

      {/* Text properties */}
      {(element.type === 'text' || element.type === 'dynamic-field') && (
        <Section title="Text">
          {element.type === 'text' && (
            <textarea
              value={element.content || ''}
              onChange={(e) => onUpdate({ content: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none"
              rows={2}
              placeholder="Enter text..."
            />
          )}
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500 w-12 shrink-0">Font</label>
            <select
              value={element.fontFamily || 'Inter'}
              onChange={(e) => onUpdate({ fontFamily: e.target.value })}
              className="flex-1 border border-gray-200 rounded px-2 py-1.5 text-xs bg-white"
              style={{ fontFamily: element.fontFamily || 'Inter' }}
            >
              {FONT_OPTIONS.map((font) => (
                <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                  {font.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <NumberInput
              label="Size"
              value={element.fontSize || 14}
              onChange={(v) => onUpdate({ fontSize: v })}
              min={6}
              max={72}
              step={1}
              suffix="px"
            />
            <button
              onClick={() =>
                onUpdate({
                  fontWeight: element.fontWeight === 'bold' ? 'normal' : 'bold',
                })
              }
              className={`p-2 rounded border ${
                element.fontWeight === 'bold'
                  ? 'border-indigo-300 bg-indigo-50 text-indigo-600'
                  : 'border-gray-200 text-gray-500 hover:bg-gray-50'
              }`}
            >
              <Bold size={14} />
            </button>
          </div>
          <div className="flex items-center gap-1">
            {(['left', 'center', 'right'] as const).map((align) => {
              const Icon = align === 'left' ? AlignLeft : align === 'center' ? AlignCenter : AlignRight;
              return (
                <button
                  key={align}
                  onClick={() => onUpdate({ textAlign: align })}
                  className={`p-2 rounded flex-1 ${
                    element.textAlign === align
                      ? 'bg-indigo-50 text-indigo-600 border border-indigo-300'
                      : 'border border-gray-200 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={14} className="mx-auto" />
                </button>
              );
            })}
          </div>
          <ColorInput label="Text Color" value={element.color || '#000000'} onChange={(v) => onUpdate({ color: v })} />
        </Section>
      )}

      {/* Image properties */}
      {element.type === 'image' && (
        <Section title="Image">
          <input
            type="text"
            value={element.imageUrl || ''}
            onChange={(e) => onUpdate({ imageUrl: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            placeholder="Image URL..."
          />
          <select
            value={element.imageFit || 'contain'}
            onChange={(e) => onUpdate({ imageFit: e.target.value as 'contain' | 'cover' | 'fill' })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
          >
            <option value="contain">Contain</option>
            <option value="cover">Cover</option>
            <option value="fill">Fill</option>
          </select>
        </Section>
      )}

      {/* QR Code */}
      {element.type === 'qr-code' && (
        <Section title="QR Code Content">
          <input
            type="text"
            value={element.content || ''}
            onChange={(e) => onUpdate({ content: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            placeholder="URL or text for QR code..."
          />
        </Section>
      )}

      {/* Shape properties */}
      {element.type === 'shape' && (
        <Section title="Shape">
          <select
            value={element.shapeType || 'rectangle'}
            onChange={(e) => onUpdate({ shapeType: e.target.value as 'rectangle' | 'circle' | 'line' })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
          >
            <option value="rectangle">Rectangle</option>
            <option value="circle">Circle</option>
            <option value="line">Line</option>
          </select>
        </Section>
      )}

      {/* Background & Border */}
      <Section title="Style">
        <ColorInput label="Background" value={element.backgroundColor || 'transparent'} onChange={(v) => onUpdate({ backgroundColor: v })} />
        <NumberInput label="Border Radius" value={element.borderRadius || 0} onChange={(v) => onUpdate({ borderRadius: v })} min={0} max={100} step={1} suffix="px" />
        <NumberInput label="Border Width" value={element.borderWidth || 0} onChange={(v) => onUpdate({ borderWidth: v })} min={0} max={10} step={1} suffix="px" />
        {(element.borderWidth || 0) > 0 && (
          <ColorInput label="Border Color" value={element.borderColor || '#000000'} onChange={(v) => onUpdate({ borderColor: v })} />
        )}
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</h4>
      {children}
    </div>
  );
}

function NumberInput({
  label,
  value,
  onChange,
  min,
  max,
  step,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  suffix?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-xs text-gray-500 w-12 shrink-0">{label}</label>
      <div className="relative flex-1">
        <input
          type="number"
          value={Math.round(value * 10) / 10}
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            if (!isNaN(v)) onChange(Math.min(max, Math.max(min, v)));
          }}
          min={min}
          max={max}
          step={step}
          className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs text-right pr-6"
        />
        {suffix && (
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

function ColorInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-xs text-gray-500 w-12 shrink-0">{label}</label>
      <div className="flex items-center gap-2 flex-1">
        <input
          type="color"
          value={value === 'transparent' ? '#ffffff' : value}
          onChange={(e) => onChange(e.target.value)}
          className="w-7 h-7 rounded border border-gray-200 cursor-pointer p-0.5"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 border border-gray-200 rounded px-2 py-1.5 text-xs"
        />
      </div>
    </div>
  );
}
