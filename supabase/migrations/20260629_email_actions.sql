create table if not exists email_actions (
  id              text not null default gen_random_uuid()::text primary key,
  tenant          text not null,
  event_id        text not null,
  event_title     text not null default '',
  type            text not null default 'custom',
  subject         text not null default '',
  body            text not null default '',
  scheduled_at    text not null default '',
  sent_at         text not null default '',
  status          text not null default 'pending',
  recipient_count int  not null default 0,
  error_message   text not null default '',
  created_by      text not null default 'admin'
);

alter table email_actions enable row level security;
