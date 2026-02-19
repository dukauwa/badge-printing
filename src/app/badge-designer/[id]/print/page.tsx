'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Printer, Settings } from 'lucide-react';
import { Badge, BadgeElement, BadgeSide, BADGE_LAYOUTS, SAMPLE_ATTENDEES, AttendeeData } from '@/types/badge';
import { getBadgeById } from '@/lib/badge-store';
import BadgeElementRenderer from '@/components/badge-designer/BadgeElementRenderer';

export default function PrintBadgePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [badge, setBadge] = useState<Badge | null>(null);
  const [copies, setCopies] = useState(1);

  useEffect(() => {
    const loaded = getBadgeById(id);
    if (loaded) setBadge(loaded);
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (!badge) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-gray-400">Loading badge...</div>
      </div>
    );
  }

  const layoutConfig = BADGE_LAYOUTS[0];
  const pxPerMm = 3;

  const resolveContent = (element: BadgeElement, attendee: AttendeeData): string => {
    if (element.type === 'dynamic-field' && element.dynamicField) {
      return attendee[element.dynamicField as keyof AttendeeData] || element.content || '';
    }
    if (element.type === 'qr-code' && element.qrContentSource === 'dynamic-field' && element.qrDynamicField) {
      return attendee[element.qrDynamicField as keyof AttendeeData] || element.content || '';
    }
    return element.content || '';
  };

  const renderPrintElement = (element: BadgeElement, attendee: AttendeeData) => {
    const resolved = resolveContent(element, attendee);
    const style: React.CSSProperties = {
      position: 'absolute',
      left: `${element.x}%`,
      top: `${element.y}%`,
      width: `${element.width}%`,
      height: `${element.height}%`,
      transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined,
      opacity: element.opacity ?? 1,
    };

    return (
      <div key={element.id} style={style}>
        <BadgeElementRenderer element={{ ...element, content: resolved }} />
      </div>
    );
  };

  const getElements = (side: BadgeSide) => {
    // When frontBackSame is ON, use front elements for both panels
    const effectiveSide = badge.frontBackSame && side === 'back' ? 'front' : side;
    return badge.elements.filter((el) => el.side === effectiveSide && el.visible);
  };

  const renderBadge = (attendee: AttendeeData, index: number) => {
    const panelW = layoutConfig.panelWidth * pxPerMm;
    const panelH = layoutConfig.panelHeight * pxPerMm;
    const sheetW = layoutConfig.badgeWidth * pxPerMm;
    const sheetH = layoutConfig.badgeHeight * pxPerMm;

    const renderPanel = (side: BadgeSide) => {
      const bg = badge.panelBackgrounds?.[side];
      return (
        <div className="relative bg-white overflow-hidden" style={{ width: panelW, height: panelH }}>
          {bg?.imageUrl && (
            <div className="absolute inset-0">
              <img src={bg.imageUrl} alt="" className="w-full h-full" style={{ objectFit: bg.fit || 'cover' }} draggable={false} />
            </div>
          )}
          {getElements(side).map((el) => renderPrintElement(el, attendee))}
        </div>
      );
    };

    return (
      <div key={index} className="print-badge inline-block mb-4 break-inside-avoid">
        <div
          style={{
            width: panelW * 2 + 1,
            height: panelH + 1,
            display: 'grid',
            gridTemplateColumns: `${panelW}px 1px ${panelW}px`,
            gridTemplateRows: `${panelH}px`,
            border: '1px solid #e5e7eb',
          }}
        >
          {renderPanel('front')}
          <div style={{ borderLeft: '1px dashed #d1d5db' }} />
          {renderPanel('back')}
        </div>
      </div>
    );
  };

  return (
    <>
      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; padding: 0; }
          .print-badge { page-break-inside: avoid; }
        }
      `}</style>

      <div className="no-print p-6 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push(`/badge-designer/${id}/edit`)}
              className="p-1.5 rounded hover:bg-gray-100"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Print Preview: {badge.name}</h2>
              <p className="text-xs text-gray-500">
                {layoutConfig.label} &middot; {layoutConfig.badgeWidth} x {layoutConfig.badgeHeight}mm
                &middot; {SAMPLE_ATTENDEES.length} attendees
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Settings size={14} />
              <label>Copies per attendee:</label>
              <input
                type="number"
                min={1}
                max={10}
                value={copies}
                onChange={(e) => setCopies(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                className="w-14 px-2 py-1 border border-gray-200 rounded text-center text-sm"
              />
            </div>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 bg-gray-900 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              <Printer size={16} />
              Print Badges
            </button>
          </div>
        </div>
      </div>

      <div className="p-8 bg-gray-50 min-h-screen">
        <div className="flex flex-wrap gap-6 justify-center">
          {SAMPLE_ATTENDEES.flatMap((attendee, i) =>
            Array.from({ length: copies }, (_, c) => renderBadge(attendee, i * copies + c))
          )}
        </div>

        <div className="no-print mt-8 text-center">
          <p className="text-sm text-gray-400">
            This preview uses sample attendee data. Connect to your registration system to print real attendee badges.
          </p>
        </div>
      </div>
    </>
  );
}
