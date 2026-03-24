import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { QuizSubmission } from "../backend.d";
import { useActor } from "./useActor";

export function useGetAllLessons() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["lessons"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllLessons();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetQuiz(lessonId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["quiz", lessonId?.toString()],
    queryFn: async () => {
      if (!actor || lessonId === null) return null;
      return actor.getQuiz(lessonId);
    },
    enabled: !!actor && !isFetching && lessonId !== null,
  });
}

export function useGetUserProgress() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["userProgress"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getUserProgress();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetUserRole() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["userRole"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSubmitQuiz() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (submission: QuizSubmission) => {
      if (!actor) throw new Error("Not connected");
      return actor.submitQuiz(submission);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProgress"] });
    },
  });
}

export function useUpdateUserProgress() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      lessonId,
      words,
    }: { lessonId: bigint; words: string[] }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateUserProgress(lessonId, words);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProgress"] });
    },
  });
}

export function useLoadSampleData() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      return actor.loadSampleData();
    },
  });
}
