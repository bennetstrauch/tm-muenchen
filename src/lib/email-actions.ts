import { getSupabase } from './supabase';

export type EmailActionType = 'custom' | 'reminder-1' | 'reminder-2';
export type EmailActionStatus = 'pending' | 'sent' | 'failed' | 'cancelled';
export type EmailActionCreatedBy = 'admin' | 'leiter';

export type EmailAction = {
  id: string;
  eventId: string;
  eventTitle: string;
  type: EmailActionType;
  subject: string;
  body: string;
  scheduledAt: string;
  sentAt: string;
  status: EmailActionStatus;
  recipientCount: number;
  errorMessage: string;
  createdBy: EmailActionCreatedBy;
};

function rowToEmailAction(row: {
  id: string; event_id: string; event_title: string; type: string;
  subject: string; body: string; scheduled_at: string; sent_at: string;
  status: string; recipient_count: number; error_message: string; created_by: string;
}): EmailAction {
  return {
    id: row.id,
    eventId: row.event_id,
    eventTitle: row.event_title,
    type: row.type as EmailActionType,
    subject: row.subject,
    body: row.body,
    scheduledAt: row.scheduled_at,
    sentAt: row.sent_at,
    status: row.status as EmailActionStatus,
    recipientCount: row.recipient_count,
    errorMessage: row.error_message,
    createdBy: row.created_by as EmailActionCreatedBy,
  };
}

export async function getEmailActions(tenant: string, eventId?: string): Promise<EmailAction[]> {
  let query = getSupabase()
    .from('email_actions')
    .select('*')
    .eq('tenant', tenant)
    .neq('status', 'cancelled')
    .order('scheduled_at', { ascending: false });

  if (eventId) query = query.eq('event_id', eventId);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(rowToEmailAction);
}

export async function createEmailAction(tenant: string, data: Omit<EmailAction, 'id'>): Promise<EmailAction> {
  const { data: row, error } = await getSupabase()
    .from('email_actions')
    .insert({
      tenant,
      event_id: data.eventId,
      event_title: data.eventTitle,
      type: data.type,
      subject: data.subject,
      body: data.body,
      scheduled_at: data.scheduledAt,
      sent_at: data.sentAt,
      status: data.status,
      recipient_count: data.recipientCount,
      error_message: data.errorMessage,
      created_by: data.createdBy,
    })
    .select()
    .single();
  if (error) throw error;
  return rowToEmailAction(row);
}

export async function updateEmailAction(tenant: string, action: EmailAction): Promise<void> {
  const { error } = await getSupabase()
    .from('email_actions')
    .update({
      event_id: action.eventId,
      event_title: action.eventTitle,
      type: action.type,
      subject: action.subject,
      body: action.body,
      scheduled_at: action.scheduledAt,
      sent_at: action.sentAt,
      status: action.status,
      recipient_count: action.recipientCount,
      error_message: action.errorMessage,
      created_by: action.createdBy,
    })
    .eq('id', action.id)
    .eq('tenant', tenant);
  if (error) throw error;
}

export async function deleteEmailAction(tenant: string, id: string): Promise<void> {
  const { data, error } = await getSupabase()
    .from('email_actions')
    .select('*')
    .eq('id', id)
    .eq('tenant', tenant)
    .single();
  if (error) throw new Error(`EmailAction ${id} not found`);
  if (data.status !== 'pending') throw new Error('Only pending actions can be cancelled');
  await updateEmailAction(tenant, { ...rowToEmailAction(data), status: 'cancelled' });
}

export async function markEmailActionSent(tenant: string, id: string, recipientCount: number): Promise<void> {
  const { data, error } = await getSupabase()
    .from('email_actions')
    .select('*')
    .eq('id', id)
    .eq('tenant', tenant)
    .single();
  if (error) throw new Error(`EmailAction ${id} not found`);
  await updateEmailAction(tenant, {
    ...rowToEmailAction(data),
    status: 'sent',
    sentAt: new Date().toISOString(),
    recipientCount,
  });
}

export async function markEmailActionFailed(tenant: string, id: string, errorMessage: string): Promise<void> {
  const { data, error } = await getSupabase()
    .from('email_actions')
    .select('*')
    .eq('id', id)
    .eq('tenant', tenant)
    .single();
  if (error) throw new Error(`EmailAction ${id} not found`);
  await updateEmailAction(tenant, { ...rowToEmailAction(data), status: 'failed', errorMessage });
}

/**
 * Pure function — no I/O. Returns true if a reminder with the given offset
 * is due within the current windowMinutes window.
 */
export function isReminderDue(
  isoDate: string,
  time: string,
  hoursOffset: number,
  now: Date,
  windowMinutes = 60,
): boolean {
  if (hoursOffset <= 0) return false;
  const [, month] = isoDate.split('-').map(Number);
  const utcOffset = month >= 4 && month <= 10 ? 2 : 1;
  const offsetStr = utcOffset === 2 ? '+02:00' : '+01:00';
  const eventMs = new Date(`${isoDate}T${time || '19:00'}:00${offsetStr}`).getTime();
  const fireMs = eventMs - hoursOffset * 3_600_000;
  const nowMs = now.getTime();
  return fireMs <= nowMs && nowMs < fireMs + windowMinutes * 60_000;
}
