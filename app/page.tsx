'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, BarChart3, Users, Lock } from 'lucide-react';

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background">
      {/* Navigation */}
      <nav className="border-b border-border/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold">FaceAttend</span>
          </div>
          <div className="flex gap-4">
            <Button variant="ghost" onClick={() => router.push('/login')}>
              Login
            </Button>
            <Button onClick={() => router.push('/signup')}>
              Sign Up
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h1 className="text-5xl md:text-6xl font-bold text-pretty">
            Smart Attendance with Face Recognition
          </h1>
          <p className="text-xl text-muted-foreground">
            Production-ready face recognition system for educational institutions. Fast, accurate, and completely on-device.
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Button size="lg" onClick={() => router.push('/signup')}>
              Get Started
            </Button>
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Real-time Scanning */}
          <Card className="border-border/50">
            <CardHeader>
              <Camera className="w-8 h-8 text-primary mb-2" />
              <CardTitle>Real-time Scanning</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Instant face recognition with live camera feed and immediate attendance marking.
              </CardDescription>
            </CardContent>
          </Card>

          {/* Face Enrollment */}
          <Card className="border-border/50">
            <CardHeader>
              <Users className="w-8 h-8 text-primary mb-2" />
              <CardTitle>Face Enrollment</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Easy enrollment system to add new students with multiple face captures.
              </CardDescription>
            </CardContent>
          </Card>

          {/* Secure Login */}
          <Card className="border-border/50">
            <CardHeader>
              <Lock className="w-8 h-8 text-primary mb-2" />
              <CardTitle>Secure Login</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Password-protected admin access with role-based permissions.
              </CardDescription>
            </CardContent>
          </Card>

          {/* Analytics Dashboard */}
          <Card className="border-border/50">
            <CardHeader>
              <BarChart3 className="w-8 h-8 text-primary mb-2" />
              <CardTitle>Analytics Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Comprehensive attendance reports and analytics with detailed logs.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 bg-primary/5 rounded-2xl">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-bold">Ready to Transform Attendance?</h2>
          <p className="text-lg text-muted-foreground">
            Join hundreds of educational institutions using FaceAttend for efficient, accurate attendance tracking.
          </p>
          <Button size="lg" onClick={() => router.push('/signup')}>
            Start Your Free Trial
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2026 FaceAttend. All rights reserved. Production-ready attendance system.</p>
        </div>
      </footer>
    </div>
  );
}
