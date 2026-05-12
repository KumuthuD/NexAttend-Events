// ============================================================
// NexAttend Events — Centralized TypeScript Type Definitions
// Fixes the `any` everywhere problem throughout the codebase.
// ============================================================

export interface User {
  id: string;
  name: string;
  email: string;
  organization?: string;
  role?: string;
  created_at?: string;
}

export interface Event {
  id: string;
  _id?: string;
  creator_id: string;
  title: string;
  description?: string;
  slug: string;
  cover_image_url?: string;
  event_date: string;
  event_end_date?: string;
  location: string;
  capacity: number;
  status: 'draft' | 'published' | 'ongoing' | 'completed';
  category?: string;
  registration_count: number;
  checked_in_count: number;
  created_at?: string;
  updated_at?: string;
}

export interface FormField {
  id: string;
  event_id: string;
  label: string;
  field_type: 'text' | 'email' | 'number' | 'phone' | 'dropdown' | 'checkbox' | 'textarea';
  placeholder?: string;
  required: boolean;
  order: number;
  options?: string[];
  created_at?: string;
}

export interface Registration {
  id: string;
  event_id: string;
  qr_code_id: string;
  form_data: Record<string, string>;
  email: string;
  checked_in: boolean;
  checked_in_at: string | null;
  checked_out?: boolean;
  checked_out_at?: string | null;
  qr_emailed?: boolean;
  registered_at: string;
}

export interface ScanResult {
  status: 'checked_in' | 'already_checked_in' | 'error';
  message: string;
  participantName?: string;
  timestamp?: string;
}

export interface StatsData {
  totalEvents: number;
  activeEvents: number;
  totalRegistrations: number;
  totalCheckedIn: number;
}

export type EventStatus = 'draft' | 'published' | 'ongoing' | 'completed';
export type FieldType = 'text' | 'email' | 'number' | 'phone' | 'dropdown' | 'checkbox' | 'textarea';
