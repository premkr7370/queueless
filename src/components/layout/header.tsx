"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Menu,
  X,
  Search,
  MapPin,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { UserMenu } from "./user-menu";

const NAV_LINKS = [
  { href: "/explore", label: "Explore Services" },
  { href: "/#categories", label: "Categories" },
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/#for-business", label: "For Business" },
] as const;

interface HeaderProps {
  user?: {
    name: string;
    email: string;
    role: string;
  } | null;
}

export function Header({ user }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <nav
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-bold tracking-tight transition-opacity hover:opacity-80"
          id="nav-logo"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-sm font-black text-primary-foreground">Q</span>
          </div>
          <span>
            Queue<span className="text-primary">Less</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              id={`nav-${link.label.toLowerCase().replace(/\s+/g, "-")}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            id="nav-search-btn"
          >
            <Search className="h-4 w-4" />
            <span className="hidden xl:inline">Search</span>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground"
            id="nav-location-btn"
          >
            <MapPin className="h-4 w-4" />
            <span className="hidden xl:inline">Location</span>
            <ChevronDown className="h-3 w-3" />
          </Button>

          <div className="mx-1 h-6 w-px bg-border" aria-hidden="true" />

          {user ? (
            <UserMenu user={user} />
          ) : (
            <>
              <Link
                href="/login"
                className="inline-flex items-center rounded-lg px-2.5 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                id="nav-login-btn"
              >
                Log in
              </Link>
              <Button size="sm" render={<Link href="/register" />} id="nav-signup-btn">
                Sign Up
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu */}
        <div className="flex items-center gap-2 lg:hidden">
          <Link
            href="/explore"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted"
            id="nav-mobile-search"
          >
            <Search className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </Link>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              render={
                <button
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted"
                  id="nav-mobile-toggle"
                />
              }
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
              <span className="sr-only">Toggle navigation</span>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle className="text-left">
                  <span className="text-lg font-bold">
                    Queue<span className="text-primary">Less</span>
                  </span>
                </SheetTitle>
              </SheetHeader>
              <div className="mt-6 flex flex-col gap-1 px-4">
                {user && (
                  <>
                    <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3 mb-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                        {user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{user.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                    </div>
                    <div className="my-1 h-px bg-border" />
                  </>
                )}
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-md px-3 py-3 text-base font-medium text-foreground transition-colors hover:bg-accent"
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="my-3 h-px bg-border" />
                <Button
                  variant="ghost"
                  className="justify-start gap-2 text-muted-foreground"
                >
                  <MapPin className="h-4 w-4" />
                  Select Location
                </Button>
                <div className="my-3 h-px bg-border" />
                {user ? (
                  <>
                    <Button
                      variant="outline"
                      className="w-full"
                      render={
                        <Link
                          href={user.role === "ADMIN" ? "/admin" : user.role === "SHOP_OWNER" ? "/owner" : "/customer/bookings"}
                          onClick={() => setMobileOpen(false)}
                        />
                      }
                    >
                      {user.role === "ADMIN" ? "Admin Panel" : user.role === "SHOP_OWNER" ? "Dashboard" : "My Bookings"}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      className="w-full"
                      render={<Link href="/login" onClick={() => setMobileOpen(false)} />}
                    >
                      Log in
                    </Button>
                    <Button
                      className="w-full"
                      render={<Link href="/register" onClick={() => setMobileOpen(false)} />}
                    >
                      Sign Up
                    </Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
