'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Download, Filter } from 'lucide-react';
import { toast } from 'sonner';

interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  checkInTime: string;
  confidenceScore: number;
}

export default function LogsPage() {
  const router = useRouter();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    date: new Date().toISOString().split('T')[0],
    className: '',
    studentName: '',
  });

  useEffect(() => {
    fetchAttendanceLogs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [records, filters]);

  const fetchAttendanceLogs = async () => {
    try {
      const response = await fetch('/api/attendance/logs');
      if (response.ok) {
        const data = await response.json();
        setRecords(data.logs || []);
      } else {
        toast.error('Failed to fetch attendance logs');
      }
    } catch (error) {
      console.error('[v0] Fetch logs error:', error);
      toast.error('Error fetching attendance logs');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...records];

    if (filters.date) {
      filtered = filtered.filter(record => {
        const recordDate = new Date(record.checkInTime).toISOString().split('T')[0];
        return recordDate === filters.date;
      });
    }

    if (filters.className) {
      filtered = filtered.filter(record =>
        record.className.toLowerCase().includes(filters.className.toLowerCase())
      );
    }

    if (filters.studentName) {
      filtered = filtered.filter(record =>
        record.studentName.toLowerCase().includes(filters.studentName.toLowerCase())
      );
    }

    setFilteredRecords(filtered);
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleExportCSV = () => {
    if (filteredRecords.length === 0) {
      toast.error('No records to export');
      return;
    }

    const headers = ['Student ID', 'Student Name', 'Class', 'Check-in Time', 'Confidence'];
    const csvContent = [
      headers.join(','),
      ...filteredRecords.map(r =>
        `"${r.studentId}","${r.studentName}","${r.className}","${new Date(r.checkInTime).toLocaleString()}","${(r.confidenceScore * 100).toFixed(1)}%"`
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-${filters.date}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast.success('Report exported successfully');
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
          <h1 className="text-2xl font-bold">Attendance Logs</h1>
        </div>
      </header>

      {/* Filters & Controls */}
      <main className="container mx-auto px-4 py-8">
        <Card className="border-border/50 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filter Attendance Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Date</label>
                <Input
                  type="date"
                  value={filters.date}
                  onChange={e => handleFilterChange('date', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Class</label>
                <Input
                  placeholder="Search by class..."
                  value={filters.className}
                  onChange={e => handleFilterChange('className', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Student Name</label>
                <Input
                  placeholder="Search by name..."
                  value={filters.studentName}
                  onChange={e => handleFilterChange('studentName', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Export</label>
                <Button
                  onClick={handleExportCSV}
                  variant="outline"
                  className="w-full bg-transparent"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Logs Table */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>
              Records ({filteredRecords.length})
            </CardTitle>
            <CardDescription>
              Showing attendance records for {filters.date}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading attendance records...</p>
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No attendance records found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/50">
                      <TableHead>Student ID</TableHead>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Check-in Time</TableHead>
                      <TableHead>Confidence</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRecords.map(record => (
                      <TableRow key={record.id} className="border-border/50">
                        <TableCell className="font-medium">{record.studentId}</TableCell>
                        <TableCell>{record.studentName}</TableCell>
                        <TableCell>{record.className}</TableCell>
                        <TableCell>
                          {new Date(record.checkInTime).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <span className={`text-sm font-medium ${
                            record.confidenceScore > 0.9
                              ? 'text-green-600'
                              : record.confidenceScore > 0.7
                                ? 'text-yellow-600'
                                : 'text-red-600'
                          }`}>
                            {(record.confidenceScore * 100).toFixed(1)}%
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary Stats */}
        {filteredRecords.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total Records</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{filteredRecords.length}</div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">High Confidence</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {filteredRecords.filter(r => r.confidenceScore > 0.9).length}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Avg. Confidence</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(
                    (filteredRecords.reduce((sum, r) => sum + r.confidenceScore, 0) /
                      filteredRecords.length) *
                    100
                  ).toFixed(1)}
                  %
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
