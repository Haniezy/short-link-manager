-- This migration intentionally refuses to discard existing legacy accounts or links.
-- Neon Auth identities cannot be inferred safely from an old email/password row.
LOCK TABLE "users", "sessions", "links", "clicks" IN ACCESS EXCLUSIVE MODE;
--> statement-breakpoint
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM "users") OR EXISTS (SELECT 1 FROM "sessions")
    OR EXISTS (SELECT 1 FROM "links") OR EXISTS (SELECT 1 FROM "clicks") THEN
    RAISE EXCEPTION 'Legacy data exists. Export it and plan an explicit Neon Auth identity migration first.';
  END IF;
END $$;
--> statement-breakpoint
ALTER TABLE "links" DROP CONSTRAINT "links_user_id_users_id_fk";
--> statement-breakpoint
DROP TABLE "sessions";
--> statement-breakpoint
DROP TABLE "users";
--> statement-breakpoint
DROP INDEX "clicks_link_id_idx";
--> statement-breakpoint
DROP INDEX "links_slug_idx";
--> statement-breakpoint
ALTER TABLE "links" ALTER COLUMN "user_id" SET DATA TYPE text;
--> statement-breakpoint
CREATE INDEX "clicks_link_date_idx" ON "clicks" USING btree ("link_id","created_at");
--> statement-breakpoint
ALTER TABLE "links" ADD CONSTRAINT "links_clicks_nonnegative" CHECK ("links"."clicks" >= 0);
