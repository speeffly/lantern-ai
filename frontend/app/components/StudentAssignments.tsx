'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Assignment {
  id: number;
  counselor_id: number;
  student_id: number;
  assignment_type: string;
  title: string;
  description: string;
  due_date?: string;
  status: 'assigned' | 'in_progress' | 'completed' | 'overdue';
  created_at: string;
  updated_at: string;
  counselor_first_name?: string;
  counselor_last_name?: string;
  counselor_email?: string;
}

interface StudentAssignmentsProps {
  limit?: number;
  showTitle?: boolean;
}

export default function StudentAssignments({ limit, showTitle = true }: StudentAssignmentsProps) {
  const router = useRouter();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingAssignment, setUpdatingAssignment] = useState<number | null>(null);

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${apiUrl}/api/student/assignments`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        // Handle HTTP errors
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📚 Student assignments response:', data);

      if (data.success) {
        let assignmentList = data.data || [];
        
        // Apply limit if specified
        if (limit && limit > 0) {
          assignmentList = assignmentList.slice(0, limit);
        }
        
        setAssignments(assignmentList);
        // Clear any previous errors
        setError(null);
      } else {
        // API returned success: false, this is a real error
        setError(data.error || 'Failed to load assignments');
      }
    } catch (error) {
      console.error('❌ Error loading assignments:', error);
      setError(error instanceof Error ? error.message : 'Failed to load assignments');
    } finally {
      setIsLoading(false);
    }
  };

  const updateAssignmentStatus = async (assignmentId: number, newStatus: 'in_progress' | 'completed') => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    setUpdatingAssignment(assignmentId);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${apiUrl}/api/student/assignments/${assignmentId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();
      console.log('🔄 Assignment status update response:', data);

      if (data.success) {
        // Update the assignment in the local state
        setAssignments(prev => prev.map(assignment => 
          assignment.id === assignmentId 
            ? { ...assignment, status: newStatus, updated_at: new Date().toISOString() }
            : assignment
        ));
      } else {
        setError(data.error || 'Failed to update assignment status');
      }
    } catch (error) {
      console.error('❌ Error updating assignment status:', error);
      setError('Failed to update assignment status');
    } finally {
      setUpdatingAssignment(null);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No due date';
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAssignmentTypeIcon = (type: string) => {
    switch (type) {
      case 'assessment': return '📝';
      case 'career_research': return '🔍';
      case 'skill_development': return '💪';
      case 'course_planning': return '📚';
      default: return '📋';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        {showTitle && <h3 className="text-lg font-semibold text-gray-900 mb-4">My Assignments</h3>}
        <div className="text-center py-4">
          <div className="text-gray-500">Loading assignments...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        {showTitle && <h3 className="text-lg font-semibold text-gray-900 mb-4">My Assignments</h3>}
        <div className="text-center py-4">
          <div className="text-red-600">{error}</div>
          <button 
            onClick={loadAssignments}
            className="mt-2 text-blue-600 hover:text-blue-800"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (assignments.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        {showTitle && <h3 className="text-lg font-semibold text-gray-900 mb-4">My Assignments</h3>}
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Assignments Yet</h3>
          <p className="text-gray-600">
            Your counselor hasn't assigned any tasks yet. Check back later or contact your counselor if you have questions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {showTitle && (
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">My Assignments ({assignments.length})</h3>
        </div>
      )}
      
      <div className="divide-y divide-gray-200">
        {assignments.map((assignment) => (
          <div key={assignment.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-2xl">{getAssignmentTypeIcon(assignment.assignment_type)}</span>
                  <h4 className="text-lg font-medium text-gray-900">{assignment.title}</h4>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(assignment.status)}`}>
                    {assignment.status.replace('_', ' ')}
                  </span>
                </div>
                
                <p className="text-gray-700 mb-3">{assignment.description}</p>
                
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span className="capitalize">{assignment.assignment_type.replace('_', ' ')}</span>
                  <span>Due: {formatDate(assignment.due_date)}</span>
                  {assignment.counselor_first_name && (
                    <span>
                      From: {assignment.counselor_first_name} {assignment.counselor_last_name}
                    </span>
                  )}
                  <span>Assigned: {formatDate(assignment.created_at)}</span>
                </div>
              </div>
              
              <div className="ml-4 flex flex-col space-y-2">
                {assignment.status === 'assigned' && (
                  <button
                    onClick={() => updateAssignmentStatus(assignment.id, 'in_progress')}
                    disabled={updatingAssignment === assignment.id}
                    className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700 disabled:opacity-50"
                  >
                    {updatingAssignment === assignment.id ? 'Updating...' : 'Start Working'}
                  </button>
                )}
                
                {assignment.status === 'in_progress' && (
                  <button
                    onClick={() => updateAssignmentStatus(assignment.id, 'completed')}
                    disabled={updatingAssignment === assignment.id}
                    className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    {updatingAssignment === assignment.id ? 'Updating...' : 'Mark Complete'}
                  </button>
                )}
                
                {assignment.status === 'completed' && (
                  <div className="flex items-center text-green-600 text-sm">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Completed
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {limit && assignments.length >= limit && (
        <div className="px-6 py-4 border-t border-gray-200 text-center">
          <button 
            onClick={() => router.push('/assignments')}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            View All Assignments →
          </button>
        </div>
      )}
    </div>
  );
}