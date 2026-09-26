ALTER TABLE "links" DROP CONSTRAINT "links_slug_unique";--> statement-breakpoint
ALTER TABLE "links" ADD COLUMN "legacy_slug" text;--> statement-breakpoint
UPDATE "links" SET "legacy_slug" = "slug";--> statement-breakpoint
ALTER TABLE "links" ADD CONSTRAINT "links_legacy_slug_unique" UNIQUE("legacy_slug");--> statement-breakpoint
ALTER TABLE "links" ADD CONSTRAINT "links_user_slug_unique" UNIQUE("user_id","slug");