import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { LogIn } from "lucide-react";
import { UserRole } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetUserRole } from "../hooks/useQueries";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { login, loginStatus } = useInternetIdentity();
  const { data: role, isLoading } = useGetUserRole();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="space-y-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }

  if (!role || role === UserRole.guest) {
    return (
      <div
        className="min-h-[60vh] flex items-center justify-center"
        data-ocid="auth.section"
      >
        <div className="text-center max-w-sm mx-auto px-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Login Required
          </h2>
          <p className="text-muted-foreground mb-6">
            Please log in to access this section and track your English learning
            progress.
          </p>
          <Button
            onClick={login}
            disabled={loginStatus === "logging-in"}
            className="bg-primary text-primary-foreground hover:bg-primary/90 w-full"
            data-ocid="auth.primary_button"
          >
            <LogIn className="w-4 h-4 mr-2" />
            {loginStatus === "logging-in"
              ? "Connecting..."
              : "Login to Continue"}
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
