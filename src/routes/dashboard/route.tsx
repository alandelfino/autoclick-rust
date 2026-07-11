import { createFileRoute, Outlet } from '@tanstack/react-router'
import { SidebarInset, SidebarProvider } from '../../components/ui/sidebar'
import { AppSidebar } from './-components/side-bar'

export const Route = createFileRoute('/dashboard')({
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <main className="border-t h-screen">
            <SidebarProvider className="h-full">
                <AppSidebar />
                <SidebarInset>
                    <Outlet />
                </SidebarInset>
            </SidebarProvider>
        </main>
    )
}
