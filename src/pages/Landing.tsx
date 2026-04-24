import { Button } from "@/components/ui/button";
import { Sparkles, Monitor, Upload as UploadIcon, Users, ChevronRight, ArrowRight, Star, ChevronLeft, Check, Play } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { DotPattern } from "@/components/ui/dot-pattern";
import { GridPattern } from "@/components/ui/grid-pattern";
import { Particles } from "@/components/ui/particles";
import { BorderBeam } from "@/components/ui/border-beam";
import { VideoLightbox } from "@/components/VideoLightbox";
import { FadeUpSection } from "@/components/FadeUpSection";
import { cn } from "@/lib/utils";
import dashboardImage from "@/assets/stitchly-dashboard.png";
import uploadDashboard from "@/assets/upload-dashboard.png";
import adminDashboard from "@/assets/admin-dashboard.png";
import stitchlyLogo from "@/assets/stitchly-logo.svg";

const BRAND = "Stitchly";
const SIGNUP_URL = "https://app.stitchly.ai/signup";
const SIGNIN_URL = "https://app.stitchly.ai";
const DEMO_VIDEO = "https://stream.mux.com/BV01yJr5s6VesvD7mJBtdaeqcj802hy1ltYBoWsmEbs4s.m3u8";

const testimonials = [
  {
    id: 1,
    rating: 5,
    text: "I had a 6-interview project that normally takes two days of logging. Stitchly had an assembly cut ready in under an hour. I opened it in Premiere and the edit was already 80% there.",
    author: "Jake Morrison",
    title: "Freelance Video Editor",
  },
  {
    id: 2,
    rating: 5,
    text: "The one-click send to Premiere is what sold me. No more exporting XMLs, hunting for the file, importing, relinking. I click a button and my sequence is just there.",
    author: "Rachel Torres",
    title: "Senior Editor, BrandCraft Studios",
  },
  {
    id: 3,
    rating: 5,
    text: "We cut testimonial videos for 12 clients a month. Stitchly saves my team about 15 hours a week on footage review alone. That's not an exaggeration.",
    author: "David Osei",
    title: "Creative Director, Meridian Media",
  },
];

const Landing = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [videoOpen, setVideoOpen] = useState(false);

  const scrollToHowItWorks = () => {
    document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
  };

  const nextTestimonial = () => setCurrentTestimonial((p) => (p + 1) % testimonials.length);
  const previousTestimonial = () => setCurrentTestimonial((p) => (p - 1 + testimonials.length) % testimonials.length);

  return (
    <div className="min-h-screen bg-stitchly-base">
      {/* Shared SVG gradient for stroke="url(#bp-gradient)" */}
      <svg width="0" height="0" className="absolute" aria-hidden>
        <defs>
          <linearGradient id="bp-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#7C3AED" />
          </linearGradient>
        </defs>
      </svg>

      {/* Header */}
      <header className="border-b border-border bg-stitchly-base/90 backdrop-blur sticky top-0 z-50">
        <div className="stitchly-container py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <img src={stitchlyLogo} alt="Stitchly" className="h-7 sm:h-8 w-auto" />
          </a>
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground font-body">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <Button variant="ghost" asChild className="text-muted-foreground hover:text-foreground hover:bg-muted text-sm sm:text-base px-2 sm:px-4">
              <a href={SIGNIN_URL}>Sign In</a>
            </Button>
            <Button asChild className="btn-gradient border-0 text-sm sm:text-base px-3 sm:px-4">
              <a href={SIGNUP_URL}>Start Your Free Trial →</a>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-stitchly-base">
        <div className="hero-radial-glow" />
        <Particles
          className="absolute inset-0 z-0"
          quantity={180}
          ease={70}
          size={0.5}
          color="#7C3AED"
        />
        <div className="stitchly-container relative z-10 py-16 sm:py-24 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex flex-col items-center text-center"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs sm:text-sm text-primary font-body mb-6">
              <Sparkles className="h-3.5 w-3.5" /> AI Video Assembly for Editors
            </span>

            <h2
              className="font-bold font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-[88px] leading-[1.1]"
              style={{ letterSpacing: "-0.03em" }}
            >
              <span className="block text-foreground">Stop Watching.</span>
              <span
                className="block bg-clip-text text-transparent"
                style={{ backgroundImage: "linear-gradient(90deg, #7C3AED 0%, #3B82F6 100%)" }}
              >
                Start Editing.
              </span>
            </h2>

            <p className="mt-6 text-base sm:text-lg lg:text-xl text-muted-foreground max-w-[600px] font-body leading-relaxed">
              Six hours of interviews. One deadline. Stitchly reads every word, finds the best soundbites, and builds your assembly cut automatically. One click sends it straight to Premiere, Resolve, or Final Cut.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto justify-center">
              <Button size="lg" asChild className="btn-gradient border-0 rounded-lg px-6 py-3 text-base font-body w-full sm:w-auto relative overflow-hidden">
                <a href={SIGNUP_URL}>
                  Start Your Free Trial →
                  <BorderBeam size={80} duration={8} colorFrom="#ffffff" colorTo="#E0D4FF" />
                </a>
              </Button>
              <Button size="lg" onClick={scrollToHowItWorks} className="btn-outline-gradient rounded-lg px-6 py-3 text-base font-body w-full sm:w-auto">
                <span className="gradient-text font-medium">See How It Works ↓</span>
              </Button>
            </div>

            {/* Product screenshot */}
            <div className="mt-14 sm:mt-20 w-full max-w-[1100px] mx-auto">
              <div
                className="relative rounded-2xl overflow-hidden image-fade-bottom"
                style={{
                  border: "1px solid rgba(124, 58, 237, 0.2)",
                  boxShadow: "0 0 60px rgba(124, 58, 237, 0.15)",
                }}
              >
                <img src={dashboardImage} alt="Stitchly Dashboard" className="w-full h-auto block" />
                <button
                  onClick={() => setVideoOpen(true)}
                  aria-label="Play product demo"
                  className="absolute inset-0 flex items-center justify-center group"
                >
                  <span
                    className="animate-play-pulse flex items-center justify-center rounded-full backdrop-blur-md transition-all duration-300 group-hover:scale-110 group-hover:bg-white"
                    style={{
                      width: 80,
                      height: 80,
                      backgroundColor: "rgba(255,255,255,0.95)",
                      boxShadow: "0 8px 30px rgba(124, 58, 237, 0.35)",
                    }}
                  >
                    <Play className="h-8 w-8 ml-1" style={{ color: "#7C3AED", fill: "#7C3AED" }} />
                  </span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <VideoLightbox open={videoOpen} onClose={() => setVideoOpen(false)} src={DEMO_VIDEO} />

      {/* How It Works */}
      <FadeUpSection
        id="how-it-works"
        className="relative overflow-hidden bg-section-howitworks"
      >
        <GridPattern
          width={48}
          height={48}
          className={cn("stroke-primary/10 opacity-80", "[mask-image:radial-gradient(ellipse_at_center,white,transparent_70%)]")}
          strokeDasharray="0"
        />
        <div className="stitchly-container relative py-16 sm:py-24">
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-10 sm:mb-14 text-foreground font-heading">How It Works</h3>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6">
            {[
              { Icon: UploadIcon, title: "Import Your Footage", text: "Drop in your interview files. Stitchly generates proxies locally, transcribes with word-level timestamps, and identifies every speaker automatically." },
              { Icon: Sparkles, title: "AI Finds the Best Moments", text: "Stitchly categorizes every soundbite by type — emotion, story, key point, CTA, and more. Search, filter, and build your sequence from the strongest clips across all your footage." },
              { Icon: Monitor, title: "One Click to Your NLE", text: "Hit \"Send to Premiere Pro\" and your sequence opens directly in your editor with all media linked. No XML hunting. No relinking. Premiere, Resolve, and Final Cut all supported." },
            ].map(({ Icon, title, text }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: i * 0.1 }}
                className="stitchly-card p-8 space-y-4"
              >
                <div className="h-12 w-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center icon-glow-purple">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h4 className="text-xl font-bold text-foreground font-heading">{title}</h4>
                <p className="text-muted-foreground leading-relaxed font-body">{text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </FadeUpSection>

      {/* Feature Block 1 */}
      <FadeUpSection id="features" className="relative overflow-hidden bg-section-feature1">
        <div
          aria-hidden
          className="pointer-events-none absolute top-1/2 -translate-y-1/2 left-[-150px] w-[600px] h-[600px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)" }}
        />
        <div className="stitchly-container relative py-16 sm:py-24">
          <div className="grid lg:grid-cols-2 gap-10 sm:gap-16 items-center">
            <div className="relative space-y-6 sm:space-y-8">
              <div className="relative">
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 font-heading">Give It a Brief. Get a Cut.</h3>
                <p className="text-muted-foreground font-body">Tell Stitchly what you need the way you'd brief a senior editor. It reads your entire transcript library and assembles the best clips into a structured sequence — labeled, timestamped, and ordered by narrative logic.</p>
              </div>
              <div className="relative space-y-6">
                {[
                  { title: "Creative briefs in plain English", text: "Type what you want: \"Build a 90-second testimonial. Open with struggle, close with results.\" Stitchly finds the clips that match." },
                  { title: "Multi-video intelligence", text: "Upload 8 interviews. Stitchly treats them as one searchable library. The best moment from interview 3 lands next to the perfect setup from interview 7." },
                  { title: "Every word searchable", text: "Word-level timestamps. Speaker identification. Semantic categorization. Your footage becomes a database you can query." },
                ].map((b) => (
                  <div key={b.title} className="flex gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <ArrowRight
                        className="h-6 w-6"
                        style={{ stroke: "url(#bp-gradient)" }}
                      />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-foreground mb-2 font-heading">{b.title}</h4>
                      <p className="text-muted-foreground font-body">{b.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="w-full">
              <img
                src={uploadDashboard}
                alt="Stitchly Workspace"
                className="w-full h-auto rounded-lg"
                style={{ boxShadow: "0 0 80px rgba(124, 58, 237, 0.2)" }}
              />
            </div>
          </div>
        </div>
      </FadeUpSection>

      {/* Feature Block 2 */}
      <FadeUpSection className="relative overflow-hidden bg-section-feature2">
        <GridPattern
          width={48}
          height={48}
          className="opacity-50"
          style={{ stroke: "rgba(59, 130, 246, 0.1)" }}
        />
        <div className="stitchly-container relative py-16 sm:py-24">
          <div className="grid lg:grid-cols-2 gap-10 sm:gap-16 items-center">
            <div className="w-full lg:order-1 order-2">
              <img
                src={adminDashboard}
                alt="Stitchly Sequence Editor"
                className="w-full h-auto rounded-lg"
                style={{ boxShadow: "0 0 80px rgba(59, 130, 246, 0.2)" }}
              />
            </div>
            <div className="relative space-y-6 sm:space-y-8 lg:order-2 order-1">
              <div className="relative">
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 font-heading">Built for Professional Editors</h3>
                <p className="text-muted-foreground font-body">Stitchly doesn't replace your NLE. It eliminates the hours you spend scrubbing footage before the real edit starts.</p>
              </div>
              <div className="relative space-y-6">
                {[
                  { title: "Premiere, Resolve, and Final Cut", text: "Export a ready-to-edit XML for any major editing platform. One click opens your sequence directly in your editor with all media paths linked." },
                  { title: "Proxy-based workflow", text: "Stitchly generates lightweight proxies locally so your machine stays fast. Original media paths are preserved in every export." },
                  { title: "Your footage stays local", text: "No cloud uploads. No waiting. Everything runs on your Mac with files stored on your own drives." },
                ].map((b) => (
                  <div key={b.title} className="flex gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <ArrowRight className="h-6 w-6" style={{ stroke: "url(#bp-gradient)" }} />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-foreground mb-2 font-heading">{b.title}</h4>
                      <p className="text-muted-foreground font-body">{b.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </FadeUpSection>

      {/* Testimonials */}
      <FadeUpSection className="relative overflow-hidden bg-section-testimonials">
        {/* Top fade from dark feature2 (#06080E) into light */}
        <div
          aria-hidden
          className="pointer-events-none absolute top-0 left-0 right-0 h-[120px] z-[1]"
          style={{ background: "linear-gradient(to bottom, #06080E 0%, transparent 100%)" }}
        />
        {/* Bottom fade from light into dark pricing (#0A0E1A) */}
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-0 left-0 right-0 h-[120px] z-[1]"
          style={{ background: "linear-gradient(to top, #0A0E1A 0%, transparent 100%)" }}
        />
        <div className="stitchly-container relative z-[2] py-20 sm:py-28">
          <div className="text-center mb-10 sm:mb-14">
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 font-heading" style={{ color: "#1A1A2E" }}>What Editors Are Saying</h3>
            <p className="font-body" style={{ color: "#5A5A6E" }}>From editors who stopped scrubbing and started editing.</p>
          </div>
          <div className="relative">
            <div className="overflow-hidden">
              <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${currentTestimonial * 100}%)` }}>
                {testimonials.map((t, i) => (
                  <div key={t.id} className="w-full flex-shrink-0 px-4">
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.2 }}
                      transition={{ duration: 0.6, ease: "easeOut", delay: i * 0.1 }}
                      className="p-8 max-w-2xl mx-auto rounded-2xl"
                      style={{
                        backgroundColor: "#FFFFFF",
                        border: "1px solid rgba(26, 26, 46, 0.08)",
                      }}
                    >
                      <div className="flex gap-1 mb-4">
                        {[...Array(t.rating)].map((_, idx) => (
                          <Star key={idx} className="h-5 w-5 fill-primary text-primary" />
                        ))}
                      </div>
                      <p className="text-lg mb-6 leading-relaxed font-body" style={{ color: "#1A1A2E" }}>"{t.text}"</p>
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(26,26,46,0.08)" }}>
                          <Users className="h-6 w-6" style={{ color: "#5A5A6E" }} />
                        </div>
                        <div>
                          <p className="font-semibold font-heading" style={{ color: "#1A1A2E" }}>{t.author}</p>
                          <p className="text-sm font-body" style={{ color: "#5A5A6E" }}>{t.title}</p>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={previousTestimonial}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 sm:-translate-x-4 p-2 sm:p-3 rounded-full transition-colors"
              style={{ backgroundColor: "rgba(26,26,46,0.08)", color: "#1A1A2E" }}
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
            <button
              onClick={nextTestimonial}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 sm:translate-x-4 p-2 sm:p-3 rounded-full transition-colors"
              style={{ backgroundColor: "rgba(26,26,46,0.08)", color: "#1A1A2E" }}
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
            <div className="flex justify-center gap-2 mt-8">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentTestimonial(idx)}
                  className={`h-2 rounded-full transition-all ${idx === currentTestimonial ? "w-8 bg-primary" : "w-2"}`}
                  style={idx === currentTestimonial ? undefined : { backgroundColor: "rgba(26,26,46,0.2)" }}
                  aria-label={`Go to testimonial ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </FadeUpSection>

      {/* Pricing */}
      <FadeUpSection id="pricing" className="relative overflow-hidden bg-stitchly-alt section-fade-top section-fade-bottom">
        <GridPattern width={40} height={40} className={cn("stroke-primary/15 opacity-20", "[mask-image:radial-gradient(ellipse_at_center,white,transparent_55%)]")} />
        <div className="stitchly-container relative py-16 sm:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 font-heading">Simple Pricing. Start Free.</h3>
            <p className="text-muted-foreground font-body mb-10">One plan. Everything included.</p>
            <div className="stitchly-card p-8 sm:p-10 text-left max-w-md mx-auto">
              <div className="mb-6">
                <h4 className="text-2xl font-bold text-foreground font-heading">Pro</h4>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-foreground font-heading">$29</span>
                  <span className="text-muted-foreground font-body">/ month</span>
                </div>
                <p className="text-muted-foreground text-sm mt-1 font-body">or $290/year</p>
                <p className="text-muted-foreground mt-4 font-body">Everything you need to stop scrubbing and start editing.</p>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  "500 credits/month (1 credit per 2 min transcription, 5 credits per AI command)",
                  "Unlimited projects",
                  "AI-powered soundbite assembly",
                  "One-click export to Premiere, Resolve & FCP",
                  "Prompt Builder + Quick Actions",
                  "Priority processing",
                  "Credit top-ups available",
                ].map((feature) => (
                  <li key={feature} className="flex gap-3 items-start">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-foreground/90 text-sm font-body">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button asChild size="lg" className="btn-gradient border-0 rounded-lg w-full">
                <a href={SIGNUP_URL}>Start Your Free Trial →</a>
              </Button>
            </div>
            <p className="text-muted-foreground text-sm mt-6 font-body">Start with a free trial. No credit card required. Download for Mac.</p>
          </div>
        </div>
      </FadeUpSection>

      {/* CTA Section */}
      <FadeUpSection className="relative overflow-hidden bg-stitchly-base">
        <DotPattern glow width={20} height={20} className={cn("fill-primary/30 opacity-60", "[mask-image:radial-gradient(ellipse_at_center,white,transparent_70%)]")} />
        <div className="stitchly-container relative py-16 sm:py-24">
          <div className="stitchly-card p-8 sm:p-14 text-center space-y-5 sm:space-y-6 max-w-4xl mx-auto">
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground font-heading">Your Next Edit Starts Here.</h3>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto font-body">
              Download Stitchly, import your footage, and get your first assembly cut before you finish your coffee. The footage isn't going to watch itself — but now it doesn't have to.
            </p>
            <div className="flex justify-center pt-2 sm:pt-4">
              <Button size="lg" asChild className="btn-gradient border-0 rounded-lg px-8">
                <a href={SIGNUP_URL}>Start Your Free Trial →</a>
              </Button>
            </div>
          </div>
        </div>
      </FadeUpSection>

      {/* Footer */}
      <FadeUpSection as="footer" className="border-t border-border bg-stitchly-alt">
        <div className="stitchly-container py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <img src={stitchlyLogo} alt="Stitchly" className="h-8 w-auto" />
              </div>
              <p className="text-muted-foreground text-sm font-body">AI video assembly for professional editors.</p>
            </div>
            <div>
              <h4 className="text-foreground font-semibold mb-4 font-heading">Product</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-body">Features</a></li>
                <li><a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-body">How It Works</a></li>
                <li><a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-body">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-foreground font-semibold mb-4 font-heading">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-body">About</a></li>
                <li><a href="mailto:support@stitchly.ai" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-body">Contact</a></li>
                <li><a href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-body">Privacy Policy</a></li>
                <li><a href="/terms" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-body">Terms</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-foreground font-semibold mb-4 font-heading">Account</h4>
              <ul className="space-y-2">
                <li><a href={SIGNIN_URL} className="text-muted-foreground hover:text-foreground transition-colors text-sm font-body">Sign In</a></li>
                <li><a href={SIGNUP_URL} className="text-muted-foreground hover:text-foreground transition-colors text-sm font-body">Start Your Free Trial</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border">
            <p className="text-muted-foreground text-sm font-body text-center">© 2026 {BRAND}. All rights reserved.</p>
          </div>
        </div>
      </FadeUpSection>
    </div>
  );
};

export default Landing;
