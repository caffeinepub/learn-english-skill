import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface UserProfile {
    wordsLearned: Array<string>;
    quizScores: Array<[bigint, bigint]>;
    lastActiveDay: Time;
    name: string;
    streakDays: bigint;
    completedLessons: Array<bigint>;
}
export type Time = bigint;
export interface Lesson {
    title: string;
    grammarTips: string;
    difficulty: string;
    dialogue: Array<DialogueLine>;
    category: string;
    vocabulary: Array<VocabularyEntry>;
}
export interface QuizQuestion {
    questionText: string;
    options: Array<QuizOption>;
}
export interface LessonQuiz {
    lessonId: bigint;
    questions: Array<QuizQuestion>;
}
export interface QuizOption {
    text: string;
    isCorrect: boolean;
}
export interface DialogueLine {
    text: string;
    speaker: string;
}
export interface QuizSubmission {
    lessonId: bigint;
    answers: Array<bigint>;
}
export interface VocabularyEntry {
    word: string;
    definition: string;
}
export interface UserProgress {
    wordsLearned: Array<string>;
    quizScores: Array<[bigint, bigint]>;
    lastActiveDay: Time;
    streakDays: bigint;
    completedLessons: Array<bigint>;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addLesson(lesson: Lesson): Promise<bigint>;
    addQuiz(quiz: LessonQuiz): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteAccount(): Promise<void>;
    getAllAvailableVocabularyByDifficulty(): Promise<Array<string>>;
    getAllLessons(): Promise<Array<Lesson>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCompletedLessonIds(): Promise<Array<bigint>>;
    getLesson(id: bigint): Promise<Lesson | null>;
    getQuiz(lessonId: bigint): Promise<LessonQuiz | null>;
    getQuizScore(lessonId: bigint): Promise<bigint | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getUserProgress(): Promise<UserProgress>;
    getVocabularyByLesson(lessonId: bigint): Promise<Array<string>>;
    isCallerAdmin(): Promise<boolean>;
    loadSampleData(): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitQuiz(submission: QuizSubmission): Promise<bigint>;
    updateUserProgress(completedLessonId: bigint, learnedWords: Array<string>): Promise<void>;
}
