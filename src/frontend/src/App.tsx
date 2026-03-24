import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { useEffect } from "react";
import { Layout } from "./components/Layout";
import { useActor } from "./hooks/useActor";
import { ConversationsPage } from "./pages/ConversationsPage";
import { HomePage } from "./pages/HomePage";
import { ProgressPage } from "./pages/ProgressPage";
import { QuizzesPage } from "./pages/QuizzesPage";
import { VocabularyPage } from "./pages/VocabularyPage";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 30, retry: 1 } },
});

// Seed sample data on first load
function SampleDataLoader() {
  const { actor, isFetching } = useActor();
  useEffect(() => {
    if (actor && !isFetching) {
      actor.loadSampleData().catch(() => {});
    }
  }, [actor, isFetching]);
  return null;
}

function Root() {
  return (
    <Layout>
      <SampleDataLoader />
      <Outlet />
    </Layout>
  );
}

const rootRoute = createRootRoute({ component: Root });
const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});
const conversationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/conversations",
  component: ConversationsPage,
});
const vocabularyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/vocabulary",
  component: VocabularyPage,
});
const quizzesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/quizzes",
  component: QuizzesPage,
});
const progressRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/progress",
  component: ProgressPage,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  conversationsRoute,
  vocabularyRoute,
  quizzesRoute,
  progressRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster position="top-right" richColors />
    </QueryClientProvider>
  );
}
