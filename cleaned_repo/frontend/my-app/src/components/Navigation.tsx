"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Home,
    Map,
    MessageCircle,
    Database,
    Info,
    BookOpen,
    BarChart3,
    Settings,
    Users
} from "lucide-react";

export const Navigation = () => {
    const pathname = usePathname();

    const navItems = [
        // { label: "Home", href: "/", icon: Home },
        { label: "Dashboard", href: "/dashboard", icon: BarChart3 },
        { label: "ARGO Explorer", href: "/explorer", icon: Map },
        { label: "AI Chat", href: "/chatbot", icon: MessageCircle },
        // { label: "Data Portal", href: "/data", icon: Database },
        // { label: "Admin", href: "/admin", icon: Settings },
        // { label: "About", href: "/about", icon: Info },
        //  { label: "About", href: "/#about", icon: Info }
        // { label: "Docs", href: "/docs", icon: BookOpen },
    ];

    return (
        <nav className="flex items-center space-x-1">
            {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                    <Link key={item.label} href={item.href}>
                        <Button
                            variant={isActive ? "default" : "ghost"}
                            size="sm"
                            className={`flex items-center space-x-1 transition-all duration-200 ${
                                isActive
                                    ? "bg-primary text-primary-foreground shadow-md"
                                    : "hover:bg-primary/10 hover:text-primary"
                            }`}
                        >
                            <Icon className="w-4 h-4" />
                            <span className="hidden lg:inline">{item.label}</span>
                        </Button>
                    </Link>
                );
            })}
        </nav>
    );
};