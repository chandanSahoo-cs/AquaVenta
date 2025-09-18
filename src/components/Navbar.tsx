"use client";

import { getUserProfile } from "@/actions/profile";
import { logoutUser } from "@/actions/user.actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  House,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  User,
  Waves,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { RoleName } from "../../generated/prisma";

interface UserProfile {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  photo: string | null;
}

export function Navbar() {
  const [userRole, setUserRole] = useState<RoleName | string>("");
  const [userName, setUserName] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const pathname = usePathname();

  const hideNavbar = pathname === "/auth";

  const router = useRouter();

  const navbarItems = [
    {
      icon: House,
      name: "Home",
      href: "/",
    },
    {
      icon: LayoutDashboard,
      name: "Dashboard",
      href: "/user/dashboard",
    },
  ];

  const handleLogout = async () => {
    try {
      const res = await logoutUser();
      if (res.success) {
        toast.success("Logged out successfully");
        router.push("/auth");
      } else throw new Error("Failed to log out");
    } catch {
      toast.error("Failed to log out. Try again");
    }
  };

  useEffect(() => {
    const fetchPayload = async () => {
      try {
        const res = await fetch("/api/me");
        if (!res.ok) throw new Error("Not authenticated");
        const data = await res.json();
        setUserRole(data.userPayload?.role);
        setUserName(data.userPayload?.name || "User");
        setUserEmail(data.userPayload?.email || "");
      } catch (error) {
        setUserRole("");
        setUserName("");
        setUserEmail("");
      }
    };

    fetchPayload();
  }, []);

  useEffect(() => {
    try {
      const fetchData = async () => {
        const res = await getUserProfile();
        if (!res || !res.success) {
          throw new Error("Failed to get user data");
        }
        setUserData(res.data as UserProfile);
      };
      fetchData();
    } catch (error) {
      toast.error("Failed to get user data");
    }
  });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  if (hideNavbar) {
    return null;
  }

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-out",
          isScrolled
            ? "bg-background/95 backdrop-blur-lg border-b border-border shadow-sm py-3"
            : "bg-background/90 backdrop-blur-sm py-4"
        )}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 group no-underline">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary rounded-md flex items-center justify-center">
                  <Waves className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-[#002443]">
                    INCOIS
                  </h1>
                  <p className="text-xs text-muted-foreground">
                    Ocean Information Services
                  </p>
                </div>
              </div>
            </Link>

            <div className="flex items-center">
              <div
                className={cn(
                  "hidden transition-all duration-300 mx-10",
                  isScrolled ? "lg:flex" : "md:flex",
                  "items-center space-x-2"
                )}>
                {navbarItems.map(({ icon: Icon, name, href }) => {
                  const isActive = pathname === href;
                  return (
                    <Link key={name} href={href}>
                      <Button
                        variant="ghost"
                        className={cn(
                          "relative px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg",
                          "hover:bg-muted hover:text-primary",
                          isActive
                            ? "text-primary bg-muted"
                            : "text-muted-foreground hover:text-foreground"
                        )}>
                        <Icon className="h-4 w-4 mr-2" />
                        {name}
                      </Button>
                    </Link>
                  );
                })}
              </div>
              <div className="hidden sm:flex items-center gap-3">
                {userRole === "" ? (
                  <Button
                    onClick={() => router.push("/auth")}
                    variant="outline"
                    className="text-sm font-medium border-border bg-background hover:bg-muted">
                    Sign In
                  </Button>
                ) : (
                  <div className="flex items-center gap-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="relative h-10 w-10 rounded-full hover:bg-muted">
                          <Avatar className="h-9 w-9">
                            <AvatarImage
                              src={userData?.photo || "/placeholder.svg"}
                              alt={userName}
                            />
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              {userName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        className="w-56"
                        align="end"
                        forceMount>
                        <DropdownMenuLabel className="font-normal">
                          <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">
                              {userName}
                            </p>
                            <p className="text-xs leading-none text-muted-foreground">
                              {userEmail}
                            </p>
                            <p className="text-xs leading-none text-muted-foreground capitalize">
                              {userRole.toLowerCase()} Role
                            </p>
                          </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {/* <Button asChild> */}
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => router.push("/user/profile")}>
                          <User className="mr-2 h-4 w-4" />
                          <span>Profile</span>
                        </DropdownMenuItem>
                        {/* </Button> */}
                        <DropdownMenuItem className="cursor-pointer">
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Settings</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="cursor-pointer text-destructive focus:text-destructive"
                          onClick={handleLogout}>
                          <LogOut className="mr-2 h-4 w-4" />
                          <span>Log out</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              </div>

              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "p-2 transition-all duration-300 hover:bg-muted",
                  isScrolled ? "lg:hidden" : "md:hidden"
                )}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/*Mobile View*/}
        <div
          className={cn(
            "overflow-hidden transition-all duration-300 ease-out",
            isMobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0",
            isScrolled ? "lg:hidden" : "md:hidden"
          )}>
          <div className="bg-background/95 backdrop-blur-lg border-t border-border shadow-lg">
            <div className="max-w-7xl mx-auto px-6 py-4">
              <div className="space-y-2">
                {navbarItems.map(({ icon: Icon, name, href }) => {
                  const isActive = pathname === href;
                  return (
                    <Link key={name} href={href}>
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full justify-start gap-3 px-4 py-3 text-sm font-medium transition-all duration-200 rounded-lg",
                          "hover:bg-muted hover:text-primary",
                          isActive
                            ? "text-primary bg-muted/50 border-l-2 border-primary"
                            : "text-muted-foreground"
                        )}>
                        <Icon className="h-4 w-4" />
                        {name}
                      </Button>
                    </Link>
                  );
                })}

                <div className="pt-4 mt-4 border-t border-border space-y-2">
                  {userRole === "" ? (
                    <Button
                      onClick={() => router.push("/auth")}
                      variant="outline"
                      className="w-full justify-center text-sm font-medium border-border bg-background hover:bg-muted">
                      Sign In
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      <div className="px-4 py-2 text-sm">
                        <p className="font-medium">{userName}</p>
                        <p className="text-xs text-muted-foreground">
                          {userEmail}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {userRole.toLowerCase()} Role
                        </p>
                      </div>
                      <Button
                        onClick={() => {
                          console.log("from profile");
                          router.push("/user/profile");
                        }}
                        variant="ghost"
                        className="w-full justify-start gap-3 px-4 py-3 text-sm font-medium">
                        <User className="h-4 w-4" />
                        Profile
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 px-4 py-3 text-sm font-medium">
                        <Settings className="h-4 w-4" />
                        Settings
                      </Button>
                      <Button
                        onClick={handleLogout}
                        variant="ghost"
                        className="w-full justify-start gap-3 px-4 py-3 text-sm font-medium text-destructive hover:text-destructive hover:bg-destructive/10">
                        <LogOut className="h-4 w-4" />
                        Log out
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div
        className={cn(
          "transition-all duration-300",
          isScrolled ? "h-16" : "h-20"
        )}
      />
    </>
  );
}
