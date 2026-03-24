import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle, ChevronRight, HelpCircle } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Lesson } from "../backend.d";
import { AuthGuard } from "../components/AuthGuard";
import {
  useGetAllLessons,
  useGetUserProgress,
  useUpdateUserProgress,
} from "../hooks/useQueries";

const difficultyColor: Record<string, string> = {
  beginner: "bg-chart-4/20 text-chart-4 border-chart-4/30",
  intermediate: "bg-primary/10 text-primary border-primary/30",
  advanced: "bg-destructive/10 text-destructive border-destructive/30",
};

function LessonDetail({
  lesson,
  lessonIndex,
  onBack,
}: { lesson: Lesson; lessonIndex: number; onBack: () => void }) {
  const { mutate: updateProgress, isPending } = useUpdateUserProgress();
  const { data: progress } = useGetUserProgress();
  const isCompleted = progress?.completedLessons.includes(BigInt(lessonIndex));
  const speakers = [...new Set(lesson.dialogue.map((d) => d.speaker))];

  const handleMarkComplete = () => {
    const words = lesson.vocabulary.map((v) => v.word);
    updateProgress(
      { lessonId: BigInt(lessonIndex), words },
      {
        onSuccess: () => toast.success("Lesson marked as complete! 🎉"),
        onError: () => toast.error("Failed to update progress."),
      },
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-6"
          data-ocid="conversations.button"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Lessons
        </Button>

        <div className="max-w-2xl mx-auto space-y-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Badge
                variant="outline"
                className={
                  difficultyColor[lesson.difficulty.toLowerCase()] ?? ""
                }
              >
                {lesson.difficulty}
              </Badge>
              <Badge variant="outline">{lesson.category}</Badge>
              {isCompleted && (
                <Badge className="bg-chart-4/20 text-chart-4 border-chart-4/30">
                  <CheckCircle className="w-3 h-3 mr-1" /> Completed
                </Badge>
              )}
            </div>
            <h1 className="text-3xl font-bold text-foreground">
              {lesson.title}
            </h1>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Dialogue
            </h2>
            <div className="space-y-3">
              {lesson.dialogue.map((line, i) => {
                const isFirst = line.speaker === speakers[0];
                return (
                  <div
                    key={`${line.speaker}-${i}`}
                    className={`flex ${isFirst ? "justify-start" : "justify-end"}`}
                    data-ocid="conversations.row"
                  >
                    <div
                      className={`max-w-[80%] ${
                        isFirst
                          ? "bg-muted rounded-2xl rounded-tl-sm"
                          : "bg-primary text-primary-foreground rounded-2xl rounded-tr-sm"
                      } px-4 py-3`}
                    >
                      <p
                        className={`text-xs font-semibold mb-1 ${isFirst ? "text-muted-foreground" : "text-primary-foreground/70"}`}
                      >
                        {line.speaker}
                      </p>
                      <p className="text-sm">{line.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {lesson.vocabulary.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Vocabulary
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {lesson.vocabulary.map((v) => (
                  <Card key={v.word} className="border border-border shadow-xs">
                    <CardContent className="p-4">
                      <p className="font-semibold text-primary">{v.word}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {v.definition}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {lesson.grammarTips && (
            <div className="bg-secondary/10 border border-secondary/20 rounded-xl p-5">
              <h2 className="text-lg font-semibold text-secondary mb-2 flex items-center gap-2">
                <HelpCircle className="w-5 h-5" /> Grammar Tips
              </h2>
              <p className="text-sm text-foreground whitespace-pre-line">
                {lesson.grammarTips}
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pb-8">
            <Link to="/quizzes">
              <Button
                variant="outline"
                className="flex-1"
                data-ocid="conversations.secondary_button"
              >
                <HelpCircle className="w-4 h-4 mr-2" /> Take Quiz
              </Button>
            </Link>
            <Button
              onClick={handleMarkComplete}
              disabled={isPending || !!isCompleted}
              className="flex-1 bg-chart-4 text-white hover:bg-chart-4/90"
              data-ocid="conversations.primary_button"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              {isCompleted
                ? "Already Completed"
                : isPending
                  ? "Saving..."
                  : "Mark Complete"}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function ConversationsPage() {
  const { data: lessons, isLoading } = useGetAllLessons();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (isLoading) {
    return (
      <AuthGuard>
        <div
          className="container mx-auto px-4 py-16"
          data-ocid="conversations.loading_state"
        >
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-40 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <AnimatePresence mode="wait">
        {selectedIndex !== null && lessons ? (
          <LessonDetail
            key="detail"
            lesson={lessons[selectedIndex]}
            lessonIndex={selectedIndex}
            onBack={() => setSelectedIndex(null)}
          />
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="container mx-auto px-4 py-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Daily Conversations
              </h1>
              <p className="text-muted-foreground mb-8">
                Choose a lesson to practice your English through real dialogues
              </p>

              {(!lessons || lessons.length === 0) && (
                <div
                  className="text-center py-16 text-muted-foreground"
                  data-ocid="conversations.empty_state"
                >
                  No lessons available yet. Please check back soon.
                </div>
              )}

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {lessons?.map((lesson, i) => (
                  <motion.div
                    key={lesson.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    data-ocid={`conversations.item.${i + 1}`}
                  >
                    <Card
                      className="border border-border shadow-card hover:shadow-card-hover cursor-pointer transition-all hover:-translate-y-1"
                      onClick={() => setSelectedIndex(i)}
                    >
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex gap-2 flex-wrap">
                            <Badge variant="outline" className="text-xs">
                              {lesson.category}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={`text-xs ${difficultyColor[lesson.difficulty.toLowerCase()] ?? ""}`}
                            >
                              {lesson.difficulty}
                            </Badge>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                        </div>
                        <h3 className="font-semibold text-foreground text-lg mb-1">
                          {lesson.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {lesson.dialogue.length} lines ·{" "}
                          {lesson.vocabulary.length} words
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthGuard>
  );
}
