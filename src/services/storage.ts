import type { BacklogItem } from '../types';
import { supabase } from './supabaseClient';

const TABLE = 'backlog_items';

const toRow = (item: BacklogItem, userId: string) => ({
  id: item.id,
  user_id: userId,
  type: item.type,
  title: item.title,
  description: item.description,
  notes: item.notes,
  link: item.link,
  image: item.image ?? null,
  tags: item.tags,
  priority: item.priority,
  status: item.status,
  favorite: item.favorite,
  created_at: item.createdAt,
  completed_at: item.completedAt ?? null,
  due_date: item.dueDate ?? null,
  progress: item.progress,
  fields: item.fields,
});

const fromRow = (row: Record<string, any>): BacklogItem => ({
  id: row.id,
  type: row.type,
  title: row.title,
  description: row.description ?? '',
  notes: row.notes ?? '',
  link: row.link ?? '',
  image: row.image ?? undefined,
  tags: row.tags ?? [],
  priority: row.priority,
  status: row.status,
  favorite: row.favorite,
  createdAt: row.created_at,
  completedAt: row.completed_at ?? undefined,
  dueDate: row.due_date ?? undefined,
  progress: row.progress ?? 0,
  fields: row.fields ?? {},
});

const currentUserId = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error('Not authenticated');
  return data.user.id;
};

export const repository = {
  async all(): Promise<BacklogItem[]> {
    const userId = await currentUserId();
    const { data, error } = await supabase.from(TABLE).select('*').eq('user_id', userId).order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(fromRow);
  },
  async put(item: BacklogItem): Promise<void> {
    const userId = await currentUserId();
    const { error } = await supabase.from(TABLE).upsert(toRow(item, userId));
    if (error) throw error;
  },
  async remove(id: string): Promise<void> {
    const { error } = await supabase.from(TABLE).delete().eq('id', id);
    if (error) throw error;
  },
  async replace(items: BacklogItem[]): Promise<void> {
    const userId = await currentUserId();
    const { error: delErr } = await supabase.from(TABLE).delete().eq('user_id', userId);
    if (delErr) throw delErr;
    if (items.length) {
      const { error } = await supabase.from(TABLE).insert(items.map(i => toRow(i, userId)));
      if (error) throw error;
    }
  },
};
