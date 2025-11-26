CREATE TABLE "system_status" (
	"id" text PRIMARY KEY DEFAULT 'system' NOT NULL,
	"status" text DEFAULT 'on' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" text
);
--> statement-breakpoint
ALTER TABLE "system_status" ADD CONSTRAINT "system_status_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;