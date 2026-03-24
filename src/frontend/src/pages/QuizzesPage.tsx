import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, CheckCircle, Trophy, XCircle } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AuthGuard } from "../components/AuthGuard";
import {
  useGetAllLessons,
  useGetQuiz,
  useSubmitQuiz,
} from "../hooks/useQueries";

function QuizRunner({
  lessonId,
  lessonTitle,
  onBack,
}: { lessonId: bigint; lessonTitle: string; onBack: () => void }) {
  const { data: quiz, isLoading } = useGetQuiz(lessonId);
  const { mutate: submitQuiz, isPending } = useSubmitQuiz();
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [score, setScore] = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center py-16"
        data-ocid="quizzes.loading_state"
      >
        <div className="w-full max-w-lg h-64 bg-muted rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!quiz || quiz.questions.length === 0) {
    return (
      <div
        className="text-center py-16 text-muted-foreground"
        data-ocid="quizzes.empty_state"
      >
        No quiz available for this lesson.
        <div className="mt-4">
          <Button variant="outline" onClick={onBack} data-ocid="quizzes.button">
            Back to Quizzes
          </Button>
        </div>
      </div>
    );
  }

  const q = quiz.questions[currentQ];
  const isLast = currentQ === quiz.questions.length - 1;

  const handleSelect = (optIdx: number) => {
    if (confirmed) return;
    setSelected(optIdx);
  };

  const handleConfirm = () => {
    if (selected === null) return;
    const newAnswers = [...answers, selected];
    setAnswers(newAnswers);
    setConfirmed(true);

    if (isLast) {
      submitQuiz(
        { lessonId, answers: newAnswers.map((a) => BigInt(a)) },
        {
          onSuccess: (s) => {
            setScore(Number(s));
            toast.success(
              `Quiz submitted! Score: ${s}/${quiz.questions.length}`,
            );
          },
          onError: () => toast.error("Failed to submit quiz."),
        },
      );
    }
  };

  const handleNext = () => {
    setCurrentQ((prev) => prev + 1);
    setSelected(null);
    setConfirmed(false);
  };

  if (score !== null) {
    const pct = Math.round((score / quiz.questions.length) * 100);
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        data-ocid="quizzes.success_state"
      >
        <div className="max-w-md mx-auto text-center py-12">
          <div className="w-20 h-20 rounded-full bg-chart-4/20 flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-10 h-10 text-chart-4" />
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Quiz Complete!
          </h2>
          <p className="text-muted-foreground mb-6">{lessonTitle}</p>
          <div className="text-5xl font-extrabold text-primary mb-2">
            {pct}%
          </div>
          <p className="text-muted-foreground mb-8">
            {score} out of {quiz.questions.length} correct
          </p>
          <Button
            onClick={onBack}
            className="bg-primary text-primary-foreground"
            data-ocid="quizzes.button"
          >
            Back to Quizzes
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <Button
        variant="ghost"
        onClick={onBack}
        className="mb-6"
        data-ocid="quizzes.button"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Back
      </Button>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-muted-foreground">
          Question {currentQ + 1} of {quiz.questions.length}
        </span>
        <Badge variant="outline">{lessonTitle}</Badge>
      </div>
      <div className="h-1.5 bg-muted rounded-full mb-6">
        <div
          className="h-full bg-primary rounded-full transition-all"
          style={{
            width: `${((currentQ + 1) / quiz.questions.length) * 100}%`,
          }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQ}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <h3 className="text-xl font-semibold text-foreground mb-6">
            {q.questionText}
          </h3>
          <div className="space-y-3">
            {q.options.map((opt, idx) => {
              let cls =
                "border border-border bg-card hover:bg-muted text-foreground";
              if (confirmed) {
                if (opt.isCorrect)
                  cls = "border-chart-4 bg-chart-4/10 text-foreground";
                else if (idx === selected && !opt.isCorrect)
                  cls = "border-destructive bg-destructive/10 text-foreground";
              } else if (idx === selected) {
                cls = "border-primary bg-primary/10 text-foreground";
              }
              return (
                <button
                  type="button"
                  key={opt.text}
                  onClick={() => handleSelect(idx)}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center justify-between ${cls}`}
                  data-ocid={`quizzes.radio.${idx + 1}`}
                >
                  <span>{opt.text}</span>
                  {confirmed && opt.isCorrect && (
                    <CheckCircle className="w-4 h-4 text-chart-4" />
                  )}
                  {confirmed && idx === selected && !opt.isCorrect && (
                    <XCircle className="w-4 h-4 text-destructive" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-6 flex gap-3">
            {!confirmed ? (
              <Button
                onClick={handleConfirm}
                disabled={selected === null}
                className="flex-1 bg-primary text-primary-foreground"
                data-ocid="quizzes.submit_button"
              >
                Confirm Answer
              </Button>
            ) : !isLast ? (
              <Button
                onClick={handleNext}
                className="flex-1 bg-primary text-primary-foreground"
                data-ocid="quizzes.primary_button"
              >
                Next Question
              </Button>
            ) : (
              <Button
                onClick={handleConfirm}
                disabled={isPending}
                className="flex-1 bg-chart-4 text-white"
                data-ocid="quizzes.submit_button"
              >
                {isPending ? "Submitting..." : "Submit Quiz"}
              </Button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export function QuizzesPage() {
  const { data: lessons, isLoading } = useGetAllLessons();
  const [activeLesson, setActiveLesson] = useState<{
    id: bigint;
    title: string;
  } | null>(null);

  if (isLoading) {
    return (
      <AuthGuard>
        <div
          className="container mx-auto px-4 py-16"
          data-ocid="quizzes.loading_state"
        >
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {activeLesson ? (
            <motion.div
              key="runner"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <QuizRunner
                lessonId={activeLesson.id}
                lessonTitle={activeLesson.title}
                onBack={() => setActiveLesson(null)}
              />
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Quizzes
              </h1>
              <p className="text-muted-foreground mb-8">
                Test your knowledge from each lesson
              </p>

              {(!lessons || lessons.length === 0) && (
                <div
                  className="text-center py-16 text-muted-foreground"
                  data-ocid="quizzes.empty_state"
                >
                  No lessons available yet.
                </div>
              )}

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {lessons?.map((lesson, i) => (
                  <motion.div
                    key={lesson.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    data-ocid={`quizzes.item.${i + 1}`}
                  >
                    <Card
                      className="border border-border shadow-card hover:shadow-card-hover cursor-pointer transition-all hover:-translate-y-1"
                      onClick={() =>
                        setActiveLesson({ id: BigInt(i), title: lesson.title })
                      }
                    >
                      <CardContent className="p-5">
                        <div className="flex gap-2 mb-3">
                          <Badge variant="outline" className="text-xs">
                            {lesson.category}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {lesson.difficulty}
                          </Badge>
                        </div>
                        <h3 className="font-semibold text-foreground mb-2">
                          {lesson.title}
                        </h3>
                        <Button
                          size="sm"
                          className="bg-accent text-accent-foreground hover:bg-accent/90"
                          data-ocid="quizzes.button"
                        >
                          Start Quiz
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AuthGuard>
  );
}
