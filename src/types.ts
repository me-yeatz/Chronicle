export interface CategoryItem {
  id: string;
  name: string;
  color: string;
}

export enum Category {
  WORK = 'Work',
  STUDY = 'Study',
  TRAVEL = 'Travel',
  PERSONAL = 'Personal',
  HEALTH = 'Health'
}

export const DEFAULT_CATEGORIES: CategoryItem[] = [
  { id: '1', name: 'Work', color: 'bg-charcoal' },
  { id: '2', name: 'Study', color: 'bg-sage' },
  { id: '3', name: 'Travel', color: 'bg-peach' },
  { id: '4', name: 'Personal', color: 'bg-terra' },
  { id: '5', name: 'Health', color: 'bg-indigo-400' },
];

export const CATEGORY_COLORS = [
  { name: 'Charcoal', value: 'bg-charcoal' },
  { name: 'Sage', value: 'bg-sage' },
  { name: 'Peach', value: 'bg-peach' },
  { name: 'Terra', value: 'bg-terra' },
  { name: 'Indigo', value: 'bg-indigo-400' },
  { name: 'Blue', value: 'bg-blue-500' },
  { name: 'Green', value: 'bg-green-500' },
  { name: 'Purple', value: 'bg-purple-500' },
  { name: 'Pink', value: 'bg-pink-500' },
  { name: 'Orange', value: 'bg-orange-500' },
];

export type ReminderSetting = 'none' | 'same-day' | '1-day-before' | '3-days-before' | '1-week-before';

export interface PlanEvent {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  category: string;
  notes: string;
  isJournal: boolean;
  reminderSetting: ReminderSetting;
  isReminderDismissed: boolean;
}

export interface Credential {
  id: string;
  serviceName: string;
  email: string;
  password: string;
  category: string;
}

export interface UserProfile {
  name: string;
  role: string;
  avatarUrl: string;
  aiApiKey?: string;
}

export interface AIInsight {
  type: 'conflict' | 'suggestion' | 'summary';
  message: string;
}
