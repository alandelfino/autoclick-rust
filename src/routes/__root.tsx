import { createRootRoute, Outlet } from '@tanstack/react-router'

const RootLayout = () => (
    <main className="h-screen overflow-hidden">
        <Outlet />
    </main>
)

export const Route = createRootRoute({ component: RootLayout })