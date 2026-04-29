import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { FadeUpSection } from "@/components/FadeUpSection";
import { GridPattern } from "@/components/ui/grid-pattern";
import { cn } from "@/lib/utils";
import stitchlyLogo from "@/assets/stitchly-logo.svg";

const BRAND = "Stitchly";
const SIGNUP_URL = "https://app.stitchly.ai/signup";
const SIGNIN_URL = "https://app.stitchly.ai";

const PrivacyPolicy = () => {
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-sm">
        <div className="stitchly-container py-4">
          <Link to="/">
            <img src={stitchlyLogo} alt="Stitchly" className="h-8 w-auto" />
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-[720px] px-6 py-16 md:py-24">
          <h1 className="text-4xl md:text-5xl font-bold font-heading text-foreground mb-4">Privacy Policy</h1>
          <div className="flex flex-wrap gap-x-6 gap-y-1 mb-10">
            <p className="text-sm text-muted-foreground font-body">Effective Date: April 29, 2026</p>
            <p className="text-sm text-muted-foreground font-body">Last Updated: April 29, 2026</p>
          </div>

          <p className="text-base font-body text-muted-foreground leading-[1.75] mb-4">
            Video Boss LLC ("Stitchly," "we," "us," or "our") operates the Stitchly desktop application and website located at stitchly.ai. This Privacy Policy explains what information we collect, how we use it, and your rights regarding your data.
          </p>
          <p className="text-base font-body text-muted-foreground leading-[1.75] mb-14">
            Questions? Contact us at{" "}
            <a href="mailto:support@stitchly.ai" className="text-primary hover:text-primary/80 transition-colors underline">
              support@stitchly.ai
            </a>.
          </p>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold font-heading text-foreground mb-6">1. Information We Collect</h2>

            <div className="mb-6">
              <h3 className="text-base font-semibold font-heading text-foreground mb-2">Account Information</h3>
              <p className="text-base font-body text-muted-foreground leading-[1.75]">
                When you create an account, we collect your email address and a hashed password. We do not store your password in plain text.
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-base font-semibold font-heading text-foreground mb-2">Project and Transcript Data</h3>
              <p className="text-base font-body text-muted-foreground leading-[1.75] mb-3">
                When you use Stitchly, we store the following in our secure database:
              </p>
              <ul className="list-disc list-outside ml-5 space-y-1.5 text-base font-body text-muted-foreground leading-[1.75]">
                <li>project names and settings</li>
                <li>video metadata such as filenames, durations, and processing state</li>
                <li>word-level transcripts generated from your interviews</li>
                <li>AI-generated soundbite categorization data</li>
                <li>soundbite selections and timecodes</li>
                <li>exported sequence data</li>
              </ul>
            </div>

            <div className="mb-6">
              <h3 className="text-base font-semibold font-heading text-foreground mb-2">Audio Files</h3>
              <p className="text-base font-body text-muted-foreground leading-[1.75]">
                When using the desktop app, your video files never leave your computer. To generate a transcript, Stitchly extracts audio from your video and temporarily uploads it to our secure cloud storage so it can be sent to AssemblyAI for transcription. This audio file is retained in our secure storage. If you would like your audio files deleted, contact us at{" "}
                <a href="mailto:support@stitchly.ai" className="text-primary hover:text-primary/80 transition-colors underline">
                  support@stitchly.ai
                </a>.
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-base font-semibold font-heading text-foreground mb-2">Video Files (Web App)</h3>
              <p className="text-base font-body text-muted-foreground leading-[1.75]">
                If you use Stitchly via a web browser rather than the desktop app, video files you upload are stored with our video infrastructure provider, Mux, for playback purposes. The desktop app does not use Mux — all video stays local on your machine.
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-base font-semibold font-heading text-foreground mb-2">Payment Information</h3>
              <p className="text-base font-body text-muted-foreground leading-[1.75]">
                We use Stripe to process payments. We do not store your credit card number, CVV, or full payment details on our servers. Stripe handles all payment processing and is subject to their own privacy policy at stripe.com/privacy.
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-base font-semibold font-heading text-foreground mb-2">Usage Data</h3>
              <p className="text-base font-body text-muted-foreground leading-[1.75]">
                We collect basic server-side logs for error reporting and security purposes. We do not use third-party analytics or behavioral tracking tools. We do not track your activity across other websites.
              </p>
            </div>

            <div>
              <h3 className="text-base font-semibold font-heading text-foreground mb-2">Cookies</h3>
              <p className="text-base font-body text-muted-foreground leading-[1.75]">
                We do not use third-party tracking or advertising cookies. The only cookie we set is a first-party preference cookie that remembers your sidebar layout preference. Authentication is handled via secure local storage, not cookies.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold font-heading text-foreground mb-6">2. How We Use Your Information</h2>
            <p className="text-base font-body text-muted-foreground leading-[1.75] mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc list-outside ml-5 space-y-1.5 text-base font-body text-muted-foreground leading-[1.75] mb-6">
              <li>Create and maintain your account</li>
              <li>Process your transcriptions and AI-powered assembly requests</li>
              <li>Process payments and manage your subscription</li>
              <li>Send transactional emails such as account verification, payment receipts, and billing notices via Resend</li>
              <li>Provide customer support</li>
              <li>Improve the reliability and performance of Stitchly</li>
            </ul>
            <p className="text-base font-body text-muted-foreground leading-[1.75]">
              We do not sell your data. We do not use your content to train AI models. We do not share your data with third parties beyond what is described in this policy.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold font-heading text-foreground mb-6">3. Third-Party Services</h2>
            <p className="text-base font-body text-muted-foreground leading-[1.75] mb-6">
              Stitchly uses the following third-party services to operate:
            </p>
            <ul className="space-y-4 text-base font-body text-muted-foreground leading-[1.75]">
              <li>
                <span className="text-foreground font-semibold font-heading">AssemblyAI</span>
                {" "}— Receives extracted audio from your interviews for transcription. AssemblyAI may retain audio and transcripts according to their privacy policy at assemblyai.com/legal/privacy-policy.
              </li>
              <li>
                <span className="text-foreground font-semibold font-heading">Anthropic (Claude)</span>
                {" "}— Receives transcript text to power AI assembly commands and soundbite analysis. No audio or video is sent to Anthropic.
              </li>
              <li>
                <span className="text-foreground font-semibold font-heading">OpenAI</span>
                {" "}— Receives transcript text for AI categorization of soundbites. No audio or video is sent to OpenAI.
              </li>
              <li>
                <span className="text-foreground font-semibold font-heading">Mux</span>
                {" "}— Stores and streams video files for web app users only. Desktop app users are not affected. Subject to Mux's privacy policy at mux.com/privacy.
              </li>
              <li>
                <span className="text-foreground font-semibold font-heading">Stripe</span>
                {" "}— Processes payments and manages subscriptions. Subject to Stripe's privacy policy at stripe.com/privacy.
              </li>
              <li>
                <span className="text-foreground font-semibold font-heading">Resend</span>
                {" "}— Delivers transactional emails such as receipts and account notifications. Subject to Resend's privacy policy at resend.com/legal/privacy-policy.
              </li>
              <li>
                <span className="text-foreground font-semibold font-heading">Supabase</span>
                {" "}— Provides our database and secure file storage infrastructure. Your data is encrypted at rest and in transit.
              </li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold font-heading text-foreground mb-6">4. Data Retention</h2>
            <p className="text-base font-body text-muted-foreground leading-[1.75] mb-4">
              We retain your data for as long as your account is active.
            </p>
            <p className="text-base font-body text-muted-foreground leading-[1.75] mb-4">
              <span className="text-foreground font-semibold font-heading">Cancelled subscriptions:</span>{" "}
              When your subscription ends, your account is locked at the end of your billing period. Your data is retained for 60 days after your last login or activity, then permanently deleted. Trial accounts with no activity for 60 days are also permanently deleted. We will notify you by email 10 days before deletion.
            </p>
            <p className="text-base font-body text-muted-foreground leading-[1.75] mb-4">
              <span className="text-foreground font-semibold font-heading">Account deletion requests:</span>{" "}
              If you request deletion of your account, we will remove your projects, transcripts, sequences, and associated data from our active systems. Encrypted backups may retain residual copies for up to 30 days before being permanently overwritten.
            </p>
            <p className="text-base font-body text-muted-foreground leading-[1.75]">
              Projects you move to Trash are retained until you permanently delete them or your account is purged.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold font-heading text-foreground mb-6">5. Your Rights</h2>
            <p className="text-base font-body text-muted-foreground leading-[1.75] mb-4">
              You have the right to:
            </p>
            <ul className="list-disc list-outside ml-5 space-y-1.5 text-base font-body text-muted-foreground leading-[1.75] mb-6">
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your account and associated data</li>
              <li>Export your transcript and project data</li>
              <li>Withdraw consent at any time</li>
            </ul>
            <p className="text-base font-body text-muted-foreground leading-[1.75]">
              To exercise any of these rights, contact us at{" "}
              <a href="mailto:support@stitchly.ai" className="text-primary hover:text-primary/80 transition-colors underline">
                support@stitchly.ai
              </a>.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold font-heading text-foreground mb-6">6. Children's Privacy</h2>
            <p className="text-base font-body text-muted-foreground leading-[1.75]">
              Stitchly is intended for users who are at least 13 years of age. Users under 18 must have parental or guardian consent to enter into a paid subscription. We do not knowingly collect personal information from children under 13. If you believe a child under 13 has provided us with personal information, contact us at{" "}
              <a href="mailto:support@stitchly.ai" className="text-primary hover:text-primary/80 transition-colors underline">
                support@stitchly.ai
              </a>{" "}
              and we will delete it promptly.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold font-heading text-foreground mb-6">7. Security</h2>
            <p className="text-base font-body text-muted-foreground leading-[1.75]">
              We use industry-standard security practices including encryption in transit (HTTPS/TLS) and encryption at rest for stored data. However, no method of transmission over the internet is 100% secure. We encourage you to use a strong, unique password for your account.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold font-heading text-foreground mb-6">8. Changes to This Policy</h2>
            <p className="text-base font-body text-muted-foreground leading-[1.75]">
              We may update this Privacy Policy from time to time. We will notify you of significant changes by email or by posting a notice on stitchly.ai. Your continued use of Stitchly after changes are posted constitutes your acceptance of the updated policy.
            </p>
          </section>

          <section className="mb-4">
            <h2 className="text-2xl font-semibold font-heading text-foreground mb-6">9. Contact</h2>
            <p className="text-base font-body text-muted-foreground leading-[1.75]">
              Video Boss LLC<br />
              Greenville, SC<br />
              <a href="mailto:support@stitchly.ai" className="text-primary hover:text-primary/80 transition-colors underline">
                support@stitchly.ai
              </a>
            </p>
          </section>
        </div>
      </main>

      <FadeUpSection as="footer" className="relative overflow-hidden bg-section-footer">
        <GridPattern
          width={48}
          height={48}
          className={cn("stroke-primary/30 opacity-100", "[mask-image:radial-gradient(ellipse_at_center,white,transparent_75%)]")}
          strokeDasharray="0"
        />
        <div className="stitchly-container relative py-10 md:py-12">
          <div className="flex flex-col md:flex-row md:justify-between md:gap-12 mb-6 md:mb-8">
            <div className="mb-6 md:mb-0 md:max-w-xs">
              <div className="flex items-center gap-2 mb-3 md:mb-4">
                <img src={stitchlyLogo} alt="Stitchly" className="h-8 w-auto" />
              </div>
              <p className="text-muted-foreground text-sm font-body">AI video assembly for professional editors.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-12">
              <div>
                <h4 className="text-foreground font-semibold mb-3 md:mb-4 font-heading">Product</h4>
                <ul className="space-y-1.5 md:space-y-2">
                  <li><a href="/#features" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-body">Features</a></li>
                  <li><a href="/#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-body">How It Works</a></li>
                  <li><a href="/#pricing" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-body">Pricing</a></li>
                  <li><a href="/#faq" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-body">FAQ</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-foreground font-semibold mb-3 md:mb-4 font-heading">Company</h4>
                <ul className="space-y-1.5 md:space-y-2">
                  <li><a href="/#about" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-body">About</a></li>
                  <li><a href="mailto:support@stitchly.ai" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-body">Contact</a></li>
                  <li><a href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-body">Privacy Policy</a></li>
                  <li><a href="/terms" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-body">Terms</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-foreground font-semibold mb-3 md:mb-4 font-heading">Account</h4>
                <ul className="space-y-1.5 md:space-y-2">
                  <li><a href={SIGNIN_URL} className="text-muted-foreground hover:text-foreground transition-colors text-sm font-body">Sign In</a></li>
                  <li><a href={SIGNUP_URL} className="text-muted-foreground hover:text-foreground transition-colors text-sm font-body">Start Your Free Trial</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="pt-6 md:pt-8 border-t border-border">
            <p className="text-muted-foreground text-sm font-body text-center">© 2026 {BRAND}. All rights reserved.</p>
          </div>
        </div>
      </FadeUpSection>

      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Back to top"
          className="fixed bottom-8 right-8 z-50 flex items-center justify-center w-10 h-10 rounded-full bg-card border border-primary/40 text-foreground hover:bg-primary/20 transition-colors"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default PrivacyPolicy;
