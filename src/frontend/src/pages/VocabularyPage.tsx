import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { VocabularyEntry } from "../backend.d";
import { AuthGuard } from "../components/AuthGuard";
import { useGetAllLessons } from "../hooks/useQueries";

function FlashCard({ entry }: { entry: VocabularyEntry }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <button
      type="button"
      className="flashcard-scene w-full h-64 cursor-pointer text-left"
      onClick={() => setFlipped(!flipped)}
      data-ocid="vocabulary.card"
    >
      <div className={`flashcard ${flipped ? "flipped" : ""} w-full h-full`}>
        <div className="flashcard-face flashcard-front bg-card rounded-2xl shadow-card border border-border flex flex-col items-center justify-center p-8">
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">
            Word
          </p>
          <p className="text-4xl font-bold text-primary text-center">
            {entry.word}
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            Click to reveal definition
          </p>
        </div>
        <div className="flashcard-face flashcard-back bg-primary rounded-2xl shadow-card border border-primary/20 flex flex-col items-center justify-center p-8">
          <p className="text-xs text-primary-foreground/70 uppercase tracking-widest mb-3">
            Definition
          </p>
          <p className="text-xl font-semibold text-primary-foreground text-center">
            {entry.definition}
          </p>
          <p className="text-sm text-primary-foreground/70 mt-4">
            Click to go back
          </p>
        </div>
      </div>
    </button>
  );
}

export function VocabularyPage() {
  const { data: lessons, isLoading } = useGetAllLessons();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipKey, setFlipKey] = useState(0);

  const allWords: VocabularyEntry[] =
    lessons?.flatMap((l) => l.vocabulary) ?? [];
  const current = allWords[currentIndex];

  const prev = () => setCurrentIndex((i) => Math.max(0, i - 1));
  const next = () =>
    setCurrentIndex((i) => Math.min(allWords.length - 1, i + 1));

  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Vocabulary Flashcards
        </h1>
        <p className="text-muted-foreground mb-8">
          Click a card to flip and reveal the definition
        </p>

        {isLoading && (
          <div
            className="text-center py-16"
            data-ocid="vocabulary.loading_state"
          >
            <div className="w-64 h-64 bg-muted rounded-2xl animate-pulse mx-auto" />
          </div>
        )}

        {!isLoading && allWords.length === 0 && (
          <div
            className="text-center py-16 text-muted-foreground"
            data-ocid="vocabulary.empty_state"
          >
            No vocabulary words found. Complete some lessons first.
          </div>
        )}

        {!isLoading && allWords.length > 0 && current && (
          <div className="max-w-lg mx-auto">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground">
                {currentIndex + 1} / {allWords.length}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setCurrentIndex(0);
                  setFlipKey((k) => k + 1);
                }}
                data-ocid="vocabulary.button"
              >
                <RotateCcw className="w-4 h-4 mr-1" /> Restart
              </Button>
            </div>

            <div className="mb-2">
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{
                    width: `${((currentIndex + 1) / allWords.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={`${currentIndex}-${flipKey}`}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.25 }}
              >
                <FlashCard entry={current} />
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center justify-center gap-4 mt-6">
              <Button
                variant="outline"
                onClick={prev}
                disabled={currentIndex === 0}
                data-ocid="vocabulary.pagination_prev"
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Previous
              </Button>
              <Button
                onClick={next}
                disabled={currentIndex === allWords.length - 1}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                data-ocid="vocabulary.pagination_next"
              >
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
