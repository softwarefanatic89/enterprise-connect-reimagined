CREATE TABLE public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id text NOT NULL,
  sender_id text NOT NULL,
  role text NOT NULL DEFAULT 'DEV',
  department text NOT NULL DEFAULT 'DPT-ENG',
  module text NOT NULL DEFAULT 'MOD-CHAT-CORE',
  status text NOT NULL DEFAULT 'CODING',
  priority text NOT NULL DEFAULT 'P2',
  body text NOT NULL,
  author_uid uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX chat_messages_conv_created_idx ON public.chat_messages (conversation_id, created_at DESC);

GRANT SELECT ON public.chat_messages TO anon;
GRANT SELECT, INSERT ON public.chat_messages TO authenticated;
GRANT ALL ON public.chat_messages TO service_role;

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read workspace messages"
  ON public.chat_messages FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Signed-in users can post messages"
  ON public.chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_uid);

ALTER TABLE public.chat_messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;