'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, MoreVertical, Pencil, Trash2, Copy } from 'lucide-react';
import { Badge, BADGE_SEGMENTS } from '@/types/badge';
import { getAllBadges, deleteBadge, saveBadge } from '@/lib/badge-store';
import { v4 as uuidv4 } from 'uuid';

export default function BadgeDesignerPage() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    setBadges(getAllBadges());
  }, []);

  // Close menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuOpen && menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  const handleDelete = (id: string) => {
    deleteBadge(id);
    setBadges(getAllBadges());
    setMenuOpen(null);
  };

  const handleDuplicate = (badge: Badge) => {
    const dup: Badge = {
      ...badge,
      id: uuidv4(),
      name: `${badge.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveBadge(dup);
    setBadges(getAllBadges());
    setMenuOpen(null);
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Badge Designer</h1>
          <p className="text-sm text-gray-500 mt-1">
            Create and manage badge designs for your event attendees.
          </p>
        </div>
        <Link
          href="/badge-designer/new"
          className="inline-flex items-center gap-2 bg-gray-900 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          <Plus size={16} />
          New Badge
        </Link>
      </div>

      {badges.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 border border-dashed border-gray-300 rounded-xl mt-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-gray-400 animate-pulse"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <circle cx="12" cy="12" r="10" strokeWidth="2" />
              <path strokeWidth="2" d="M12 6v6l4 2" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No badges created yet</h3>
          <p className="text-sm text-gray-500 mb-6">
            Create your first badge design to start sending personalized badges to your attendees.
          </p>
          <Link
            href="/badge-designer/new"
            className="inline-flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            <Plus size={16} />
            Create Your First Badge
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mt-8">
          {badges.map((badge) => {
            return (
              <div
                key={badge.id}
                className={`group relative bg-white border rounded-xl hover:shadow-md transition-shadow cursor-pointer ${
                  badge.isActive === false ? 'border-gray-200 opacity-60' : 'border-gray-200'
                }`}
                onClick={() => router.push(`/badge-designer/${badge.id}/edit`)}
              >
                {/* Badge preview thumbnail */}
                <div className="aspect-[3/4] bg-gray-50 rounded-t-xl flex items-center justify-center p-4 relative">
                  <div className="w-full max-w-[120px] bg-white border border-gray-200 rounded shadow-sm aspect-[105/149] flex flex-col items-center justify-center gap-1 p-3">
                    <div className="w-8 h-8 bg-gray-200 rounded" />
                    <div className="w-16 h-2 bg-gray-300 rounded" />
                    <div className="w-12 h-1.5 bg-gray-200 rounded" />
                    <div className="w-10 h-1.5 bg-gray-200 rounded" />
                  </div>

                  {/* Active/Inactive badge in top-left */}
                  <span
                    className={`absolute top-2 left-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                      badge.isActive === false
                        ? 'bg-gray-100 text-gray-500'
                        : 'bg-green-50 text-green-700'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        badge.isActive === false ? 'bg-gray-400' : 'bg-green-500'
                      }`}
                    />
                    {badge.isActive === false ? 'Inactive' : 'Active'}
                  </span>

                  {/* Segment pills in top-right */}
                  {badge.segments && badge.segments.length > 0 && (
                    <div className="absolute top-2 right-2 flex flex-wrap gap-0.5 justify-end max-w-[60%]">
                      {badge.segments.map((segKey) => {
                        const seg = BADGE_SEGMENTS.find((s) => s.key === segKey);
                        return seg ? (
                          <span
                            key={segKey}
                            className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold text-white"
                            style={{ backgroundColor: seg.color }}
                          >
                            {seg.label}
                          </span>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>

                {/* Badge info */}
                <div className="p-3 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-medium text-gray-900 truncate">{badge.name}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Foldable Badge &middot;{' '}
                        {badge.elements.length} elements
                      </p>
                    </div>
                    <div className="relative" ref={menuOpen === badge.id ? menuRef : undefined}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpen(menuOpen === badge.id ? null : badge.id);
                        }}
                        className="p-1 rounded hover:bg-gray-100"
                      >
                        <MoreVertical size={16} className="text-gray-400" />
                      </button>
                      {menuOpen === badge.id && (
                        <div className="fixed z-50" style={{
                          // Position using JS to avoid clipping
                        }}>
                          <DropdownMenu
                            badge={badge}
                            onEdit={() => {
                              setMenuOpen(null);
                              router.push(`/badge-designer/${badge.id}/edit`);
                            }}
                            onDuplicate={() => handleDuplicate(badge)}
                            onDelete={() => handleDelete(badge.id)}
                            buttonRef={menuRef}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function DropdownMenu({
  badge,
  onEdit,
  onDuplicate,
  onDelete,
  buttonRef,
}: {
  badge: Badge;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  buttonRef: React.RefObject<HTMLDivElement | null>;
}) {
  const menuElRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPos({
        top: rect.bottom + 4,
        left: rect.right - 160,
      });
    }
  }, [buttonRef]);

  return (
    <div
      ref={menuElRef}
      className="bg-white border border-gray-200 rounded-lg shadow-lg py-1 w-40"
      style={{ position: 'fixed', top: pos.top, left: pos.left, zIndex: 9999 }}
    >
      <button
        onClick={(e) => { e.stopPropagation(); onEdit(); }}
        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full"
      >
        <Pencil size={14} /> Edit
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full"
      >
        <Copy size={14} /> Duplicate
      </button>
      <div className="h-px bg-gray-100 my-1" />
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full"
      >
        <Trash2 size={14} /> Delete
      </button>
    </div>
  );
}
