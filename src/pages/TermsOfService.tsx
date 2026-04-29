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

const TermsOfService = () => {
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
          <h1 className="text-4xl md:text-5xl font-bold font-heading text-foreground mb-4">Terms of Service</h1>
          <div className="flex flex-wrap gap-x-6 gap-y-1 mb-10">
            <p className="text-sm text-muted-foreground font-body">Effective Date: April 29, 2026</p>
            <p className="text-sm text-muted-foreground font-body">Last Updated: April 29, 2026</p>
          </div>

          <p className="text-base font-body text-muted-foreground leading-[1.75] mb-4">
            These Terms of Service ("Terms") govern your use of Stitchly, operated by Video Boss LLC ("we," "us," or "our"), including the desktop application and the website at stitchly.ai. By creating an account or using Stitchly, you agree to these Terms.
          </p>
          <p className="text-base font-body text-muted-foreground leading-[1.75] mb-14">
            Questions? Contact us at{" "}
            <a href="mailto:support@stitchly.ai" className="text-primary hover:text-primary/80 transition-colors underline">
              support@stitchly.ai
            </a>.
          </p>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold font-heading text-foreground mb-6">1. Eligibility</h2>
            <p className="text-base font-body text-muted-foreground leading-[1.75]">
              You must be at least 13 years old to use Stitchly. If you are under 18, you must have parental or guardian consent to create an account. Users under 18 may not purchase a paid subscription without parental consent. By using Stitchly, you represent that you meet these requirements.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold font-heading text-foreground mb-6">2. Your Account</h2>
            <p className="text-base font-body text-muted-foreground leading-[1.75] mb-4">
              You are responsible for maintaining the security of your account credentials. You are responsible for all activity that occurs under your account. Notify us immediately at{" "}
              <a href="mailto:support@stitchly.ai" className="text-primary hover:text-primary/80 transition-colors underline">
                support@stitchly.ai
              </a>{" "}
              if you suspect unauthorized access to your account.
            </p>
            <p className="text-base font-body text-muted-foreground leading-[1.75]">
              We reserve the right to suspend or terminate accounts that violate these Terms.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold font-heading text-foreground mb-6">3. Acceptable Use</h2>
            <p className="text-base font-body text-muted-foreground leading-[1.75] mb-4">
              You agree not to use Stitchly to:
            </p>
            <ul className="list-disc list-outside ml-5 space-y-1.5 text-base font-body text-muted-foreground leading-[1.75]">
              <li>Process footage you do not own or do not have the rights to use</li>
              <li>Upload, process, or distribute illegal content of any kind</li>
              <li>Attempt to reverse engineer, decompile, or extract the source code of Stitchly</li>
              <li>Resell, sublicense, or redistribute Stitchly or its outputs as a competing product</li>
              <li>Circumvent usage limits, credits, or billing systems</li>
              <li>Use automated scripts to access the service in ways that violate these Terms</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold font-heading text-foreground mb-6">4. Your Content</h2>
            <p className="text-base font-body text-muted-foreground leading-[1.75] mb-4">
              You retain full ownership of all footage, transcripts, sequences, and other content you create or process using Stitchly. We do not claim any ownership over your content.
            </p>
            <p className="text-base font-body text-muted-foreground leading-[1.75] mb-4">
              By using Stitchly, you grant us a limited license to store, process, and transmit your content solely for the purpose of providing the service to you. We do not use your content to train AI models or share it with third parties beyond what is described in our Privacy Policy.
            </p>
            <p className="text-base font-body text-muted-foreground leading-[1.75]">
              You are solely responsible for ensuring you have the rights to process any footage you import into Stitchly.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold font-heading text-foreground mb-6">5. Credits and Subscriptions</h2>

            <div className="mb-6">
              <h3 className="text-base font-semibold font-heading text-foreground mb-2">Free Trial</h3>
              <p className="text-base font-body text-muted-foreground leading-[1.75]">
                New accounts receive 50 credits at no charge with no credit card required. Free trial credits are one-time, non-transferable, and do not roll over or expire.
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-base font-semibold font-heading text-foreground mb-2">Pro Plan</h3>
              <p className="text-base font-body text-muted-foreground leading-[1.75]">
                The Pro plan is billed at $29 per month or $290 per year as selected at checkout. Pro subscribers receive 500 credits at the start of each billing cycle.
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-base font-semibold font-heading text-foreground mb-2">Credit Rollover and Expiration</h3>
              <p className="text-base font-body text-muted-foreground leading-[1.75]">
                Unused monthly credits automatically roll over to the following month. Monthly credits are valid for 60 days from the date they are issued. Any monthly credits older than 60 days are automatically removed from your balance. Your account has a maximum stored credit cap of 1,500 credits for monthly credits. If adding new monthly credits would cause your balance to exceed this cap, only the amount needed to reach the cap will be added. When credits are used, the oldest credits are deducted first.
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-base font-semibold font-heading text-foreground mb-2">Credit Top-Ups</h3>
              <p className="text-base font-body text-muted-foreground leading-[1.75]">
                Pro subscribers may purchase additional credits at any time. Top-up credits range from 100 credits ($7.99) to 1,000 credits ($54.99). Top-up credits do not expire and remain available in your account until used. If your subscription lapses or is cancelled, top-up credits are frozen and cannot be used until an active subscription is restored. If your account is permanently deleted per our inactivity policy, all remaining credits including top-up credits are permanently removed.
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-base font-semibold font-heading text-foreground mb-2">Credit Usage</h3>
              <p className="text-base font-body text-muted-foreground leading-[1.75]">
                Transcription costs 1 credit per 2 minutes of footage. AI commands cost 5 credits each.
              </p>
            </div>

            <div>
              <h3 className="text-base font-semibold font-heading text-foreground mb-2">Billing</h3>
              <p className="text-base font-body text-muted-foreground leading-[1.75]">
                All payments are processed by Stripe. Subscriptions renew automatically at the end of each billing period unless cancelled. You authorize us to charge your payment method on file for recurring subscription fees.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold font-heading text-foreground mb-6">6. Cancellation and Data Retention</h2>
            <p className="text-base font-body text-muted-foreground leading-[1.75] mb-4">
              You may cancel your subscription at any time from Settings → Billing. Your access continues until the end of your current billing period. After your billing period ends, your account is locked and all credits are frozen. Your account and all associated data are permanently deleted 60 days after your last login or activity. We will send you a warning email 10 days before deletion.
            </p>
            <p className="text-base font-body text-muted-foreground leading-[1.75]">
              We do not offer refunds for partial billing periods or unused credits except where required by applicable law. If you believe you were charged in error, contact us at{" "}
              <a href="mailto:support@stitchly.ai" className="text-primary hover:text-primary/80 transition-colors underline">
                support@stitchly.ai
              </a>{" "}
              within 30 days of the charge.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold font-heading text-foreground mb-6">7. Service Availability</h2>
            <p className="text-base font-body text-muted-foreground leading-[1.75] mb-4">
              We strive to keep Stitchly available and reliable, but we do not guarantee uninterrupted access. We may perform maintenance, updates, or experience outages outside of our control. We are not liable for any loss resulting from service interruptions.
            </p>
            <p className="text-base font-body text-muted-foreground leading-[1.75]">
              We reserve the right to modify, suspend, or discontinue any part of Stitchly at any time with reasonable notice where possible.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold font-heading text-foreground mb-6">8. Intellectual Property</h2>
            <p className="text-base font-body text-muted-foreground leading-[1.75]">
              Stitchly, including its software, design, branding, and underlying technology, is owned by Video Boss LLC and protected by applicable intellectual property laws. Nothing in these Terms grants you ownership of any Stitchly technology or intellectual property.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold font-heading text-foreground mb-6">9. Disclaimer of Warranties</h2>
            <p className="text-base font-body text-muted-foreground leading-[1.75]">
              Stitchly is provided "as is" and "as available" without warranties of any kind, express or implied. We do not warrant that the service will be error-free, uninterrupted, or that AI-generated outputs will meet your specific requirements. Use of AI assembly features is at your own discretion and editorial judgment.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold font-heading text-foreground mb-6">10. Limitation of Liability</h2>
            <p className="text-base font-body text-muted-foreground leading-[1.75]">
              To the maximum extent permitted by applicable law, Video Boss LLC shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of Stitchly, including but not limited to loss of data, loss of revenue, or loss of business opportunities. Our total liability to you for any claim shall not exceed the amount you paid us in the 12 months preceding the claim.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold font-heading text-foreground mb-6">11. Governing Law</h2>
            <p className="text-base font-body text-muted-foreground leading-[1.75]">
              These Terms are governed by the laws of the State of South Carolina, United States, without regard to its conflict of law provisions. Any disputes arising from these Terms shall be resolved in the courts located in Greenville County, South Carolina.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold font-heading text-foreground mb-6">12. Changes to These Terms</h2>
            <p className="text-base font-body text-muted-foreground leading-[1.75]">
              We may update these Terms from time to time. We will notify you of significant changes by email or by posting a notice on stitchly.ai. Your continued use of Stitchly after changes are posted constitutes your acceptance of the updated Terms.
            </p>
          </section>

          <section className="mb-4">
            <h2 className="text-2xl font-semibold font-heading text-foreground mb-6">13. Contact</h2>
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

export default TermsOfService;
