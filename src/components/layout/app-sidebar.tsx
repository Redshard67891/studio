"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  GraduationCap,
  Users,
  Book,
  ClipboardCheck,
  Settings,
  LayoutDashboard,
  Archive,
} from "lucide-react";
import { useSidebar } from "../ui/sidebar";

const AppSidebar = () => {
  const pathname = usePathname();
  const { state } = useSidebar();

  return (
    <Sidebar>
      <SidebarHeader>
        <Link href="/" className="flex items-center gap-2.5">
          <GraduationCap className="w-8 h-8 text-primary" />
          {state === "expanded" && (
            <h1 className="text-xl font-bold font-headline">AttendEase</h1>
          )}
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === "/"}
              tooltip={{ children: "Dashboard" }}
            >
              <Link href="/">
                <LayoutDashboard />
                <span>Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname.startsWith("/students")}
              tooltip={{ children: "Students" }}
            >
              <Link href="/students">
                <Users />
                <span>Students</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname.startsWith("/courses")}
              tooltip={{ children: "Courses" }}
            >
              <Link href="/courses">
                <Book />
                <span>Courses</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname.startsWith("/attendance")}
              tooltip={{ children: "Attendance" }}
            >
              <Link href="/attendance">
                <ClipboardCheck />
                <span>Attendance</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname.startsWith("/records")}
              tooltip={{ children: "Records" }}
            >
              <Link href="/records">
                <Archive />
                <span>Records</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip={{ children: "Settings" }}>
              <Settings />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
