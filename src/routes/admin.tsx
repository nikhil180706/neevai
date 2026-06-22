import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  ClipboardList,
  Database,
  LockKeyhole,
  LogOut,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";

import { getAdminDashboard, getSessionStatus, login, logout } from "../lib/backend";

type DashboardResponse = Awaited<ReturnType<typeof getAdminDashboard>>;
type DashboardData = NonNullable<DashboardResponse["dashboard"]>;
type PublicUser = NonNullable<DashboardResponse["user"]>;

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "NeevAI Master Console" },
      {
        name: "description",
        content: "Authenticated master console for the NeevAI web app.",
      },
    ],
  }),
  component: AdminRoute,
});

function AdminRoute() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<PublicUser | null>(null);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadDashboard = async () => {
    const result = await getAdminDashboard();
    setUser(result.user);
    setDashboard(result.dashboard);
    setIsLoading(false);
  };

  useEffect(() => {
    getSessionStatus()
      .then((result) => {
        if (result.user) {
          return loadDashboard();
        }
        setUser(null);
        setDashboard(null);
        setIsLoading(false);
        return undefined;
      })
      .catch(() => {
        setError("Could not reach the authentication service.");
        setIsLoading(false);
      });
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    const result = await login({ data: { userId, password } });
    setIsSubmitting(false);

    if (!result.ok || !result.user) {
      setError(result.message);
      return;
    }

    setPassword("");
    await loadDashboard();
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setDashboard(null);
    setUserId("");
    setPassword("");
  };

  if (isLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#05060A] px-6 text-white">
        <div className="flex items-center gap-3 text-white/70">
          <Database className="h-5 w-5 animate-pulse text-[#00FFA3]" />
          Loading master console
        </div>
      </main>
    );
  }

  if (user && dashboard) {
    return <AdminDashboard dashboard={dashboard} user={user} onLogout={handleLogout} />;
  }

  return (
    <main className="min-h-screen bg-[#05060A] px-6 py-8 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl flex-col">
        <header className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-[#00E5FF] to-[#00FFA3] text-sm font-black text-[#05060A]">
              N
            </span>
            <span className="font-semibold">NeevAI</span>
          </Link>
          <Link to="/" className="text-sm text-white/60 transition hover:text-white">
            Back to site
          </Link>
        </header>

        <section className="grid flex-1 items-center gap-10 py-16 lg:grid-cols-[1fr_420px]">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#00FFA3]/25 bg-[#00FFA3]/10 px-4 py-2 text-xs font-medium uppercase text-[#00FFA3]">
              <ShieldCheck className="h-4 w-4" />
              Server-authenticated
            </div>
            <h1 className="mt-6 text-5xl font-black leading-tight md:text-7xl">
              NeevAI
              <span className="block bg-gradient-to-r from-[#00E5FF] via-[#00FFA3] to-[#FFB547] bg-clip-text text-transparent">
                console.
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/65">
              A working admin console backed by a seeded database, hashed master password, HTTP-only
              session cookie, pilot requests, and operations data.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-white/10 bg-white/[0.04] p-7 shadow-2xl backdrop-blur-xl"
          >
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#00E5FF]/15 text-[#00E5FF]">
                <LockKeyhole className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Master login</h2>
                <p className="text-sm text-white/50">Credentials are verified on the server.</p>
              </div>
            </div>

            <label className="mt-8 block text-sm font-medium text-white/75" htmlFor="userId">
              User ID
            </label>
            <div className="mt-2 flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 focus-within:border-[#00FFA3]">
              <UserRound className="h-5 w-5 text-white/35" />
              <input
                id="userId"
                type="text"
                autoComplete="username"
                value={userId}
                onChange={(event) => setUserId(event.target.value)}
                className="h-13 min-w-0 flex-1 bg-transparent text-white outline-none placeholder:text-white/30"
                placeholder="master@neevai.local"
              />
            </div>

            <label className="mt-5 block text-sm font-medium text-white/75" htmlFor="password">
              Password
            </label>
            <div className="mt-2 flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 focus-within:border-[#00FFA3]">
              <LockKeyhole className="h-5 w-5 text-white/35" />
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-13 min-w-0 flex-1 bg-transparent text-white outline-none placeholder:text-white/30"
                placeholder="Password"
              />
            </div>

            {error ? (
              <p className="mt-4 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-7 inline-flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-[#00FFA3] px-5 font-semibold text-[#05060A] transition hover:bg-[#72ffc9] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <ShieldCheck className="h-5 w-5" />
              {isSubmitting ? "Signing in" : "Sign in"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}

function AdminDashboard({
  dashboard,
  user,
  onLogout,
}: {
  dashboard: DashboardData;
  user: PublicUser;
  onLogout: () => void;
}) {
  return (
    <main className="min-h-screen bg-[#05060A] px-6 py-8 text-white">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[#00E5FF] to-[#00FFA3] font-black text-[#05060A]">
              N
            </span>
            <div>
              <p className="text-sm text-white/50">Signed in as {user.userId}</p>
              <h1 className="text-xl font-semibold">{user.name}</h1>
            </div>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/10 px-4 text-sm text-white/75 transition hover:border-white/30 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </header>

        <section className="py-10">
          <div className="grid gap-5 md:grid-cols-4">
            {dashboard.metrics.map((metric) => (
              <div
                key={metric.label}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-6"
              >
                <p className="text-sm text-white/50">{metric.label}</p>
                <p className="mt-3 text-4xl font-black text-white">{metric.value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <Panel
            icon={<Activity className="h-5 w-5" />}
            title="Field operations"
            subtitle="Live operational snapshot from the database"
          >
            <div className="space-y-4">
              {dashboard.operations.map((operation) => (
                <div
                  key={operation.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 p-4"
                >
                  <div>
                    <p className="font-medium">{operation.name}</p>
                    <p className="mt-1 text-sm text-white/45">{operation.detail}</p>
                  </div>
                  <StatusBadge status={operation.status} />
                </div>
              ))}
            </div>
          </Panel>

          <Panel
            icon={<ClipboardList className="h-5 w-5" />}
            title="Pilot requests"
            subtitle="Submitted from the public landing page"
          >
            <div className="space-y-4">
              {dashboard.pilotRequests.map((request) => (
                <div
                  key={request.id}
                  className="rounded-2xl border border-white/10 bg-black/20 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{request.organisation}</p>
                      <p className="mt-1 text-sm text-[#00E5FF]">{request.email}</p>
                    </div>
                    <span className="rounded-full border border-[#FFB547]/25 bg-[#FFB547]/10 px-3 py-1 text-xs font-semibold text-[#FFE0AA]">
                      {request.status}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-white/55">{request.message}</p>
                </div>
              ))}
            </div>
          </Panel>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <Panel
            icon={<ShieldCheck className="h-5 w-5" />}
            title="Users"
            subtitle="Seeded access control"
          >
            <div className="space-y-3">
              {dashboard.users.map((item) => (
                <div key={item.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="font-medium">{item.name}</p>
                  <p className="mt-1 text-sm text-white/45">
                    {item.userId} · {item.role}
                  </p>
                </div>
              ))}
            </div>
          </Panel>

          <Panel
            icon={<Database className="h-5 w-5" />}
            title="Audit log"
            subtitle="Recent server-side events"
          >
            <div className="space-y-3">
              {dashboard.auditLog.map((entry) => (
                <div key={entry.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-sm text-white/70">{entry.action}</p>
                  <p className="mt-1 text-xs text-white/35">
                    {entry.actor} · {new Date(entry.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </Panel>
        </section>
      </div>
    </main>
  );
}

function Panel({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: ReactNode;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-7">
      <div className="mb-7 flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#00E5FF]/15 text-[#00E5FF]">
          {icon}
        </div>
        <div>
          <h2 className="text-2xl font-semibold">{title}</h2>
          <p className="text-sm text-white/50">{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "Healthy"
      ? "border-[#00FFA3]/25 bg-[#00FFA3]/10 text-[#00FFA3]"
      : status === "Review"
        ? "border-[#FFB547]/25 bg-[#FFB547]/10 text-[#FFE0AA]"
        : "border-red-400/25 bg-red-500/10 text-red-200";

  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${tone}`}>{status}</span>
  );
}
