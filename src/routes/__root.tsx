import queryClient from "@/helpers/query.config";
import { QueryClientProvider } from "@tanstack/react-query";
import { Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { ToastContainer } from "react-toastify";

export const Route = createRootRoute({
    component: () => (
        <QueryClientProvider client={queryClient}>
            <ToastContainer
                autoClose={2000}
                limit={3}
                closeButton
                pauseOnFocusLoss={false}
                pauseOnHover
                theme="light"
                position="top-right"
            />
            <Outlet />
            <TanStackRouterDevtools />
        </QueryClientProvider>
    ),
});
