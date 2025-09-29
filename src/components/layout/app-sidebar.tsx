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
  LayoutDashboard,
  Archive,
} from "lucide-react";
import { useSidebar } from "../ui/sidebar";
import { ThemeToggle } from "./theme-toggle";

const AppSidebar = () => {
  const pathname = usePathname();
  const { state, setOpenMobile, isMobile } = useSidebar();

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <Link href="/" className="flex items-center gap-2.5">
          <GraduationCap className="w-8 h-8 text-primary" />
          {state === "expanded" && (
            <h1 className="text-xl font-bold font-headline">PresenSys</h1>
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
              <Link href="/" onClick={handleLinkClick}>
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
              <Link href="/students" onClick={handleLinkClick}>
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
              <Link href="/courses" onClick={handleLinkClick}>
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
              <Link href="/attendance" onClick={handleLinkClick}>
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
              <Link href="/records" onClick={handleLinkClick}>
                <Archive />
                <span>Records</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center justify-center p-2">
            <ThemeToggle />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
