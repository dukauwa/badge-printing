'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Plus, Trash2, Settings2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import {
  BadgeSegment,
  BADGE_SEGMENTS,
  AttributeRule,
  AttributeOperator,
  ATTRIBUTE_OPERATORS,
  ATTRIBUTE_VALUE_OPTIONS,
} from '@/types/badge';

// ─── Multi-select dropdown for segments ───

export function SegmentMultiSelect({
  selected,
  onChange,
  compact = false,
}: {
  selected: BadgeSegment[];
  onChange: (segments: BadgeSegment[]) => void;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggle = (key: BadgeSegment) => {
    if (selected.includes(key)) {
      onChange(selected.filter((s) => s !== key));
    } else {
      onChange([...selected, key]);
    }
  };

  const remove = (key: BadgeSegment, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selected.filter((s) => s !== key));
  };

  return (
    <div ref={ref} className="relative">
      <div
        onClick={() => setOpen(!open)}
        className={`w-full border border-gray-300 rounded-lg flex items-center flex-wrap gap-1.5 cursor-pointer hover:border-gray-400 transition-colors ${
          compact ? 'min-h-[36px] px-2 py-1.5' : 'min-h-[44px] px-3 py-2'
        }`}
      >
        {selected.length === 0 && (
          <span className={`text-gray-400 ${compact ? 'text-xs' : 'text-sm'}`}>Select segments...</span>
        )}
        {selected.map((key) => {
          const seg = BADGE_SEGMENTS.find((s) => s.key === key);
          if (!seg) return null;
          return (
            <span
              key={key}
              className={`inline-flex items-center gap-1 rounded-md font-medium text-white ${
                compact ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs'
              }`}
              style={{ backgroundColor: seg.color }}
            >
              {seg.label}
              <button
                onClick={(e) => remove(key, e)}
                className="hover:bg-white/20 rounded-full p-0.5"
              >
                <X size={compact ? 8 : 10} />
              </button>
            </span>
          );
        })}
        <ChevronDown
          size={compact ? 14 : 16}
          className={`ml-auto shrink-0 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </div>
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg py-1 max-h-56 overflow-y-auto">
          {BADGE_SEGMENTS.map((seg) => {
            const isSelected = selected.includes(seg.key);
            return (
              <button
                key={seg.key}
                onClick={() => toggle(seg.key)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${
                  isSelected ? 'bg-indigo-50' : ''
                }`}
              >
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: seg.color }}
                />
                <span className={isSelected ? 'font-medium text-indigo-700' : 'text-gray-700'}>
                  {seg.label}
                </span>
                {isSelected && (
                  <svg className="ml-auto w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Multi-select dropdown for attribute values ───

export function AttributeValueSelect({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (values: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggle = (val: string) => {
    if (selected.includes(val)) {
      onChange(selected.filter((v) => v !== val));
    } else {
      onChange([...selected, val]);
    }
  };

  const remove = (val: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selected.filter((v) => v !== val));
  };

  return (
    <div ref={ref} className="relative flex-1">
      <div
        onClick={() => setOpen(!open)}
        className="w-full min-h-[36px] border border-gray-200 rounded-lg px-2.5 py-1.5 flex items-center flex-wrap gap-1 cursor-pointer hover:border-gray-400 transition-colors"
      >
        {selected.length === 0 && (
          <span className="text-xs text-gray-400">Select all that apply</span>
        )}
        {selected.map((val) => (
          <span
            key={val}
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-indigo-100 text-indigo-700"
          >
            {val}
            <button
              onClick={(e) => remove(val, e)}
              className="hover:bg-indigo-200 rounded-full p-0.5"
            >
              <X size={8} />
            </button>
          </span>
        ))}
        <ChevronDown
          size={14}
          className={`ml-auto shrink-0 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </div>
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg py-1 max-h-48 overflow-y-auto">
          {ATTRIBUTE_VALUE_OPTIONS.map((val) => {
            const isSelected = selected.includes(val);
            return (
              <button
                key={val}
                onClick={() => toggle(val)}
                className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-gray-50 transition-colors ${
                  isSelected ? 'bg-indigo-50' : ''
                }`}
              >
                <span className={isSelected ? 'font-medium text-indigo-700' : 'text-gray-700'}>
                  {val}
                </span>
                {isSelected && (
                  <svg className="ml-auto w-3.5 h-3.5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Single attribute rule row ───

export function AttributeRuleRow({
  rule,
  onUpdate,
  onRemove,
  compact = false,
}: {
  rule: AttributeRule;
  onUpdate: (updated: AttributeRule) => void;
  onRemove: () => void;
  compact?: boolean;
}) {
  const [operatorOpen, setOperatorOpen] = useState(false);
  const opRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (opRef.current && !opRef.current.contains(e.target as Node)) setOperatorOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const currentOp = ATTRIBUTE_OPERATORS.find((o) => o.key === rule.operator);

  return (
    <div className={`flex items-start gap-2 ${compact ? 'flex-col' : ''}`}>
      <div className={`flex items-start gap-2 ${compact ? 'w-full' : ''}`}>
        {/* Operator selector */}
        <div ref={opRef} className={`relative shrink-0 ${compact ? 'w-36' : 'w-48'}`}>
          <button
            onClick={() => setOperatorOpen(!operatorOpen)}
            className={`w-full flex items-center justify-between border border-gray-200 rounded-lg text-gray-700 hover:border-gray-400 transition-colors bg-white ${
              compact ? 'px-2 py-2 text-[10px]' : 'px-3 py-2.5 text-xs'
            }`}
          >
            {currentOp?.label || 'Select...'}
            <ChevronDown size={compact ? 12 : 14} className={`text-gray-400 transition-transform ${operatorOpen ? 'rotate-180' : ''}`} />
          </button>
          {operatorOpen && (
            <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg py-1">
              {ATTRIBUTE_OPERATORS.map((op) => (
                <button
                  key={op.key}
                  onClick={() => {
                    onUpdate({ ...rule, operator: op.key as AttributeOperator });
                    setOperatorOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs hover:bg-gray-50 ${
                    rule.operator === op.key ? 'bg-indigo-50 font-medium text-indigo-700' : 'text-gray-700'
                  }`}
                >
                  {op.label}
                  {rule.operator === op.key && (
                    <svg className="w-3.5 h-3.5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Remove button */}
        <button
          onClick={onRemove}
          className={`text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0 ${
            compact ? 'p-1.5 mt-0.5 ml-auto' : 'p-2 mt-0.5'
          }`}
          title="Remove rule"
        >
          <Trash2 size={compact ? 14 : 16} />
        </button>
      </div>

      {/* Values multi-select */}
      <div className={compact ? 'w-full' : 'flex-1'}>
        <AttributeValueSelect
          selected={rule.values}
          onChange={(values) => onUpdate({ ...rule, values })}
        />
      </div>
    </div>
  );
}

// ─── Badge Settings Panel (for the editor right sidebar) ───

export default function BadgeSettingsPanel({
  segments,
  attributeRules,
  onUpdateSegments,
  onUpdateAttributeRules,
}: {
  segments: BadgeSegment[];
  attributeRules: AttributeRule[];
  onUpdateSegments: (segments: BadgeSegment[]) => void;
  onUpdateAttributeRules: (rules: AttributeRule[]) => void;
}) {
  const addRule = () => {
    onUpdateAttributeRules([
      ...attributeRules,
      { id: uuidv4(), operator: 'includes_one_of', values: [] },
    ]);
  };

  const updateRule = (id: string, updated: AttributeRule) => {
    onUpdateAttributeRules(attributeRules.map((r) => (r.id === id ? updated : r)));
  };

  const removeRule = (id: string) => {
    onUpdateAttributeRules(attributeRules.filter((r) => r.id !== id));
  };

  return (
    <div className="p-3 space-y-4">
      <div className="flex items-center gap-1.5">
        <Settings2 size={14} className="text-gray-500" />
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Badge Settings
        </h4>
      </div>

      {/* Segments */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Segments
        </label>
        <p className="text-[10px] text-gray-400 mb-2">
          Attendee types this badge applies to.
        </p>
        <SegmentMultiSelect selected={segments} onChange={onUpdateSegments} compact />
      </div>

      {/* Attribute rules */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Attribute segmentation
        </label>
        <p className="text-[10px] text-gray-400 mb-2">
          Rules are combined with AND.
        </p>

        <div className="space-y-3">
          {attributeRules.map((rule) => (
            <AttributeRuleRow
              key={rule.id}
              rule={rule}
              onUpdate={(updated) => updateRule(rule.id, updated)}
              onRemove={() => removeRule(rule.id)}
              compact
            />
          ))}
        </div>

        <button
          onClick={addRule}
          className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          <Plus size={12} />
          Add rule
        </button>
      </div>
    </div>
  );
}
