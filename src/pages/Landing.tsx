import { Button } from "@/components/ui/button";
import { Sparkles, Monitor, Upload as UploadIcon, Users, ArrowRight, Star, Check, Play, Apple } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { GridPattern } from "@/components/ui/grid-pattern";
import { DotPattern } from "@/components/ui/dot-pattern";
import { Particles } from "@/components/ui/particles";
import { BorderBeam } from "@/components/ui/border-beam";
import { Spotlight } from "@/components/ui/spotlight";
import appleMacLogo from "@/assets/apple-mac-logo.svg";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from "@/components/ui/carousel";
import { TracingBeam } from "@/components/ui/tracing-beam";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { WaveDivider } from "@/components/WaveDivider";
import { VideoLightbox } from "@/components/VideoLightbox";
import { ImageLightbox } from "@/components/ImageLightbox";
import { SimpleVideoLightbox } from "@/components/SimpleVideoLightbox";
import { FadeUpSection } from "@/components/FadeUpSection";
import { Typewriter } from "@/components/Typewriter";
import { TypewriterLoop } from "@/components/TypewriterLoop";
import { ScreenshotReveal } from "@/components/ScreenshotReveal";
import { GlassScreenshotFrame } from "@/components/GlassScreenshotFrame";
import { cn } from "@/lib/utils";
import dashboardImage from "@/assets/stitchly-dashboard-product-shot.png";
import dashboardImage2 from "@/assets/stitchly-project-area-product-shot.png";
import uploadDashboard from "@/assets/stitchly-project-area-product-shot2.png";
import professionalEditorsShot from "@/assets/stitchly-project-area-product-shot3.jpg";
import adminDashboard from "@/assets/admin-dashboard.png";
import stitchlyLogo from "@/assets/stitchly-logo.svg";
import builtByEditorBg from "@/assets/built-by-editor-bg.png";
import finalCtaBg from "@/assets/final-cta-bg.png";
import premiereBg from "@/assets/premiere-bg.jpg";

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
  const [lightboxImage, setLightboxImage] = useState<{ src: string; alt: string } | null>(null);
  const [lightboxVideo, setLightboxVideo] = useState<string | null>(null);
  const [heroImageIndex, setHeroImageIndex] = useState(0);
  const [testimonialApi, setTestimonialApi] = useState<CarouselApi | null>(null);
  const [testimonialPaused, setTestimonialPaused] = useState(false);
  const [heroEffectsReady, setHeroEffectsReady] = useState(false);
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
    const decodes = [dashboardImage, dashboardImage2].map((src) => {
      const img = new Image();
      img.src = src;
      return img.decode().catch(() => {});
    });
    Promise.all(decodes).then(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setHeroEffectsReady(true);
        });
      });
    });
  }, []);

  useEffect(() => {
    if (!testimonialApi) return;
    if (testimonialPaused) return;
    const interval = setInterval(() => {
      const slidesToScroll = 3;
      const total = testimonialApi.scrollSnapList().length;
      const next = (testimonialApi.selectedScrollSnap() + slidesToScroll) % total;
      testimonialApi.scrollTo(next);
    }, 4000);
    return () => clearInterval(interval);
  }, [testimonialApi, testimonialPaused]);

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
            <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
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
            className="scroll-fade-in flex flex-col items-center text-center"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/60 bg-primary/15 px-[15px] py-[5px] text-sm sm:text-base font-bold font-body mb-6 text-foreground/95 shadow-[0_0_20px_rgba(124,58,237,0.25)]">
              AI-Powered Desktop App for Mac
              <img src={appleMacLogo} alt="Mac" className="h-4 w-auto" />
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

            <p className="mt-6 text-base sm:text-lg lg:text-xl text-white max-w-[700px] font-body leading-relaxed">
              A professional tool for professional editors. Drop in your interview footage. Stitchly transcribes it, finds the best soundbites, and sends a ready-to-edit sequence straight to <strong><em>Premiere, Resolve, or Final Cut</em></strong>.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto justify-center">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  opacity: { duration: 0.75, ease: [0.22, 1, 0.36, 1], delay: 1.0 },
                  y: { duration: 0.75, ease: [0.22, 1, 0.36, 1], delay: 1.0 },
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
                  opacity: { duration: 0.75, ease: [0.22, 1, 0.36, 1], delay: 1.2 },
                  y: { duration: 0.75, ease: [0.22, 1, 0.36, 1], delay: 1.2 },
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

            {/* Product screenshot — bare on first paint, effects deferred until images decode + paint */}
            <motion.div
              initial={{ y: 80, scale: 0.96 }}
              animate={{ y: 0, scale: 1 }}
              transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                "mt-14 sm:mt-20 w-full max-w-[1180px] mx-auto relative",
                heroEffectsReady && "screenshot-hover"
              )}
            >
              {heroEffectsReady && (
                <div
                  aria-hidden
                  className="pointer-events-none absolute -inset-12 rounded-[2.5rem] animate-hero-glow"
                  style={{
                    background:
                      "radial-gradient(ellipse at 30% 40%, rgba(124,58,237,0.38) 0%, transparent 60%), radial-gradient(ellipse at 70% 60%, rgba(59,130,246,0.32) 0%, transparent 65%)",
                    filter: "blur(60px)",
                    zIndex: 0,
                  }}
                />
              )}
              <div
                className="no-shimmer relative z-10 rounded-2xl overflow-hidden p-3 sm:p-4"
                style={heroEffectsReady ? {
                  background: "rgba(8, 10, 20, 0.62)",
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  boxShadow:
                    "0 30px 80px -20px rgba(0,0,0,0.6), 0 10px 40px -10px rgba(124,58,237,0.25), inset 0 1px 0 0 rgba(255,255,255,0.08), inset 0 -1px 0 0 rgba(0,0,0,0.35)",
                  willChange: "transform",
                } : {
                  background: "rgba(8, 10, 20, 0.95)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                }}
              >
                {heroEffectsReady && (
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 rounded-2xl"
                    style={{
                      background:
                        "radial-gradient(ellipse 70% 60% at 12% 8%, rgba(255,255,255,0.08) 0%, transparent 55%), radial-gradient(ellipse 70% 60% at 90% 95%, rgba(0,0,0,0.35) 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 50% 50%, rgba(255,255,255,0.03) 0%, transparent 70%)",
                      zIndex: 1,
                    }}
                  />
                )}
                {heroEffectsReady && (
                  <div aria-hidden className="glass-drift rounded-2xl" style={{ zIndex: 1 }} />
                )}
                {heroEffectsReady && (
                  <BorderBeam
                    size={320}
                    duration={30}
                    borderWidth={2}
                    colorFrom="#A855F7"
                    colorTo="rgba(168,85,247,0)"
                    className="rounded-2xl"
                  />
                )}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-y-0 left-0 w-px"
                  style={{
                    background:
                      "linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.18) 50%, transparent 100%)",
                    zIndex: 2,
                  }}
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-y-0 right-0 w-px"
                  style={{
                    background:
                      "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.4) 50%, transparent 100%)",
                    zIndex: 2,
                  }}
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-px"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.45) 50%, transparent 100%)",
                    zIndex: 2,
                  }}
                />
                <div className="relative flex items-center gap-1.5 px-2 pb-3" style={{ zIndex: 3 }}>
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: "rgba(255,95,86,0.55)" }} />
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: "rgba(255,189,46,0.55)" }} />
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: "rgba(39,201,63,0.55)" }} />
                </div>
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 top-0 h-px"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.25) 50%, transparent 100%)",
                    zIndex: 3,
                  }}
                />
                <div className="relative w-full" style={{ zIndex: 2 }}>
                  <div
                    className="relative w-full rounded-xl overflow-hidden"
                    style={{
                      boxShadow: "0 10px 30px -10px rgba(0,0,0,0.55)",
                      aspectRatio: "1920 / 1313",
                    }}
                  >
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
                </div>
                <button
                  onClick={() => setVideoOpen(true)}
                  aria-label="Play product demo"
                  className="absolute inset-0 flex items-center justify-center group"
                  style={{ zIndex: 10 }}
                >
                  {heroEffectsReady && (
                    <span
                      aria-hidden
                      className="hero-play-glow absolute rounded-full pointer-events-none"
                    />
                  )}
                  <span
                    className={cn(
                      "hero-play-button relative flex items-center justify-center rounded-full",
                      heroEffectsReady && "backdrop-blur-md"
                    )}
                  >
                    <Play className="h-8 w-8 ml-1 text-primary fill-primary" />
                  </span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <VideoLightbox open={videoOpen} onClose={() => setVideoOpen(false)} src={DEMO_VIDEO} />
      <ImageLightbox
        open={lightboxImage !== null}
        onClose={() => setLightboxImage(null)}
        src={lightboxImage?.src ?? ""}
        alt={lightboxImage?.alt ?? ""}
      />
      <SimpleVideoLightbox
        open={lightboxVideo !== null}
        onClose={() => setLightboxVideo(null)}
        src={lightboxVideo ?? ""}
      />

      {/* Wave divider: hero -> how it works */}
      <WaveDivider bottomColor="#0F1420" />

      {/* What is Stitchly? */}
      <FadeUpSection className="relative overflow-hidden bg-section-howitworks">
        <GridPattern
          width={48}
          height={48}
          className={cn("stroke-primary/30 opacity-100", "[mask-image:radial-gradient(ellipse_at_center,white,transparent_75%)]")}
          strokeDasharray="0"
        />
        <div className="stitchly-container relative py-16 sm:py-20">
          <div className="max-w-3xl mx-auto text-center">
            <motion.h3
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="scroll-fade-in font-bold mb-6 font-heading text-foreground text-4xl sm:text-5xl md:text-6xl lg:text-[70px] leading-[1.1]"
              style={{ letterSpacing: "-0.02em" }}
            >
              What is{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: "linear-gradient(90deg, #7C3AED 0%, #3B82F6 100%)" }}
              >
                Stitchly?
              </span>
            </motion.h3>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
              className="scroll-fade-in text-base sm:text-lg text-muted-foreground font-body leading-relaxed space-y-4 text-left"
            >
               <p>Stitchly is a Mac desktop app for video editors who are tired of scrubbing through hours of footage just to find the right soundbites and assemble them quickly.</p>
              <p>Import your interviews and everything stays local on your machine. Proxies are generated, transcripts are created with speaker detection, and your footage becomes fully searchable in minutes. AI surfaces and categorizes the strongest soundbites so you can work faster and make better decisions without second guessing.</p>
              <p>Then you take over. Drag, drop, trim, cut, and reorganize every soundbite to build your sequence exactly how you want it.</p>
              <p>When you are ready, send it straight into Premiere, Resolve, or Final Cut with one click.</p>
              <p className="font-bold text-foreground">One thing Stitchly is not: a replacement for your NLE. Premiere, Final Cut, and Resolve are where the real edit happens. Stitchly just makes sure you show up with the right material.</p>
            </motion.div>
          </div>
        </div>
      </FadeUpSection>

      {/* Section divider */}
      <div className="relative bg-section-howitworks">
        <div className="stitchly-container py-2">
          <div className="relative h-px w-full bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        </div>
      </div>

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
            className="scroll-fade-in font-bold text-center mb-10 sm:mb-14 text-foreground font-heading text-4xl sm:text-5xl md:text-6xl lg:text-[70px] leading-[1.1]"
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
                text: "Drop in your footage and Stitchly gets to work immediately. Proxies are generated for smooth playback and your interviews are transcribed with speaker detection in minutes. Rename speakers, group clips into folders, favorite key moments, and filter soundbites by category.",
                // Sidebar area (left side)
                imgStyle: { objectPosition: "left center", transform: "scale(1.6)", transformOrigin: "left center" },
              },
              {
                Icon: Sparkles,
                step: "02",
                title: "AI Finds the Best Moments",
                text: "AI automatically tags every soundbite by type: emotion, story, key point, CTA, and more so the strongest clips rise to the top fast. Then you take over. Drag and drop clips into your sequence, reorder anything instantly, and trim each moment with precision. Speed from AI, control from you.",
                // Main project grid (center)
                imgStyle: { objectPosition: "center center", transform: "scale(1.3)", transformOrigin: "center center" },
              },
              {
                Icon: Monitor,
                step: "03",
                title: "One Click to Your NLE",
                text: "Hit Send to Premiere Pro, Resolve, or Final Cut and your sequence opens directly in your editor with all media already linked. No XML hunting. No relinking. No extra steps. Need the transcript instead? Export as docx, pdf, txt, srt, and more.",
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
                    <GlassScreenshotFrame beamDelay={i * 4}>
                      <div className={cn("w-full overflow-hidden bg-stitchly-alt", i <= 2 ? "aspect-video" : "aspect-[16/10]")}>
                        {i === 0 ? (
                          <video
                            autoPlay
                            loop
                            muted
                            playsInline
                            poster={dashboardImage}
                            src="/stitchly-how-it-works-step-1.mp4"
                            className="w-full h-full object-cover cursor-zoom-in"
                            onClick={() => setLightboxVideo("/stitchly-how-it-works-step-1.mp4")}
                          />
                        ) : i === 1 ? (
                          <video
                            autoPlay
                            loop
                            muted
                            playsInline
                            poster={dashboardImage}
                            src="/stitchly-how-it-works-step-2.mp4"
                            className="w-full h-full object-cover cursor-zoom-in"
                            onClick={() => setLightboxVideo("/stitchly-how-it-works-step-2.mp4")}
                          />
                        ) : i === 2 ? (
                          <video
                            autoPlay
                            loop
                            muted
                            playsInline
                            poster={dashboardImage}
                            src="/stitchly-how-it-works-step-3.mp4"
                            className="w-full h-full object-cover cursor-zoom-in"
                            onClick={() => setLightboxVideo("/stitchly-how-it-works-step-3.mp4")}
                          />
                        ) : (
                          <img
                            src={dashboardImage}
                            alt={`${title} preview`}
                            className="w-full h-full object-cover"
                            style={imgStyle as React.CSSProperties}
                          />
                        )}
                      </div>
                    </GlassScreenshotFrame>
                  </ScreenshotReveal>
                  {/* Text */}
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
                    className="scroll-fade-in space-y-4"
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
                <motion.h3
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="scroll-fade-in text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 font-heading"
                >
                  Give it a Prompt.{" "}
                  <span
                    className="bg-clip-text text-transparent"
                    style={{ backgroundImage: "linear-gradient(90deg, #7C3AED 0%, #3B82F6 100%)" }}
                  >
                    Get a Rough Cut.
                  </span>
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
                  className="scroll-fade-in text-muted-foreground font-body"
                >Tell Stitchly what you need the way you'd brief a senior editor. It reads your entire transcript library and assembles the best clips into a structured sequence, labeled, timestamped, and ordered by narrative logic. When you're happy with the sequence, one click opens it directly in Premiere, Resolve, or Final Cut with your original files already linked.</motion.p>
              </div>
              <TracingBeam className="pl-8 sm:pl-10">
                <div className="relative space-y-6">
                  {[
                    { title: "Creative briefs in plain English", text: "Type what you want: \"Build a 90-second testimonial. Open with struggle, close with results.\" Stitchly finds the clips that match." },
                    { title: "Multi-video intelligence", text: "Upload 8 interviews. Stitchly treats them as one searchable library. The best moment from interview 3 lands next to the perfect setup from interview 7." },
                    { title: "Every word searchable", text: "Word-level timestamps. Speaker identification. Semantic categorization. Your footage becomes a database you can query." },
                  ].map((b, i) => (
                    <motion.div
                      key={b.title}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.2 }}
                      transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 + i * 0.12 }}
                      className="scroll-fade-in flex gap-4"
                    >
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
                    </motion.div>
                  ))}
                </div>
              </TracingBeam>
            </div>
            <ScreenshotReveal className="w-full">
              <GlassScreenshotFrame beamDelay={10}>
                <img
                  src={uploadDashboard}
                  alt="Stitchly Workspace"
                  className="w-full h-auto block cursor-zoom-in"
                  onClick={() => setLightboxImage({ src: uploadDashboard, alt: "Stitchly Workspace" })}
                />
              </GlassScreenshotFrame>
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
              <GlassScreenshotFrame beamDelay={20}>
                <img
                  src={professionalEditorsShot}
                  alt="Stitchly Sequence Editor"
                  className="w-full h-auto block cursor-zoom-in"
                  onClick={() => setLightboxImage({ src: professionalEditorsShot, alt: "Stitchly Sequence Editor" })}
                />
              </GlassScreenshotFrame>
            </ScreenshotReveal>
            <div className="relative space-y-6 sm:space-y-8 lg:order-2 order-1">
              <div className="relative">
                <motion.h3
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="scroll-fade-in text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 font-heading"
                >
                  Built for{" "}
                  <span
                    className="bg-clip-text text-transparent"
                    style={{ backgroundImage: "linear-gradient(90deg, #7C3AED 0%, #3B82F6 100%)" }}
                  >
                    Professional Editors
                  </span>
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
                  className="scroll-fade-in text-muted-foreground font-body"
                >Stitchly doesn't replace your NLE. It eliminates the hours you spend scrubbing footage before the real edit starts.</motion.p>
              </div>
              <TracingBeam className="pl-8 sm:pl-10 z-[2]">
                <div className="relative space-y-6">
                  {[
                    { title: "Premiere, Resolve, and Final Cut", text: "Export a ready-to-edit XML for any major editing platform. One click opens your sequence directly in your editor with all media paths linked." },
                    { title: "Proxy-based workflow", text: "Stitchly generates lightweight proxies locally so your machine stays fast. Original media paths are preserved in every export." },
                    { title: "Your footage stays local", text: "No cloud uploads. No waiting. Everything runs on your Mac with files stored on your own drives." },
                    { title: "Runs entirely on your Mac", text: "Your footage never leaves your drive." },
                  ].map((b, i) => (
                    <motion.div
                      key={b.title}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.2 }}
                      transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 + i * 0.15 }}
                      className="scroll-fade-in flex gap-4"
                    >
                      <div className="flex-shrink-0 mt-1">
                        <ArrowRight className="h-6 w-6" style={{ stroke: "url(#bp-gradient)" }} />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-foreground mb-2 font-heading">{b.title}</h4>
                        <p className="text-muted-foreground font-body">{b.text}</p>
                      </div>
                    </motion.div>
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
            <motion.h3
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="scroll-fade-in font-bold mb-3 font-heading text-foreground text-4xl sm:text-5xl md:text-6xl lg:text-[70px] leading-[1.1]"
              style={{ letterSpacing: "-0.02em" }}
            >
              What Editors Are{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: "linear-gradient(90deg, #7C3AED 0%, #3B82F6 100%)" }}
              >
                Saying
              </span>
            </motion.h3>
            <p className="font-body text-muted-foreground mt-4">From editors who stopped scrubbing and started editing.</p>
          </div>
          <div
            className="relative px-4 sm:px-12 lg:px-16"
            onMouseEnter={() => setTestimonialPaused(true)}
            onMouseLeave={() => setTestimonialPaused(false)}
          >
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
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.2 }}
                      transition={{ duration: 0.6, ease: "easeOut", delay: (index % 3) * 0.15 }}
                      className="scroll-fade-in h-full p-7 rounded-2xl flex flex-col"
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
                    </motion.div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="-left-2 sm:-left-2 h-10 w-10 bg-card/80 hover:bg-card border-border text-foreground" />
              <CarouselNext className="-right-2 sm:-right-2 h-10 w-10 bg-card/80 hover:bg-card border-border text-foreground" />
            </Carousel>
          </div>
        </div>
      </FadeUpSection>

      {/* Founder credibility */}
      <FadeUpSection id="about" className="relative overflow-hidden bg-section-feature2">
        <div
          aria-hidden
          className="absolute inset-0 w-full h-full"
          style={{
            backgroundImage: `url(${premiereBg})`,
            backgroundSize: "cover",
            backgroundPosition: "center center",
            backgroundRepeat: "no-repeat",
          }}
        />
        {/* Blue animated light sheen */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <div
            className="absolute -inset-[20%] opacity-60 animate-[sheen_8s_ease-in-out_infinite]"
            style={{
              background:
                "radial-gradient(ellipse at 30% 40%, rgba(59,130,246,0.25) 0%, transparent 55%), radial-gradient(ellipse at 70% 60%, rgba(37,99,235,0.18) 0%, transparent 60%)",
            }}
          />
        </div>
        {/* Floating particles */}
        <Particles
          className="absolute inset-0"
          quantity={80}
          ease={70}
          color="#3B82F6"
          size={0.6}
        />
        <div className="stitchly-container relative py-16 sm:py-20">
          <div className="max-w-3xl mx-auto text-center">
            <motion.h3
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="scroll-fade-in font-bold mb-6 font-heading text-foreground text-3xl sm:text-4xl md:text-5xl lg:text-[56px] leading-[1.1]"
              style={{ letterSpacing: "-0.02em" }}
            >
              Built by an Editor<br />
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: "linear-gradient(90deg, #7C3AED 0%, #3B82F6 100%)" }}
              >
                For Editors
              </span>
            </motion.h3>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
              className="scroll-fade-in text-base sm:text-lg lg:text-xl font-body leading-relaxed text-white"
            >
              Stitchly was built by Kevin Anson, a post-production veteran with 22 years in the industry and 10,000+ videos produced for clients like Tony Robbins, Mike Tyson, Russell Brunson, Grant Cardone, and Costco. Kevin has taught video production workflows and marketing to tens of thousands of editors, entrepreneurs, and content creators. He did not build this as an outsider looking in. He built it because he sat through the same six hours of footage one too many times and decided there had to be a better way.
            </motion.p>
          </div>
        </div>
      </FadeUpSection>

      {/* FAQ */}
      <FadeUpSection id="faq" className="relative overflow-hidden bg-section-feature2">
        <GridPattern
          width={48}
          height={48}
          className="opacity-50"
          style={{ stroke: "rgba(59, 130, 246, 0.1)" }}
        />
        <div className="stitchly-container relative z-[2] py-20 sm:py-28">
          <div className="text-center mb-10 sm:mb-14 max-w-3xl mx-auto">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="font-body uppercase tracking-[0.2em] text-xs sm:text-sm text-primary mb-4"
            >
              FAQs
            </motion.p>
            <motion.h3
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="scroll-fade-in font-bold mb-4 font-heading text-foreground text-4xl sm:text-5xl md:text-6xl lg:text-[70px] leading-[1.1]"
              style={{ letterSpacing: "-0.02em" }}
            >
              Everything You <br />
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: "linear-gradient(90deg, #7C3AED 0%, #3B82F6 100%)" }}
              >
                Need To Know
              </span>
            </motion.h3>
          </div>
          <div className="max-w-3xl mx-auto">
            <Accordion
              type="single"
              collapsible
              className="space-y-3"
            >
              {[
                {
                  q: "How does Stitchly actually work?",
                  a: "Drop your interview footage into Stitchly. The app generates a lightweight proxy locally on your Mac, transcribes every word with speaker identification, and uses AI to categorize each soundbite by type including emotion, story, key points, and CTAs. Once your footage is transcribed and categorized, you write a plain English brief telling the AI what kind of video to build. Something like 'Build a 90-second testimonial, open with the problem, close with the result.' Stitchly reads your entire transcript, finds the clips that match your intent, and assembles a rough cut sequence automatically. One click sends it straight to Premiere, Resolve, or Final Cut with all media already linked. The entire flow runs on your machine. No uploads, no waiting on cloud servers, no sending your footage anywhere.",
                },
                {
                  q: "Do my files leave my computer?",
                  a: "No. Stitchly is a desktop app and your video files, proxies, and exported sequences all stay on your local drives. The only thing that touches a cloud service is the audio sent to AssemblyAI for transcription, which is processed and then discarded. Your footage is never uploaded, stored, or shared anywhere. If you have sensitive client material, you can use Stitchly with full confidence that it never leaves your machine.",
                },
                {
                  q: "What editing software does Stitchly work with?",
                  a: "Adobe Premiere Pro, DaVinci Resolve, and Apple Final Cut Pro are all fully supported. When you hit the Send to NLE button, Stitchly checks if your editor is open, saves the sequence file silently to your system, and opens it directly in your timeline with all media paths already linked. There are no XML import dialogs to deal with, no relinking media, and no extra steps. You go from Stitchly to your timeline in one click.",
                },
                {
                  q: "Does Stitchly replace my editing software?",
                  a: "No, and it is not trying to. Stitchly handles the part of the job that does not require your creative judgment, which is finding the moments worth using, organizing them by type and quality, and getting them into your timeline in a logical order. The actual edit, color work, sound design, and final polish all happen in your NLE where they belong. Stitchly gives you a strong starting point instead of a blank sequence, so you spend your time on the decisions that actually require your skill.",
                },
                {
                  q: "How long does processing take?",
                  a: "Proxy generation runs in real time or faster on most modern Macs. Transcription typically takes between 5 and 15 minutes depending on file length. AI categorization of soundbites runs in under a minute once the transcript is ready. For a typical one-hour interview, you can go from import to building your sequence in around 15 to 20 minutes. Longer projects take longer, but everything runs locally so there is no queue to wait in.",
                },
                {
                  q: "Can I use multiple interviews in one project?",
                  a: "Yes. You can import as many videos as you want into a single project. Stitchly treats them as one unified searchable library, so you can pull the best moment from interview#7 and place it next to the perfect setup from interview #2 without thinking about which file it came from. Multi-video assembly is one of the biggest advantages Stitchly has over working directly in your NLE, especially on documentary, testimonial, or long-form content where footage spans multiple shoots.",
                },
                {
                  q: "What does a credit cost?",
                  a: "Transcription costs 1 credit per 2 minutes of footage. AI commands cost 5 credits each. The Pro plan includes 500 credits per month, which covers roughly 16 hours of transcription or around 100 AI assembly commands. Most editors do not come close to using their full monthly allotment. If you do run out, you can purchase top-up credits at any time as a Pro subscriber. Top-ups range from 100 credits for $7.99 up to 1,200 credits for $54.99, and they never expire as long as your Pro subscription is active.",
                },
                {
                  q: "Is there a free trial?",
                  a: "Yes. Download Stitchly, create an account, and start using it immediately. No credit card is required to get started. You will receive enough credits to fully test the entire workflow from import through transcription to exporting a sequence into your NLE before making any decision about upgrading. If you want more after that, Pro is $29 per month or $290 per year.",
                },
              ].map((item, i) => (
                <AccordionItem
                  key={`faq-${i + 1}`}
                  value={`faq-${i + 1}`}
                  className="border border-border/60 rounded-xl bg-stitchly-base/50 backdrop-blur-sm px-5 sm:px-6 data-[state=open]:border-primary/40 data-[state=open]:bg-stitchly-base/70 transition-all duration-300 hover:border-primary/40 hover:shadow-[0_0_30px_rgba(124,58,237,0.25)] data-[state=open]:shadow-[0_0_40px_rgba(124,58,237,0.35)]"
                >
                  <AccordionTrigger className="text-left font-heading text-base sm:text-lg font-semibold text-foreground hover:no-underline py-5">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="font-body text-muted-foreground text-sm sm:text-base leading-relaxed pb-5">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
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
            <motion.h3
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="scroll-fade-in font-bold text-foreground mb-3 font-heading text-4xl sm:text-5xl md:text-6xl lg:text-[70px] leading-[1.1]"
              style={{ letterSpacing: "-0.02em" }}
            >
              <span className="block text-foreground">Simple Pricing.</span>
              <span
                className="inline-block bg-clip-text text-transparent"
                style={{ backgroundImage: "linear-gradient(90deg, #7C3AED 0%, #3B82F6 100%)" }}
              >
                Start Free.
              </span>
            </motion.h3>
            <p className="text-muted-foreground font-body mb-10">Start with the desktop app. Your files never leave your Mac.</p>

            <div className="grid md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto items-stretch">
              {/* Free Trial card */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
                className="scroll-fade-in relative p-8 sm:p-10 text-left rounded-2xl overflow-hidden flex flex-col"
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
                  <p className="text-muted-foreground mt-4 font-body">Desktop app for Mac. All files stay local, no uploading required.</p>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {[
                    "Mac desktop app",
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
              </motion.div>

              {/* Pro card (hero card) */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
                className="scroll-fade-in group relative p-8 sm:p-10 text-left rounded-2xl transition-all duration-200 overflow-hidden flex flex-col"
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
            </motion.div>
            </div>
            <p className="text-muted-foreground text-sm mt-6 font-body">Start with a free trial. No credit card required. Download for Mac.</p>
          </div>
        </div>
      </FadeUpSection>

      {/* CTA Section */}
      <FadeUpSection className="relative overflow-hidden bg-stitchly-base">
        {/* Background image */}
        <div
          aria-hidden
          className="absolute inset-0 w-full h-full"
          style={{
            backgroundImage: `url(${finalCtaBg})`,
            backgroundSize: "cover",
            backgroundPosition: "center center",
            backgroundRepeat: "no-repeat",
          }}
        />
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
            <motion.h3
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="scroll-fade-in text-3xl sm:text-5xl lg:text-6xl font-bold text-foreground font-heading"
            >
              Your Next Edit{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: "linear-gradient(90deg, #7C3AED 0%, #3B82F6 100%)" }}
              >
                Starts Here.
              </span>
            </motion.h3>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
              className="scroll-fade-in text-[18.4px] sm:text-[20.7px] text-white max-w-2xl mx-auto font-body"
            >
              Download Stitchly, import your footage, and get your first assembly cut before you finish your coffee. The footage isn't going to watch itself, but now it doesn't have to.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
              className="scroll-fade-in flex justify-center pt-4 sm:pt-6"
            >
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
            </motion.div>
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
                  <li><a href="#features" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-body">Features</a></li>
                  <li><a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-body">How It Works</a></li>
                  <li><a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-body">Pricing</a></li>
                  <li><a href="#faq" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-body">FAQ</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-foreground font-semibold mb-3 md:mb-4 font-heading">Company</h4>
                <ul className="space-y-1.5 md:space-y-2">
                  <li><a href="#about" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-body">About</a></li>
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
    </div>
  );
};

export default Landing;
