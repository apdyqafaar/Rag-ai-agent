// app/api/inngest/route.ts

import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { uploadDocument } from "@/lib/inngest/funtions/process_document";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [uploadDocument],
});