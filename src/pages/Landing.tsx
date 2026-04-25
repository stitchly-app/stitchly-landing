import { Button } from "@/components/ui/button";
import { Sparkles, Monitor, Upload as UploadIcon, Users, ArrowRight, Star, Check, Play } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { GridPattern } from "@/components/ui/grid-pattern";
import { DotPattern } from "@/components/ui/dot-pattern";
import { Particles } from "@/components/ui/particles";
import { BorderBeam } from "@/components/ui/border-beam";
import { Spotlight } from "@/components/ui/spotlight";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from "@/components/ui/carousel";
import { TracingBeam } from "@/components/ui/tracing-beam";
import { WaveDivider } from "@/components/WaveDivider";
import { VideoLightbox } from "@/components/VideoLightbox";
import { FadeUpSection } from "@/components/FadeUpSection";
import { Typewriter } from "@/components/Typewriter";
import { TypewriterLoop } from "@/components/TypewriterLoop";
import { ScreenshotReveal } from "@/components/ScreenshotReveal";
import { cn } from "@/lib/utils";
import dashboardImage from "@/assets/stitchly-dashboard-product-shot.png";
import dashboardImage2 from "@/assets/stitchly-project-area-product-shot.png";
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
    text: "I was skeptical that AI could actually understand the nuance of a good interview soundbite. It does. My first project took 45 minutes instead of half a day. I haven't gone back to manual logging once.",
    author: "Priya Nambiar",
    title: "Post-Production Supervisor, Clearfield Media",
  },
  {
    id: 2,
    rating: 5,
    text: "We produce 40 client videos a month. Stitchly cut our assembly time by 60%. That's not a guess. I tracked it. We took on three new clients with the same team size.",
    author: "Marcus Webb",
    title: "Founder, Webb Creative Co.",
  },
  {
    id: 3,
    rating: 5,
    text: "The transcript view is what got me. I can read through the whole interview, star the best moments, and build a sequence in minutes. It's like having a logging assistant who never sleeps.",
    author: "Yuki Tanaka",
    title: "Freelance Documentary Editor, Tokyo",
  },
  {
    id: 4,
    rating: 5,
    text: "I do a lot of talking head content for B2B brands. The AI categorization tags every soundbite: story, key point, CTA. I can find the perfect clip in seconds instead of scrubbing for 20 minutes.",
    author: "Femke van der Berg",
    title: "Video Strategist, Amsterdam",
  },
  {
    id: 5,
    rating: 5,
    text: "My biggest objection was the learning curve. There wasn't one. I imported my first interview, got a transcript, built a sequence, and sent it to Premiere in about 12 minutes. That was day one.",
    author: "Carlos Reyes",
    title: "Editor and Director, Mexico City",
  },
  {
    id: 6,
    rating: 5,
    text: "We charge clients for edit time. Stitchly basically gave us back two billable days per week. That's real money. We increased our monthly revenue without raising our rates or hiring anyone.",
    author: "Dominique Achebe",
    title: "Executive Producer, Pulse Content Studio",
  },
  {
    id: 7,
    rating: 5,
    text: "I've tried every AI video tool out there. Most of them are gimmicks. Stitchly is the only one that actually fits into a professional editing workflow. The XML goes straight into Premiere with the original files already linked. That alone is worth the subscription.",
    author: "Shane O'Callaghan",
    title: "Senior Editor, Dublin",
  },
  {
    id: 8,
    rating: 5,
    text: "We were spending $3,000 a month on an offshore logging team. We cancelled that contract three weeks after starting Stitchly. The quality is better and it's instant.",
    author: "Aisha Mwangi",
    title: "Head of Production, Nairobi Digital Agency",
  },
  {
    id: 9,
    rating: 5,
    text: "The Send to Premiere button made my jaw drop the first time I used it. I built a sequence, hit the button, and it just appeared on my timeline with everything connected. I actually laughed out loud.",
    author: "Brett Holloway",
    title: "Commercial Editor, Brisbane",
  },
];

const loopingTestimonials = [...testimonials, ...testimonials];

const Landing = () => {
  const [videoOpen, setVideoOpen] = useState(false);
  const [heroImageIndex, setHeroImageIndex] = useState(0);
  const [testimonialApi, setTestimonialApi] = useState<CarouselApi | null>(null);
  const heroImages = [
    { src: dashboardImage, alt: "Stitchly Dashboard" },
    { src: dashboardImage2, alt: "Stitchly Project Area" },
  ];
  useEffect(() => {
    const interval = setInterval(() => {
      setHeroImageIndex((i) => (i + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  useEffect(() => {
    if (!testimonialApi) return;
    const interval = setInterval(() => {
      const slidesToScroll = 3;
      const total = testimonialApi.scrollSnapList().length;
      const next = (testimonialApi.selectedScrollSnap() + slidesToScroll) % total;
      testimonialApi.scrollTo(next);
    }, 4000);
    return () => clearInterval(interval);
  }, [testimonialApi]);

  const scrollToHowItWorks = () => {
    document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
  };

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
        <div className="hero-radial-glow hero-radial-glow--br" aria-hidden />
        <Spotlight className="-top-40 left-0 md:-top-20 md:left-60" fill="#7C3AED" />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[1] rotate-180"
        >
          <Spotlight className="-top-40 left-0 md:-top-20 md:left-60" fill="#7C3AED" />
        </div>
        <div className="hero-aurora" aria-hidden />
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
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/60 bg-primary/15 px-3 py-1 text-xs sm:text-sm font-body mb-6 text-foreground/95 shadow-[0_0_20px_rgba(124,58,237,0.25)]">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> AI Video Assembly for Editors
            </span>

            <h2
              className="font-bold font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-[88px] leading-[1.1]"
              style={{ letterSpacing: "-0.03em" }}
            >
              <Typewriter
                text="Stop Watching."
                speed={70}
                delay={200}
                className="block text-foreground"
              />
              <span className="block">
                <Typewriter
                  text="Start "
                  speed={70}
                  delay={200 + 14 * 70 + 250}
                  cursor={false}
                  className="text-foreground"
                />
                <TypewriterLoop
                  className="bg-clip-text text-transparent"
                  style={{ backgroundImage: "linear-gradient(90deg, #7C3AED 0%, #3B82F6 100%)" }}
                  words={["Editing.", "Saving Time.", "Exporting.", "Delivering.", "Earning."]}
                  startDelay={200 + 14 * 70 + 250 + 6 * 70 + 200}
                  typeSpeed={90}
                  deleteSpeed={55}
                  holdMs={1500}
                />
              </span>
            </h2>

            <p className="mt-6 text-base sm:text-lg lg:text-xl text-white max-w-[600px] font-body leading-relaxed">
              Six hours of interviews. One deadline. Stitchly reads every word, finds the best soundbites, and builds your assembly cut automatically. One click sends it straight to Premiere, Resolve, or Final Cut.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto justify-center">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  opacity: { duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 1.0 },
                  y: { duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 1.0 },
                  scale: { duration: 0.25, ease: [0.22, 1, 0.36, 1] },
                }}
                className="w-full sm:w-auto group/cta relative"
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 1.02 }}
                style={{ transformOrigin: "center" }}
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-lg opacity-0 group-hover/cta:opacity-100 transition-opacity duration-300 blur-2xl"
                  style={{ background: "linear-gradient(90deg, #3B82F6 0%, #7C3AED 100%)", transform: "scale(1.15)" }}
                />
                <Button size="lg" asChild className="btn-gradient btn-shimmer border-0 rounded-lg px-6 py-3 text-base font-body w-full sm:w-auto relative overflow-hidden">
                  <a href={SIGNUP_URL}>
                    Start Your Free Trial →
                    <BorderBeam size={80} duration={8} colorFrom="#ffffff" colorTo="#E0D4FF" />
                  </a>
                </Button>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  opacity: { duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 1.2 },
                  y: { duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 1.2 },
                  scale: { duration: 0.25, ease: [0.22, 1, 0.36, 1] },
                }}
                className="w-full sm:w-auto group/cta2 relative"
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 1.02 }}
                style={{ transformOrigin: "center" }}
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-lg opacity-0 group-hover/cta2:opacity-100 transition-opacity duration-300 blur-2xl"
                  style={{ background: "linear-gradient(90deg, #3B82F6 0%, #7C3AED 100%)", transform: "scale(1.15)" }}
                />
                <Button size="lg" onClick={scrollToHowItWorks} className="btn-outline-gradient rounded-lg px-6 py-3 text-base font-body w-full sm:w-auto">
                  <span className="gradient-text font-medium">See How It Works ↓</span>
                </Button>
              </motion.div>
            </div>

            {/* Product screenshot */}
            <ScreenshotReveal
              immediate
              delay={0.6}
              duration={1.4}
              yOffset={80}
              className="mt-14 sm:mt-20 w-full max-w-[1100px] mx-auto relative"
            >
              {/* Soft pulsating purple glow behind the screenshot */}
              <div
                aria-hidden
                className="pointer-events-none absolute -inset-8 rounded-[2rem] animate-hero-glow"
                style={{
                  background:
                    "radial-gradient(ellipse at center, rgba(124,58,237,0.45) 0%, rgba(124,58,237,0.15) 40%, transparent 70%)",
                  filter: "blur(40px)",
                  zIndex: 0,
                }}
              />
              <div
                className="glass-frame no-shimmer relative z-10 image-fade-bottom"
              >
                <div className="relative w-full">
                  {/* Sizer keeps frame height stable */}
                  <img
                    src={heroImages[0].src}
                    alt=""
                    aria-hidden
                    className="w-full h-auto block invisible"
                  />
                  {heroImages.map((img, i) => (
                    <img
                      key={img.src}
                      src={img.src}
                      alt={img.alt}
                      className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out"
                      style={{ opacity: heroImageIndex === i ? 1 : 0 }}
                    />
                  ))}
                </div>
                <button
                  onClick={() => setVideoOpen(true)}
                  aria-label="Play product demo"
                  className="absolute inset-0 flex items-center justify-center group"
                >
                  {/* Pulsating glow behind the play button */}
                  <span
                    aria-hidden
                    className="hero-play-glow absolute rounded-full pointer-events-none"
                  />
                  <span
                    className="hero-play-button relative flex items-center justify-center rounded-full backdrop-blur-md"
                  >
                    <Play className="h-8 w-8 ml-1 text-primary fill-primary" />
                  </span>
                </button>
              </div>
            </ScreenshotReveal>
          </motion.div>
        </div>
      </section>

      <VideoLightbox open={videoOpen} onClose={() => setVideoOpen(false)} src={DEMO_VIDEO} />

      {/* Wave divider: hero -> how it works */}
      <WaveDivider bottomColor="#0F1420" />

      {/* How It Works */}
      <FadeUpSection
        id="how-it-works"
        className="relative overflow-hidden bg-section-howitworks"
      >
        <GridPattern
          width={48}
          height={48}
          className={cn("stroke-primary/30 opacity-100", "[mask-image:radial-gradient(ellipse_at_center,white,transparent_75%)]")}
          strokeDasharray="0"
        />
        <div className="stitchly-container relative py-16 sm:py-24">
          <motion.h3
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="font-bold text-center mb-10 sm:mb-14 text-foreground font-heading text-4xl sm:text-5xl md:text-6xl lg:text-[70px] leading-[1.1]"
            style={{ letterSpacing: "-0.02em" }}
          >
            How It{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(90deg, #7C3AED 0%, #3B82F6 100%)" }}
            >
              Works
            </span>
          </motion.h3>
          <div className="space-y-20 sm:space-y-28 max-w-6xl mx-auto">
            {[
              {
                Icon: UploadIcon,
                step: "01",
                title: "Import Your Footage",
                text: "Drop in your interview files. Stitchly generates proxies locally, transcribes with word-level timestamps, and identifies every speaker automatically.",
                // Sidebar area (left side)
                imgStyle: { objectPosition: "left center", transform: "scale(1.6)", transformOrigin: "left center" },
              },
              {
                Icon: Sparkles,
                step: "02",
                title: "AI Finds the Best Moments",
                text: "Stitchly categorizes every soundbite by type — emotion, story, key point, CTA, and more. Search, filter, and build your sequence from the strongest clips across all your footage.",
                // Main project grid (center)
                imgStyle: { objectPosition: "center center", transform: "scale(1.3)", transformOrigin: "center center" },
              },
              {
                Icon: Monitor,
                step: "03",
                title: "One Click to Your NLE",
                text: "Hit \"Send to Premiere Pro\" and your sequence opens directly in your editor with all media linked. No XML hunting. No relinking. Premiere, Resolve, and Final Cut all supported.",
                // Top right (right side, top)
                imgStyle: { objectPosition: "right top", transform: "scale(1.6)", transformOrigin: "right top" },
              },
            ].map(({ Icon, step, title, text, imgStyle }, i) => {
              const reversed = i % 2 === 1;
              return (
                <div
                  key={title}
                  className={cn(
                    "grid lg:grid-cols-2 gap-8 sm:gap-12 items-center",
                    reversed && "lg:[&>*:first-child]:order-2",
                  )}
                >
                  {/* Screenshot frame */}
                  <ScreenshotReveal>
                    <div className="relative">
                      <div
                        aria-hidden
                        className="pointer-events-none absolute -inset-10 rounded-[2rem] -z-10"
                        style={{
                          background:
                            "radial-gradient(ellipse at center, rgba(60,128,245,0.45) 0%, rgba(124,58,237,0.25) 40%, transparent 75%)",
                          filter: "blur(40px)",
                        }}
                      />
                      <div
                        className="glass-frame relative"
                        style={{ "--shimmer-delay": `${(i + 1) * 1.5}s` } as React.CSSProperties}
                      >
                      <div className="aspect-[16/10] w-full overflow-hidden bg-stitchly-alt">
                        <img
                          src={dashboardImage}
                          alt={`${title} preview`}
                          className="w-full h-full object-cover"
                          style={imgStyle as React.CSSProperties}
                        />
                      </div>
                      <BorderBeam size={120} duration={10} delay={i * 2} colorFrom="#7C3AED" colorTo="#3B82F6" />
                      </div>
                    </div>
                  </ScreenshotReveal>
                  {/* Text */}
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-mono tracking-widest" style={{ color: "#3C80F5" }}>STEP {step}</span>
                      <div className="h-px flex-1 bg-gradient-to-r from-primary/40 to-transparent" />
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center icon-glow-purple">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <h4 className="text-2xl sm:text-3xl font-bold text-foreground font-heading">{title}</h4>
                    </div>
                    <p className="text-muted-foreground leading-relaxed font-body text-base sm:text-lg">{text}</p>
                  </motion.div>
                </div>
              );
            })}
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
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 font-heading">
                  Give it a Prompt.{" "}
                  <span
                    className="bg-clip-text text-transparent"
                    style={{ backgroundImage: "linear-gradient(90deg, #7C3AED 0%, #3B82F6 100%)" }}
                  >
                    Get a Cut.
                  </span>
                </h3>
                <p className="text-muted-foreground font-body">Tell Stitchly what you need the way you'd brief a senior editor. It reads your entire transcript library and assembles the best clips into a structured sequence — labeled, timestamped, and ordered by narrative logic.</p>
              </div>
              <TracingBeam className="pl-8 sm:pl-10">
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
              </TracingBeam>
            </div>
            <ScreenshotReveal className="w-full">
              <div className="glass-frame" style={{ "--shimmer-delay": "6s" } as React.CSSProperties}>
                <img
                  src={uploadDashboard}
                  alt="Stitchly Workspace"
                  className="w-full h-auto"
                />
              </div>
            </ScreenshotReveal>
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
            <ScreenshotReveal className="w-full lg:order-1 order-2">
              <div className="glass-frame" style={{ "--shimmer-delay": "7.5s" } as React.CSSProperties}>
                <img
                  src={adminDashboard}
                  alt="Stitchly Sequence Editor"
                  className="w-full h-auto"
                />
              </div>
            </ScreenshotReveal>
            <div className="relative space-y-6 sm:space-y-8 lg:order-2 order-1">
              <div className="relative">
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 font-heading">
                  Built for{" "}
                  <span
                    className="bg-clip-text text-transparent"
                    style={{ backgroundImage: "linear-gradient(90deg, #7C3AED 0%, #3B82F6 100%)" }}
                  >
                    Professional Editors
                  </span>
                </h3>
                <p className="text-muted-foreground font-body">Stitchly doesn't replace your NLE. It eliminates the hours you spend scrubbing footage before the real edit starts.</p>
              </div>
              <TracingBeam className="pl-8 sm:pl-10 z-[2]">
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
              </TracingBeam>
            </div>
          </div>
        </div>
      </FadeUpSection>

      {/* Wave divider: features -> testimonials */}
      <WaveDivider bottomColor="#0A0E1A" />

      {/* Testimonials */}
      <FadeUpSection className="relative overflow-hidden bg-[#0A0E1A]">
        {/* Subtle grid pattern */}
        <GridPattern
          width={56}
          height={56}
          className={cn(
            "opacity-100 stroke-primary/20",
            "[mask-image:radial-gradient(ellipse_at_center,white,transparent_75%)]",
          )}
        />
        {/* Soft warm radial accent */}
        <div
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] rounded-full"
          style={{ background: "radial-gradient(ellipse, rgba(124, 58, 237, 0.12) 0%, transparent 70%)" }}
        />
        <div className="stitchly-container relative z-[2] py-20 sm:py-28">
          <div className="text-center mb-10 sm:mb-14">
            <h3
              className="font-bold mb-3 font-heading text-foreground text-4xl sm:text-5xl md:text-6xl lg:text-[70px] leading-[1.1]"
              style={{ letterSpacing: "-0.02em" }}
            >
              What Editors Are{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: "linear-gradient(90deg, #7C3AED 0%, #3B82F6 100%)" }}
              >
                Saying
              </span>
            </h3>
            <p className="font-body text-muted-foreground mt-4">From editors who stopped scrubbing and started editing.</p>
          </div>
          <div className="relative px-12 sm:px-16">
            <Carousel
              opts={{ loop: true, align: "start" }}
              setApi={setTestimonialApi}
              className="w-full"
            >
              <CarouselContent className="-ml-4 py-4">
                {loopingTestimonials.map((t, index) => (
                  <CarouselItem
                    key={`${t.id}-${index}`}
                    className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3"
                  >
                    <div
                      className="h-full p-7 rounded-2xl flex flex-col"
                      style={{
                        backgroundColor: "#141B2D",
                        border: "1px solid rgba(124, 58, 237, 0.2)",
                        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
                      }}
                    >
                      <div className="flex gap-1 mb-4">
                        {[...Array(t.rating)].map((_, idx) => (
                          <Star key={idx} className="h-5 w-5 fill-primary text-primary" />
                        ))}
                      </div>
                      <p className="text-base mb-6 leading-relaxed font-body text-foreground/90 flex-1">"{t.text}"</p>
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(124, 58, 237, 0.15)" }}>
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold font-heading text-sm text-foreground">{t.author}</p>
                          <p className="text-xs font-body text-muted-foreground">{t.title}</p>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-0 sm:-left-2 h-10 w-10 bg-card/80 hover:bg-card border-border text-foreground" />
              <CarouselNext className="right-0 sm:-right-2 h-10 w-10 bg-card/80 hover:bg-card border-border text-foreground" />
            </Carousel>
          </div>
        </div>
      </FadeUpSection>

      {/* Pricing */}
      <FadeUpSection id="pricing" className="relative overflow-hidden bg-section-feature1">
        {/* Large radial purple spotlight behind the card */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 65%)" }}
        />
        <div className="stitchly-container relative py-16 sm:py-24">
          <div className="max-w-5xl mx-auto text-center">
            <h3
              className="font-bold text-foreground mb-3 font-heading text-4xl sm:text-5xl md:text-6xl lg:text-[70px] leading-[1.1]"
              style={{ letterSpacing: "-0.02em" }}
            >
              <span className="block text-foreground">Simple Pricing.</span>
              <span
                className="inline-block bg-clip-text text-transparent"
                style={{ backgroundImage: "linear-gradient(90deg, #7C3AED 0%, #3B82F6 100%)" }}
              >
                Start Free.
              </span>
            </h3>
            <p className="text-muted-foreground font-body mb-10">Start with the desktop app — your files never leave your Mac.</p>

            <div className="grid md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto items-stretch">
              {/* Free Trial card */}
              <div
                className="relative p-8 sm:p-10 text-left rounded-2xl overflow-hidden flex flex-col"
                style={{
                  backgroundColor: "#141B2D",
                  border: "1px solid rgba(124, 58, 237, 0.18)",
                }}
              >
                <div className="mb-6">
                  <h4 className="text-2xl font-bold font-heading text-foreground inline-block">Free Trial</h4>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-foreground font-heading">$0</span>
                  </div>
                  <p className="text-muted-foreground text-sm mt-1 font-body">No credit card required. Download to start.</p>
                  <p className="text-muted-foreground mt-4 font-body">Desktop app for Mac. All files stay local — no uploading required.</p>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {[
                    "50 credits, one time",
                    "Instant local transcriptions",
                    "Unlimited projects",
                    "AI-powered soundbite assembly",
                    "One-click export to Premiere, Resolve & FCP",
                    "Prompt Builder + Quick Actions",
                  ].map((feature) => (
                    <li key={feature} className="flex gap-3 items-start">
                      <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-foreground/90 text-sm font-body">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button asChild size="lg" variant="secondary" className="rounded-lg w-full">
                  <a href={SIGNUP_URL}>Download Free Trial →</a>
                </Button>
              </div>

              {/* Pro card (hero card) */}
              <div
                className="group relative p-8 sm:p-10 text-left rounded-2xl transition-all duration-200 overflow-hidden flex flex-col"
              style={{
                backgroundColor: "#141B2D",
                border: "1px solid rgba(124, 58, 237, 0.4)",
                boxShadow: "0 0 80px rgba(124, 58, 237, 0.35), 0 0 30px rgba(124, 58, 237, 0.2)",
              }}
            >
              <BorderBeam size={140} duration={9} colorFrom="#7C3AED" colorTo="#E0D4FF" />
              <div className="mb-6">
                <h4 className="text-2xl font-bold font-heading text-gradient-bp inline-block">Pro</h4>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-foreground font-heading">$29</span>
                  <span className="text-muted-foreground font-body">/ month</span>
                </div>
                <p className="text-muted-foreground text-sm mt-1 font-body">or $290/year</p>
                <p className="text-muted-foreground mt-4 font-body">Everything you need to stop scrubbing and start editing.</p>
              </div>
                <ul className="space-y-3 mb-8 flex-1">
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
              <Button asChild size="lg" className="btn-gradient border-0 rounded-lg w-full relative overflow-hidden">
                <a href={SIGNUP_URL}>
                  Start Your Free Trial →
                  <BorderBeam size={80} duration={8} colorFrom="#ffffff" colorTo="#E0D4FF" />
                </a>
              </Button>
            </div>
            </div>
            <p className="text-muted-foreground text-sm mt-6 font-body">Start with a free trial. No credit card required. Download for Mac.</p>
          </div>
        </div>
      </FadeUpSection>

      {/* CTA Section */}
      <FadeUpSection className="relative overflow-hidden bg-stitchly-base">
        {/* Replicated hero background */}
        <div className="hero-radial-glow" />
        <Spotlight className="-top-40 left-0 md:-top-20 md:left-60" fill="#7C3AED" />
        <div className="hero-aurora" aria-hidden />
        <Particles
          className="absolute inset-0 z-0"
          quantity={180}
          ease={70}
          size={0.5}
          color="#7C3AED"
        />
        <div className="stitchly-container relative z-10 py-20 sm:py-28">
          <div className="text-center space-y-5 sm:space-y-6 max-w-4xl mx-auto">
            <h3 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-foreground font-heading">
              Your Next Edit{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: "linear-gradient(90deg, #7C3AED 0%, #3B82F6 100%)" }}
              >
                Starts Here.
              </span>
            </h3>
            <p className="text-[18.4px] sm:text-[20.7px] text-white max-w-2xl mx-auto font-body">
              Download Stitchly, import your footage, and get your first assembly cut before you finish your coffee. The footage isn't going to watch itself — but now it doesn't have to.
            </p>
            <div className="flex justify-center pt-4 sm:pt-6">
              <motion.div
                whileHover={{ scale: 1.06 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="relative group/ctab"
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-lg opacity-0 group-hover/ctab:opacity-100 transition-opacity duration-300 blur-2xl"
                  style={{ background: "linear-gradient(90deg, #3B82F6 0%, #7C3AED 100%)", transform: "scale(1.2)" }}
                />
                <Button
                  size="lg"
                  asChild
                  className="btn-gradient btn-shimmer border-0 rounded-lg px-6 py-3 text-base font-body relative overflow-hidden text-white"
                >
                  <a href={SIGNUP_URL}>
                    Start Your Free Trial →
                    <BorderBeam size={80} duration={8} colorFrom="#ffffff" colorTo="#E0D4FF" />
                  </a>
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </FadeUpSection>

      {/* Footer */}
      <FadeUpSection as="footer" className="relative overflow-hidden bg-section-footer">
        <GridPattern
          width={48}
          height={48}
          className={cn("stroke-primary/30 opacity-100", "[mask-image:radial-gradient(ellipse_at_center,white,transparent_75%)]")}
          strokeDasharray="0"
        />
        <div className="stitchly-container relative py-12">
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
