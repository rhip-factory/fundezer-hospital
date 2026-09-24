import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  LayoutDashboard,
  ClipboardList,
  HeartHandshake,
  Wallet,
  BarChart3,
  BadgeCheck,
  ArrowRightLeft,
  Building2,
  Bell,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import logo from "@/assets/fundezer-icon.png.asset.json";
import { supabase } from "@/integrations/supabase/client";
import { hydrateFromServer, usePortalHydrated, usePortalState } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const nav: { to: string; label: string; icon: LucideIcon }[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/applications", label: "Applications", icon: ClipboardList },
  { to: "/campaigns", label: "Campaigns", icon: HeartHandshake },
  { to: "/payments", label: "Payments & wallet", icon: Wallet },
  { to: "/transfers", label: "Transfer requests", icon: ArrowRightLeft },
  { to: "/reports", label: "Reports", icon: BarChart3 },
  { to: "/profile", label: "Hospital profile", icon: Building2 },
];

export function PortalLayout({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const hydrated = usePortalHydrated();
  const { applications, hospital, reviewerName, reviewerRole, signedIn } = usePortalState();
  const pending = applications.filter((a) => a.status === "pending").length;

  useEffect(() => {
    if (hydrated && !signedIn) navigate({ to: "/auth", replace: true });
  }, [hydrated, signedIn, navigate]);

  if (!hydrated || !signedIn) return null;

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
        <div className="flex items-center gap-3 px-6 py-6">
          <img src={logo.url} alt="FundEzer logo" className="h-10 w-10" />
          <div>
            <p className="text-base font-extrabold tracking-tight">
              fund<span className="text-primary">E</span>zer
            </p>
            <p className="text-[11px] font-medium text-muted-foreground">Hospital Portal</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {nav.map((item) => {
            const active =
              item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-secondary",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
                {item.to === "/applications" && pending > 0 && (
                  <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-primary-foreground">
                    {pending}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="m-3 rounded-xl border border-sidebar-border bg-primary-soft p-4">
          <div className="flex items-center gap-2 text-accent-foreground">
            <BadgeCheck className="h-4 w-4" />
            <span className="text-xs font-semibold">Verified partner</span>
          </div>
          <p className="mt-2 text-sm font-semibold">{hospital?.name ?? "No hospital linked"}</p>
          <p className="text-xs text-muted-foreground">{hospital ? `${hospital.city}, ${hospital.state}` : "Sign in to load your hospital"}</p>
        </div>

        <div className="px-3 pb-4">
          <button
            type="button"
            onClick={async () => {
              await supabase.auth.signOut();
              await hydrateFromServer();
              navigate({ to: "/auth", replace: true });
            }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur">
          <div className="flex flex-wrap items-center gap-4 px-6 py-4">
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-xl font-bold">{title}</h1>
              {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
            </div>
            {actions}
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="relative rounded-lg border border-border p-2 text-muted-foreground transition-colors hover:bg-secondary"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
              </button>
              <div className="hidden items-center gap-2 sm:flex">
                <div className="flex h-9 w-9 items-center justify-center rounded-full brand-gradient text-sm font-semibold text-primary-foreground">
                  AE
                </div>
                <div className="leading-tight">
                  <p className="text-sm font-semibold">{reviewerName || "Guest"}</p>
                  <p className="text-xs text-muted-foreground">{reviewerRole || "Not signed in"}</p>
                </div>
              </div>
            </div>
          </div>
          <nav className="flex gap-1 overflow-x-auto border-t border-border px-4 py-2 lg:hidden">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground [&.active]:bg-primary-soft [&.active]:text-accent-foreground"
                activeOptions={{ exact: item.to === "/" }}
              >
                {item.label}
              </Link>
            ))}
            <button
              type="button"
              onClick={async () => {
                await supabase.auth.signOut();
                await hydrateFromServer();
                navigate({ to: "/auth", replace: true });
              }}
              className="whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Log out
            </button>
          </nav>
        </header>
        <main className="px-6 py-6">{children}</main>
      </div>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-warning/15 text-warning-foreground border-warning/30",
    "info-requested": "bg-secondary text-secondary-foreground border-border",
    assessed: "bg-primary-soft text-accent-foreground border-primary/30",
    approved: "bg-success/15 text-success border-success/30",
    rejected: "bg-destructive/10 text-destructive border-destructive/30",
    active: "bg-primary-soft text-accent-foreground border-primary/30",
    completed: "bg-success/15 text-success border-success/30",
    paid: "bg-success/15 text-success border-success/30",
    scheduled: "bg-secondary text-secondary-foreground border-border",
    requested: "bg-warning/15 text-warning-foreground border-warning/30",
    declined: "bg-destructive/10 text-destructive border-destructive/30",
  };
  const label: Record<string, string> = {
    pending: "Pending review",
    "info-requested": "Info requested",
    assessed: "Assessment done",
    approved: "Approved",
    rejected: "Rejected",
    active: "Active",
    completed: "Completed",
    paid: "Paid",
    scheduled: "Scheduled",
    requested: "Requested",
    declined: "Declined",
  };
  return (
    <Badge variant="outline" className={cn("font-medium capitalize", map[status])}>
      {label[status] ?? status}
    </Badge>
  );
}

export function RiskPill({ score }: { score: number }) {
  const tone =
    score >= 60
      ? "bg-destructive/10 text-destructive border-destructive/30"
      : score >= 30
        ? "bg-warning/15 text-warning-foreground border-warning/30"
        : "bg-success/15 text-success border-success/30";
  const label = score >= 60 ? "High risk" : score >= 30 ? "Medium risk" : "Low risk";
  return (
    <Badge variant="outline" className={cn("font-medium", tone)}>
      {label} · {score}
    </Badge>
  );
}
