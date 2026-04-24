import { Button } from "@/components/ui/button";
import { Upload, Sparkles, Monitor, Users, ChevronRight, ArrowRight, Star, ChevronLeft, Check } from "lucide-react";
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
            {loadingBrand ? (
              <>
                <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-muted animate-pulse" />
                <div className="h-4 sm:h-5 bg-muted rounded w-24 sm:w-32 animate-pulse" />
              </>
            ) : (
              <>
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="h-6 w-6 sm:h-8 sm:w-8 object-contain" />
                ) : (
                  <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-primary flex items-center justify-center">
                    <Video className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground" />
                  </div>
                )}
                <h1 className="text-base sm:text-lg font-bold text-foreground font-heading">{brandName}</h1>
              </>
            )}
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="ghost"
              onClick={() => navigate("/auth")}
              className="text-muted-foreground hover:text-foreground hover:bg-muted text-sm sm:text-base px-2 sm:px-4"
            >
              Sign In
            </Button>
            <Button
              onClick={() => navigate("/auth")}
              className="bg-[#40CCB799] hover:bg-[#40CCB7]/90 text-white border border-[#40CCB7] text-sm sm:text-base px-3 sm:px-4"
            >
              <span className="hidden sm:inline">Get Started</span>
              <span className="sm:hidden">Start</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="mx-auto px-4 sm:px-6 lg:pl-6 lg:pr-0 py-12 sm:py-20 lg:py-32">
        <div className="mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <div className="space-y-6 sm:space-y-8 lg:pr-6">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight font-heading">
                Professional Video Editing Made Simple
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-gray-400 max-w-xl font-body leading-relaxed">
                Create stunning video content with our powerful yet intuitive editor. Trim, split, and export your
                videos in minutes.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
                <Button size="lg" onClick={handleStartDemo} className="gap-2 px-6 sm:px-8 py-5 sm:py-6 text-sm sm:text-base font-body w-full sm:w-auto">
                  Try a Demo Now
                  <Play className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate("/auth")}
                  className="border-white/20 text-white hover:text-white hover:bg-white/10 px-6 sm:px-8 py-5 sm:py-6 text-sm sm:text-base font-body w-full sm:w-auto"
                >
                  Sign Up for Free
                  <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 ml-1" />
                </Button>
              </div>
            </div>
            <div className="w-full lg:-mr-6 xl:-mr-16">
              <div className="relative">
                <img src={heroImage} alt="Video Editor Interface" className="w-full h-auto drop-shadow-2xl rounded-lg lg:rounded-none" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="mx-auto px-4 sm:px-6 py-12 sm:py-16 bg-[#1C1E2D]">
        <div className="mx-auto">
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-8 sm:mb-12 text-foreground font-heading">
            Why Choose {brandName}?
          </h3>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="p-8 space-y-4 bg-[#101321] border border-border rounded-xl hover:border-primary/50 transition-colors">
              <div className="h-12 w-12 rounded-lg border border-border flex items-center justify-center bg-muted">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h4 className="text-xl font-bold text-foreground font-heading">Lightning Fast</h4>
              <p className="text-muted-foreground leading-relaxed font-body">
                Process and edit videos quickly with our optimized engine. No more waiting hours for renders.
              </p>
            </div>

            <div className="p-8 space-y-4 bg-[#101321] border border-border rounded-xl hover:border-primary/50 transition-colors">
              <div className="h-12 w-12 rounded-lg border border-border flex items-center justify-center bg-muted">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h4 className="text-xl font-bold text-foreground font-heading">Secure & Private</h4>
              <p className="text-muted-foreground leading-relaxed font-body">
                Your videos are encrypted and stored securely. We never share your content with third parties.
              </p>
            </div>

            <div className="p-8 space-y-4 bg-[#101321] border border-border rounded-xl hover:border-primary/50 transition-colors">
              <div className="h-12 w-12 rounded-lg border border-border flex items-center justify-center bg-muted">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h4 className="text-xl font-bold text-foreground font-heading">Team Collaboration</h4>
              <p className="text-muted-foreground leading-relaxed font-body">
                Work together with your team in real time. Share projects and get feedback instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Standard User Mode Section */}
      <section className="mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div className="space-y-6 sm:space-y-8">
              <div>
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 font-heading">Standard User Mode</h3>
                <p className="text-muted-foreground font-body">
                  Everything you need to polish your videos around the learning curve.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <ArrowRight className="h-6 w-6 text-primary mt-1" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-foreground mb-2 font-heading">
                      Upload and preview instantly
                    </h4>
                    <p className="text-muted-foreground font-body">
                      Drag in any supported file and scroll through playback with full scrubable, all in your
                      thumbnails.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <ArrowRight className="h-6 w-6 text-primary mt-1" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-foreground mb-2 font-heading">Trim and cut with precision</h4>
                    <p className="text-muted-foreground font-body">
                      Easily snip any unwanted moments or keep multiple highlights and preview the stitching result
                      live.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <ArrowRight className="h-6 w-6 text-primary mt-1" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-foreground mb-2 font-heading">Perfect your format</h4>
                    <p className="text-muted-foreground font-body">
                      Switch between horizontally, vertically or square on export. Fit your content to any social
                      channel. No fuss, clean export that matches your platform.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full">
              <div className="relative">
                <img
                  src={uploadDashboard}
                  alt="Upload Dashboard Interface"
                  className="w-full h-auto rounded-lg shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Admin Mode Section */}
      <section className="mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div className="w-full lg:order-1 order-2">
              <div className="relative">
                <img
                  src={adminDashboard}
                  alt="Admin Dashboard Interface"
                  className="w-full h-auto rounded-lg shadow-2xl"
                />
              </div>
            </div>

            <div className="space-y-6 sm:space-y-8 lg:order-2 order-1">
              <div>
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 font-heading">Admin Mode</h3>
                <p className="text-muted-foreground font-body">Take complete control of your workspace.</p>
              </div>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <ArrowRight className="h-6 w-6 text-primary mt-1" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-foreground mb-2 font-heading">Stay on top of activity</h4>
                    <p className="text-muted-foreground font-body">
                      Monitor who's editing what, track your team's user roles, and export projects with a clear,
                      real-time dashboard.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <ArrowRight className="h-6 w-6 text-primary mt-1" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-foreground mb-2 font-heading">
                      Track performance with reports
                    </h4>
                    <p className="text-muted-foreground font-body">
                      View detailed usage metrics per user or across the entire platform. Understand workload, storage
                      usage, and export volume.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <ArrowRight className="h-6 w-6 text-primary mt-1" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-foreground mb-2 font-heading">Customize your environment</h4>
                    <p className="text-muted-foreground font-body">
                      Brand the Editor experience and fine-tune system settings to match your organization's needs.
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
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 font-heading">Testimonials</h3>
            <p className="text-muted-foreground font-body">Here's what our customers have to say about us:</p>
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

      {/* CTA Section */}
      <section className="mx-auto px-4 sm:px-6 py-12 sm:py-20 bg-[#1C1E2D]">
        <div className="mx-auto">
          <Card className="bg-[#101321] border-border p-6 sm:p-12 text-center space-y-4 sm:space-y-6">
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground font-heading">Ready to Get Started?</h3>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto font-body">
              Try our demo without signing up, or create a free account to unlock all features and keep your projects
              permanently.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-2 sm:pt-4">
              <Button
                size="lg"
                onClick={handleStartDemo}
                className="bg-[#40CCB799] hover:bg-[#40CCB7]/90 text-white border border-[#40CCB7] px-8"
              >
                Try a Demo Now
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/auth")}
                className="border-border text-foreground hover:text-foreground hover:bg-muted px-8"
              >
                Create a Free Account
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border mt-20 bg-[#101321]">
        <div className="mx-auto px-6 py-12">
          <div className="grid md:grid-cols-5 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                  <Video className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="font-bold text-foreground text-lg font-heading">{brandName}</span>
              </div>
              <div className="space-y-3">
                <p className="text-muted-foreground text-sm font-body">Join our newsletter</p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Enter Your Email"
                    className="flex-1 bg-background border border-border rounded px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary font-body"
                  />
                  <Button className="bg-[#40CCB799] hover:bg-[#40CCB7]/90 text-white border border-[#40CCB7]">
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-foreground font-semibold mb-4 font-heading">Home</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors text-sm font-body"
                  >
                    Our Team
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors text-sm font-body"
                  >
                    How It Works
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-foreground font-semibold mb-4 font-heading">Features</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors text-sm font-body"
                  >
                    Feature
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors text-sm font-body"
                  >
                    Feature
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors text-sm font-body"
                  >
                    Feature
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-foreground font-semibold mb-4 font-heading">Account</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    onClick={() => navigate("/auth")}
                    className="text-muted-foreground hover:text-foreground transition-colors text-sm font-body"
                  >
                    Sign in
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors text-sm font-body"
                  >
                    My Profile
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-border">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex gap-4">
                <a href="#" className="h-10 w-10 rounded-lg hover:opacity-80 transition-opacity">
                  <img src={instagramIcon} alt="Instagram" className="h-full w-full" />
                </a>
                <a href="#" className="h-10 w-10 rounded-lg hover:opacity-80 transition-opacity">
                  <img src={tiktokIcon} alt="TikTok" className="h-full w-full" />
                </a>
                <a href="#" className="h-10 w-10 rounded-lg hover:opacity-80 transition-opacity">
                  <img src={youtubeIcon} alt="YouTube" className="h-full w-full" />
                </a>
                <a href="#" className="h-10 w-10 rounded-lg hover:opacity-80 transition-opacity">
                  <img src={facebookIcon} alt="Facebook" className="h-full w-full" />
                </a>
              </div>
              <p className="text-muted-foreground text-sm font-body">© 2025 {brandName}. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
