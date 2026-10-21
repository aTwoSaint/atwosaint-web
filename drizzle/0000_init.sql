CREATE TYPE "public"."reference_status" AS ENUM('draft', 'published');--> statement-breakpoint
CREATE TABLE "images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"url" text NOT NULL,
	"storage_key" text NOT NULL,
	"alt" text NOT NULL,
	"width" integer NOT NULL,
	"height" integer NOT NULL,
	"mime_type" text NOT NULL,
	"size_bytes" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "references" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"category" text,
	"primary_image_id" uuid NOT NULL,
	"hover_image_id" uuid,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"status" "reference_status" DEFAULT 'published' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "references_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "references" ADD CONSTRAINT "references_primary_image_id_images_id_fk" FOREIGN KEY ("primary_image_id") REFERENCES "public"."images"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "references" ADD CONSTRAINT "references_hover_image_id_images_id_fk" FOREIGN KEY ("hover_image_id") REFERENCES "public"."images"("id") ON DELETE restrict ON UPDATE no action;