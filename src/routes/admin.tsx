import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity, LockKeyhole, LogOut, ShieldCheck, UserRound } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";

const MASTER_USER_ID = "master@neevai.local";
const MASTER_PASSWORD = "NeevAI@2026";
const AUTH_STORAGE_KEY = "neevai-master-authenticated";

const metrics = [
  { label: "Pilot workers", value: "2,300+" },
  { label: "Active villages", value: "14" },
  { label: "Sync queue", value: "128" },
  { label: "Referral lift", value: "4x" },
];

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "NeevAI Master Console" },
      {
        name: "description",
        content: "Prototype master console for the NeevAI web app.",
      },
    ],
  }),
  component: AdminRoute,
});

function AdminRoute() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setIsAuthenticated(localStorage.getItem(AUTH_STORAGE_KEY) === "true");
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (userId.trim() === MASTER_USER_ID && password === MASTER_PASSWORD) {
      localStorage.setItem(AUTH_STORAGE_KEY, "true");
      setIsAuthenticated(true);
      setError("");
      setPassword("");
      return;
    }

    setError("Invalid master user ID or password.");
  };

  const handleLogout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setIsAuthenticated(false);
    setUserId("");
    setPassword("");
  };

  if (isAuthenticated) {
    return <AdminDashboard onLogout={handleLogout} />;
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
              Master access
            </div>
            <h1 className="mt-6 text-5xl font-black leading-tight md:text-7xl">
              NeevAI
              <span className="block bg-gradient-to-r from-[#00E5FF] via-[#00FFA3] to-[#FFB547] bg-clip-text text-transparent">
                console.
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/65">
              Control room for pilot status, field syncs, referral signals, and
              operational readiness.
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
                <p className="text-sm text-white/50">Enter your master credentials.</p>
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
              className="mt-7 inline-flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-[#00FFA3] px-5 font-semibold text-[#05060A] transition hover:bg-[#72ffc9]"
            >
              <ShieldCheck className="h-5 w-5" />
              Sign in
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  return (
    <main className="min-h-screen bg-[#05060A] px-6 py-8 text-white">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[#00E5FF] to-[#00FFA3] font-black text-[#05060A]">
              N
            </span>
            <div>
              <p className="text-sm text-white/50">Signed in as</p>
              <h1 className="text-xl font-semibold">NeevAI Master Console</h1>
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
            {metrics.map((metric) => (
              <div key={metric.label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
                <p className="text-sm text-white/50">{metric.label}</p>
                <p className="mt-3 text-4xl font-black text-white">{metric.value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-7">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#00E5FF]/15 text-[#00E5FF]">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold">Field operations</h2>
                <p className="text-sm text-white/50">Current pilot snapshot</p>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              {[
                ["Bihar TB referral model", "Healthy", "92% sync completion"],
                ["Jharkhand cough classifier", "Review", "18 cases awaiting audit"],
                ["ASHA worker device fleet", "Healthy", "97% battery-ready"],
              ].map(([name, status, detail]) => (
                <div
                  key={name}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 p-4"
                >
                  <div>
                    <p className="font-medium">{name}</p>
                    <p className="mt-1 text-sm text-white/45">{detail}</p>
                  </div>
                  <span className="rounded-full border border-[#00FFA3]/25 bg-[#00FFA3]/10 px-3 py-1 text-xs font-semibold text-[#00FFA3]">
                    {status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-7">
            <h2 className="text-2xl font-semibold">Access</h2>
            <p className="mt-3 text-sm leading-relaxed text-white/55">
              This prototype stores the session in this browser only. Production
              auth should move credentials to a server-side provider.
            </p>
            <div className="mt-7 rounded-2xl border border-[#FFB547]/20 bg-[#FFB547]/10 p-4 text-sm text-[#FFE0AA]">
              Master mode is active on this device.
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
