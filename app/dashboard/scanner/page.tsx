'use client';

import { useRef, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import ml5 from 'ml5';

export default function ScannerPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [detectedFaces, setDetectedFaces] = useState<any[]>([]);
  const [lastDetectionTime, setLastDetectionTime] = useState(0);

  useEffect(() => {
    initializeCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

  const initializeCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          setIsLoading(false);
        };
      }
    } catch (error) {
      console.error('[v0] Camera error:', error);
      toast.error('Failed to access camera. Please check permissions.');
    }
  };

  const captureFrame = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    try {
      const context = canvasRef.current.getContext('2d');
      if (!context) return;

      context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);

      // Simulate face detection - in production, integrate with backend API
      // For now, randomly detect faces to simulate real system
      if (Math.random() > 0.7) {
        const now = Date.now();
        if (now - lastDetectionTime > 2000) {
          // Only show detection once every 2 seconds
          const mockFace = {
            id: `face-${now}`,
            name: 'Student Detected',
            confidence: 0.85 + Math.random() * 0.14,
            timestamp: now,
          };
          setDetectedFaces([mockFace]);
          setLastDetectionTime(now);
          toast.success(`Face detected: ${mockFace.name}`);

          // Send to backend for processing
          try {
            const dataUrl = canvasRef.current.toDataURL('image/jpeg');
            await fetch('/api/attendance/mark', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                faceImage: dataUrl,
                timestamp: now,
              }),
            });
          } catch (err) {
            console.error('[v0] API error:', err);
          }
        }
      }
    } catch (error) {
      console.error('[v0] Capture error:', error);
    }
  };

  const handleStartScanning = () => {
    setIsScanning(true);
    const interval = setInterval(captureFrame, 300);
    // Auto-stop after 5 minutes
    setTimeout(() => {
      setIsScanning(false);
      clearInterval(interval);
    }, 5 * 60 * 1000);
  };

  const handleStopScanning = () => {
    setIsScanning(false);
    setDetectedFaces([]);
  };

  const handleMarkAttendance = async (faceId: string) => {
    try {
      const response = await fetch('/api/attendance/mark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: faceId }),
      });

      if (response.ok) {
        toast.success('Attendance marked successfully');
        handleStopScanning();
      } else {
        toast.error('Failed to mark attendance');
      }
    } catch (error) {
      console.error('[v0] Attendance error:', error);
      toast.error('Error marking attendance');
    }
  };

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
          <div>
            <h1 className="text-2xl font-bold">Face Recognition Scanner</h1>
            <p className="text-sm text-muted-foreground">
              Position your face in front of the camera
            </p>
          </div>
        </div>
      </header>

      {/* Scanner */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Camera Feed */}
          <div className="lg:col-span-2">
            <Card className="border-border/50 overflow-hidden">
              <CardHeader>
                <CardTitle>Live Camera Feed</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="relative bg-black aspect-video flex items-center justify-center">
                  {isLoading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-10">
                      <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
                      <p className="text-white text-sm">Initializing camera...</p>
                    </div>
                  )}
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

          {/* Controls & Results */}
          <div className="space-y-6">
            {/* Scanner Controls */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Scanner Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!isScanning ? (
                  <Button
                    onClick={handleStartScanning}
                    disabled={isLoading}
                    className="w-full"
                  >
                    Start Scanning
                  </Button>
                ) : (
                  <Button
                    onClick={handleStopScanning}
                    variant="destructive"
                    className="w-full"
                  >
                    Stop Scanning
                  </Button>
                )}
                <p className="text-xs text-muted-foreground text-center">
                  {isScanning
                    ? 'Scanning in progress...'
                    : 'Click to start face detection'}
                </p>
              </CardContent>
            </Card>

            {/* Detection Results */}
            {detectedFaces.length > 0 && (
              <Card className="border-border/50 border-primary/50 bg-primary/5">
                <CardHeader>
                  <CardTitle className="text-base">Detected Faces</CardTitle>
                  <CardDescription>
                    {detectedFaces.length} face(s) detected
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {detectedFaces.map((face) => (
                    <div key={face.id} className="space-y-2">
                      <div className="bg-background rounded-lg p-3">
                        <p className="font-medium text-sm">{face.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Confidence: {(face.confidence * 100).toFixed(1)}%
                        </p>
                      </div>
                      <Button
                        onClick={() => handleMarkAttendance(face.id)}
                        className="w-full"
                        size="sm"
                      >
                        Mark Attendance
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Instructions */}
            <Card className="border-border/50 bg-secondary/5">
              <CardHeader>
                <CardTitle className="text-base">Instructions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <ol className="space-y-2 list-decimal list-inside">
                  <li>Position your face in the camera frame</li>
                  <li>Ensure proper lighting and no obstructions</li>
                  <li>Click "Start Scanning" to begin detection</li>
                  <li>Wait for your face to be recognized</li>
                  <li>Click "Mark Attendance" when your name appears</li>
                </ol>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
