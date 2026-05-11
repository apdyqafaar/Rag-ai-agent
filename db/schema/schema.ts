import { InferModel, relations } from "drizzle-orm";
import { pgTable, text, timestamp, boolean, index, integer, pgEnum } from "drizzle-orm/pg-core";

export const userRole=pgEnum("user_role",[
  "user",
  "admin",
  "moderator"
])
export const documentStatusEnum=pgEnum('document_status',[
  "processing",
  "failed",
  "completed",
  "uploading"
])
export const messageRoleEnum=pgEnum('message_role',[
  "user",
  "assistant",
  "system"
])
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
   role: userRole("role").default("user").notNull(), // Enum types
  banned: boolean("banned").default(false),
  banReason: text("ban_reason"),
  banExpires: timestamp("ban_expires"),
});
export type IUser=InferModel<typeof user>

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    impersonatedBy: text("impersonated_by"),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);



// document meta data
export const documentsTable = pgTable("documents", {
  id: text("id").primaryKey(),

  // Human info
  title: text("title").notNull(),
  description: text("description"),
  
  // Source tracking
  source: text("source"), 
  sourceUrl: text("source_url"),

  // Versioning
  version: text("version"),
  isActive: boolean("is_active").default(true),

  // Ownership / multi-tenant (optional)
  userId: text("userId").references(() => user.id, { onDelete: "cascade" }).notNull(),

  // Stats
  status: documentStatusEnum("status").default("processing").notNull(),
  documentType: text("document_type").notNull(),
  chunkCount: integer("chunk_count").default(0),
  tokenCount: integer("token_count"),
  contentLength:integer("content_length").default(0),
  vectorCount:integer("vector_count").default(0),
  size: text("size").notNull(),

  // Progress: 0 to 100
  progress: integer("progress").default(0).notNull(),

  // Timestamps
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
});
export type IDocument=InferModel<typeof documentsTable>

export const conversationsTable = pgTable("conversations", {
  id: text("id").primaryKey(),
  documentId: text("document_id").references(() => documentsTable.id, { onDelete: "cascade" }).notNull(),
  title: text("title"),
  userId: text("userId").references(() => user.id, { onDelete: "cascade" }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
});
export type IConversation=InferModel<typeof conversationsTable>

export const messagesTable = pgTable("messages", {
  id: text("id").primaryKey(),
  conversationId: text("conversation_id").references(() => conversationsTable.id, { onDelete: "cascade" }).notNull(),
  role: messageRoleEnum("role").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
export type IMessage=InferModel<typeof messagesTable>


// relations
export const userRelations = relations(user, ({ many }) => ({
  documents: many(documentsTable),
  sessions: many(session),
  accounts: many(account),
  conversations: many(conversationsTable),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const documentRelations = relations(documentsTable, ({ one }) => ({
  owner: one(user, {
    fields: [documentsTable.userId],
    references: [user.id],
  }),
}));

export const conversationRelations = relations(conversationsTable, ({ one, many }) => ({
  owner: one(user, {
    fields: [conversationsTable.userId],
    references: [user.id],
  }),
  messages: many(messagesTable),
}));

export const messageRelations = relations(messagesTable, ({ one }) => ({
  conversation: one(conversationsTable, {
    fields: [messagesTable.conversationId],
    references: [conversationsTable.id],
  }),
}));

// exporting the schema
export const schema={
    user,
    account,
    session,
    verification,
    documentsTable,
    conversationsTable,
    messagesTable,
}




