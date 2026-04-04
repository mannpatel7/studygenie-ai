export default function About() {
  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h2 className="text-3xl font-semibold text-foreground">About StudyGenie</h2>
        <p className="max-w-2xl text-sm text-muted-foreground mt-3">
          StudyGenie is a smart study platform built to help learners turn notes, PDFs, and lectures into interactive study materials.
          It combines AI summarization, quizzes, flashcards, and planning tools so you can learn more efficiently.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-foreground">AI-powered Learning</h3>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            Automatically generate summaries, flashcards, and quizzes from your study content. Spend less time organizing and more time understanding.
          </p>
        </div>
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-foreground">Personalized Study Flow</h3>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            Keep your learning on track with a planner that helps you set goals, manage time, and stay focused across every subject.
          </p>
        </div>
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-foreground">Interactive Content</h3>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            Review faster with AI quizzes and flashcards designed to reinforce your memory and improve retention.
          </p>
        </div>
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-foreground">Accessible Anytime</h3>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            Access your study resources from anywhere and keep your learning progress synchronized and easy to manage.
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <h3 className="text-2xl font-semibold text-foreground">Our mission</h3>
        <p className="mt-4 text-sm leading-7 text-muted-foreground">
          StudyGenie exists to make studying smarter, not harder. We want to help learners move faster from raw information to real understanding.
          By combining smart automation with clear progress tools, the platform helps you learn with confidence.
        </p>
      </div>
    </div>
  );
}
