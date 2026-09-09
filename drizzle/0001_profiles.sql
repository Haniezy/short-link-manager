CREATE TABLE IF NOT EXISTS profiles (
 user_id text PRIMARY KEY,
 display_name text NOT NULL,
 avatar_url text NOT NULL DEFAULT '',
 bio text NOT NULL DEFAULT ''
);
