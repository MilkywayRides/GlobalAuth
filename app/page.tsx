"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Code2, Shield, ArrowRight, BookOpen, Zap, Users, Star, Loader2 } from "lucide-react";
import Link from "next/link";
import DotPattern from "@/components/ui/dot-pattern";
import Marquee from "@/components/ui/marquee";
import { cn } from "@/lib/utils";
import { appConfig } from "@/lib/app-config";

const testimonials = [
  { name: "Alex Chen", role: "Senior Developer", content: "Amazing API performance" },
  { name: "Sarah Kim", role: "Tech Lead", content: "Best developer experience" },
  { name: "Mike Johnson", role: "CTO", content: "Seamless integration" },
  { name: "Lisa Wang", role: "Full Stack Dev", content: "Excellent documentation" },
];

export default function Home() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isPending && session) {
      if (session.user.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    }
  }, [session, isPending, router]);

  // Show loading spinner while checking authentication
  if (!mounted || isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen">
        <nav className="border-b backdrop-blur-sm bg-background/80 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold">{appConfig.name}</span>
                <Badge variant="secondary">{appConfig.description}</Badge>
              </div>
              <div className="flex items-center space-x-4">
                <Link href="/login">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link href="/signup">
                  <Button>Get Started</Button>
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <DotPattern className="opacity-50" />
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <Badge className="mb-4 animate-pulse">Developer Portal</Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
              Build with {appConfig.name}
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Powerful APIs and developer tools to integrate with your application.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="group">
                  Start Building
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button size="lg" variant="outline">
                <BookOpen className="mr-2 w-4 h-4" />
                Documentation
              </Button>
            </div>
          </div>
        </section>

        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Everything you need</h2>
              <p className="text-xl text-muted-foreground">
                Simple APIs, secure authentication, and comprehensive tools.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <Shield className="w-8 h-8 mb-4 text-primary group-hover:scale-110 transition-transform" />
                  <CardTitle>Secure Authentication</CardTitle>
                  <CardDescription>
                    Multi-provider OAuth with enterprise-grade security.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <Code2 className="w-8 h-8 mb-4 text-primary group-hover:scale-110 transition-transform" />
                  <CardTitle>Developer APIs</CardTitle>
                  <CardDescription>
                    RESTful APIs with comprehensive documentation and SDKs.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <Zap className="w-8 h-8 mb-4 text-primary group-hover:scale-110 transition-transform" />
                  <CardTitle>Lightning Fast</CardTitle>
                  <CardDescription>
                    Optimized performance with global CDN and caching.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Trusted by developers</h2>
              <p className="text-xl text-muted-foreground">
                See what developers are saying about our platform.
              </p>
            </div>

            <Marquee pauseOnHover className="[--duration:20s]">
              {testimonials.map((testimonial, idx) => (
                <Card key={idx} className="w-80 mx-4">
                  <CardHeader>
                    <div className="flex items-center space-x-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                      ))}
                    </div>
                    <CardDescription className="text-base">
                      "{testimonial.content}"
                    </CardDescription>
                    <div className="flex items-center space-x-2 mt-4">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                        <Users className="w-4 h-4 text-primary-foreground" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{testimonial.name}</p>
                        <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </Marquee>
          </div>
        </section>

        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/50">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to get started?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Create your developer account and start building today.
            </p>
            <Link href="/signup">
              <Button size="lg" className="group">
                Create Account
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return null;
}
