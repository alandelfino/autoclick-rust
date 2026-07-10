import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Link } from "@tanstack/react-router"
import { GitForkIcon, LockKeyholeIcon, MousePointerClick, SettingsIcon } from "lucide-react"

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" className="border-t">

            {/* Header */}
            <SidebarHeader>
                <SidebarMenuButton className="h-auto group-data-[collapsible=icon]:p-0! group-data-[collapsible=icon]:justify-center">
                    <MousePointerClick className="bg-neutral-900 rounded-lg w-7! h-7! text-white p-1 group-data-[collapsible=icon]:w-5! group-data-[collapsible=icon]:h-6! group-data-[collapsible=icon]:rounded-md! group-data-[collapsible=icon]:bg-transparent! group-data-[collapsible=icon]:text-neutral-800 group-data-[collapsible=icon]:p-0" />
                    <span className="text-base font-semibold font-inter group-data-[collapsible=icon]:hidden!">Autoclick</span>
                </SidebarMenuButton>
            </SidebarHeader>

            {/* Content */}
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Geral</SidebarGroupLabel>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton className="text-neutral-600 p-0">
                                <Link to="/dashboard/flows" className="flex items-center gap-2 w-full h-full">
                                    <GitForkIcon />
                                    <span>Flows</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton className="text-neutral-600 p-0">
                                <Link to="/dashboard/credentials" className="flex items-center gap-2 w-full h-full">
                                    <LockKeyholeIcon />
                                    <span>Credentials</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton className="text-neutral-600 p-0">
                            <Link to="/dashboard/settings" className="flex items-center gap-2 w-full h-full">
                                <SettingsIcon />
                                <span>Settings</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}