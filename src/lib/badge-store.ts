'use client';

import { Badge, BadgeElement, BadgeSide, BadgeSegment, BadgeLayoutType, AttributeRule, DEFAULT_ELEMENT_STYLES } from '@/types/badge';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'badge-printing-badges';

function migrateBadge(badge: Badge): Badge {
  // Migrate old layout type
  if ((badge.layout as string) === 'foldable-ticket') {
    badge.layout = 'foldable-badge' as BadgeLayoutType;
  }
  // Remove inside-left/inside-right elements
  badge.elements = badge.elements.filter(el => el.side === 'front' || el.side === 'back');
  // Remove inside-left/inside-right backgrounds
  if (badge.panelBackgrounds) {
    const { front, back } = badge.panelBackgrounds as Record<string, unknown>;
    badge.panelBackgrounds = {};
    if (front) (badge.panelBackgrounds as Record<string, unknown>).front = front;
    if (back) (badge.panelBackgrounds as Record<string, unknown>).back = back;
  }
  return badge;
}

export function syncFrontToBack(badge: Badge): Badge {
  const frontElements = badge.elements.filter(el => el.side === 'front');
  const backCopies = frontElements.map(el => ({
    ...el,
    id: uuidv4(),
    side: 'back' as BadgeSide,
  }));
  return {
    ...badge,
    elements: [...frontElements, ...backCopies],
    panelBackgrounds: {
      ...badge.panelBackgrounds,
      back: badge.panelBackgrounds?.front ? { ...badge.panelBackgrounds.front } : undefined,
    },
  };
}

export function getAllBadges(): Badge[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  const badges: Badge[] = JSON.parse(data);
  return badges.map(migrateBadge);
}

export function getBadgeById(id: string): Badge | null {
  const badges = getAllBadges();
  const badge = badges.find((b) => b.id === id) || null;
  return badge ? migrateBadge(badge) : null;
}

export function saveBadge(badge: Badge): Badge {
  const badges = getAllBadges();
  const index = badges.findIndex((b) => b.id === badge.id);
  const updated = { ...badge, updatedAt: new Date().toISOString() };
  if (index >= 0) {
    badges[index] = updated;
  } else {
    badges.push(updated);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(badges));
  return updated;
}

export function deleteBadge(id: string): void {
  const badges = getAllBadges().filter((b) => b.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(badges));
}

/**
 * Creates the default template elements for the "Front" and "Back" panels.
 * Both panels share the same layout:
 * - Dark header bar with event logo placeholder
 * - Attendee name (dynamic)
 * - Job title (dynamic)
 * - Company (dynamic)
 * - QR Code
 * - Footer bar with event hashtag
 */
function el(overrides: Partial<BadgeElement> & { id: string; type: BadgeElement['type']; side: BadgeSide }): BadgeElement {
  return {
    x: 0, y: 0, width: 50, height: 10,
    rotation: 0, locked: false, visible: true,
    ...DEFAULT_ELEMENT_STYLES,
    ...overrides,
  } as BadgeElement;
}

function createTemplateElements(): BadgeElement[] {
  const makeSide = (side: BadgeSide): BadgeElement[] => [
    // First Name
    el({ id: uuidv4(), type: 'dynamic-field', side, dynamicField: 'attendee_name',
      content: 'John', x: 5, y: 16, width: 90, height: 8,
      fontSize: 28, fontWeight: 'bold', textAlign: 'center', color: '#1a1f3d' }),
    // Last Name
    el({ id: uuidv4(), type: 'dynamic-field', side, dynamicField: 'attendee_last_name',
      content: 'Doe', x: 5, y: 27, width: 90, height: 8,
      fontSize: 28, fontWeight: 'bold', textAlign: 'center', color: '#1a1f3d' }),
    // Job Title
    el({ id: uuidv4(), type: 'dynamic-field', side, dynamicField: 'attendee_title',
      content: 'HR Manager', x: 10, y: 38, width: 80, height: 5,
      fontSize: 14, fontWeight: 'normal', textAlign: 'center', color: '#6b7280' }),
    // Company
    el({ id: uuidv4(), type: 'dynamic-field', side, dynamicField: 'attendee_company',
      content: 'idloom Inc.', x: 10, y: 45, width: 80, height: 5,
      fontSize: 15, fontWeight: 'bold', textAlign: 'center', color: '#1a1f3d' }),
    // QR Code
    el({ id: uuidv4(), type: 'qr-code', side,
      content: 'REG-001234', qrContentSource: 'dynamic-field', qrDynamicField: 'registration_id',
      x: 27, y: 54, width: 46, height: 28 }),
  ];

  return [
    ...makeSide('front'),
    ...makeSide('back'),
  ];
}

export function createNewBadge(name: string, segments: BadgeSegment[], attributeRules: AttributeRule[]): Badge {
  const badge: Badge = {
    id: uuidv4(),
    name,
    segments,
    attributeRules,
    isActive: false,
    layout: 'foldable-badge',
    elements: createTemplateElements(),
    panelBackgrounds: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  return saveBadge(badge);
}

export function createDefaultElement(
  type: BadgeElement['type'],
  side: BadgeSide,
  overrides?: Partial<BadgeElement>
): BadgeElement {
  const base: BadgeElement = {
    id: uuidv4(),
    type,
    x: 25,
    y: 25,
    width: 50,
    height: 10,
    rotation: 0,
    side,
    locked: false,
    visible: true,
    ...DEFAULT_ELEMENT_STYLES,
    ...overrides,
  };

  switch (type) {
    case 'text':
      return { ...base, content: 'New Text', fontSize: 16, height: 8 };
    case 'dynamic-field':
      return {
        ...base,
        dynamicField: 'attendee_name',
        content: 'John',
        fontSize: 20,
        fontWeight: 'bold',
        height: 10,
      };
    case 'image':
      return { ...base, height: 20, imageFit: 'contain', imageUrl: '' };
    case 'qr-code':
      return { ...base, width: 25, height: 25, content: 'REG-001234', qrContentSource: 'dynamic-field', qrDynamicField: 'registration_id' };
    case 'shape':
      return {
        ...base,
        shapeType: 'rectangle',
        backgroundColor: '#e5e7eb',
        width: 100,
        height: 8,
        x: 0,
      };
    default:
      return base;
  }
}

export function duplicateElement(element: BadgeElement): BadgeElement {
  return {
    ...element,
    id: uuidv4(),
    x: Math.min(element.x + 3, 90),
    y: Math.min(element.y + 3, 90),
  };
}
