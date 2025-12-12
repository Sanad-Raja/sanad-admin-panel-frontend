import { Card } from "@/components/ui/card";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";


export const Route = createFileRoute("/auth")({
  component: RouteComponent,
  loader: () => {
    if (localStorage.getItem("token")) {
      return redirect({ to: "/" });
    }
  },
});

function RouteComponent() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-black/50 p-4 auth-bg-image">
      <Card className="flex flex-col md:flex-row shadow-lg lg:w-lg md:w-4/6 w-full h-auto rounded-lg overflow-hidden bg-white z-10 p-6">
        <div className="flex flex-col w-full lg:items-start items-center justify-center md:p-4">
          <Outlet />
        </div>
      </Card>
    </div>
  );
}
