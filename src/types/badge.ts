export type BadgeLayoutType = 'foldable-badge';

export type BadgeSegment =
  | 'attendee'
  | 'vip'
  | 'speaker'
  | 'exhibitor'
  | 'sponsor'
  | 'press'
  | 'staff'
  | 'buyer';

export const BADGE_SEGMENTS: { key: BadgeSegment; label: string; color: string }[] = [
  { key: 'attendee', label: 'Attendee', color: '#3b82f6' },
  { key: 'vip', label: 'VIP', color: '#eab308' },
  { key: 'speaker', label: 'Speaker', color: '#8b5cf6' },
  { key: 'exhibitor', label: 'Exhibitor', color: '#f97316' },
  { key: 'sponsor', label: 'Sponsor', color: '#ec4899' },
  { key: 'press', label: 'Press', color: '#14b8a6' },
  { key: 'staff', label: 'Staff', color: '#6b7280' },
  { key: 'buyer', label: 'Buyer', color: '#10b981' },
];

// --- Attribute Segmentation ---

export type AttributeOperator = 'includes_one_of' | 'includes_all_of' | 'does_not_include';

export const ATTRIBUTE_OPERATORS: { key: AttributeOperator; label: string }[] = [
  { key: 'includes_one_of', label: 'Includes one of' },
  { key: 'includes_all_of', label: 'Includes all of' },
  { key: 'does_not_include', label: 'Does not include' },
];

export interface AttributeRule {
  id: string;
  operator: AttributeOperator;
  values: string[];
}

// Predefined attribute values users can pick from
export const ATTRIBUTE_VALUE_OPTIONS: string[] = [
  'Premium',
  'Standard',
  'Free',
  'Early Bird',
  'Late Registration',
  'Online',
  'In-Person',
  'Day 1 Only',
  'Day 2 Only',
  'Full Access',
  'Workshop',
  'Networking',
  'Gala Dinner',
  'Student',
  'Corporate',
];

// --- End Attribute Segmentation ---

export type BadgeSide = 'front' | 'back';

export const BADGE_SIDES_FOLDABLE: { key: BadgeSide; label: string }[] = [
  { key: 'front', label: 'Front' },
  { key: 'back', label: 'Back' },
];

export interface BadgeLayout {
  type: BadgeLayoutType;
  label: string;
  description: string;
  badgeWidth: number;  // in mm (full sheet for foldable)
  badgeHeight: number; // in mm (full sheet for foldable)
  panelWidth: number;  // in mm (single panel)
  panelHeight: number; // in mm (single panel)
  pageDescription: string;
}

export const BADGE_LAYOUTS: BadgeLayout[] = [
  {
    type: 'foldable-badge',
    label: 'Foldable Badge',
    description: '2 printable panels: Front and Back',
    badgeWidth: 210,
    badgeHeight: 297,
    panelWidth: 105,
    panelHeight: 148.5,
    pageDescription: 'A4 sheet folded in 2',
  },
];

export type BadgeElementType =
  | 'text'
  | 'image'
  | 'qr-code'
  | 'shape'
  | 'dynamic-field';

export type DynamicFieldKey =
  | 'attendee_name'
  | 'attendee_title'
  | 'attendee_company'
  | 'attendee_email'
  | 'event_name'
  | 'event_date'
  | 'ticket_type'
  | 'registration_id';

export type QrContentSource = 'static' | 'dynamic-field';

export interface BadgeElement {
  id: string;
  type: BadgeElementType;
  x: number;       // percentage from left (0-100)
  y: number;       // percentage from top (0-100)
  width: number;   // percentage of badge width (0-100)
  height: number;  // percentage of badge height (0-100)
  rotation: number;
  side: BadgeSide;
  locked: boolean;
  visible: boolean;
  // Type-specific properties
  content?: string;
  fontSize?: number;
  fontWeight?: 'normal' | 'bold';
  fontFamily?: string;
  textAlign?: 'left' | 'center' | 'right';
  color?: string;
  backgroundColor?: string;
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  imageUrl?: string;
  imageFit?: 'contain' | 'cover' | 'fill';
  dynamicField?: DynamicFieldKey;
  shapeType?: 'rectangle' | 'circle' | 'line';
  opacity?: number;
  qrContentSource?: QrContentSource;
  qrDynamicField?: DynamicFieldKey;
}

export interface BadgePanelBackground {
  imageUrl: string;
  fit: 'contain' | 'cover' | 'fill';
}

export interface Badge {
  id: string;
  name: string;
  segments: BadgeSegment[];
  attributeRules: AttributeRule[];
  isActive: boolean;
  layout: BadgeLayoutType;
  elements: BadgeElement[];
  panelBackgrounds?: Partial<Record<BadgeSide, BadgePanelBackground>>;
  createdAt: string;
  updatedAt: string;
  thumbnail?: string;
  frontBackSame?: boolean;
}

export interface AttendeeData {
  attendee_name: string;
  attendee_title: string;
  attendee_company: string;
  attendee_email: string;
  ticket_type: string;
  event_name: string;
  event_date: string;
  registration_id: string;
}

export const SAMPLE_ATTENDEES: AttendeeData[] = [
  { attendee_name: 'John Doe', attendee_title: 'CEO', attendee_company: 'Acme Corp', attendee_email: 'john@acme.com', ticket_type: 'VIP', event_name: 'Annual Conference 2025', event_date: '20/03/2025', registration_id: 'REG-001234' },
  { attendee_name: 'Jane Smith', attendee_title: 'CTO', attendee_company: 'TechStart', attendee_email: 'jane@techstart.io', ticket_type: 'General', event_name: 'Annual Conference 2025', event_date: '20/03/2025', registration_id: 'REG-001235' },
  { attendee_name: 'Mike Johnson', attendee_title: 'Senior Product Designer', attendee_company: 'Creative Inc', attendee_email: 'mike@creative.co', ticket_type: 'Speaker', event_name: 'Annual Conference 2025', event_date: '20/03/2025', registration_id: 'REG-001236' },
  { attendee_name: 'Sarah Williams', attendee_title: 'VP Marketing', attendee_company: 'GrowthCo', attendee_email: 'sarah@growthco.com', ticket_type: 'VIP', event_name: 'Annual Conference 2025', event_date: '20/03/2025', registration_id: 'REG-001237' },
  { attendee_name: 'Dr. Alexandra Konstantinidis', attendee_title: 'Head of International Business Development', attendee_company: 'Mediterranean Ventures International', attendee_email: 'alexandra@medventures.gr', ticket_type: 'Speaker', event_name: 'Annual Conference 2025', event_date: '20/03/2025', registration_id: 'REG-001238' },
  { attendee_name: 'Li Wei', attendee_title: 'Intern', attendee_company: 'StartupXYZ', attendee_email: 'li@startupxyz.com', ticket_type: 'General', event_name: 'Annual Conference 2025', event_date: '20/03/2025', registration_id: 'REG-001239' },
];

export interface BadgeEditorState {
  badge: Badge | null;
  selectedElementId: string | null;
  activeSide: BadgeSide;
  zoom: number;
  isDragging: boolean;
  isResizing: boolean;
  history: Badge[];
  historyIndex: number;
}

export const DYNAMIC_FIELD_OPTIONS: { key: DynamicFieldKey; label: string; preview: string }[] = [
  { key: 'attendee_name', label: 'First Name', preview: 'JOHN' },
  { key: 'attendee_title', label: 'Job Title', preview: 'HR Manager' },
  { key: 'attendee_company', label: 'Company', preview: 'idloom Inc.' },
  { key: 'attendee_email', label: 'Email', preview: 'john@example.com' },
  { key: 'event_name', label: 'Event Name', preview: 'Annual Conference' },
  { key: 'event_date', label: 'Event Date', preview: '20/03/2030' },
  { key: 'ticket_type', label: 'Ticket Type', preview: 'Member registration' },
  { key: 'registration_id', label: 'Registration ID', preview: 'REG-001234' },
];

export const DEFAULT_ELEMENT_STYLES: Partial<BadgeElement> = {
  fontSize: 14,
  fontWeight: 'normal',
  fontFamily: 'Inter',
  textAlign: 'center',
  color: '#000000',
  backgroundColor: 'transparent',
  borderRadius: 0,
  borderWidth: 0,
  borderColor: '#000000',
  opacity: 1,
  rotation: 0,
  locked: false,
  visible: true,
};
