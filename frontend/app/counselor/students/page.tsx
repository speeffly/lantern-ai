'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import StudentDetailClient from './StudentDetailClient';

interface StudentProgress {
  student: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
  };
  profile: any;
  assessmentStatus: {
    hasCompletedAssessment: boolean;
    lastAssessmentDate?: string;
    assessmentCount: number;
  };
  careerPlan: {
    hasCareerPlan: boolean;
    topCareer?: string;
    planCreatedDate?: string;
  };
  actionPlan: {
    hasActionPlan: boolean;
    completedSteps: number;
    totalSteps: number;
    lastUpdated?: string;
  };
}

interface CounselorStats {
  totalStudents: number;
  studentsWithAssessments: number;
  studentsWithCareerPlans: number;
  totalAssignments: number;
  completedAssignments: number;
  assessmentCompletionRate: number;
  careerPlanCompletionRate: number;
  assignmentCompletionRate: number;
}

function CounselorStudentsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const studentId = searchParams.get('studentId');
  const [isLoading, setIsLoading] = useState(true);
  const [students, setStudents] = useState<StudentProgress[]>([]);
  const [stats, setStats] = useState<CounselorStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [isAddingStudent, setIsAddingStudent] = useState(false);

  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  const checkAuthAndLoadData = async () => {
    const token = localStorage.getItem('token');
    console.log('🔍 Counselor Students - Checking authentication...');
    
    if (!token) {
      console.log('❌ No token found, redirecting to login');
      router.push('/login');
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const profileUrl = `${apiUrl}/api/auth-db/profile`;
      
      console.log('📡 Making profile request to:', profileUrl);

      const response = await fetch(profileUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      console.log('🔍 Counselor Students - Profile response:', data);
      
      if (!data.success || data.data.role !== 'counselor') {
        console.log('❌ Authentication failed or not a counselor');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
        return;
      }
      
      console.log('✅ Counselor authentication successful');
      
      // Load students and stats
      await Promise.all([
        loadStudents(token),
        loadStats(token)
      ]);
      
    } catch (error) {
      console.error('❌ Auth check failed:', error);
      setError('Authentication failed');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  };

  const loadStudents = async (token: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const studentsUrl = `${apiUrl}/api/counselor/students`;
      
      console.log('📡 Loading students from:', studentsUrl);

      const response = await fetch(studentsUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      console.log('👥 Students response:', data);
      
      if (data.success) {
        setStudents(data.data || []);
      } else {
        setError(data.error || 'Failed to load students');
      }
    } catch (error) {
      console.error('❌ Error loading students:', error);
      setError('Failed to load students');
    }
  };

  const loadStats = async (token: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const statsUrl = `${apiUrl}/api/counselor/stats`;
      
      console.log('📊 Loading stats from:', statsUrl);

      const response = await fetch(statsUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      console.log('📊 Stats response:', data);
      
      if (data.success) {
        setStats(data.data);
      } else {
        console.error('Failed to load stats:', data.error);
      }
    } catch (error) {
      console.error('❌ Error loading stats:', error);
    }
  };

  const addStudent = async () => {
    if (!newStudentEmail.trim()) return;
    
    setIsAddingStudent(true);
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const addStudentUrl = `${apiUrl}/api/counselor/students`;
      
      console.log('➕ Adding student:', newStudentEmail);

      const response = await fetch(addStudentUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          studentEmail: newStudentEmail.trim()
        })
      });

      const data = await response.json();
      console.log('➕ Add student response:', data);
      
      if (data.success) {
        setNewStudentEmail('');
        setShowAddStudent(false);
        // Reload students and stats
        await Promise.all([
          loadStudents(token!),
          loadStats(token!)
        ]);
      } else {
        setError(data.error || 'Failed to add student');
      }
    } catch (error) {
      console.error('❌ Error adding student:', error);
      setError('Failed to add student');
    } finally {
      setIsAddingStudent(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading students...</div>
      </div>
    );
  }

  // If studentId is provided, show student detail view
  if (studentId) {
    return <StudentDetailClient studentId={studentId} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link href="/counselor/dashboard" className="text-blue-600 hover:text-blue-800">
                ← Back to Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Student Management</h1>
            </div>
            <button
              onClick={() => setShowAddStudent(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Student
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="text-red-600">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Overview */}
      {stats && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-2xl font-bold text-gray-900">{stats.totalStudents}</div>
              <div className="text-gray-600">Total Students</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className={`text-2xl font-bold ${getProgressColor(stats.assessmentCompletionRate)}`}>
                {stats.assessmentCompletionRate}%
              </div>
              <div className="text-gray-600">Assessment Completion</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className={`text-2xl font-bold ${getProgressColor(stats.careerPlanCompletionRate)}`}>
                {stats.careerPlanCompletionRate}%
              </div>
              <div className="text-gray-600">Career Plans</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className={`text-2xl font-bold ${getProgressColor(stats.assignmentCompletionRate)}`}>
                {stats.assignmentCompletionRate}%
              </div>
              <div className="text-gray-600">Assignment Completion</div>
            </div>
          </div>
        </div>
      )}

      {/* Students List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {students.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Students Yet</h2>
            <p className="text-gray-600 mb-6">
              Start by adding students to your caseload. You can track their assessment progress, 
              career planning, and provide personalized guidance.
            </p>
            <button
              onClick={() => setShowAddStudent(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Your First Student
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Your Students ({students.length})</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assessment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Career Plan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action Plan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {students.map((studentProgress) => (
                    <tr key={studentProgress.student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {studentProgress.student.first_name} {studentProgress.student.last_name}
                          </div>
                          <div className="text-sm text-gray-500">{studentProgress.student.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {studentProgress.assessmentStatus.hasCompletedAssessment ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Completed ({studentProgress.assessmentStatus.assessmentCount})
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Not Started
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          Last: {formatDate(studentProgress.assessmentStatus.lastAssessmentDate)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {studentProgress.careerPlan.hasCareerPlan ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              None
                            </span>
                          )}
                        </div>
                        {studentProgress.careerPlan.topCareer && (
                          <div className="text-xs text-gray-500 truncate max-w-32">
                            {studentProgress.careerPlan.topCareer}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {studentProgress.actionPlan.hasActionPlan ? (
                            <div>
                              <div className="text-sm font-medium">
                                {studentProgress.actionPlan.completedSteps}/{studentProgress.actionPlan.totalSteps} steps
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full" 
                                  style={{ 
                                    width: `${studentProgress.actionPlan.totalSteps > 0 
                                      ? (studentProgress.actionPlan.completedSteps / studentProgress.actionPlan.totalSteps) * 100 
                                      : 0}%` 
                                  }}
                                ></div>
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-500">No action plan</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => router.push(`/counselor/students?studentId=${studentProgress.student.id}`)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add Student Modal */}
      {showAddStudent && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add Student</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Student Email
                </label>
                <input
                  type="email"
                  value={newStudentEmail}
                  onChange={(e) => setNewStudentEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="student@example.com"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowAddStudent(false);
                    setNewStudentEmail('');
                    setError(null);
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                  disabled={isAddingStudent}
                >
                  Cancel
                </button>
                <button
                  onClick={addStudent}
                  disabled={isAddingStudent || !newStudentEmail.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAddingStudent ? 'Adding...' : 'Add Student'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CounselorStudentsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-xl">Loading...</div></div>}>
      <CounselorStudentsContent />
    </Suspense>
  );
}