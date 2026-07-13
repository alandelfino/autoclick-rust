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
    SidebarTrigger,
} from "@/components/ui/sidebar"
import { Link } from "@tanstack/react-router"
import { GitForkIcon, LockKeyholeIcon, MousePointerClick, SettingsIcon } from "lucide-react"
import logo from "../../../../assets/logo.png"
import { cn } from "../../../../lib/utils"

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" className="border-t">

            {/* Header */}
            <SidebarHeader className="flex justify-start">
                <div className="px-w-full h-14 flex items-center justify-between">
                    
                    <img
                        src={logo}
                        alt='Logo'
                        className={cn("h-8 object-contain", "group-data-[collapsible=icon]:hidden")}
                    />
                    
                    <SidebarTrigger />
                    
                </div>
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