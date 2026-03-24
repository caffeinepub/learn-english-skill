import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BookOpen, Star, Trophy, Zap } from "lucide-react";
import { motion } from "motion/react";
import { AuthGuard } from "../components/AuthGuard";
import { useGetAllLessons, useGetUserProgress } from "../hooks/useQueries";

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <Card className="border border-border shadow-card">
      <CardContent className="p-6 flex items-center gap-4">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}
        >
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <div className="text-2xl font-bold text-foreground">{value}</div>
          <div className="text-sm text-muted-foreground">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ProgressPage() {
  const { data: progress, isLoading } = useGetUserProgress();
  const { data: lessons } = useGetAllLessons();

  const completed = progress?.completedLessons.length ?? 0;
  const words = progress?.wordsLearned.length ?? 0;
  const streak = Number(progress?.streakDays ?? 0);
  const totalLessons = lessons?.length ?? 10;
  const pct =
    totalLessons > 0 ? Math.round((completed / totalLessons) * 100) : 0;
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (pct / 100) * circumference;
  const quizScoreMap = new Map(
    progress?.quizScores.map(([id, s]) => [Number(id), Number(s)]) ?? [],
  );

  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">My Progress</h1>
        <p className="text-muted-foreground mb-8">
          Track your English learning journey
        </p>

        {isLoading ? (
          <div className="space-y-6" data-ocid="progress.loading_state">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
            <Skeleton className="h-64" />
          </div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
            >
              <StatCard
                icon={BookOpen}
                label="Lessons Completed"
                value={completed}
                color="bg-primary/10 text-primary"
              />
              <StatCard
                icon={Star}
                label="Words Learned"
                value={words}
                color="bg-secondary/10 text-secondary"
              />
              <StatCard
                icon={Zap}
                label="Day Streak"
                value={streak}
                color="bg-accent/10 text-accent"
              />
              <StatCard
                icon={Trophy}
                label="Quizzes Taken"
                value={quizScoreMap.size}
                color="bg-chart-4/20 text-chart-4"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border border-border shadow-card mb-8">
                <CardContent className="p-8">
                  <h2 className="text-xl font-semibold text-foreground mb-6">
                    Overall Course Progress
                  </h2>
                  <div className="flex flex-col sm:flex-row items-center gap-8">
                    <div className="relative w-40 h-40 shrink-0">
                      <svg
                        className="w-full h-full -rotate-90"
                        viewBox="0 0 120 120"
                        role="img"
                        aria-label={`Progress: ${pct}% complete`}
                      >
                        <circle
                          cx="60"
                          cy="60"
                          r="54"
                          fill="none"
                          stroke="oklch(var(--muted))"
                          strokeWidth="10"
                        />
                        <circle
                          cx="60"
                          cy="60"
                          r="54"
                          fill="none"
                          stroke="oklch(var(--primary))"
                          strokeWidth="10"
                          strokeLinecap="round"
                          strokeDasharray={circumference}
                          strokeDashoffset={offset}
                          style={{ transition: "stroke-dashoffset 1s ease" }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-bold text-foreground">
                          {pct}%
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Complete
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Lessons</span>
                          <span className="font-medium">
                            {completed} / {totalLessons}
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">
                            Vocabulary
                          </span>
                          <span className="font-medium">{words} words</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full">
                          <div
                            className="h-full bg-secondary rounded-full"
                            style={{ width: `${Math.min(100, words)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {progress && progress.completedLessons.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="border border-border shadow-card">
                  <CardContent className="p-0">
                    <div className="px-6 py-4 border-b border-border">
                      <h2 className="text-xl font-semibold text-foreground">
                        Completed Lessons
                      </h2>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>#</TableHead>
                          <TableHead>Lesson</TableHead>
                          <TableHead>Quiz Score</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {progress.completedLessons.map((id, i) => {
                          const idx = Number(id);
                          const lesson = lessons?.[idx];
                          const quizScore = quizScoreMap.get(idx);
                          return (
                            <TableRow
                              key={id.toString()}
                              data-ocid={`progress.row.${i + 1}`}
                            >
                              <TableCell className="text-muted-foreground">
                                {i + 1}
                              </TableCell>
                              <TableCell className="font-medium">
                                {lesson?.title ?? `Lesson ${idx + 1}`}
                              </TableCell>
                              <TableCell>
                                {quizScore !== undefined
                                  ? `${quizScore} pts`
                                  : "—"}
                              </TableCell>
                              <TableCell>
                                <span className="inline-flex items-center gap-1 text-chart-4 text-sm font-medium">
                                  <Trophy className="w-3.5 h-3.5" /> Completed
                                </span>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {progress && progress.completedLessons.length === 0 && (
              <div
                className="text-center py-12 text-muted-foreground"
                data-ocid="progress.empty_state"
              >
                <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>
                  No lessons completed yet. Start learning to track your
                  progress!
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </AuthGuard>
  );
}
