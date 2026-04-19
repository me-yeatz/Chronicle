import Dexie, { Table } from 'dexie';
import { PlanEvent, Note, Credential, UserProfile, CategoryItem } from '../types';

export class ChronicleDatabase extends Dexie {
  events!: Table<PlanEvent>;
  notes!: Table<Note>;
  credentials!: Table<Credential>;
  userProfile!: Table<{ id: string, data: UserProfile }>;
  categories!: Table<{ id: string, data: CategoryItem[] }>;

  constructor() {
    super('ChronicleDatabase');
    this.version(1).stores({
      events: 'id, startDate, endDate, category',
      notes: 'id, date, title',
      credentials: 'id, serviceName, category',
      userProfile: 'id',
      categories: 'id'
    });
  }
}

export const db = new ChronicleDatabase();
