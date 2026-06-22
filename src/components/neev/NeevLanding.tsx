import { useEffect, useRef, useState } from "react";
import ClientCanvas from "./ClientCanvas";
import { submitPilotRequest } from "../../lib/backend";

const zones = [
  {
    tag: "01 — The Reality",
    title: "900 million people.",
    accent: "One doctor for every 1,500.",
    body: "In rural India, the nearest diagnostic lab is hours away. ASHA workers carry the weight of a nation's health on their shoulders — armed with nothing but a notebook and a ₹6,000 smartphone.",
  },
  {
    tag: "02 — The Idea",
    title: "What if the phone itself",
    accent: "became the clinic?",
    body: "NeevAI turns any smartphone camera and microphone into a clinical-grade diagnostic instrument. No data plan. No internet. No cloud round-trip. Pure on-device intelligence.",
  },
  {
    tag: "03 — The Engine",
    title: "Multimodal Edge-AI.",
    accent: "Trained for the field.",
    body: "Vision models detect anemia from conjunctiva photos. Audio models hear pneumonia in a cough. NLP transcribes Hindi, Bhojpuri, Tamil. All running on a 2GB-RAM device, fully offline.",
  },
  {
    tag: "04 — The Workflow",
    title: "Scan. Diagnose. Decide.",
    accent: "Under 30 seconds.",
    body: "An ASHA worker opens NeevAI, points the camera, records a 5-second cough. The phone returns risk scores, referral urgency, and a printable record — even in a village with zero bars.",
  },
  {
    tag: "05 — The Network",
    title: "When signal returns,",
    accent: "knowledge syncs.",
    body: "Encrypted case bundles upload silently. District officers see live disease heatmaps. Models retrain on real-world Indian data. Every scan makes the next one smarter.",
  },
  {
    tag: "06 — The Impact",
    title: "From village to nation.",
    accent: "Health, made portable.",
    body: "Early pilots in Bihar show a 4× increase in early TB referrals and 60% drop in unnecessary travel. NeevAI is the foundation — neev — of a self-healing healthcare system.",
  },
];

const stats = [
  { value: "₹6K", label: "Min. device cost" },
  { value: "30s", label: "Per diagnosis" },
  { value: "0", label: "MB internet needed" },
  { value: "4×", label: "Earlier referrals" },
];

export default function NeevLanding() {
  const progressRef = useRef(0);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeZone, setActiveZone] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [pilotEmail, setPilotEmail] = useState("");
  const [pilotOrganisation, setPilotOrganisation] = useState("");
  const [pilotStatus, setPilotStatus] = useState("");
  const [isSubmittingPilot, setIsSubmittingPilot] = useState(false);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const el = scrollerRef.current;
      if (el) {
        const max = el.scrollHeight - window.innerHeight;
        const p = Math.min(1, Math.max(0, window.scrollY / max));
        progressRef.current = p;
        setActiveZone(Math.min(zones.length - 1, Math.floor(p * zones.length)));
        setScrolled(window.scrollY > 50);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div ref={scrollerRef} className="relative bg-[#05060A] text-white">
      <ClientCanvas progressRef={progressRef} />

      {/* Nav */}
      <nav
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
          scrolled ? "backdrop-blur-xl bg-[#05060A]/60 border-b border-white/5" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-5 flex items-center justify-between">
          <a href="#top" className="flex items-center gap-2 group">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00E5FF] to-[#00FFA3] grid place-items-center text-[#05060A] font-black text-sm">
              N
            </span>
            <span className="font-semibold tracking-tight">NeevAI</span>
          </a>
          <div className="hidden md:flex items-center gap-8 text-sm text-white/70">
            <a href="#story" className="hover:text-white transition">
              Story
            </a>
            <a href="#tech" className="hover:text-white transition">
              Technology
            </a>
            <a href="#impact" className="hover:text-white transition">
              Impact
            </a>
            <a href="#join" className="hover:text-white transition">
              Join
            </a>
          </div>
          <a
            href="#join"
            className="px-4 py-2 rounded-full bg-white text-[#05060A] text-sm font-medium hover:bg-[#00FFA3] transition"
          >
            Partner with us
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section
        id="top"
        className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center px-6"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#05060A]/40 pointer-events-none" />
        <p className="relative text-xs uppercase tracking-[0.3em] text-[#00E5FF] mb-6">
          Offline-First · Multimodal · Edge-AI Healthcare
        </p>
        <h1 className="relative text-5xl md:text-8xl font-black leading-[0.95] tracking-tight max-w-5xl">
          A clinic in
          <br />
          <span className="bg-gradient-to-r from-[#00E5FF] via-[#00FFA3] to-[#FFB547] bg-clip-text text-transparent">
            every pocket.
          </span>
        </h1>
        <p className="relative mt-8 max-w-2xl text-lg text-white/70 leading-relaxed">
          NeevAI transforms ordinary smartphones into clinical-grade diagnostic tools for India's
          1M+ frontline ASHA workers — fully offline, fully private, fully theirs.
        </p>
        <div className="relative mt-10 flex flex-wrap items-center justify-center gap-4">
          <a
            href="#story"
            className="px-7 py-3.5 rounded-full bg-[#00FFA3] text-[#05060A] font-semibold hover:scale-105 transition-transform shadow-[0_0_40px_rgba(0,255,163,0.4)]"
          >
            See how it works
          </a>
          <a
            href="#join"
            className="px-7 py-3.5 rounded-full border border-white/20 hover:bg-white/5 transition"
          >
            Request a pilot
          </a>
        </div>
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-xs uppercase tracking-widest text-white/40 flex flex-col items-center gap-2 animate-pulse">
          Scroll to descend
          <span className="block w-px h-10 bg-gradient-to-b from-white/50 to-transparent" />
        </div>
      </section>

      {/* Zone indicator */}
      <div className="fixed left-6 top-1/2 -translate-y-1/2 z-30 hidden md:flex flex-col gap-3">
        {zones.map((_, i) => (
          <div
            key={i}
            className={`w-1 rounded-full transition-all duration-500 ${
              i === activeZone ? "h-10 bg-[#00FFA3]" : "h-6 bg-white/20"
            }`}
          />
        ))}
      </div>

      {/* Zones (story) */}
      <section id="story" className="relative z-10">
        {zones.map((z, i) => (
          <div key={i} className="min-h-screen flex items-center px-6 md:px-16">
            <div
              className={`max-w-2xl ${
                i % 2 === 0 ? "ml-auto mr-0 md:mr-20" : "mr-auto ml-0 md:ml-20"
              }`}
            >
              <div className="backdrop-blur-2xl bg-white/[0.03] border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl">
                <p className="text-xs uppercase tracking-[0.25em] text-[#00E5FF] mb-5">{z.tag}</p>
                <h2 className="text-4xl md:text-6xl font-bold leading-tight tracking-tight">
                  {z.title}
                  <br />
                  <span className="text-white/50">{z.accent}</span>
                </h2>
                <p className="mt-6 text-lg text-white/70 leading-relaxed">{z.body}</p>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Tech / Stats */}
      <section id="tech" className="relative z-10 py-32 px-6 md:px-16 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs uppercase tracking-[0.3em] text-[#00FFA3] mb-4">
            The numbers that matter
          </p>
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight max-w-3xl">
            Built for the edge of the grid.
          </h2>
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s) => (
              <div
                key={s.label}
                className="backdrop-blur-xl bg-white/[0.04] border border-white/10 rounded-2xl p-8"
              >
                <div className="text-5xl md:text-6xl font-black bg-gradient-to-br from-[#00E5FF] to-[#00FFA3] bg-clip-text text-transparent">
                  {s.value}
                </div>
                <div className="mt-3 text-sm text-white/60">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="mt-20 grid md:grid-cols-3 gap-6">
            {[
              {
                t: "Vision",
                d: "Conjunctiva, skin lesion, oral cavity, and retinal screening using lightweight CNNs quantized to INT8.",
              },
              {
                t: "Audio",
                d: "Cough, breath, and heart-sound classifiers trained on the Coswara, ICBHI, and indigenous datasets.",
              },
              {
                t: "Language",
                d: "On-device ASR + symptom NLU for 11 Indian languages. Zero text leaves the phone until the worker consents.",
              },
            ].map((c) => (
              <div
                key={c.t}
                className="group rounded-2xl p-8 border border-white/10 hover:border-[#00FFA3]/40 hover:bg-white/[0.03] transition"
              >
                <div className="text-xs uppercase tracking-widest text-[#FFB547]">Modality</div>
                <h3 className="mt-2 text-2xl font-semibold">{c.t}</h3>
                <p className="mt-3 text-white/60 text-sm leading-relaxed">{c.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact */}
      <section id="impact" className="relative z-10 py-32 px-6 md:px-16 border-t border-white/5">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-[#FFB547] mb-4">Field-tested</p>
          <h2 className="text-4xl md:text-7xl font-bold tracking-tight leading-tight">
            One worker.
            <br />
            <span className="text-white/50">A thousand lives.</span>
          </h2>
          <p className="mt-8 text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
            Piloted across 14 villages in Bihar and Jharkhand with{" "}
            <span className="text-white">2,300+ ASHA workers</span>. Early results: 4× more TB
            referrals, 60% drop in unnecessary travel, 92% worker satisfaction.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section id="join" className="relative z-10 py-32 px-6 md:px-16 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-[2rem] p-10 md:p-16 bg-gradient-to-br from-[#00E5FF]/10 via-[#00FFA3]/5 to-transparent border border-[#00FFA3]/20 backdrop-blur-xl">
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight">
              Build the foundation
              <br />
              <span className="bg-gradient-to-r from-[#00E5FF] to-[#00FFA3] bg-clip-text text-transparent">
                with us.
              </span>
            </h2>
            <p className="mt-6 text-white/70 max-w-xl leading-relaxed">
              We're partnering with state governments, NGOs, hospital networks, and researchers. If
              you serve communities the system forgot — we want to hear from you.
            </p>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setIsSubmittingPilot(true);
                setPilotStatus("");
                const result = await submitPilotRequest({
                  data: {
                    email: pilotEmail,
                    organisation: pilotOrganisation,
                    message: "Pilot request submitted from the landing page.",
                  },
                });
                setIsSubmittingPilot(false);
                setPilotStatus(result.message);
                if (result.ok) {
                  setPilotEmail("");
                  setPilotOrganisation("");
                }
              }}
              className="mt-10 flex max-w-xl flex-col gap-3"
            >
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="email"
                  required
                  value={pilotEmail}
                  onChange={(event) => setPilotEmail(event.target.value)}
                  placeholder="your@organisation.org"
                  className="flex-1 rounded-full border border-white/10 bg-white/5 px-5 py-4 text-white transition placeholder:text-white/40 focus:border-[#00FFA3] focus:outline-none"
                />
                <input
                  type="text"
                  value={pilotOrganisation}
                  onChange={(event) => setPilotOrganisation(event.target.value)}
                  placeholder="Organisation"
                  className="flex-1 rounded-full border border-white/10 bg-white/5 px-5 py-4 text-white transition placeholder:text-white/40 focus:border-[#00FFA3] focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmittingPilot}
                className="rounded-full bg-[#00FFA3] px-7 py-4 font-semibold text-[#05060A] transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmittingPilot ? "Submitting request" : "Request a pilot"}
              </button>
              {pilotStatus ? <p className="text-sm text-white/60">{pilotStatus}</p> : null}
            </form>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/5 py-10 px-6 md:px-16 text-sm text-white/40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-gradient-to-br from-[#00E5FF] to-[#00FFA3] grid place-items-center text-[#05060A] font-black text-[10px]">
              N
            </span>
            <span>NeevAI · Built in India, for India.</span>
          </div>
          <div>© {new Date().getFullYear()} NeevAI Health Technologies</div>
        </div>
      </footer>
    </div>
  );
}
