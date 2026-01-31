'use client';

import React from "react";
import { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Camera, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface CapturedFace {
  id: string;
  dataUrl: string;
  timestamp: number;
}

export default function EnrollmentPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [step, setStep] = useState<'form' | 'capture'>('form');
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedFaces, setCapturedFaces] = useState<CapturedFace[]>([]);
  const [formData, setFormData] = useState({
    studentId: '',
    fullName: '',
    email: '',
    className: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStartCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setStep('capture');
        setIsCapturing(true);
      }
    } catch (error) {
      console.error('[v0] Camera error:', error);
      toast.error('Failed to access camera. Please check permissions.');
    }
  };

  const captureFace = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    try {
      const context = canvasRef.current.getContext('2d');
      if (!context) return;

      context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
      const dataUrl = canvasRef.current.toDataURL('image/jpeg');

      const newFace: CapturedFace = {
        id: `face-${Date.now()}`,
        dataUrl,
        timestamp: Date.now(),
      };

      setCapturedFaces(prev => [...prev, newFace]);
      toast.success(`Face ${capturedFaces.length + 1} captured`);
    } catch (error) {
      console.error('[v0] Capture error:', error);
      toast.error('Failed to capture face');
    }
  };

  const removeFace = (id: string) => {
    setCapturedFaces(prev => prev.filter(face => face.id !== id));
  };

  const handleSubmitEnrollment = async () => {
    if (!formData.studentId || !formData.fullName || !formData.className) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (capturedFaces.length === 0) {
      toast.error('Please capture at least one face');
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('[v0] Submitting enrollment:', {
        studentId: formData.studentId,
        fullName: formData.fullName,
        className: formData.className,
        faceCount: capturedFaces.length,
      });

      const response = await fetch('/api/students/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          faces: capturedFaces.map(f => ({ dataUrl: f.dataUrl })),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('[v0] Enrollment successful:', data);
        toast.success('Student enrolled successfully!');
        setTimeout(() => router.push('/dashboard'), 1500);
      } else {
        console.error('[v0] Enrollment failed:', data);
        toast.error(data.message || 'Failed to enroll student');
      }
    } catch (error) {
      console.error('[v0] Enrollment error:', error);
      toast.error('Error during enrollment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
    setStep('form');
    setIsCapturing(false);
  };

  if (step === 'capture') {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border/50">
          <div className="container mx-auto px-4 py-4 flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={stopCamera}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-2xl font-bold">Capture Face Data</h1>
          </div>
        </header>

        {/* Capture Interface */}
        <main className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Video Feed */}
            <div className="lg:col-span-2">
              <Card className="border-border/50 overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative bg-black aspect-video">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    <canvas
                      ref={canvasRef}
                      className="hidden"
                      width={1280}
                      height={720}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Captured Faces */}
            <div className="space-y-4">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-base">
                    Captured Faces ({capturedFaces.length})
                  </CardTitle>
                  <CardDescription>
                    Minimum 3 faces recommended
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    onClick={captureFace}
                    className="w-full"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Capture Face
                  </Button>

                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {capturedFaces.map((face, idx) => (
                      <div
                        key={face.id}
                        className="relative rounded-lg overflow-hidden border border-border/50"
                      >
                        <img
                          src={face.dataUrl || "/placeholder.svg"}
                          alt={`Face ${idx + 1}`}
                          className="w-full h-24 object-cover"
                        />
                        <Button
                          size="icon"
                          variant="destructive"
                          className="absolute top-1 right-1"
                          onClick={() => removeFace(face.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={stopCamera}
                    variant="outline"
                    className="w-full bg-transparent"
                    disabled={capturedFaces.length === 0}
                  >
                    Continue
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Enroll New Student</h1>
        </div>
      </header>

      {/* Enrollment Form */}
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Student Information</CardTitle>
            <CardDescription>
              Fill in the student details and capture their face for enrollment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="studentId">Student ID *</Label>
                <Input
                  id="studentId"
                  name="studentId"
                  placeholder="STU-2024-001"
                  value={formData.studentId}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={handleFormChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john@school.edu"
                  value={formData.email}
                  onChange={handleFormChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="className">Class Name *</Label>
                <Input
                  id="className"
                  name="className"
                  placeholder="10-A"
                  value={formData.className}
                  onChange={handleFormChange}
                  required
                />
              </div>
            </div>

            <div className="border-t border-border/50 pt-6 space-y-4">
              <div>
                <h3 className="font-medium mb-2">Face Enrollment Status</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Captured faces: <span className="font-semibold">{capturedFaces.length}</span>
                  {capturedFaces.length > 0 && (
                    <>
                      {' '}
                      <span className="text-green-600">✓</span>
                    </>
                  )}
                </p>

                {capturedFaces.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {capturedFaces.slice(0, 3).map((face, idx) => (
                      <div key={face.id} className="relative">
                        <img
                          src={face.dataUrl || "/placeholder.svg"}
                          alt={`Preview ${idx + 1}`}
                          className="w-16 h-16 rounded border border-border/50 object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {capturedFaces.length === 0 ? (
                  <Button
                    onClick={handleStartCapture}
                    className="w-full"
                    size="lg"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Start Face Capture
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <Button
                      onClick={handleStartCapture}
                      variant="outline"
                      className="w-full bg-transparent"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add More Faces
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-4">
              <Link href="/dashboard" className="flex-1">
                <Button 
                  variant="outline" 
                  className="w-full bg-transparent"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </Link>
              <Button
                onClick={handleSubmitEnrollment}
                disabled={!formData.studentId || !formData.fullName || !formData.className || capturedFaces.length === 0 || isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? 'Enrolling...' : 'Complete Enrollment'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
