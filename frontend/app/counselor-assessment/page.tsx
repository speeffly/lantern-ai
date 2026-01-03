'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '../components/Header';

interface CounselorQuestion {
  id: string;
  order: number;
  text: string;
  type: string;
  category: string;
  options?: string[];
  fields?: {
    [key: string]: {
      type: string;
      options?: string[];
      placeholder?: string;
      maxLength?: number;
      required?: boolean;
    };
  };
  placeholder?: string;
  minLength?: number;
  maxLength?: number;
  required?: boolean;
  hasOtherOption?: boolean;
  otherPlaceholder?: string;
}

interface CounselorAssessmentResponse {
  grade?: number;
  zipCode?: string;
  workEnvironment?: string;
  handsOnPreference?: string;
  problemSolving?: string;
  helpingOthers?: string;
  educationCommitment?: string;
  incomeImportance?: string;
  jobSecurity?: string;
  subjectsStrengths?: string[];
  interestsPassions?: string;
  workExperience?: string;
  academicPerformance?: {
    inputMethod?: string;
    gradesText?: string;
    transcriptFile?: File | null;
  };
  legacyImpact?: string;
  personalTraits?: {
    selected?: string[];
    other?: string;
  };
  inspirationRoleModels?: string;
}

export default function CounselorAssessmentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <Header title="Enhanced Career Assessment" />
        <div className="flex items-center justify-center pt-20">
          <div className="text-xl">Loading assessment...</div>
        </div>
      </div>
    }>
      <CounselorAssessmentContent />
    </Suspense>
  );
}

function CounselorAssessmentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [questions, setQuestions] = useState<CounselorQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<CounselorAssessmentResponse>({});
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: any }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previousResults, setPreviousResults] = useState<any>(null);
  const [showPreviousResults, setShowPreviousResults] = useState(false);
  const [hasRestoredAnswers, setHasRestoredAnswers] = useState(false);
  const ANSWER_STORAGE_KEY = 'counselorAssessmentAnswers';
  const ANSWER_STALE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
  const forceRetake = searchParams.get('retake') === 'true';

  useEffect(() => {
    checkForPreviousResults();
  }, []);

  // Reapply stored answers once questions are loaded to avoid race conditions on first render
  useEffect(() => {
    if (!hasRestoredAnswers && !isLoading && questions.length > 0) {
      const storedAnswers = loadStoredAnswers();
      if (storedAnswers) {
        console.log('✅ Reapplying stored answers after questions loaded');
        setSelectedAnswers(prev => ({
          ...storedAnswers.selectedAnswers,
          ...prev
        }));
        setResponses(prev => ({
          ...storedAnswers.responses,
          ...prev
        }));
      }
      setHasRestoredAnswers(true);
    }
  }, [hasRestoredAnswers, isLoading, questions.length]);

  const serializeWithoutFiles = (data: any) => {
    try {
      return JSON.parse(JSON.stringify(data, (_key, value) => {
        if (typeof File !== 'undefined' && value instanceof File) {
          return { name: value.name, size: value.size, type: value.type };
        }
        return value;
      }));
    } catch (error) {
      console.error('❌ Failed to serialize assessment answers:', error);
      return null;
    }
  };

  const loadStoredAnswers = () => {
    try {
      const raw = localStorage.getItem(ANSWER_STORAGE_KEY);
      if (!raw) return null;

      const stored = JSON.parse(raw);
      const storedUser = localStorage.getItem('user');
      const user = storedUser ? JSON.parse(storedUser) : null;
      const isRecent = stored.timestamp && new Date(stored.timestamp).getTime() > Date.now() - ANSWER_STALE_MS;
      const userMatches = !stored.userEmail || !user?.email || stored.userEmail === user.email;

      if (!isRecent || !userMatches) {
        return null;
      }

      return {
        selectedAnswers: stored.selectedAnswers || {},
        responses: stored.responses || {}
      };
    } catch (error) {
      console.error('❌ Error loading stored assessment answers:', error);
      return null;
    }
  };

  const saveStoredAnswers = (finalResponses: CounselorAssessmentResponse) => {
    try {
      const sanitizedResponses = serializeWithoutFiles(finalResponses);
      const sanitizedSelectedAnswers = serializeWithoutFiles(selectedAnswers);
      if (!sanitizedResponses || !sanitizedSelectedAnswers) return;

      const storedUser = localStorage.getItem('user');
      const user = storedUser ? JSON.parse(storedUser) : null;

      localStorage.setItem(ANSWER_STORAGE_KEY, JSON.stringify({
        timestamp: new Date().toISOString(),
        userEmail: user?.email || null,
        responses: sanitizedResponses,
        selectedAnswers: sanitizedSelectedAnswers
      }));
    } catch (error) {
      console.error('❌ Error saving assessment answers for retake:', error);
    }
  };

  const checkForPreviousResults = async () => {
    console.log('🔍 Checking for previous results...');
    
    if (forceRetake) {
      console.log('↩️ Retake requested via URL, skipping previous results view');
      fetchQuestions();
      return;
    }
    
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('❌ No token found, proceeding with normal assessment');
      fetchQuestions();
      return;
    }

    try {
      // Check for previous results in localStorage first (faster and more reliable)
      const storedResults = localStorage.getItem('counselorAssessmentResults');
      const storedUser = localStorage.getItem('user');
      
      console.log('📦 Stored results found:', !!storedResults);
      console.log('👤 Stored user found:', !!storedUser);
      
      if (storedResults && storedUser) {
        console.log('✅ Found previous assessment results in localStorage');
        const results = JSON.parse(storedResults);
        const user = JSON.parse(storedUser);
        
        console.log('📊 Results data:', {
          hasRecommendations: !!results.recommendations,
          hasSummary: !!results.summary,
          timestamp: results.timestamp,
          userEmail: results.userEmail
        });
        
        // Check if results are recent (within last 30 days) and belong to current user
        const resultDate = new Date(results.timestamp || 0);
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        
        console.log('📅 Result date:', resultDate);
        console.log('📅 Thirty days ago:', thirtyDaysAgo);
        console.log('📅 Is recent:', resultDate > thirtyDaysAgo);
        console.log('👤 User match:', results.userEmail === user.email || !results.userEmail);
        
        if (resultDate > thirtyDaysAgo && (results.userEmail === user.email || !results.userEmail)) {
          console.log('✅ Showing previous results');
          setPreviousResults(results);
          setShowPreviousResults(true);
          setIsLoading(false);
          return;
        } else {
          console.log('⚠️ Results are old or belong to different user, removing them');
          localStorage.removeItem('counselorAssessmentResults');
        }
      }

      console.log('📡 No valid localStorage results, checking server...');
      // Try to fetch from server if available (this is optional)
      // For now, just proceed with normal assessment since localStorage is more reliable
      fetchQuestions();
      
    } catch (error) {
      console.error('❌ Error checking previous results:', error);
      fetchQuestions();
    }
  };

  const fetchPreviousResults = async (sessionId: number) => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      
      const response = await fetch(`${apiUrl}/api/counselor-assessment/results/${sessionId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Previous results fetched:', data);
        
        if (data.success && data.data.recommendations) {
          setPreviousResults(data.data.recommendations);
          setShowPreviousResults(true);
          setIsLoading(false);
          return;
        }
      }
      
      // Failed to fetch results, proceed with normal assessment
      fetchQuestions();
    } catch (error) {
      console.error('Error fetching previous results:', error);
      fetchQuestions();
    }
  };

  const startNewAssessment = () => {
    console.log('Starting new assessment...');
    setShowPreviousResults(false);
    setPreviousResults(null);
    setCurrentIndex(0);
    setResponses({});
    setSelectedAnswers({});
    setHasRestoredAnswers(false);
    setIsLoading(true);
    // Clear old results from localStorage
    localStorage.removeItem('counselorAssessmentResults');
    fetchQuestions();
  };

  const fetchQuestions = async () => {
    console.log('🔄 fetchQuestions called');
    setIsLoading(true);
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      console.log('Fetching counselor questions from:', `${apiUrl}/api/counselor-assessment/questions`);
      
      // Include authentication token if available
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('🔑 Using authentication token');
      } else {
        console.log('🔓 No authentication token found');
      }
      
      const response = await fetch(`${apiUrl}/api/counselor-assessment/questions`, {
        headers
      });
      
      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📦 Received questions data:', data);
      
      if (data.success) {
        console.log('✅ API call successful');
        console.log('📊 Number of questions received:', data.data.questions?.length || 0);
        console.log('🔍 Questions structure:', data.data);
        
        const storedAnswers = loadStoredAnswers();
        let initialSelectedAnswers = storedAnswers?.selectedAnswers || {};
        let initialResponses = storedAnswers?.responses || {};

        // Handle prefilled data for authenticated users
        if (data.data.prefilledData) {
          console.log('📝 Prefilled data received:', data.data.prefilledData);
          setResponses(prev => ({
            ...prev,
            ...data.data.prefilledData
          }));
          initialResponses = {
            ...initialResponses,
            grade: initialResponses.grade || data.data.prefilledData.grade,
            zipCode: initialResponses.zipCode || data.data.prefilledData.zipCode
          };
          if (!initialSelectedAnswers.location_grade && (data.data.prefilledData.grade || data.data.prefilledData.zipCode)) {
            initialSelectedAnswers = {
              ...initialSelectedAnswers,
              location_grade: {
                ...(data.data.prefilledData.grade ? { grade: data.data.prefilledData.grade } : {}),
                ...(data.data.prefilledData.zipCode ? { zipCode: data.data.prefilledData.zipCode } : {})
              }
            };
          }
          
          // Show a notification about auto-filled data
          if (data.data.prefilledData.grade && data.data.prefilledData.zipCode) {
            console.log('📝 First question skipped - using profile data');
          }
        }
        
        // Show authentication status
        if (data.data.isAuthenticated) {
          console.log(`✅ User authenticated as: ${data.data.userRole}`);
          if (data.data.prefilledData?.grade && data.data.prefilledData?.zipCode) {
            console.log('📝 First question skipped - using profile data');
          }
        }
        
        // Make sure we have questions
        if (data.data.questions && data.data.questions.length > 0) {
          console.log('📋 Setting questions array with', data.data.questions.length, 'questions');
          const sortedQuestions = data.data.questions.sort((a: CounselorQuestion, b: CounselorQuestion) => a.order - b.order);
          console.log('📋 First question:', sortedQuestions[0]);
          setQuestions(sortedQuestions);
          setCurrentIndex(0); // Reset to first question
          if (Object.keys(initialSelectedAnswers).length > 0) {
            console.log('✅ Restoring previous answers for retake');
            setSelectedAnswers(initialSelectedAnswers);
            setResponses(prev => ({
              ...prev,
              ...initialResponses
            }));
          }
          setIsLoading(false);
          console.log('✅ Questions loaded successfully');
        } else {
          console.error('❌ No questions in response');
          throw new Error('No questions received from server');
        }
      } else {
        console.error('❌ API call failed:', data.error);
        throw new Error(data.error || 'Failed to load questions');
      }
    } catch (error) {
      console.error('❌ Error fetching counselor questions:', error);
      
      // Fallback to demo questions if API fails
      console.log('Falling back to demo questions...');
      const demoQuestions: CounselorQuestion[] = [
        {
          id: "1",
          order: 1,
          text: "What is the student's current grade level and ZIP code?",
          type: "combined",
          category: "basic_info",
          fields: {
            grade: {
              type: "select",
              options: ["9", "10", "11", "12"],
              required: true
            },
            zipCode: {
              type: "text",
              placeholder: "Enter ZIP code",
              maxLength: 5,
              required: true
            }
          }
        },
        {
          id: "2",
          order: 2,
          text: "What are the student's main interests and hobbies?",
          type: "free_text",
          category: "interests",
          placeholder: "Describe the student's interests, hobbies, and activities they enjoy...",
          minLength: 20,
          maxLength: 500
        }
      ];
      
      setQuestions(demoQuestions);
      setIsLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string, value: any) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleNext = () => {
    const currentQuestion = questions[currentIndex];
    const currentAnswer = selectedAnswers[currentQuestion.id];

    // Check if question is optional
    const isOptional = currentQuestion.required === false;

    // Validate required answers
    if (currentQuestion.type === 'combined') {
      if (!currentAnswer?.grade || !currentAnswer?.zipCode) {
        alert('Please fill in both grade and ZIP code');
        return;
      }
    } else if (currentQuestion.type === 'combined_input') {
      // For combined_input (academic performance), it's optional
      const inputMethod = currentAnswer?.inputMethod;
      if (inputMethod === 'Type grades manually') {
        const gradesText = currentAnswer?.gradesText?.trim();
        if (!gradesText) {
          alert('Please enter your grades or select a different option');
          return;
        }
      } else if (inputMethod === 'Upload transcript file') {
        if (!currentAnswer?.transcriptFile) {
          alert('Please upload a transcript file or select a different option');
          return;
        }
      }
      // If inputMethod is 'skip' or empty, that's fine for optional questions
    } else if (currentQuestion.type === 'multiple_choice') {
      if (!isOptional && (!currentAnswer || currentAnswer.length === 0)) {
        alert('Please select at least one option');
        return;
      }
    } else if (currentQuestion.type === 'multiple_choice_with_other') {
      const selectedOptions = currentAnswer?.selected || [];
      const otherText = currentAnswer?.other || '';
      
      if (!isOptional && selectedOptions.length === 0 && !otherText.trim()) {
        alert('Please select at least one trait or describe your own');
        return;
      }
    } else if (currentQuestion.type === 'free_text') {
      const minLength = currentQuestion.minLength || 10;
      // For optional questions, allow empty answers or answers that meet minimum length
      if (!isOptional && (!currentAnswer || currentAnswer.length < minLength)) {
        alert(`Please provide a more detailed response. You need at least ${minLength} characters (currently ${(currentAnswer || '').length}). Be specific!`);
        return;
      }
      // For optional questions, if they start typing, they should meet minimum length (unless minLength is 0)
      if (isOptional && currentAnswer && minLength > 0 && currentAnswer.length < minLength) {
        alert(`If you choose to answer this optional question, please provide at least ${minLength} characters (currently ${currentAnswer.length}). You can also skip this question.`);
        return;
      }
    } else {
      if (!isOptional && !currentAnswer) {
        alert('Please select an answer');
        return;
      }
    }

    // Update responses based on question type
    const newResponses = { ...responses };
    
    if (currentQuestion.id === 'location_grade') {
      newResponses.grade = parseInt(currentAnswer.grade);
      newResponses.zipCode = currentAnswer.zipCode;
    } else if (currentQuestion.id === 'work_environment') {
      newResponses.workEnvironment = currentAnswer;
    } else if (currentQuestion.id === 'hands_on_preference') {
      newResponses.handsOnPreference = currentAnswer;
    } else if (currentQuestion.id === 'problem_solving') {
      newResponses.problemSolving = currentAnswer;
    } else if (currentQuestion.id === 'helping_others') {
      newResponses.helpingOthers = currentAnswer;
    } else if (currentQuestion.id === 'education_commitment') {
      newResponses.educationCommitment = currentAnswer;
    } else if (currentQuestion.id === 'income_importance') {
      newResponses.incomeImportance = currentAnswer;
    } else if (currentQuestion.id === 'job_security') {
      newResponses.jobSecurity = currentAnswer;
    } else if (currentQuestion.id === 'subjects_strengths') {
      newResponses.subjectsStrengths = Array.isArray(currentAnswer) ? currentAnswer : [currentAnswer];
    } else if (currentQuestion.id === 'interests_passions') {
      newResponses.interestsPassions = currentAnswer;
    } else if (currentQuestion.id === 'work_experience') {
      newResponses.workExperience = currentAnswer;
    } else if (currentQuestion.id === 'academic_performance') {
      newResponses.academicPerformance = currentAnswer;
    } else if (currentQuestion.id === 'legacy_impact') {
      newResponses.legacyImpact = currentAnswer;
    } else if (currentQuestion.id === 'personal_traits') {
      newResponses.personalTraits = currentAnswer;
    } else if (currentQuestion.id === 'inspiration_role_models') {
      newResponses.inspirationRoleModels = currentAnswer;
    }

    setResponses(newResponses);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      handleSubmit(newResponses);
    }
  };

  const handleSubmit = async (finalResponses: CounselorAssessmentResponse) => {
    setIsSubmitting(true);

    try {
      const sessionId = localStorage.getItem('sessionId');
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');

      // Check if there's a file to upload
      const hasFile = finalResponses.academicPerformance?.transcriptFile;
      
      let response;
      
      if (hasFile) {
        // Use FormData for file upload
        const formData = new FormData();
        formData.append('sessionId', sessionId || '');
        formData.append('userId', userId || '');
        formData.append('responses', JSON.stringify({
          ...finalResponses,
          academicPerformance: {
            ...finalResponses.academicPerformance,
            transcriptFile: null // Remove file from JSON, it's in FormData
          }
        }));
        
        // Only append transcript file if academicPerformance exists and has a transcriptFile
        if (finalResponses.academicPerformance?.transcriptFile) {
          formData.append('transcriptFile', finalResponses.academicPerformance.transcriptFile);
        }

        response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/counselor-assessment/submit`, {
          method: 'POST',
          headers: { 
            ...(token && { 'Authorization': `Bearer ${token}` })
            // Don't set Content-Type for FormData, browser will set it with boundary
          },
          body: formData
        });
      } else {
        // Regular JSON submission
        response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/counselor-assessment/submit`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
          },
          body: JSON.stringify({ 
            sessionId, 
            responses: finalResponses,
            userId: userId ? parseInt(userId) : null
          })
        });
      }

      const data = await response.json();
      if (data.success) {
        // Store results for the results page with timestamp
        const storedUser = localStorage.getItem('user');
        const user = storedUser ? JSON.parse(storedUser) : null;
        
        const resultsWithTimestamp = {
          ...data.data,
          timestamp: new Date().toISOString(),
          userEmail: user?.email || 'unknown'
        };
        localStorage.setItem('counselorAssessmentResults', JSON.stringify(resultsWithTimestamp));
        localStorage.setItem('zipCode', finalResponses.zipCode || '');
        saveStoredAnswers(finalResponses);
        
        // Navigate to enhanced results page
        router.push('/counselor-results');
      } else {
        alert('Failed to submit assessment: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error submitting counselor assessment:', error);
      alert('Failed to submit assessment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderQuestionInput = (question: CounselorQuestion) => {
    const currentAnswer = selectedAnswers[question.id];

    if (question.type === 'combined' && question.fields) {
      return (
        <div className="space-y-4">
          {Object.entries(question.fields).map(([fieldName, fieldConfig]) => (
            <div key={fieldName}>
              <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                {fieldName.replace(/([A-Z])/g, ' $1').trim()}
              </label>
              {fieldConfig.type === 'select' ? (
                <select
                  value={currentAnswer?.[fieldName] || ''}
                  onChange={(e) => handleAnswerChange(question.id, {
                    ...currentAnswer,
                    [fieldName]: e.target.value
                  })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  required={fieldConfig.required}
                >
                  <option value="">Select {fieldName}</option>
                  {fieldConfig.options?.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={currentAnswer?.[fieldName] || ''}
                  onChange={(e) => handleAnswerChange(question.id, {
                    ...currentAnswer,
                    [fieldName]: e.target.value
                  })}
                  placeholder={fieldConfig.placeholder}
                  maxLength={fieldConfig.maxLength}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  required={fieldConfig.required}
                />
              )}
            </div>
          ))}
        </div>
      );
    }

    if (question.type === 'single_choice') {
      return (
        <div className="space-y-3">
          {question.options?.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerChange(question.id, option)}
              className={`w-full text-left px-6 py-4 rounded-lg border-2 transition-all ${
                currentAnswer === option
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      );
    }

    if (question.type === 'multiple_choice') {
      return (
        <div className="space-y-3">
          {question.options?.map((option, index) => (
            <label key={index} className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50">
              <input
                type="checkbox"
                checked={Array.isArray(currentAnswer) ? currentAnswer.includes(option) : false}
                onChange={(e) => {
                  const currentArray = Array.isArray(currentAnswer) ? currentAnswer : [];
                  if (e.target.checked) {
                    handleAnswerChange(question.id, [...currentArray, option]);
                  } else {
                    handleAnswerChange(question.id, currentArray.filter(item => item !== option));
                  }
                }}
                className="w-4 h-4 text-blue-600"
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      );
    }

    if (question.type === 'multiple_choice_with_other') {
      const currentAnswer = selectedAnswers[question.id] || { selected: [], other: '' };
      const selectedOptions = Array.isArray(currentAnswer.selected) ? currentAnswer.selected : [];
      const otherText = currentAnswer.other || '';

      return (
        <div className="space-y-4">
          {/* Predefined options */}
          <div className="space-y-3">
            {question.options?.map((option, index) => (
              <label key={index} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedOptions.includes(option)}
                  onChange={(e) => {
                    const newSelected = e.target.checked
                      ? [...selectedOptions, option]
                      : selectedOptions.filter((item: string) => item !== option);
                    
                    handleAnswerChange(question.id, {
                      ...currentAnswer,
                      selected: newSelected
                    });
                  }}
                  className="w-4 h-4 text-blue-600"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>

          {/* Other option */}
          {question.hasOtherOption && (
            <div className="border-t pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Other traits (describe in your own words):
              </label>
              <textarea
                value={otherText}
                onChange={(e) => {
                  handleAnswerChange(question.id, {
                    ...currentAnswer,
                    other: e.target.value
                  });
                }}
                placeholder={question.otherPlaceholder || "Describe other traits..."}
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg resize-none focus:border-blue-500 focus:outline-none"
              />
              <div className="text-sm text-gray-500 mt-1">
                {otherText.length} characters
              </div>
            </div>
          )}
        </div>
      );
    }

    if (question.type === 'combined_input' && question.fields) {
      const currentAnswer = selectedAnswers[question.id] || {};
      const inputMethod = currentAnswer.inputMethod || '';
      
      return (
        <div className="space-y-6">
          {/* Input method selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              How would you like to share your academic information?
            </label>
            <div className="space-y-2">
              {question.fields.inputMethod?.options?.map((option, index) => (
                <label key={index} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name={`${question.id}_method`}
                    value={option}
                    checked={inputMethod === option}
                    onChange={(e) => {
                      const newValue = {
                        ...selectedAnswers[question.id],
                        inputMethod: e.target.value,
                        // Clear the other field when switching methods
                        gradesText: e.target.value === 'Type grades manually' ? (selectedAnswers[question.id]?.gradesText || '') : '',
                        transcriptFile: e.target.value === 'Upload transcript file' ? (selectedAnswers[question.id]?.transcriptFile || null) : null
                      };
                      handleAnswerChange(question.id, newValue);
                    }}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Text input for manual entry */}
          {inputMethod === 'Type grades manually' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter your grades or academic performance:
              </label>
              <textarea
                value={currentAnswer.gradesText || ''}
                onChange={(e) => {
                  const newValue = {
                    ...selectedAnswers[question.id],
                    gradesText: e.target.value
                  };
                  handleAnswerChange(question.id, newValue);
                }}
                placeholder={question.fields?.gradesText?.placeholder}
                maxLength={question.fields?.gradesText?.maxLength}
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg resize-none focus:border-blue-500 focus:outline-none"
              />
              <div className="text-sm text-gray-500 mt-1">
                {(currentAnswer.gradesText || '').length} / {question.fields?.gradesText?.maxLength || 500} characters
              </div>
            </div>
          )}

          {/* File upload for transcript */}
          {inputMethod === 'Upload transcript file' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload your transcript (PDF or CSV format):
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <input
                  type="file"
                  accept=".pdf,.csv"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    const newValue = {
                      ...selectedAnswers[question.id],
                      transcriptFile: file
                    };
                    handleAnswerChange(question.id, newValue);
                  }}
                  className="hidden"
                  id={`file-upload-${question.id}`}
                />
                <label htmlFor={`file-upload-${question.id}`} className="cursor-pointer">
                  <div className="space-y-2">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="text-gray-600">
                      <span className="font-medium text-blue-600 hover:text-blue-500">Click to upload</span> or drag and drop
                    </div>
                    <p className="text-sm text-gray-500">PDF or CSV files only</p>
                  </div>
                </label>
                {currentAnswer.transcriptFile && (
                  <div className="mt-3 text-sm text-green-600">
                    ✅ File selected: {currentAnswer.transcriptFile.name}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Skip option */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                handleAnswerChange(question.id, { inputMethod: 'skip' });
              }}
              className="text-gray-500 hover:text-gray-700 text-sm underline"
            >
              Skip this question
            </button>
          </div>
        </div>
      );
    }

    if (question.type === 'free_text') {
      const currentLength = (currentAnswer || '').length;
      const minLength = question.minLength || 10;
      const maxLength = question.maxLength || 500;
      const isValid = currentLength >= minLength;
      
      return (
        <div>
          <textarea
            value={currentAnswer || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder={question.placeholder}
            rows={6}
            maxLength={maxLength}
            className={`w-full px-4 py-3 border-2 rounded-lg resize-none transition-colors ${
              currentLength > 0 
                ? isValid 
                  ? 'border-green-300 focus:border-green-500' 
                  : 'border-yellow-300 focus:border-yellow-500'
                : 'border-gray-300 focus:border-blue-500'
            }`}
          />
          <div className="flex justify-between items-center mt-2">
            <div className={`text-sm font-medium ${
              currentLength === 0 
                ? 'text-gray-500'
                : isValid 
                  ? 'text-green-600' 
                  : 'text-yellow-600'
            }`}>
              {currentLength === 0 && (
                <span>
                  {question.required === false 
                    ? `💡 Optional: Share your ${question.category === 'academics' ? 'grades/academic performance' : 'interests and hobbies'} (minimum ${minLength} characters if you choose to answer)`
                    : `💡 Please share your interests and hobbies (minimum ${minLength} characters)`
                  }
                </span>
              )}
              {currentLength > 0 && !isValid && minLength > 0 && (
                <span>📝 Keep writing... {minLength - currentLength} more characters needed</span>
              )}
              {(isValid || (question.required === false && minLength === 0)) && (
                <span>✅ {question.required === false ? 'You can skip this or continue to the next question' : 'Great! You can proceed to the next question'}</span>
              )}
            </div>
            <div className={`text-sm ${
              currentLength > maxLength * 0.9 ? 'text-red-500' : 'text-gray-500'
            }`}>
              {currentLength} / {maxLength}
            </div>
          </div>
          {!isValid && currentLength > 0 && (
            <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Tip:</strong> Be specific about what you enjoy! For example: "I love working on cars with my dad, I'm fascinated by how the human body works, I enjoy helping younger kids with their homework..."
              </p>
            </div>
          )}
        </div>
      );
    }

    return (
      <div>
        <p className="text-red-600">
          Error: Unknown question type "{question.type}". Please contact support.
        </p>
        <pre className="text-xs text-gray-500 mt-2">
          {JSON.stringify(question, null, 2)}
        </pre>
      </div>
    );
  };

  if (isLoading || (questions.length === 0 && !showPreviousResults)) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Enhanced Career Assessment" />
        <div className="flex items-center justify-center pt-20">
          <div className="text-xl">Loading enhanced assessment...</div>
        </div>
      </div>
    );
  }

  if (isSubmitting) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Enhanced Career Assessment" />
        <div className="flex items-center justify-center pt-20">
          <div className="text-center">
            <div className="text-xl mb-4">Generating Your Personalized Career Plan...</div>
            <div className="text-gray-600">This may take a moment as we analyze your responses and create detailed recommendations.</div>
          </div>
        </div>
      </div>
    );
  }

  // Show previous results if available (must be before question rendering to avoid empty-question errors)
  if (showPreviousResults && previousResults) {
    const recommendations = previousResults.recommendations || previousResults;
    const summary = previousResults.summary;
    
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Your Previous Assessment Results" />
        <div className="py-12 px-4">
          <div className="max-w-4xl mx-auto">
            {/* Previous Results Header */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Welcome Back!</h1>
                  <p className="text-gray-600 mt-2">
                    You've already completed the enhanced career assessment. Here are your personalized results.
                  </p>
                  {previousResults.timestamp && (
                    <p className="text-sm text-gray-500 mt-1">
                      Completed on: {new Date(previousResults.timestamp).toLocaleDateString()}
                    </p>
                  )}
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-800 text-sm">
                      ✅ Your previous assessment results have been automatically loaded. You can view the full details or take a new assessment if your interests have changed.
                    </p>
                  </div>
                </div>
                <div className="flex space-x-4">
                  <button
                    onClick={() => router.push('/counselor-results')}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                  >
                    View Full Results
                  </button>
                  <button
                    onClick={startNewAssessment}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300"
                  >
                    Take New Assessment
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Summary */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-900">Top Career Match</h3>
                {recommendations?.topJobMatches && recommendations.topJobMatches[0] && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-medium text-blue-600">
                        {recommendations.topJobMatches[0].career.title}
                      </h4>
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                        {recommendations.topJobMatches[0].matchScore}% Match
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm">
                      {recommendations.topJobMatches[0].career.description}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>💰 ${recommendations.topJobMatches[0].career.averageSalary?.toLocaleString()}</span>
                      <span>🎓 {recommendations.topJobMatches[0].career.requiredEducation}</span>
                    </div>
                  </div>
                )}
                {summary && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-medium text-blue-600">
                        {summary.topCareer}
                      </h4>
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                        Top Match
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>💰 ${summary.averageSalary?.toLocaleString()}</span>
                      <span>🎓 {summary.educationPath}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Career Readiness:</span> 
                      <span className={`ml-2 capitalize ${
                        summary.careerReadiness === 'high' ? 'text-green-600' :
                        summary.careerReadiness === 'moderate' ? 'text-yellow-600' :
                        'text-blue-600'
                      }`}>
                        {summary.careerReadiness}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-900">Assessment Summary</h3>
                {summary && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Total Career Matches:</span>
                      <span className="font-medium">{summary.totalJobMatches}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Average Salary:</span>
                      <span className="font-medium">${summary.averageSalary?.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Education Path:</span>
                      <span className="font-medium text-sm">{summary.educationPath}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Career Readiness:</span>
                      <span className={`font-medium capitalize ${
                        summary.careerReadiness === 'high' ? 'text-green-600' :
                        summary.careerReadiness === 'moderate' ? 'text-yellow-600' :
                        'text-blue-600'
                      }`}>
                        {summary.careerReadiness}
                      </span>
                    </div>
                  </div>
                )}
                {recommendations?.studentProfile && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Grade Level:</span>
                      <span className="font-medium">{recommendations.studentProfile.grade}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Location:</span>
                      <span className="font-medium">{recommendations.studentProfile.location}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Key Strengths:</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {recommendations.studentProfile.strengths?.slice(0, 3).map((strength: string, index: number) => (
                          <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                            {strength}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Action Items */}
            {recommendations?.aiRecommendations?.actionItems && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-900">Next Steps for You</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {recommendations.aiRecommendations.actionItems.slice(0, 4).map((item: any, index: number) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{item.title}</h4>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          item.priority === 'high' ? 'bg-red-100 text-red-800' :
                          item.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {item.priority}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                      <p className="text-xs text-gray-500">⏰ {item.timeline}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Career Matches Preview */}
            {recommendations?.topJobMatches && (
              <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-900">Your Top Career Matches</h3>
                <div className="space-y-4">
                  {recommendations.topJobMatches.slice(0, 3).map((match: any, index: number) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{match.career.title}</h4>
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                          {match.matchScore}% Match
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{match.career.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>💰 ${match.career.averageSalary?.toLocaleString()}</span>
                        <span>🎓 {match.career.requiredEducation}</span>
                        <span>📈 {match.career.growthOutlook || 'Stable'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  // Safeguard: if currentIndex is out of bounds, reset it
  if (questions.length > 0 && (currentIndex < 0 || currentIndex >= questions.length)) {
    console.log('⚠️ currentIndex out of bounds, resetting to 0');
    setCurrentIndex(0);
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Enhanced Career Assessment" />
        <div className="flex items-center justify-center pt-20">
          <div className="text-xl">Resetting assessment...</div>
        </div>
      </div>
    );
  }

  // Debug info
  console.log('🔍 Debug info:');
  console.log('  - questions.length:', questions.length);
  console.log('  - currentIndex:', currentIndex);
  console.log('  - currentQuestion exists:', !!currentQuestion);
  console.log('  - isLoading:', isLoading);
  console.log('  - showPreviousResults:', showPreviousResults);

  if (!currentQuestion && !isLoading && !showPreviousResults) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Enhanced Career Assessment" />
        <div className="py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-red-600 mb-4">Error: No Question Found</h2>
              <p className="text-red-600 mb-4">
                Question index {currentIndex} not found. Total questions: {questions.length}
              </p>
              <div className="mb-4">
                <button
                  onClick={() => {
                    console.log('🔄 Retrying to fetch questions...');
                    setCurrentIndex(0);
                    setQuestions([]);
                    fetchQuestions();
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mr-4"
                >
                  Retry Loading Questions
                </button>
                <button
                  onClick={() => {
                    console.log('🏠 Going back to home...');
                    router.push('/');
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Go to Home
                </button>
              </div>
              <details className="mt-4">
                <summary className="cursor-pointer text-red-600">Show debug info</summary>
                <div className="text-xs text-red-500 mt-2 space-y-2">
                  <div>Questions length: {questions.length}</div>
                  <div>Current index: {currentIndex}</div>
                  <div>Is loading: {isLoading.toString()}</div>
                  <div>Show previous results: {showPreviousResults.toString()}</div>
                  <div>API URL: {process.env.NEXT_PUBLIC_API_URL}</div>
                  <div>Token exists: {!!localStorage.getItem('token')}</div>
                </div>
                <pre className="text-xs text-red-500 mt-2 overflow-auto max-h-40">
                  {JSON.stringify(questions, null, 2)}
                </pre>
              </details>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show previous results if available
  if (showPreviousResults && previousResults) {
    const recommendations = previousResults.recommendations || previousResults;
    const summary = previousResults.summary;
    
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Your Previous Assessment Results" />
        <div className="py-12 px-4">
          <div className="max-w-4xl mx-auto">
            {/* Previous Results Header */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Welcome Back!</h1>
                  <p className="text-gray-600 mt-2">
                    You've already completed the enhanced career assessment. Here are your personalized results.
                  </p>
                  {previousResults.timestamp && (
                    <p className="text-sm text-gray-500 mt-1">
                      Completed on: {new Date(previousResults.timestamp).toLocaleDateString()}
                    </p>
                  )}
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-800 text-sm">
                      ✅ Your previous assessment results have been automatically loaded. You can view the full details or take a new assessment if your interests have changed.
                    </p>
                  </div>
                </div>
                <div className="flex space-x-4">
                  <button
                    onClick={() => router.push('/counselor-results')}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                  >
                    View Full Results
                  </button>
                  <button
                    onClick={startNewAssessment}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300"
                  >
                    Take New Assessment
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Summary */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-900">Top Career Match</h3>
                {recommendations?.topJobMatches && recommendations.topJobMatches[0] && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-medium text-blue-600">
                        {recommendations.topJobMatches[0].career.title}
                      </h4>
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                        {recommendations.topJobMatches[0].matchScore}% Match
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm">
                      {recommendations.topJobMatches[0].career.description}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>💰 ${recommendations.topJobMatches[0].career.averageSalary?.toLocaleString()}</span>
                      <span>🎓 {recommendations.topJobMatches[0].career.requiredEducation}</span>
                    </div>
                  </div>
                )}
                {summary && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-medium text-blue-600">
                        {summary.topCareer}
                      </h4>
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                        Top Match
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>💰 ${summary.averageSalary?.toLocaleString()}</span>
                      <span>🎓 {summary.educationPath}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Career Readiness:</span> 
                      <span className={`ml-2 capitalize ${
                        summary.careerReadiness === 'high' ? 'text-green-600' :
                        summary.careerReadiness === 'moderate' ? 'text-yellow-600' :
                        'text-blue-600'
                      }`}>
                        {summary.careerReadiness}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-900">Assessment Summary</h3>
                {summary && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Total Career Matches:</span>
                      <span className="font-medium">{summary.totalJobMatches}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Average Salary:</span>
                      <span className="font-medium">${summary.averageSalary?.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Education Path:</span>
                      <span className="font-medium text-sm">{summary.educationPath}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Career Readiness:</span>
                      <span className={`font-medium capitalize ${
                        summary.careerReadiness === 'high' ? 'text-green-600' :
                        summary.careerReadiness === 'moderate' ? 'text-yellow-600' :
                        'text-blue-600'
                      }`}>
                        {summary.careerReadiness}
                      </span>
                    </div>
                  </div>
                )}
                {recommendations?.studentProfile && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Grade Level:</span>
                      <span className="font-medium">{recommendations.studentProfile.grade}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Location:</span>
                      <span className="font-medium">{recommendations.studentProfile.location}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Key Strengths:</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {recommendations.studentProfile.strengths?.slice(0, 3).map((strength: string, index: number) => (
                          <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                            {strength}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Action Items */}
            {recommendations?.aiRecommendations?.actionItems && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-900">Next Steps for You</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {recommendations.aiRecommendations.actionItems.slice(0, 4).map((item: any, index: number) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{item.title}</h4>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          item.priority === 'high' ? 'bg-red-100 text-red-800' :
                          item.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {item.priority}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                      <p className="text-xs text-gray-500">⏰ {item.timeline}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Career Matches Preview */}
            {recommendations?.topJobMatches && (
              <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-900">Your Top Career Matches</h3>
                <div className="space-y-4">
                  {recommendations.topJobMatches.slice(0, 3).map((match: any, index: number) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{match.career.title}</h4>
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                          {match.matchScore}% Match
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{match.career.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>💰 ${match.career.averageSalary?.toLocaleString()}</span>
                        <span>🎓 {match.career.requiredEducation}</span>
                        <span>📈 {match.career.growthOutlook || 'Stable'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Enhanced Career Assessment" />
      <div className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Question {currentIndex + 1} of {questions.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="mb-6">
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full mb-4">
                {currentQuestion.category.replace(/_/g, ' ').toUpperCase()}
              </span>
              <h2 className="text-2xl font-semibold">
                {currentQuestion.text}
                {currentQuestion.required === false && (
                  <span className="text-lg text-gray-500 font-normal ml-2">(Optional)</span>
                )}
              </h2>
            </div>
            
            {(() => {
              try {
                return renderQuestionInput(currentQuestion);
              } catch (error) {
                console.error('Error rendering question:', currentQuestion, error);
                return (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 font-medium">Error rendering this question</p>
                    <p className="text-sm text-red-500 mt-1">Question ID: {currentQuestion.id}</p>
                    <p className="text-sm text-red-500">Type: {currentQuestion.type}</p>
                    <details className="mt-2">
                      <summary className="text-sm text-red-600 cursor-pointer">Show details</summary>
                      <pre className="text-xs text-red-500 mt-1 overflow-auto">
                        {JSON.stringify(currentQuestion, null, 2)}
                      </pre>
                    </details>
                  </div>
                );
              }
            })()}

            <div className="mt-8 flex justify-between">
              <button
                onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                disabled={currentIndex === 0}
                className="px-6 py-2 text-gray-600 disabled:opacity-50"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
              >
                {currentIndex === questions.length - 1 ? 'Generate My Career Plan' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
