import { createRootRoute, Outlet } from '@tanstack/react-router'
import { Toaster } from '../components/ui/toaster'

const RootLayout = () => (
    <main className="h-screen overflow-hidden">
        <Outlet />
        <Toaster />
    </main>
)

export const Route = createRootRoute({ component: RootLayout })