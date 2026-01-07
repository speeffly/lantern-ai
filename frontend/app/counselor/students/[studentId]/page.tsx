'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface StudentDetails {
  student: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
  };
  profile: any;
  assessmentSessions: any[];
  careerRecommendations: any[];
  actionPlans: any[];
  notes: CounselorNote[];
  assignments: StudentAssignment[];
}

interface CounselorNote {
  id: number;
  student_id: number;
  counselor_id: number;
  note_type: string;
  title: string;
  content: string;
  is_shared_with_parent: boolean;
  created_at: string;
  updated_at: string;
}

interface StudentAssignment {
  id: number;
  counselor_id: number;
  student_id: number;
  assignment_type: string;
  title: string;
  description: string;
  due_date?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export default function StudentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const studentId = params.studentId as string;
  
  const [isLoading, setIsLoading] = useState(true);
  const [studentDetails, setStudentDetails] = useState<StudentDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'notes' | 'assignments'>('overview');
  
  // Note creation state
  const [showCreateNote, setShowCreateNote] = useState(false);
  const [noteForm, setNoteForm] = useState({
    noteType: 'general',
    title: '',
    content: '',
    isSharedWithParent: false
  });
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  
  // Assignment creation state
  const [showCreateAssignment, setShowCreateAssignment] = useState(false);
  const [assignmentForm, setAssignmentForm] = useState({
    assignmentType: 'assessment',
    title: '',
    description: '',
    dueDate: ''
  });
  const [isCreatingAssignment, setIsCreatingAssignment] = useState(false);

  useEffect(() => {
    if (studentId) {
      loadStudentDetails();
    }
  }, [studentId]);

  const loadStudentDetails = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const detailsUrl = `${apiUrl}/api/counselor/students/${studentId}`;
      
      console.log('📡 Loading student details from:', detailsUrl);

      const response = await fetch(detailsUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      console.log('👤 Student details response:', data);
      
      if (data.success) {
        setStudentDetails(data.data);
      } else {
        setError(data.error || 'Failed to load student details');
      }
    } catch (error) {
      console.error('❌ Error loading student details:', error);
      setError('Failed to load student details');
    } finally {
      setIsLoading(false);
    }
  };

  const createNote = async () => {
    if (!noteForm.title.trim() || !noteForm.content.trim()) return;
    
    setIsCreatingNote(true);
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const createNoteUrl = `${apiUrl}/api/counselor/students/${studentId}/notes`;
      
      console.log('📝 Creating note for student:', studentId);

      const response = await fetch(createNoteUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(noteForm)
      });

      const data = await response.json();
      console.log('📝 Create note response:', data);
      
      if (data.success) {
        setNoteForm({
          noteType: 'general',
          title: '',
          content: '',
          isSharedWithParent: false
        });
        setShowCreateNote(false);
        // Reload student details
        await loadStudentDetails();
      } else {
        setError(data.error || 'Failed to create note');
      }
    } catch (error) {
      console.error('❌ Error creating note:', error);
      setError('Failed to create note');
    } finally {
      setIsCreatingNote(false);
    }
  };

  const createAssignment = async () => {
    if (!assignmentForm.title.trim() || !assignmentForm.description.trim()) return;
    
    setIsCreatingAssignment(true);
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const createAssignmentUrl = `${apiUrl}/api/counselor/students/${studentId}/assignments`;
      
      console.log('📋 Creating assignment for student:', studentId);

      const response = await fetch(createAssignmentUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...assignmentForm,
          dueDate: assignmentForm.dueDate || undefined
        })
      });

      const data = await response.json();
      console.log('📋 Create assignment response:', data);
      
      if (data.success) {
        setAssignmentForm({
          assignmentType: 'assessment',
          title: '',
          description: '',
          dueDate: ''
        });
        setShowCreateAssignment(false);
        // Reload student details
        await loadStudentDetails();
      } else {
        setError(data.error || 'Failed to create assignment');
      }
    } catch (error) {
      console.error('❌ Error creating assignment:', error);
      setError('Failed to create assignment');
    } finally {
      setIsCreatingAssignment(false);
    }
  };

  const formatDate = (dateString: string) => {
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading student details...</div>
      </div>
    );
  }

  if (error || !studentDetails) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-red-600 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Student</h2>
            <p className="text-gray-600 mb-6">{error || 'Student not found'}</p>
            <Link
              href="/counselor/students"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Students
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link href="/counselor/students" className="text-blue-600 hover:text-blue-800">
                ← Back to Students
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {studentDetails.student.first_name} {studentDetails.student.last_name}
                </h1>
                <p className="text-gray-600">{studentDetails.student.email}</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowCreateNote(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Add Note
              </button>
              <button
                onClick={() => setShowCreateAssignment(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Assignment
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'notes'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Notes ({studentDetails.notes.length})
            </button>
            <button
              onClick={() => setActiveTab('assignments')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'assignments'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Assignments ({studentDetails.assignments.length})
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Assessment Status */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Assessment Status</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Completed Assessments:</span>
                  <span className="font-medium">{studentDetails.assessmentSessions.length}</span>
                </div>
                {studentDetails.assessmentSessions.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Assessment:</span>
                    <span className="font-medium">
                      {formatDate(studentDetails.assessmentSessions[0].completed_at)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Career Recommendations */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Career Recommendations</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Career Plans:</span>
                  <span className="font-medium">{studentDetails.careerRecommendations.length}</span>
                </div>
                {studentDetails.careerRecommendations.length > 0 && (
                  <div>
                    <span className="text-gray-600">Top Career:</span>
                    <div className="mt-1">
                      {studentDetails.careerRecommendations[0].career_matches?.[0]?.career?.title || 'N/A'}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Plans */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Action Plans</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Active Plans:</span>
                  <span className="font-medium">{studentDetails.actionPlans.length}</span>
                </div>
                {studentDetails.actionPlans.map((plan, index) => (
                  <div key={plan.id} className="border-t pt-3">
                    <div className="font-medium">{plan.career_title}</div>
                    <div className="text-sm text-gray-600">
                      Created: {formatDate(plan.created_at)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Student Profile */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Profile</h3>
              {studentDetails.profile ? (
                <div className="space-y-3">
                  {studentDetails.profile.grade && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Grade:</span>
                      <span className="font-medium">{studentDetails.profile.grade}</span>
                    </div>
                  )}
                  {studentDetails.profile.zip_code && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">ZIP Code:</span>
                      <span className="font-medium">{studentDetails.profile.zip_code}</span>
                    </div>
                  )}
                  {studentDetails.profile.school_name && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">School:</span>
                      <span className="font-medium">{studentDetails.profile.school_name}</span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">No profile information available</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="space-y-6">
            {studentDetails.notes.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-gray-500 mb-4">No notes yet for this student</p>
                <button
                  onClick={() => setShowCreateNote(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Add First Note
                </button>
              </div>
            ) : (
              studentDetails.notes.map((note) => (
                <div key={note.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">{note.title}</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="capitalize">{note.note_type.replace('_', ' ')}</span>
                        <span>{formatDate(note.created_at)}</span>
                        {note.is_shared_with_parent && (
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                            Shared with Parent
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-gray-700 whitespace-pre-wrap">{note.content}</div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'assignments' && (
          <div className="space-y-6">
            {studentDetails.assignments.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-gray-500 mb-4">No assignments yet for this student</p>
                <button
                  onClick={() => setShowCreateAssignment(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create First Assignment
                </button>
              </div>
            ) : (
              studentDetails.assignments.map((assignment) => (
                <div key={assignment.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">{assignment.title}</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="capitalize">{assignment.assignment_type.replace('_', ' ')}</span>
                        <span>Created: {formatDate(assignment.created_at)}</span>
                        {assignment.due_date && (
                          <span>Due: {formatDate(assignment.due_date)}</span>
                        )}
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(assignment.status)}`}>
                      {assignment.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-gray-700 whitespace-pre-wrap">{assignment.description}</div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Create Note Modal */}
      {showCreateNote && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create Note</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Note Type</label>
                  <select
                    value={noteForm.noteType}
                    onChange={(e) => setNoteForm({...noteForm, noteType: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="general">General</option>
                    <option value="career_guidance">Career Guidance</option>
                    <option value="academic">Academic</option>
                    <option value="personal">Personal</option>
                    <option value="parent_communication">Parent Communication</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={noteForm.title}
                    onChange={(e) => setNoteForm({...noteForm, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Note title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                  <textarea
                    value={noteForm.content}
                    onChange={(e) => setNoteForm({...noteForm, content: e.target.value})}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Note content"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="shareWithParent"
                    checked={noteForm.isSharedWithParent}
                    onChange={(e) => setNoteForm({...noteForm, isSharedWithParent: e.target.checked})}
                    className="mr-2"
                  />
                  <label htmlFor="shareWithParent" className="text-sm text-gray-700">
                    Share with parent
                  </label>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowCreateNote(false);
                    setNoteForm({
                      noteType: 'general',
                      title: '',
                      content: '',
                      isSharedWithParent: false
                    });
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                  disabled={isCreatingNote}
                >
                  Cancel
                </button>
                <button
                  onClick={createNote}
                  disabled={isCreatingNote || !noteForm.title.trim() || !noteForm.content.trim()}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreatingNote ? 'Creating...' : 'Create Note'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Assignment Modal */}
      {showCreateAssignment && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create Assignment</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Assignment Type</label>
                  <select
                    value={assignmentForm.assignmentType}
                    onChange={(e) => setAssignmentForm({...assignmentForm, assignmentType: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="assessment">Assessment</option>
                    <option value="career_research">Career Research</option>
                    <option value="skill_development">Skill Development</option>
                    <option value="course_planning">Course Planning</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={assignmentForm.title}
                    onChange={(e) => setAssignmentForm({...assignmentForm, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Assignment title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={assignmentForm.description}
                    onChange={(e) => setAssignmentForm({...assignmentForm, description: e.target.value})}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Assignment description"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Due Date (Optional)</label>
                  <input
                    type="date"
                    value={assignmentForm.dueDate}
                    onChange={(e) => setAssignmentForm({...assignmentForm, dueDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowCreateAssignment(false);
                    setAssignmentForm({
                      assignmentType: 'assessment',
                      title: '',
                      description: '',
                      dueDate: ''
                    });
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                  disabled={isCreatingAssignment}
                >
                  Cancel
                </button>
                <button
                  onClick={createAssignment}
                  disabled={isCreatingAssignment || !assignmentForm.title.trim() || !assignmentForm.description.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreatingAssignment ? 'Creating...' : 'Create Assignment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}