import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-2xl text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-2xl">
          ✦
        </div>

        <p className="mb-3 text-sm font-medium text-primary">
          RAG Agent
        </p>

        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Welcome to your RAG Agent
        </h1>

        <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-muted-foreground">
          Your intelligent knowledge assistant is ready. Explore your
          documents, ask questions, and get accurate answers grounded in your
          knowledge base.
        </p>

        <div className="mt-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            Go to Dashboard
            <span className="ml-2">→</span>
          </Link>
        </div>

        <p className="mt-6 text-xs text-muted-foreground">
          Your knowledge. Your documents. Your AI assistant.
        </p>
      </div>
    </main>
  );
}