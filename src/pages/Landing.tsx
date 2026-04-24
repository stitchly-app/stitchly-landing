import { Button } from "@/components/ui/button";
import { Sparkles, Monitor, Upload as UploadIcon, Users, ChevronRight, ArrowRight, Star, ChevronLeft, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import heroImage from "@/assets/hero-imac.png";
import uploadDashboard from "@/assets/upload-dashboard.png";
import adminDashboard from "@/assets/admin-dashboard.png";

const BRAND = "Stitchly";
const SIGNUP_URL = "https://app.stitchly.ai/signup";
const SIGNIN_URL = "https://app.stitchly.ai";

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

  const scrollToHowItWorks = () => {
    document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
  };

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const previousTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background sticky top-0 z-50">
        <div className="mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold font-heading">S</span>
            </div>
            <h1 className="text-base sm:text-lg font-bold font-heading">
              <span className="text-foreground">Stitch</span><span className="text-primary">ly</span>
            </h1>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground font-body">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="ghost"
              asChild
              className="text-muted-foreground hover:text-foreground hover:bg-muted text-sm sm:text-base px-2 sm:px-4"
            >
              <a href={SIGNIN_URL}>Sign In</a>
            </Button>
            <Button asChild className="text-sm sm:text-base px-3 sm:px-4">
              <a href={SIGNUP_URL}>Download for Mac →</a>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="mx-auto px-4 sm:px-6 lg:pl-6 lg:pr-0 py-12 sm:py-20 lg:py-32">
        <div className="mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <div className="space-y-6 sm:space-y-8 lg:pr-6">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground leading-tight font-heading">
                Stop Watching. Start Editing.
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-xl font-body leading-relaxed">
                Six hours of interviews. One deadline. Stitchly reads every word, finds the best soundbites, and builds your assembly cut automatically. One click sends it straight to Premiere, Resolve, or Final Cut.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
                <Button size="lg" asChild className="gap-2 px-6 sm:px-8 py-5 sm:py-6 text-sm sm:text-base font-body w-full sm:w-auto">
                  <a href={SIGNUP_URL}>Download for Mac →</a>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={scrollToHowItWorks}
                  className="border-border text-foreground hover:text-foreground hover:bg-muted px-6 sm:px-8 py-5 sm:py-6 text-sm sm:text-base font-body w-full sm:w-auto"
                >
                  See How It Works ↓
                </Button>
              </div>
            </div>
            <div className="w-full lg:-mr-6 xl:-mr-16">
              <div className="relative">
                <img src={heroImage} alt="Stitchly Editor Interface" className="w-full h-auto drop-shadow-2xl rounded-lg lg:rounded-none" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="mx-auto px-4 sm:px-6 py-12 sm:py-16 bg-[#1C1E2D]">
        <div className="mx-auto">
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-8 sm:mb-12 text-foreground font-heading">
            How It Works
          </h3>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="p-8 space-y-4 bg-[#101321] border border-border rounded-xl hover:border-primary/50 transition-colors">
              <div className="h-12 w-12 rounded-lg border border-border flex items-center justify-center bg-muted">
                <UploadIcon className="h-6 w-6 text-primary" />
              </div>
              <h4 className="text-xl font-bold text-foreground font-heading">Import Your Footage</h4>
              <p className="text-muted-foreground leading-relaxed font-body">
                Drop in your interview files. Stitchly generates proxies locally, transcribes with word-level timestamps, and identifies every speaker automatically.
              </p>
            </div>

            <div className="p-8 space-y-4 bg-[#101321] border border-border rounded-xl hover:border-primary/50 transition-colors">
              <div className="h-12 w-12 rounded-lg border border-border flex items-center justify-center bg-muted">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h4 className="text-xl font-bold text-foreground font-heading">AI Finds the Best Moments</h4>
              <p className="text-muted-foreground leading-relaxed font-body">
                Stitchly categorizes every soundbite by type — emotion, story, key point, CTA, and more. Search, filter, and build your sequence from the strongest clips across all your footage.
              </p>
            </div>

            <div className="p-8 space-y-4 bg-[#101321] border border-border rounded-xl hover:border-primary/50 transition-colors">
              <div className="h-12 w-12 rounded-lg border border-border flex items-center justify-center bg-muted">
                <Monitor className="h-6 w-6 text-primary" />
              </div>
              <h4 className="text-xl font-bold text-foreground font-heading">One Click to Your NLE</h4>
              <p className="text-muted-foreground leading-relaxed font-body">
                Hit "Send to Premiere Pro" and your sequence opens directly in your editor with all media linked. No XML hunting. No relinking. Premiere, Resolve, and Final Cut all supported.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Block 1 */}
      <section id="features" className="mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div className="space-y-6 sm:space-y-8">
              <div>
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 font-heading">Give It a Brief. Get a Cut.</h3>
                <p className="text-muted-foreground font-body">
                  Tell Stitchly what you need the way you'd brief a senior editor. It reads your entire transcript library and assembles the best clips into a structured sequence — labeled, timestamped, and ordered by narrative logic.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <ArrowRight className="h-6 w-6 text-primary mt-1" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-foreground mb-2 font-heading">
                      Creative briefs in plain English
                    </h4>
                    <p className="text-muted-foreground font-body">
                      Type what you want: "Build a 90-second testimonial. Open with struggle, close with results." Stitchly finds the clips that match.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <ArrowRight className="h-6 w-6 text-primary mt-1" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-foreground mb-2 font-heading">Multi-video intelligence</h4>
                    <p className="text-muted-foreground font-body">
                      Upload 8 interviews. Stitchly treats them as one searchable library. The best moment from interview 3 lands next to the perfect setup from interview 7.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <ArrowRight className="h-6 w-6 text-primary mt-1" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-foreground mb-2 font-heading">Every word searchable</h4>
                    <p className="text-muted-foreground font-body">
                      Word-level timestamps. Speaker identification. Semantic categorization. Your footage becomes a database you can query.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full">
              <div className="relative">
                <img
                  src={uploadDashboard}
                  alt="Stitchly Workspace"
                  className="w-full h-auto rounded-lg shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Block 2 */}
      <section className="mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div className="w-full lg:order-1 order-2">
              <div className="relative">
                <img
                  src={adminDashboard}
                  alt="Stitchly Sequence Editor"
                  className="w-full h-auto rounded-lg shadow-2xl"
                />
              </div>
            </div>

            <div className="space-y-6 sm:space-y-8 lg:order-2 order-1">
              <div>
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 font-heading">Built for Professional Editors</h3>
                <p className="text-muted-foreground font-body">Stitchly doesn't replace your NLE. It eliminates the hours you spend scrubbing footage before the real edit starts.</p>
              </div>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <ArrowRight className="h-6 w-6 text-primary mt-1" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-foreground mb-2 font-heading">Premiere, Resolve, and Final Cut</h4>
                    <p className="text-muted-foreground font-body">
                      Export a ready-to-edit XML for any major editing platform. One click opens your sequence directly in your editor with all media paths linked.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <ArrowRight className="h-6 w-6 text-primary mt-1" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-foreground mb-2 font-heading">
                      Proxy-based workflow
                    </h4>
                    <p className="text-muted-foreground font-body">
                      Stitchly generates lightweight proxies locally so your machine stays fast. Original media paths are preserved in every export.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <ArrowRight className="h-6 w-6 text-primary mt-1" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-foreground mb-2 font-heading">Your footage stays local</h4>
                    <p className="text-muted-foreground font-body">
                      No cloud uploads. No waiting. Everything runs on your Mac with files stored on your own drives.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="mx-auto px-4 sm:px-6 py-12 sm:py-20 bg-[#1C1E2D]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 font-heading">What Editors Are Saying</h3>
            <p className="text-muted-foreground font-body">From editors who stopped scrubbing and started editing.</p>
          </div>

          <div className="relative">
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentTestimonial * 100}%)` }}
              >
                {testimonials.map((testimonial) => (
                  <div key={testimonial.id} className="w-full flex-shrink-0 px-4">
                    <Card className="bg-[#101321] border-border p-8 max-w-2xl mx-auto">
                      <div className="flex gap-1 mb-4">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                        ))}
                      </div>
                      <p className="text-foreground text-lg mb-6 leading-relaxed font-body">"{testimonial.text}"</p>
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                          <Users className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-foreground font-semibold font-heading">{testimonial.author}</p>
                          <p className="text-muted-foreground text-sm font-body">{testimonial.title}</p>
                        </div>
                      </div>
                    </Card>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={previousTestimonial}
              className="absolute left-0 sm:left-0 top-1/2 -translate-y-1/2 -translate-x-2 sm:-translate-x-4 bg-card hover:bg-muted text-foreground p-2 sm:p-3 rounded-full border border-border transition-colors"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>

            <button
              onClick={nextTestimonial}
              className="absolute right-0 sm:right-0 top-1/2 -translate-y-1/2 translate-x-2 sm:translate-x-4 bg-card hover:bg-muted text-foreground p-2 sm:p-3 rounded-full border border-border transition-colors"
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>

            <div className="flex justify-center gap-2 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === currentTestimonial ? "w-8 bg-primary" : "w-2 bg-muted"
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 font-heading">Simple Pricing. Start Free.</h3>
          <p className="text-muted-foreground font-body mb-10">One plan. Everything included.</p>

          <Card className="bg-[#101321] border-border p-8 sm:p-10 text-left max-w-md mx-auto">
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

            <Button asChild size="lg" className="w-full">
              <a href={SIGNUP_URL}>Start Free Trial →</a>
            </Button>
          </Card>

          <p className="text-muted-foreground text-sm mt-6 font-body">
            Start with a free trial. No credit card required. Download for Mac.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto px-4 sm:px-6 py-12 sm:py-20 bg-[#1C1E2D]">
        <div className="mx-auto">
          <Card className="bg-[#101321] border-border p-6 sm:p-12 text-center space-y-4 sm:space-y-6">
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground font-heading">Your Next Edit Starts Here.</h3>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto font-body">
              Download Stitchly, import your footage, and get your first assembly cut before you finish your coffee. The footage isn't going to watch itself — but now it doesn't have to.
            </p>
            <div className="flex justify-center pt-2 sm:pt-4">
              <Button size="lg" asChild className="px-8">
                <a href={SIGNUP_URL}>Download for Mac →</a>
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border mt-20 bg-[#101321]">
        <div className="mx-auto px-6 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold font-heading">S</span>
                </div>
                <span className="font-bold text-lg font-heading">
                  <span className="text-foreground">Stitch</span><span className="text-primary">ly</span>
                </span>
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
                <li><a href={SIGNUP_URL} className="text-muted-foreground hover:text-foreground transition-colors text-sm font-body">Download for Mac</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-border">
            <p className="text-muted-foreground text-sm font-body text-center">© 2026 {BRAND}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
