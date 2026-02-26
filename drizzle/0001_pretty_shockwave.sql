ALTER TABLE "documents" ALTER COLUMN "source" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "document_type" text NOT NULL;