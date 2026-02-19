'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus } from 'lucide-react';
import Link from 'next/link';
import { v4 as uuidv4 } from 'uuid';
import { createNewBadge } from '@/lib/badge-store';
import {
  BadgeSegment,
  AttributeRule,
} from '@/types/badge';
import { SegmentMultiSelect, AttributeRuleRow } from '@/components/badge-designer/BadgeSettingsPanel';

// ─── Main page ───

export default function NewBadgePage() {
  const [name, setName] = useState('');
  const [segments, setSegments] = useState<BadgeSegment[]>([]);
  const [attributeRules, setAttributeRules] = useState<AttributeRule[]>([]);
  const router = useRouter();

  const handleCreate = () => {
    if (!name.trim() || segments.length === 0) return;
    const badge = createNewBadge(name.trim(), segments, attributeRules);
    router.push(`/badge-designer/${badge.id}/edit`);
  };

  const addRule = () => {
    setAttributeRules((prev) => [
      ...prev,
      { id: uuidv4(), operator: 'includes_one_of', values: [] },
    ]);
  };

  const updateRule = (id: string, updated: AttributeRule) => {
    setAttributeRules((prev) => prev.map((r) => (r.id === id ? updated : r)));
  };

  const removeRule = (id: string) => {
    setAttributeRules((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="flex flex-col h-full">
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-2xl">
          <Link
            href="/badge-designer"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 text-sm"
          >
            <ArrowLeft size={16} />
            <span className="font-semibold text-xl text-gray-900">New badge</span>
          </Link>

          {/* Name input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter badge name"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            />
          </div>

          {/* Segment multi-select dropdown */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Segments <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-400 mb-2">
              Choose the attendee segments this badge design applies to.
            </p>
            <SegmentMultiSelect selected={segments} onChange={setSegments} />
          </div>

          {/* Attributes segmentation */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Attributes segmentation
            </label>
            <p className="text-xs text-gray-400 mb-3">
              Rules are combined with AND. Add multiple rules to mix operators.
            </p>

            <div className="space-y-2">
              {attributeRules.map((rule) => (
                <AttributeRuleRow
                  key={rule.id}
                  rule={rule}
                  onUpdate={(updated) => updateRule(rule.id, updated)}
                  onRemove={() => removeRule(rule.id)}
                />
              ))}
            </div>

            <button
              onClick={addRule}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              <Plus size={14} />
              Add rule
            </button>
          </div>

          {/* Layout info */}
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 mb-8">
            <div className="flex items-start gap-4">
              <FoldableBadgePreview />
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Foldable Badge</h3>
                <p className="text-xs text-gray-500 mt-0.5">A4 sheet &middot; 210 x 297mm</p>
                <p className="text-xs text-gray-400 mt-2">
                  2 printable panels: Front and Back.
                  Your badge starts from a template — customise each panel to match your event.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed bottom bar */}
      <div className="shrink-0 border-t border-gray-200 bg-white px-8 py-4 flex justify-end">
        <button
          onClick={handleCreate}
          disabled={!name.trim() || segments.length === 0}
          className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Create Badge
        </button>
      </div>
    </div>
  );
}

function FoldableBadgePreview() {
  return (
    <svg width="80" height="110" viewBox="0 0 100 130" fill="none" className="shrink-0">
      {/* A4 sheet outline */}
      <rect x="10" y="5" width="80" height="120" rx="2" stroke="#d1d5db" strokeWidth="1" fill="white" />
      {/* Horizontal fold line at halfway */}
      <line x1="10" y1="65" x2="90" y2="65" stroke="#d1d5db" strokeWidth="0.5" strokeDasharray="3 2" />
      {/* Vertical divider in top half */}
      <line x1="50" y1="5" x2="50" y2="65" stroke="#d1d5db" strokeWidth="0.5" strokeDasharray="3 2" />
      {/* Front panel — top-left quarter */}
      <rect x="15" y="12" width="30" height="46" rx="1" stroke="#e5e7eb" strokeWidth="0.5" fill="#fafafa" />
      {/* Back panel — top-right quarter */}
      <rect x="55" y="12" width="30" height="46" rx="1" stroke="#e5e7eb" strokeWidth="0.5" fill="#fafafa" />
      <text x="30" y="39" textAnchor="middle" fontSize="8" fill="#9ca3af">Front</text>
      <text x="70" y="39" textAnchor="middle" fontSize="8" fill="#9ca3af">Back</text>
    </svg>
  );
}
