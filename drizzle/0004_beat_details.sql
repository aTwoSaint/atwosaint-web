ALTER TABLE "tracks" ADD COLUMN "slug" text;--> statement-breakpoint
ALTER TABLE "tracks" ADD COLUMN "bpm" integer;--> statement-breakpoint
ALTER TABLE "tracks" ADD COLUMN "musical_key" text;--> statement-breakpoint
ALTER TABLE "tracks" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "tracks" ADD COLUMN "released_on" date;--> statement-breakpoint
ALTER TABLE "tracks" ADD CONSTRAINT "tracks_slug_unique" UNIQUE("slug");