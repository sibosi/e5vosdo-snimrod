import CodeLoginForm from "@/components/CodeLoginForm";

export default function CodeLoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-5 text-foreground">
      <div className="flex w-full max-w-md flex-col items-center gap-5 rounded-2xl border-2 p-6">
        <div className="text-center">
          <h1 className="text-3xl font-semibold">Bejelentkezés kóddal</h1>
          <p className="mt-2 text-sm">Írd be a másik eszközön generált, 5 percig érvényes kódot.</p>
        </div>
        <CodeLoginForm />
      </div>
    </main>
  );
}