'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Camera, Users, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');

  const handleLogout = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold">FaceAttend Dashboard</span>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="attendance">Mark Attendance</TabsTrigger>
            <TabsTrigger value="enrollment">Enrollment</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-border/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">In the system</p>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Today's Attendance</CardTitle>
                  <Camera className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">Marked today</p>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg. Attendance</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0%</div>
                  <p className="text-xs text-muted-foreground">This semester</p>
                </CardContent>
              </Card>
            </div>

            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Quick Links</CardTitle>
                <CardDescription>Access key features</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-4">
                <Link href="/dashboard/scanner">
                  <Button>
                    <Camera className="w-4 h-4 mr-2" />
                    Start Scanner
                  </Button>
                </Link>
                <Link href="/dashboard/enroll">
                  <Button variant="outline">
                    <Users className="w-4 h-4 mr-2" />
                    Enroll Student
                  </Button>
                </Link>
                <Link href="/dashboard/logs">
                  <Button variant="outline">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View Logs
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Attendance Tab */}
          <TabsContent value="attendance" className="space-y-6">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Mark Attendance</CardTitle>
                <CardDescription>
                  Use the face recognition scanner to mark attendance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/dashboard/scanner">
                  <Button size="lg" className="w-full">
                    <Camera className="w-4 h-4 mr-2" />
                    Open Face Recognition Scanner
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Enrollment Tab */}
          <TabsContent value="enrollment" className="space-y-6">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Student Enrollment</CardTitle>
                <CardDescription>
                  Add new students and capture their face data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/dashboard/enroll">
                  <Button size="lg" className="w-full">
                    <Users className="w-4 h-4 mr-2" />
                    Enroll New Student
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Attendance Analytics</CardTitle>
                <CardDescription>
                  View detailed attendance reports and logs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/dashboard/logs">
                  <Button size="lg" className="w-full">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View Attendance Logs
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
