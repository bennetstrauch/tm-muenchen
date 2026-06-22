CREATE TABLE info_anfragen (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant      text NOT NULL,
  locale      text NOT NULL,
  name        text NOT NULL,
  email       text NOT NULL,
  phone       text,
  message     text,
  source      text NOT NULL,
  tmw_registration_id text,
  news_subscribed boolean NOT NULL DEFAULT false,
  city        text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE info_anfragen ENABLE ROW LEVEL SECURITY;
