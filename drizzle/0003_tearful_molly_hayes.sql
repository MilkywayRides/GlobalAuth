CREATE TABLE "api_key" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"key" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_used_at" timestamp,
	"expires_at" timestamp,
	CONSTRAINT "api_key_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "api_key_usage" (
	"id" text PRIMARY KEY NOT NULL,
	"api_key_id" text NOT NULL,
	"date" text NOT NULL,
	"request_count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "oauth_consent" DROP CONSTRAINT "oauth_consent_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "oauth_consent" DROP CONSTRAINT "oauth_consent_client_id_oauth_application_client_id_fk";
--> statement-breakpoint
ALTER TABLE "oauth_consent" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "oauth_consent" ADD COLUMN "application_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "oauth_consent" DROP COLUMN "client_id";