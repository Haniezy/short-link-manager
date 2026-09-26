CREATE TABLE "avatars" (
	"user_id" text PRIMARY KEY NOT NULL,
	"id" uuid NOT NULL,
	"webp" text,
	CONSTRAINT "avatars_id_unique" UNIQUE("id")
);
