import DoctorNetworkCanvas from "@/components/DoctorNetworkCanvas";
import SymptomAnalysisCanvas from "@/components/SymptomAnalysisCanvas";
import LungAnalysisCanvas from "@/components/LungAnalysisCanvas";
import StatisticsSection from "@/components/StatisticsSection";
import CrosshairCursor from "@/components/CrosshairCursor";

export default function Home() {
  return (
    <main className="relative bg-clinical-dark min-h-screen">
      <CrosshairCursor />

      {/* ═══════════════════════════════════════
          HERO SECTION
          ═══════════════════════════════════════ */}
      <section className="relative h-screen flex items-center justify-center">
        <div className="text-center z-10 px-6">
          <div className="text-[10px] sm:text-xs tracking-[0.5em] text-clinical-primary/50 mb-8 font-mono uppercase">
            Your Complete Health Platform
          </div>

          <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-tighter leading-[0.85]">
            Med<span className="text-clinical-primary">Care</span>
            <br />
            <span className="text-[#C4A882]">AI</span>
          </h1>

          <p className="text-[#6B5040] mt-8 max-w-lg mx-auto text-sm sm:text-base md:text-lg leading-relaxed">
            Find trusted doctors. Predict diseases from symptoms. Detect
            cancer with deep learning. All in one platform.
          </p>

          <div className="mt-20 flex flex-col items-center gap-4">
            <div className="w-px h-16 bg-gradient-to-b from-transparent via-clinical-primary/30 to-clinical-primary/50" />
            <span className="text-[9px] sm:text-[10px] tracking-[0.4em] text-clinical-primary/40 font-mono uppercase">
              Scroll to explore
            </span>
          </div>
        </div>

        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-clinical-primary/[0.03] blur-[120px]" />
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SECTION 1 — DOCTOR NETWORK
          ═══════════════════════════════════════ */}
      <DoctorNetworkCanvas />

      {/* ═══════════════════════════════════════
          SECTION 2 — SYMPTOM-BASED DISEASE PREDICTION
          ═══════════════════════════════════════ */}
      <SymptomAnalysisCanvas />

      {/* ═══════════════════════════════════════
          SECTION 3 — LUNG CANCER DETECTION
          ═══════════════════════════════════════ */}
      <LungAnalysisCanvas />

      {/* ═══════════════════════════════════════
          SECTION 4 — STATISTICS
          ═══════════════════════════════════════ */}
      <StatisticsSection />

      {/* ═══════════════════════════════════════
          SECTION 5 — CTA
          ═══════════════════════════════════════ */}
      <section className="relative py-32 sm:py-40 md:py-48 flex items-center justify-center">
        <div className="text-center max-w-3xl mx-auto px-6 z-10">
          <div className="text-[10px] sm:text-xs tracking-[0.5em] text-clinical-primary/50 mb-8 font-mono uppercase">
            The Future of Healthcare
          </div>

          <h2 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tighter leading-[0.85]">
            Early Detection
            <br />
            <span className="text-[#C4A882]">Saves Lives</span>
          </h2>

          <p className="text-[#6B5040] mt-8 max-w-lg mx-auto text-sm sm:text-base md:text-lg leading-relaxed">
            Join thousands of users who trust MedCare AI for doctor appointments,
            disease prediction, and early cancer detection.
          </p>

          <div className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="px-10 py-4 bg-clinical-primary text-[#EDD9CC] font-semibold text-[11px] sm:text-xs tracking-[0.2em] uppercase hover:bg-clinical-primary/90 transition-colors duration-300 rounded-sm">
              Sign Up
            </button>
            <button className="px-10 py-4 border border-clinical-primary/20 text-clinical-primary/70 font-semibold text-[11px] sm:text-xs tracking-[0.2em] uppercase hover:border-clinical-primary/40 hover:text-clinical-primary transition-all duration-300 rounded-sm">
              Login
            </button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FOOTER
          ═══════════════════════════════════════ */}
      <footer className="relative border-t border-[#C4A882]/30">
        <div className="max-w-6xl mx-auto px-6 py-12 sm:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 sm:gap-8">
            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="text-lg font-bold tracking-tight">
                Med<span className="text-clinical-primary">Care</span>{" "}
                <span className="text-[#C4A882]">AI</span>
              </div>
              <p className="text-[#8B7560] text-xs mt-3 max-w-xs leading-relaxed">
                Your complete health platform — connecting patients with
                specialists and AI-powered diagnostics.
              </p>
            </div>

            {/* Platform */}
            <div>
              <div className="text-[10px] tracking-[0.3em] text-[#8B7560] font-mono uppercase mb-4">
                Platform
              </div>
              <ul className="space-y-2.5">
                {["Find Doctors", "Book Appointments", "Disease Prediction", "Cancer Detection"].map(
                  (item) => (
                    <li key={item}>
                      <a
                        href="#"
                        className="text-[#8B7560] hover:text-clinical-primary text-xs transition-colors duration-200"
                      >
                        {item}
                      </a>
                    </li>
                  ),
                )}
              </ul>
            </div>

            {/* Company */}
            <div>
              <div className="text-[10px] tracking-[0.3em] text-[#8B7560] font-mono uppercase mb-4">
                Company
              </div>
              <ul className="space-y-2.5">
                {["About Us", "Research", "Careers", "Contact"].map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-[#8B7560] hover:text-clinical-primary text-xs transition-colors duration-200"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <div className="text-[10px] tracking-[0.3em] text-[#8B7560] font-mono uppercase mb-4">
                Legal
              </div>
              <ul className="space-y-2.5">
                {["Terms of Service", "Privacy Policy", "Cookie Policy", "HIPAA Compliance"].map(
                  (item) => (
                    <li key={item}>
                      <a
                        href="#"
                        className="text-[#8B7560] hover:text-clinical-primary text-xs transition-colors duration-200"
                      >
                        {item}
                      </a>
                    </li>
                  ),
                )}
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-[#C4A882]/30 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Copyright */}
            <p className="text-[9px] sm:text-[10px] tracking-[0.2em] text-[#A08870] font-mono">
              © 2026 MedCare AI — All Rights Reserved
            </p>

            {/* Social links */}
            <div className="flex items-center gap-6">
              {[
                { name: "Twitter", icon: "𝕏" },
                { name: "LinkedIn", icon: "in" },
                { name: "GitHub", icon: "GH" },
              ].map((social) => (
                <a
                  key={social.name}
                  href="#"
                  className="text-[#A08870] hover:text-clinical-primary text-[10px] font-mono tracking-wider transition-colors duration-200"
                  aria-label={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
