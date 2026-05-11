ALTER TYPE "public"."message_role" ADD VALUE 'system';--> statement-breakpoint
ALTER TABLE "conversations" ADD COLUMN "document_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" DROP COLUMN "document_id";--> statement-breakpoint
ALTER TABLE "messages" DROP COLUMN "context";