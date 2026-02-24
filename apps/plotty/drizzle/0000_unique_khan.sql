CREATE TABLE "plotty_polls" (
	"id" varchar(10) PRIMARY KEY NOT NULL,
	"admin_token" varchar(64) NOT NULL,
	"encrypted_data" text,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "plotty_polls_admin_token_unique" UNIQUE("admin_token")
);
--> statement-breakpoint
CREATE INDEX "idx_polls_expires_at" ON "plotty_polls" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "idx_polls_created_at" ON "plotty_polls" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_polls_admin_token" ON "plotty_polls" USING btree ("admin_token");--> statement-breakpoint
CREATE INDEX "idx_polls_encrypted_data" ON "plotty_polls" USING btree ("encrypted_data");