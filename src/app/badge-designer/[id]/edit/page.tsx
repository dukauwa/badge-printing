'use client';

import React, { useEffect, useState, useCallback, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  SlidersHorizontal,
  RotateCcw,
  Grid3X3,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  Upload,
  Link2,
  Unlink,
} from 'lucide-react';
import { Badge, BadgeElement, BadgeElementType, BadgeSide, BadgeSegment, AttributeRule, BADGE_LAYOUTS, BADGE_SIDES_FOLDABLE, BADGE_SEGMENTS, SAMPLE_ATTENDEES } from '@/types/badge';
import { getBadgeById, saveBadge, createDefaultElement, duplicateElement, syncFrontToBack } from '@/lib/badge-store';
import BadgeCanvas from '@/components/badge-designer/BadgeCanvas';
import ElementToolbox from '@/components/badge-designer/ElementToolbox';
import PropertiesPanel from '@/components/badge-designer/PropertiesPanel';
import BadgeSettingsPanel from '@/components/badge-designer/BadgeSettingsPanel';

export default function BadgeEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [badge, setBadge] = useState<Badge | null>(null);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [activeSide, setActiveSide] = useState<BadgeSide>('front');
  const [zoom, setZoom] = useState(1);
  const [history, setHistory] = useState<Badge[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [saving, setSaving] = useState(false);
  const [showGrid, setShowGrid] = useState(false);

  // Preview mode
  const [isPreview, setIsPreview] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  // File upload ref for panel background
  const bgFileInputRef = useRef<HTMLInputElement>(null);

  // Activate prompt modal
  const [showActivateModal, setShowActivateModal] = useState(false);

  useEffect(() => {
    const loaded = getBadgeById(id);
    if (loaded) {
      setBadge(loaded);
      setHistory([loaded]);
      setHistoryIndex(0);
    }
  }, [id]);

  const pushHistory = useCallback(
    (newBadge: Badge) => {
      setHistory((prev) => {
        const trimmed = prev.slice(0, historyIndex + 1);
        return [...trimmed, newBadge];
      });
      setHistoryIndex((prev) => prev + 1);
    },
    [historyIndex]
  );

  const updateBadge = useCallback(
    (updater: (b: Badge) => Badge) => {
      setBadge((prev) => {
        if (!prev) return prev;
        const updated = updater(prev);
        pushHistory(updated);
        return updated;
      });
    },
    [pushHistory]
  );

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setBadge(history[newIndex]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setBadge(history[newIndex]);
    }
  };

  const handleSave = async () => {
    if (!badge) return;
    if (!badge.isActive) {
      setShowActivateModal(true);
      return;
    }
    performSave(badge);
  };

  const performSave = (badgeToSave: Badge) => {
    setSaving(true);
    saveBadge(badgeToSave);
    setTimeout(() => {
      setSaving(false);
      router.push('/badge-designer');
    }, 400);
  };

  const handleSaveAndActivate = () => {
    if (!badge) return;
    const activated = { ...badge, isActive: true };
    setBadge(activated);
    setShowActivateModal(false);
    performSave(activated);
  };

  const handleSaveInactive = () => {
    if (!badge) return;
    setShowActivateModal(false);
    performSave(badge);
  };

  const handleToggleActive = () => {
    updateBadge((b) => ({ ...b, isActive: !b.isActive }));
  };

  const handleUpdateSegments = useCallback(
    (segments: BadgeSegment[]) => {
      updateBadge((b) => ({ ...b, segments }));
    },
    [updateBadge]
  );

  const handleUpdateAttributeRules = useCallback(
    (attributeRules: AttributeRule[]) => {
      updateBadge((b) => ({ ...b, attributeRules }));
    },
    [updateBadge]
  );

  const handleToggleFrontBackSame = useCallback(() => {
    updateBadge((b) => {
      const newValue = !b.frontBackSame;
      let updated: Badge = { ...b, frontBackSame: newValue };
      if (newValue) {
        updated = syncFrontToBack(updated);
      }
      return updated;
    });
    setActiveSide('front');
    setSelectedElementId(null);
  }, [updateBadge]);

  const handleUpdateElement = useCallback(
    (elementId: string, updates: Partial<BadgeElement>) => {
      updateBadge((b) => {
        let updated: Badge = {
          ...b,
          elements: b.elements.map((el) =>
            el.id === elementId ? { ...el, ...updates } : el
          ),
        };
        if (updated.frontBackSame) {
          updated = syncFrontToBack(updated);
        }
        return updated;
      });
    },
    [updateBadge]
  );

  const handleAddElement = useCallback(
    (type: BadgeElementType) => {
      const overrides: Partial<BadgeElement> = {};
      const existingCount = badge?.elements.filter((el) => el.side === activeSide).length || 0;
      const stagger = (existingCount * 5) % 40;
      overrides.y = 5 + stagger;
      const newEl = createDefaultElement(type, activeSide, overrides);
      updateBadge((b) => {
        let updated: Badge = {
          ...b,
          elements: [...b.elements, newEl],
        };
        if (updated.frontBackSame) {
          updated = syncFrontToBack(updated);
        }
        return updated;
      });
      setSelectedElementId(newEl.id);
    },
    [activeSide, updateBadge, badge]
  );

  const handleDropNewElement = useCallback(
    (type: BadgeElementType, x: number, y: number) => {
      const newEl = createDefaultElement(type, activeSide, { x: Math.max(0, x - 10), y: Math.max(0, y - 5) });
      updateBadge((b) => ({
        ...b,
        elements: [...b.elements, newEl],
      }));
      setSelectedElementId(newEl.id);
    },
    [activeSide, updateBadge]
  );

  const handleDeleteElement = useCallback(() => {
    if (!selectedElementId) return;
    updateBadge((b) => {
      let updated: Badge = {
        ...b,
        elements: b.elements.filter((el) => el.id !== selectedElementId),
      };
      if (updated.frontBackSame) {
        updated = syncFrontToBack(updated);
      }
      return updated;
    });
    setSelectedElementId(null);
  }, [selectedElementId, updateBadge]);

  const handleDuplicateElement = useCallback(() => {
    if (!selectedElementId || !badge) return;
    const el = badge.elements.find((e) => e.id === selectedElementId);
    if (!el) return;
    const dup = duplicateElement(el);
    updateBadge((b) => {
      let updated: Badge = {
        ...b,
        elements: [...b.elements, dup],
      };
      if (updated.frontBackSame) {
        updated = syncFrontToBack(updated);
      }
      return updated;
    });
    setSelectedElementId(dup.id);
  }, [selectedElementId, badge, updateBadge]);

  // Background image handlers
  const handleSetPanelBackground = useCallback(
    (imageUrl: string) => {
      updateBadge((b) => {
        let updated: Badge = {
          ...b,
          panelBackgrounds: {
            ...b.panelBackgrounds,
            [activeSide]: { imageUrl, fit: b.panelBackgrounds?.[activeSide]?.fit || 'fill' },
          },
        };
        if (updated.frontBackSame) {
          updated = syncFrontToBack(updated);
        }
        return updated;
      });
    },
    [activeSide, updateBadge]
  );

  const handleRemovePanelBackground = useCallback(() => {
    updateBadge((b) => {
      const bgs = { ...b.panelBackgrounds };
      delete bgs[activeSide];
      let updated: Badge = { ...b, panelBackgrounds: bgs };
      if (updated.frontBackSame) {
        updated = syncFrontToBack(updated);
      }
      return updated;
    });
  }, [activeSide, updateBadge]);

  const handleBgFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        if (dataUrl) handleSetPanelBackground(dataUrl);
      };
      reader.readAsDataURL(file);
      // Reset input so the same file can be re-selected
      e.target.value = '';
    },
    [handleSetPanelBackground]
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (isPreview) {
        if (e.key === 'Escape') setIsPreview(false);
        if (e.key === 'ArrowLeft') setPreviewIndex((i) => Math.max(0, i - 1));
        if (e.key === 'ArrowRight') setPreviewIndex((i) => Math.min(SAMPLE_ATTENDEES.length - 1, i + 1));
        return;
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (
          selectedElementId &&
          !(e.target instanceof HTMLInputElement) &&
          !(e.target instanceof HTMLTextAreaElement)
        ) {
          e.preventDefault();
          handleDeleteElement();
        }
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) handleRedo();
        else handleUndo();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
        e.preventDefault();
        handleDuplicateElement();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      if (e.key === 'Escape') {
        setSelectedElementId(null);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedElementId, handleDeleteElement, handleDuplicateElement, isPreview]);

  const selectedElement = badge?.elements.find((el) => el.id === selectedElementId) || null;
  const layoutConfig = BADGE_LAYOUTS[0];
  const currentBg = badge?.panelBackgrounds?.[activeSide];

  // Preview data
  const currentAttendee = SAMPLE_ATTENDEES[previewIndex];
  const previewAttendee = isPreview ? (currentAttendee as unknown as Record<string, string>) : null;

  if (!badge) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-gray-400">Loading badge...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-96px)]">
      {/* Editor toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-white shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/badge-designer')}
            className="p-1.5 rounded hover:bg-gray-100"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-gray-900">{badge.name}</h2>
              {badge.segments?.map((segKey) => {
                const seg = BADGE_SEGMENTS.find((s) => s.key === segKey);
                return seg ? (
                  <span
                    key={segKey}
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold text-white"
                    style={{ backgroundColor: seg.color }}
                  >
                    {seg.label}
                  </span>
                ) : null;
              })}
            </div>
            <p className="text-xs text-gray-500">
              {layoutConfig.label} &middot; Panel: {layoutConfig.panelWidth} x {layoutConfig.panelHeight}mm
            </p>
          </div>
        </div>

        {/* Center: Panel tabs + Front & Back same toggle */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
            {BADGE_SIDES_FOLDABLE
              .filter((opt) => !badge.frontBackSame || opt.key === 'front')
              .map((opt) => (
              <button
                key={opt.key}
                onClick={() => {
                  setActiveSide(opt.key);
                  setSelectedElementId(null);
                }}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  activeSide === opt.key
                    ? 'bg-white shadow-sm text-gray-900'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Front & Back are the same toggle */}
          <button
            onClick={handleToggleFrontBackSame}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              badge.frontBackSame
                ? 'bg-indigo-100 text-indigo-700 border border-indigo-300'
                : 'border border-gray-200 text-gray-500 hover:bg-gray-50'
            }`}
            title={badge.frontBackSame ? 'Front & Back are synced' : 'Sync Front & Back'}
          >
            {badge.frontBackSame ? <Link2 size={14} /> : <Unlink size={14} />}
            {badge.frontBackSame ? 'Front = Back' : 'Link sides'}
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1">
          {/* Preview toggle */}
          <button
            onClick={() => {
              setIsPreview(!isPreview);
              if (!isPreview) setSelectedElementId(null);
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              isPreview
                ? 'bg-indigo-100 text-indigo-700 border border-indigo-300'
                : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
            title="Preview with sample data"
          >
            {isPreview ? <EyeOff size={14} /> : <Eye size={14} />}
            {isPreview ? 'Exit Preview' : 'Preview'}
          </button>

          <div className="w-px h-5 bg-gray-200 mx-1" />

          <button
            onClick={handleUndo}
            disabled={historyIndex <= 0 || isPreview}
            className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30"
            title="Undo (Cmd+Z)"
          >
            <Undo2 size={16} />
          </button>
          <button
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1 || isPreview}
            className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30"
            title="Redo (Cmd+Shift+Z)"
          >
            <Redo2 size={16} />
          </button>
          <div className="w-px h-5 bg-gray-200 mx-1" />
          <button
            onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
            className="p-1.5 rounded hover:bg-gray-100"
            title="Zoom out"
          >
            <ZoomOut size={16} />
          </button>
          <span className="text-xs text-gray-500 w-10 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom(Math.min(2, zoom + 0.25))}
            className="p-1.5 rounded hover:bg-gray-100"
            title="Zoom in"
          >
            <ZoomIn size={16} />
          </button>
          <button
            onClick={() => setZoom(1)}
            className="p-1.5 rounded hover:bg-gray-100"
            title="Reset zoom"
          >
            <RotateCcw size={14} />
          </button>
          <button
            onClick={() => setShowGrid((v) => !v)}
            className={`p-1.5 rounded transition-colors ${
              showGrid ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-gray-100 text-gray-500'
            }`}
            title={showGrid ? 'Hide grid' : 'Show grid'}
          >
            <Grid3X3 size={14} />
          </button>
          <div className="w-px h-5 bg-gray-200 mx-1" />

          {/* Active / Inactive toggle */}
          <button
            onClick={handleToggleActive}
            className="inline-flex items-center gap-2 px-2 py-1.5"
            title={badge.isActive ? 'Badge is active — click to deactivate' : 'Badge is inactive — click to activate'}
          >
            <span className={`w-12 text-xs font-medium text-right ${badge.isActive ? 'text-green-700' : 'text-gray-400'}`}>
              {badge.isActive ? 'Active' : 'Inactive'}
            </span>
            <span
              className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors duration-200 ${
                badge.isActive ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 mt-0.5 ${
                  badge.isActive ? 'translate-x-4 ml-0.5' : 'translate-x-0 ml-0.5'
                }`}
              />
            </span>
          </button>

          <button
            onClick={handleSave}
            className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
              saving
                ? 'bg-green-500 text-white'
                : 'bg-gray-900 text-white hover:bg-gray-800'
            }`}
          >
            <Save size={14} />
            {saving ? 'Saved!' : 'Save'}
          </button>
        </div>
      </div>

      {/* Preview attendee selector bar */}
      {isPreview && (
        <div className="flex items-center justify-center gap-4 px-4 py-2 bg-indigo-50 border-b border-indigo-200 shrink-0">
          <button
            onClick={() => setPreviewIndex((i) => Math.max(0, i - 1))}
            disabled={previewIndex === 0}
            className="p-1 rounded hover:bg-indigo-100 disabled:opacity-30"
          >
            <ChevronLeft size={16} />
          </button>
          <div className="text-sm text-indigo-800">
            <span className="font-semibold">{currentAttendee.attendee_name}</span>
            <span className="mx-2 text-indigo-400">|</span>
            <span className="text-indigo-600">{currentAttendee.attendee_title}</span>
            <span className="mx-2 text-indigo-400">|</span>
            <span className="text-indigo-600">{currentAttendee.attendee_company}</span>
            <span className="ml-3 text-xs text-indigo-400">
              ({previewIndex + 1} of {SAMPLE_ATTENDEES.length})
            </span>
          </div>
          <button
            onClick={() => setPreviewIndex((i) => Math.min(SAMPLE_ATTENDEES.length - 1, i + 1))}
            disabled={previewIndex === SAMPLE_ATTENDEES.length - 1}
            className="p-1 rounded hover:bg-indigo-100 disabled:opacity-30"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Editor body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar — hidden in preview */}
        {!isPreview && (
          <div className="w-56 border-r border-gray-200 bg-white flex flex-col shrink-0">
            <div className="flex-1 overflow-y-auto">
              <ElementToolbox onAddElement={handleAddElement} />
            </div>
          </div>
        )}

        {/* Canvas area */}
        <div className="flex-1 overflow-auto">
          <BadgeCanvas
            elements={badge.elements}
            activeSide={activeSide}
            selectedElementId={selectedElementId}
            zoom={zoom}
            showGrid={showGrid && !isPreview}
            panelBackgrounds={badge.panelBackgrounds}
            previewAttendee={previewAttendee}
            onSelectElement={setSelectedElementId}
            onUpdateElement={handleUpdateElement}
            onDropNewElement={handleDropNewElement}
          />
        </div>

        {/* Right sidebar: Properties — hidden in preview */}
        {!isPreview && (
          <div className="w-72 border-l border-gray-200 bg-white flex flex-col shrink-0">
            <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-gray-200 text-xs font-medium text-gray-700">
              <SlidersHorizontal size={14} />
              Properties
            </div>
            <div className="flex-1 overflow-y-auto">
              <PropertiesPanel
                element={selectedElement}
                onUpdate={(updates) => {
                  if (selectedElementId) {
                    handleUpdateElement(selectedElementId, updates);
                  }
                }}
                onDelete={handleDeleteElement}
                onDuplicate={handleDuplicateElement}
              />

              {/* Panel background section */}
              <div className="border-t border-gray-200 p-3 space-y-2">
                <div className="flex items-center gap-1.5">
                  <ImageIcon size={14} className="text-gray-500" />
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Panel Background
                  </h4>
                </div>
                <p className="text-[10px] text-gray-400">
                  Recommended: 1050 x 1485 px (105 x 148.5mm at 254 DPI)
                </p>

                <input
                  ref={bgFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleBgFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => bgFileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-lg px-3 py-3 text-xs text-gray-500 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/50 transition-colors cursor-pointer"
                >
                  <Upload size={14} />
                  {currentBg?.imageUrl ? 'Replace image...' : 'Choose image file...'}
                </button>

                {/* Preview thumbnail when background is set */}
                {currentBg?.imageUrl && (
                  <div className="space-y-2">
                    <div className="relative w-full h-16 rounded-md overflow-hidden border border-gray-200 bg-gray-50">
                      <img
                        src={currentBg.imageUrl}
                        alt="Background preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      onClick={handleRemovePanelBackground}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Remove background
                    </button>
                  </div>
                )}
              </div>

              {/* Badge settings: Segments & Attributes */}
              <div className="border-t border-gray-200">
                <BadgeSettingsPanel
                  segments={badge.segments || []}
                  attributeRules={badge.attributeRules || []}
                  onUpdateSegments={handleUpdateSegments}
                  onUpdateAttributeRules={handleUpdateAttributeRules}
                />
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Activate badge modal */}
      {showActivateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowActivateModal(false)} />
          <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Activate this badge?</h3>
            <p className="text-sm text-gray-500 mb-6">
              This badge is currently inactive. Would you like to activate it so it can be used for attendees?
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={handleSaveInactive}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Save as inactive
              </button>
              <button
                onClick={handleSaveAndActivate}
                className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Activate &amp; Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
