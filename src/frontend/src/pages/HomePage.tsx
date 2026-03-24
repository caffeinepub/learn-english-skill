import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  HelpCircle,
  Lightbulb,
  MessageCircle,
  Star,
} from "lucide-react";
import { motion } from "motion/react";
import { UserRole } from "../backend.d";
import { useGetUserProgress, useGetUserRole } from "../hooks/useQueries";

const features = [
  {
    icon: MessageCircle,
    title: "Daily Conversations",
    desc: "Practice real-life English dialogues from everyday situations.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: BookOpen,
    title: "Vocabulary Flashcards",
    desc: "Master new words with interactive flip cards and spaced repetition.",
    color: "text-secondary",
    bg: "bg-secondary/10",
  },
  {
    icon: HelpCircle,
    title: "Fun Quizzes",
    desc: "Test your knowledge and earn points with engaging quizzes.",
    color: "text-accent",
    bg: "bg-accent/10",
  },
];

const modules = [
  {
    icon: MessageCircle,
    title: "Daily Conversations",
    to: "/conversations",
    color: "bg-primary",
    desc: "Learn from real dialogues",
  },
  {
    icon: BookOpen,
    title: "Vocabulary",
    to: "/vocabulary",
    color: "bg-secondary",
    desc: "Build your word bank",
  },
  {
    icon: HelpCircle,
    title: "Quizzes",
    to: "/quizzes",
    color: "bg-accent",
    desc: "Test your skills",
  },
  {
    icon: Lightbulb,
    title: "Grammar Tips",
    to: "/conversations",
    color: "bg-chart-4",
    desc: "Master the rules",
  },
];

function ProgressPreview() {
  const { data: role } = useGetUserRole();
  const { data: progress } = useGetUserProgress();
  const isLoggedIn = role && role !== UserRole.guest;

  if (!isLoggedIn) {
    return (
      <div className="bg-card rounded-2xl p-8 shadow-card text-center">
        <p className="text-muted-foreground">
          Login to track your learning progress
        </p>
        <Link to="/progress">
          <Button
            variant="outline"
            className="mt-4"
            data-ocid="home.secondary_button"
          >
            View Progress
          </Button>
        </Link>
      </div>
    );
  }

  const completed = progress?.completedLessons.length ?? 0;
  const words = progress?.wordsLearned.length ?? 0;
  const streak = Number(progress?.streakDays ?? 0);
  const totalLessons = 10;
  const pct = Math.round((completed / totalLessons) * 100);
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="bg-card rounded-2xl p-8 shadow-card">
      <h3 className="text-xl font-bold text-foreground mb-6">Your Progress</h3>
      <div className="flex flex-col sm:flex-row items-center gap-8">
        <div className="relative w-36 h-36 shrink-0">
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
            <span className="text-3xl font-bold text-foreground">{pct}%</span>
            <span className="text-xs text-muted-foreground">Complete</span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-6 flex-1">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{completed}</div>
            <div className="text-xs text-muted-foreground">Lessons Done</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-secondary">{words}</div>
            <div className="text-xs text-muted-foreground">Words Learned</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-accent">{streak}</div>
            <div className="text-xs text-muted-foreground">Day Streak</div>
          </div>
        </div>
      </div>
      <div className="mt-6 flex justify-end">
        <Link to="/progress">
          <Button variant="outline" size="sm" data-ocid="home.secondary_button">
            Full Dashboard <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

export function HomePage() {
  return (
    <div>
      <section className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-6">
                <Star className="w-3.5 h-3.5" /> #1 English Learning App
              </div>
              <h1 className="text-4xl lg:text-5xl font-extrabold text-foreground leading-tight mb-4">
                Master English Through{" "}
                <span className="text-primary">Daily Conversations</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Learn English naturally through real-life dialogues, interactive
                vocabulary flashcards, and fun quizzes. Build confidence one
                conversation at a time.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/conversations">
                  <Button
                    size="lg"
                    className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold shadow-card-hover"
                    data-ocid="hero.primary_button"
                  >
                    Start Learning <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link to="/progress">
                  <Button
                    size="lg"
                    variant="outline"
                    data-ocid="hero.secondary_button"
                  >
                    View My Progress
                  </Button>
                </Link>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="flex justify-center"
            >
              <img
                src="/assets/generated/hero-learn-english.dim_600x500.png"
                alt="Learn English illustration"
                className="w-full max-w-lg rounded-2xl"
              />
            </motion.div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold text-foreground text-center mb-3">
            Everything You Need to Succeed
          </h2>
          <p className="text-muted-foreground text-center mb-10">
            Three powerful tools to accelerate your English learning journey
          </p>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Card className="border border-border shadow-card hover:shadow-card-hover transition-shadow">
                <CardContent className="p-6">
                  <div
                    className={`w-12 h-12 rounded-xl ${f.bg} flex items-center justify-center mb-4`}
                  >
                    <f.icon className={`w-6 h-6 ${f.color}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {f.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">{f.desc}</p>
                  <Link
                    to={
                      f.title === "Daily Conversations"
                        ? "/conversations"
                        : f.title === "Vocabulary Flashcards"
                          ? "/vocabulary"
                          : "/quizzes"
                    }
                  >
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-primary border-primary/30 hover:bg-primary/10"
                      data-ocid="feature.button"
                    >
                      Try Now <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold text-foreground mb-3">
            Track Your Progress
          </h2>
          <p className="text-muted-foreground mb-8">
            Stay motivated with your personal learning dashboard
          </p>
          <ProgressPreview />
        </motion.div>
      </section>

      <section className="bg-card border-t border-border">
        <div className="container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-foreground text-center mb-3">
              Start Learning Now
            </h2>
            <p className="text-muted-foreground text-center mb-10">
              Choose a module and begin your journey
            </p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {modules.map((m, i) => (
              <motion.div
                key={m.title}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <Link to={m.to}>
                  <div
                    className="group cursor-pointer rounded-2xl overflow-hidden border border-border shadow-card hover:shadow-card-hover transition-all hover:-translate-y-1"
                    data-ocid="module.card"
                  >
                    <div
                      className={`${m.color} p-8 flex items-center justify-center`}
                    >
                      <m.icon className="w-12 h-12 text-white opacity-90" />
                    </div>
                    <div className="bg-card p-4">
                      <h3 className="font-semibold text-foreground">
                        {m.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {m.desc}
                      </p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
