'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '../components/Header';
import { validateZipCode, ZipCodeValidationResult } from '../services/zipCodeValidator';

interface CounselorQuestion {
  id: string;
  order: number;
  text: string;
  type: string;
  category: string;
  options?: string[];
  subjects?: string[];
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
  const RESULTS_STORAGE_KEY = 'counselorAssessmentResults';
  const ANSWER_STALE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
  const forceRetake = searchParams.get('retake') === 'true';

  // Helper function to get user-specific storage key
  const getUserSpecificKey = (baseKey: string): string => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      // For anonymous users, use a special anonymous key
      return `${baseKey}_anonymous`;
    }
    
    try {
      const user = JSON.parse(storedUser);
      if (user?.email) {
        // For logged-in users, use email-based key
        return `${baseKey}_user_${user.email}`;
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
    
    // Fallback to anonymous key
    return `${baseKey}_anonymous`;
  };

  // Helper function to clear all assessment data for current user context
  const clearCurrentUserAssessmentData = () => {
    const currentKey = getUserSpecificKey(ANSWER_STORAGE_KEY);
    const currentResultsKey = getUserSpecificKey(RESULTS_STORAGE_KEY);
    
    localStorage.removeItem(currentKey);
    localStorage.removeItem(currentResultsKey);
    
    // Also clear the old non-user-specific keys for cleanup
    localStorage.removeItem(ANSWER_STORAGE_KEY);
    localStorage.removeItem(RESULTS_STORAGE_KEY);
    
    console.log('🧹 Cleared assessment data for current user context');
  };

  // Helper function to clear anonymous data when user logs in
  const clearAnonymousDataOnLogin = () => {
    const anonymousAnswerKey = `${ANSWER_STORAGE_KEY}_anonymous`;
    const anonymousResultsKey = `${RESULTS_STORAGE_KEY}_anonymous`;
    
    localStorage.removeItem(anonymousAnswerKey);
    localStorage.removeItem(anonymousResultsKey);
    
    console.log('🧹 Cleared anonymous assessment data on login');
  };

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
      const userSpecificKey = getUserSpecificKey(ANSWER_STORAGE_KEY);
      const raw = localStorage.getItem(userSpecificKey);
      
      if (!raw) {
        // Check for old non-user-specific data and migrate/clear it
        const oldRaw = localStorage.getItem(ANSWER_STORAGE_KEY);
        if (oldRaw) {
          console.log('🔄 Found old non-user-specific data, clearing it for security');
          localStorage.removeItem(ANSWER_STORAGE_KEY);
        }
        return null;
      }

      const stored = JSON.parse(raw);
      const storedUser = localStorage.getItem('user');
      const user = storedUser ? JSON.parse(storedUser) : null;
      
      // Check if data is recent
      const isRecent = stored.timestamp && new Date(stored.timestamp).getTime() > Date.now() - ANSWER_STALE_MS;
      
      // For user-specific keys, we don't need to check email match since the key already ensures user isolation
      // But we still validate for extra security
      const userMatches = !stored.userEmail || !user?.email || stored.userEmail === user.email;

      if (!isRecent) {
        console.log('⚠️ Stored answers are too old, clearing them');
        localStorage.removeItem(userSpecificKey);
        return null;
      }

      if (!userMatches) {
        console.log('⚠️ Stored answers belong to different user, clearing them');
        localStorage.removeItem(userSpecificKey);
        return null;
      }

      console.log('✅ Loaded stored answers for current user');
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
      const userSpecificKey = getUserSpecificKey(ANSWER_STORAGE_KEY);

      const dataToStore = {
        timestamp: new Date().toISOString(),
        userEmail: user?.email || null,
        responses: sanitizedResponses,
        selectedAnswers: sanitizedSelectedAnswers
      };

      localStorage.setItem(userSpecificKey, JSON.stringify(dataToStore));
      
      // Clear old non-user-specific data for cleanup
      localStorage.removeItem(ANSWER_STORAGE_KEY);
      
      console.log('💾 Saved assessment answers with user-specific key:', userSpecificKey);
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
    const storedUser = localStorage.getItem('user');
    
    // If user just logged in, clear any anonymous data
    if (token && storedUser) {
      clearAnonymousDataOnLogin();
    }
    
    if (!token) {
      console.log('❌ No token found, proceeding with normal assessment (anonymous mode)');
      fetchQuestions();
      return;
    }

    try {
      // Check for previous results using user-specific key
      const userSpecificResultsKey = getUserSpecificKey(RESULTS_STORAGE_KEY);
      const storedResults = localStorage.getItem(userSpecificResultsKey);
      
      console.log('📦 Checking user-specific results key:', userSpecificResultsKey);
      console.log('📦 Stored results found:', !!storedResults);
      console.log('👤 Stored user found:', !!storedUser);
      
      // Clean up old non-user-specific results
      const oldResults = localStorage.getItem(RESULTS_STORAGE_KEY);
      if (oldResults) {
        console.log('🧹 Cleaning up old non-user-specific results');
        localStorage.removeItem(RESULTS_STORAGE_KEY);
      }
      
      if (storedResults && storedUser) {
        console.log('✅ Found previous assessment results for current user');
        const results = JSON.parse(storedResults);
        const user = JSON.parse(storedUser);
        
        console.log('📊 Results data:', {
          hasRecommendations: !!results.recommendations,
          hasSummary: !!results.summary,
          timestamp: results.timestamp,
          userEmail: results.userEmail
        });
        
        // Check if results are recent (within last 30 days)
        const resultDate = new Date(results.timestamp || 0);
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        
        console.log('📅 Result date:', resultDate);
        console.log('📅 Thirty days ago:', thirtyDaysAgo);
        console.log('📅 Is recent:', resultDate > thirtyDaysAgo);
        
        // Double-check user match for extra security
        const userMatches = results.userEmail === user.email || !results.userEmail;
        console.log('👤 User match:', userMatches);
        
        if (resultDate > thirtyDaysAgo && userMatches) {
          console.log('✅ Showing previous results for authenticated user');
          setPreviousResults(results);
          setShowPreviousResults(true);
          setIsLoading(false);
          return;
        } else {
          console.log('⚠️ Results are old or user mismatch, removing them');
          localStorage.removeItem(userSpecificResultsKey);
        }
      }

      console.log('📡 No valid user-specific results found, proceeding with new assessment');
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
    // Clear user-specific assessment data
    clearCurrentUserAssessmentData();
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
          if (!initialSelectedAnswers.q1_grade_zip && (data.data.prefilledData.grade || data.data.prefilledData.zipCode)) {
            initialSelectedAnswers = {
              ...initialSelectedAnswers,
              q1_grade_zip: {
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
    console.log('📝 Answer changed:', { questionId, value, isSkip: value?.inputMethod === 'skip' });
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
      
      // Validate ZIP code format and authenticity
      try {
        if (!currentAnswer.zipCode || typeof currentAnswer.zipCode !== 'string') {
          alert('Please enter a valid ZIP code');
          return;
        }
        const zipValidation = validateZipCode(currentAnswer.zipCode);
        if (!zipValidation.isValid) {
          alert(zipValidation.error || 'Please enter a valid US ZIP code');
          return;
        }
      } catch (error) {
        console.error('ZIP code validation error in handleNext:', error);
        alert('Error validating ZIP code. Please check your input and try again.');
        return;
      }
    } else if (currentQuestion.type === 'combined_input') {
      // For combined_input (academic performance), it's optional
      const inputMethod = currentAnswer?.inputMethod;
      
      console.log('🔍 Validating combined_input question:', {
        questionId: currentQuestion.id,
        inputMethod: inputMethod,
        isOptional: isOptional,
        currentAnswer: currentAnswer,
        skipDetected: inputMethod === 'skip'
      });
      
      if (inputMethod === 'skip') {
        console.log('✅ Question skipped, proceeding to next');
        // Question is skipped, allow to proceed
      } else if (inputMethod === 'Type grades manually') {
        const gradesText = currentAnswer?.gradesText?.trim();
        if (!gradesText) {
          alert('Please enter your grades or select a different option (or skip this question)');
          return;
        }
      } else if (inputMethod === 'Upload transcript file') {
        if (!currentAnswer?.transcriptFile) {
          alert('Please upload a transcript file or select a different option (or skip this question)');
          return;
        }
      } else if (!isOptional) {
        // If it's not optional and no method selected, require selection
        alert('Please select how you want to share your academic information or skip this question');
        return;
      }
      // If inputMethod is empty and question is optional, that's fine too
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
    } else if (currentQuestion.type === 'matrix_radio') {
      if (!isOptional) {
        const subjects = currentQuestion.subjects || [];
        const answeredSubjects = Object.keys(currentAnswer || {});
        
        if (answeredSubjects.length < subjects.length) {
          const missingSubjects = subjects.filter(subject => !currentAnswer?.[subject]);
          alert(`Please rate your performance in all subjects. Missing: ${missingSubjects.join(', ')}`);
          return;
        }
      }
    } else if (currentQuestion.type === 'free_text') {
      // For free text questions, just check if they're required and have any content
      if (!isOptional && (!currentAnswer || currentAnswer.trim().length === 0)) {
        alert('Please provide an answer to this question.');
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
    
    if (currentQuestion.id === 'q1_grade_zip') {
      newResponses.grade = parseInt(currentAnswer.grade);
      newResponses.zipCode = currentAnswer.zipCode;
    } else if (currentQuestion.id === 'q2_work_environment') {
      newResponses.workEnvironment = currentAnswer;
    } else if (currentQuestion.id === 'q3_work_style') {
      newResponses.handsOnPreference = currentAnswer;
    } else if (currentQuestion.id === 'q4_thinking_style') {
      newResponses.problemSolving = currentAnswer;
    } else if (currentQuestion.id === 'q13_helping_importance') {
      newResponses.helpingOthers = currentAnswer;
    } else if (currentQuestion.id === 'q5_education_willingness') {
      newResponses.educationCommitment = currentAnswer;
    } else if (currentQuestion.id === 'q11_income_importance') {
      newResponses.incomeImportance = currentAnswer;
    } else if (currentQuestion.id === 'q12_stability_importance') {
      newResponses.jobSecurity = currentAnswer;
    } else if (currentQuestion.id === 'q6_academic_interests') {
      newResponses.subjectsStrengths = Array.isArray(currentAnswer) ? currentAnswer : [currentAnswer];
    } else if (currentQuestion.id === 'q8_interests_text') {
      newResponses.interestsPassions = currentAnswer;
    } else if (currentQuestion.id === 'q9_experience_text') {
      newResponses.workExperience = currentAnswer;
    } else if (currentQuestion.id === 'q7_academic_performance') {
      newResponses.academicPerformance = currentAnswer;
    } else if (currentQuestion.id === 'q19_impact_text') {
      newResponses.legacyImpact = currentAnswer;
    } else if (currentQuestion.id === 'q10_traits') {
      newResponses.personalTraits = currentAnswer;
    } else if (currentQuestion.id === 'q20_inspiration_text') {
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

    // Debug: Log the final responses being submitted
    console.log('🚀 Submitting assessment responses:', finalResponses);
    console.log('📊 Grade:', finalResponses.grade);
    console.log('📍 ZIP Code:', finalResponses.zipCode);

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
        
        // Save results with user-specific key
        const userSpecificResultsKey = getUserSpecificKey(RESULTS_STORAGE_KEY);
        localStorage.setItem(userSpecificResultsKey, JSON.stringify(resultsWithTimestamp));
        
        // Clear old non-user-specific results for cleanup
        localStorage.removeItem('counselorAssessmentResults');
        
        localStorage.setItem('zipCode', finalResponses.zipCode || '');
        saveStoredAnswers(finalResponses);
        
        console.log('💾 Saved assessment results with user-specific key:', userSpecificResultsKey);
        
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
          {Object.entries(question.fields).map(([fieldName, fieldConfig]) => {
            const fieldValue = currentAnswer?.[fieldName] || '';
            const isZipCode = fieldName === 'zipCode';
            
            let zipValidation: ZipCodeValidationResult | null = null;
            let validationError: string | null = null;
            
            if (isZipCode && fieldValue && fieldValue.length === 5) {
              try {
                zipValidation = validateZipCode(fieldValue);
              } catch (error) {
                console.error('ZIP code validation error:', error);
                validationError = 'Error validating ZIP code';
                zipValidation = { isValid: false, error: 'Validation error occurred' };
              }
            }
            
            const isValidZip = !isZipCode || !fieldValue || fieldValue.length !== 5 || (zipValidation?.isValid ?? false);
            const showZipError = isZipCode && fieldValue && fieldValue.length > 0 && fieldValue.length === 5 && !isValidZip && !validationError;
            const showZipSuccess = isZipCode && fieldValue && zipValidation?.isValid;
            
            return (
              <div key={fieldName}>
                <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                  {fieldName.replace(/([A-Z])/g, ' $1').trim()}
                  {isZipCode && (
                    <span className="text-xs text-gray-500 ml-2">(5 digits)</span>
                  )}
                </label>
                {fieldConfig.type === 'select' ? (
                  <select
                    value={fieldValue}
                    onChange={(e) => handleAnswerChange(question.id, {
                      ...currentAnswer,
                      [fieldName]: e.target.value
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required={fieldConfig.required}
                  >
                    <option value="">Select {fieldName}</option>
                    {fieldConfig.options?.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                ) : (
                  <div>
                    <input
                      type="text"
                      value={fieldValue}
                      onChange={(e) => {
                        let value = e.target.value;
                        
                        // Special handling for ZIP code field
                        if (fieldName === 'zipCode') {
                          // Only allow digits and limit to 5 characters
                          value = value.replace(/\D/g, '').slice(0, 5);
                        }
                        
                        handleAnswerChange(question.id, {
                          ...currentAnswer,
                          [fieldName]: value
                        });
                      }}
                      placeholder={fieldConfig.placeholder}
                      maxLength={fieldConfig.maxLength}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 transition-colors ${
                        showZipError 
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50' 
                          : showZipSuccess
                          ? 'border-green-500 focus:border-green-500 focus:ring-green-500 bg-green-50'
                          : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                      }`}
                      required={fieldConfig.required}
                    />
                    {isZipCode && (
                      <div className="mt-1">
                        {showZipError && zipValidation && (
                          <p className="text-sm text-red-600 flex items-center">
                            <span className="mr-1">❌</span>
                            {zipValidation.error || 'Invalid ZIP code'}
                          </p>
                        )}
                        {showZipSuccess && zipValidation && (
                          <p className="text-sm text-green-600 flex items-center">
                            <span className="mr-1">✅</span>
                            Valid ZIP code{zipValidation.region && zipValidation.state ? ` - ${zipValidation.region}, ${zipValidation.state}` : ''}
                          </p>
                        )}
                        {fieldValue.length > 0 && fieldValue.length < 5 && (
                          <p className="text-sm text-gray-500">
                            Enter {5 - fieldValue.length} more digit{5 - fieldValue.length !== 1 ? 's' : ''}
                          </p>
                        )}
                        {fieldValue.length === 0 && (
                          <p className="text-sm text-gray-500">
                            Enter your 5-digit ZIP code (e.g., 12345)
                          </p>
                        )}
                        {validationError && (
                          <p className="text-sm text-orange-600 flex items-center">
                            <span className="mr-1">⚠️</span>
                            {validationError}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
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
            
            {/* Show skip status prominently if skipped */}
            {inputMethod === 'skip' && (
              <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-400 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-green-800 font-semibold">Question Skipped</p>
                    <p className="text-green-700 text-sm">You've chosen to skip sharing your academic information. You can change your mind by selecting an option below.</p>
                  </div>
                </div>
              </div>
            )}
            
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
          <div className="text-center mt-6 pt-4 border-t border-gray-200">
            {currentAnswer?.inputMethod === 'skip' ? (
              <button
                type="button"
                onClick={() => {
                  console.log('🔄 Un-skipping question:', question.id);
                  console.log('🔄 Current answer before un-skip:', selectedAnswers[question.id]);
                  handleAnswerChange(question.id, { inputMethod: '' });
                  console.log('🔄 Answer after un-skip:', { inputMethod: '' });
                }}
                className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
                </svg>
                Answer this question instead
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  console.log('🔄 Skipping question:', question.id);
                  console.log('🔄 Current answer before skip:', selectedAnswers[question.id]);
                  handleAnswerChange(question.id, { inputMethod: 'skip' });
                  console.log('🔄 Answer after skip:', { inputMethod: 'skip' });
                }}
                className="inline-flex items-center px-4 py-2 bg-gray-50 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Skip this question
              </button>
            )}
            <p className="text-xs text-gray-500 mt-2">
              This question is optional. You can skip it and continue with the assessment.
            </p>
          </div>
        </div>
      );
    }

    if (question.type === 'free_text') {
      const currentLength = (currentAnswer || '').length;
      const maxLength = question.maxLength || 500;
      const hasContent = currentLength > 0;
      
      return (
        <div>
          <textarea
            value={currentAnswer || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder={question.placeholder}
            rows={6}
            maxLength={maxLength}
            className={`w-full px-4 py-3 border-2 rounded-lg resize-none transition-colors ${
              hasContent 
                ? 'border-green-300 focus:border-green-500' 
                : 'border-gray-300 focus:border-blue-500'
            }`}
          />
          <div className="flex justify-between items-center mt-2">
            <div className={`text-sm font-medium ${
              currentLength === 0 
                ? 'text-gray-500'
                : 'text-green-600'
            }`}>
              {currentLength === 0 && (
                <span>
                  💡 Please share your thoughts about this question
                </span>
              )}
              {hasContent && (
                <span>✅ Great! You can proceed to the next question</span>
              )}
            </div>
            <div className={`text-sm ${
              currentLength > maxLength * 0.9 ? 'text-red-500' : 'text-gray-500'
            }`}>
              {currentLength} / {maxLength}
            </div>
          </div>
        </div>
      );
    }

    if (question.type === 'matrix_radio') {
      const currentAnswer = selectedAnswers[question.id] || {};
      
      return (
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left p-2 border-b font-medium text-gray-700">Subject</th>
                  {question.options?.map((option) => (
                    <th key={option} className="text-center p-2 border-b font-medium text-gray-700 min-w-[80px]">
                      <div className="text-xs">{option}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {question.subjects?.map((subject) => (
                  <tr key={subject} className="border-b">
                    <td className="p-2 font-medium text-gray-800 text-sm">{subject}</td>
                    {question.options?.map((option) => (
                      <td key={option} className="text-center p-2">
                        <input
                          type="radio"
                          name={`${question.id}_${subject}`}
                          value={option}
                          checked={currentAnswer[subject] === option}
                          onChange={(e) => {
                            handleAnswerChange(question.id, {
                              ...currentAnswer,
                              [subject]: e.target.value
                            });
                          }}
                          className="text-blue-600"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="text-sm text-gray-600 mt-2">
            💡 Rate your performance in each subject. Select one option per row.
          </div>
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

  // Function to handle direct navigation to a question
  const navigateToQuestion = (questionIndex: number) => {
    if (questionIndex >= 0 && questionIndex < questions.length) {
      setCurrentIndex(questionIndex);
    }
  };

  // Function to get the status of a question (completed, current, or upcoming)
  const getQuestionStatus = (questionIndex: number) => {
    if (questionIndex < currentIndex) {
      // Check if this question has been answered
      const question = questions[questionIndex];
      const answer = selectedAnswers[question.id];
      
      if (question.type === 'combined') {
        return answer?.grade && answer?.zipCode ? 'completed' : 'incomplete';
      } else if (question.type === 'free_text') {
        return answer && answer.trim().length > 0 ? 'completed' : 'incomplete';
      } else if (question.type === 'multiple_choice') {
        return answer && Array.isArray(answer) && answer.length > 0 ? 'completed' : 'incomplete';
      } else if (question.type === 'multiple_choice_with_other') {
        const selected = answer?.selected || [];
        const other = answer?.other || '';
        return (selected.length > 0 || other.trim().length > 0) ? 'completed' : 'incomplete';
      } else if (question.type === 'matrix_radio') {
        const subjects = question.subjects || [];
        const answeredSubjects = Object.keys(answer || {});
        return answeredSubjects.length >= subjects.length ? 'completed' : 'incomplete';
      } else {
        return answer ? 'completed' : 'incomplete';
      }
    } else if (questionIndex === currentIndex) {
      return 'current';
    } else {
      return 'upcoming';
    }
  };

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
          {/* Test Profile Button */}
          <div className="mb-6 text-center">
            <button
              onClick={() => router.push('/test-profiles')}
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Test Profile
            </button>
            <p className="text-sm text-gray-500 mt-1">
              Try the assessment with pre-filled sample profiles
            </p>
          </div>
          
          <div className="mb-8">
            {/* Circle Navigation */}
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {questions.map((question, index) => {
                const status = getQuestionStatus(index);
                const isClickable = index <= currentIndex || status === 'completed';
                
                return (
                  <button
                    key={question.id}
                    onClick={() => isClickable ? navigateToQuestion(index) : null}
                    disabled={!isClickable}
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200
                      ${status === 'completed' 
                        ? 'bg-green-500 text-white hover:bg-green-600 cursor-pointer' 
                        : status === 'current'
                        ? 'bg-blue-600 text-white ring-2 ring-blue-300 cursor-pointer'
                        : status === 'incomplete'
                        ? 'bg-yellow-500 text-white hover:bg-yellow-600 cursor-pointer'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }
                      ${isClickable ? 'hover:scale-110' : ''}
                    `}
                    title={`Question ${index + 1}: ${question.text.substring(0, 50)}${question.text.length > 50 ? '...' : ''}`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
            
            {/* Progress Text */}
            <div className="text-center text-sm text-gray-600">
              <span>Question {currentIndex + 1} of {questions.length}</span>
              <span className="mx-2">•</span>
              <span>{Math.round(((currentIndex + 1) / questions.length) * 100)}% Complete</span>
            </div>
            
            {/* Navigation Hint */}
            <div className="text-center text-xs text-gray-500 mt-1">
              Click any circle to jump to that question
            </div>
            
            {/* Legend */}
            <div className="flex justify-center gap-6 mt-3 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span>Completed</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                <span>Current</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span>Incomplete</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-gray-200"></div>
                <span>Upcoming</span>
              </div>
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
                onClick={() => navigateToQuestion(Math.max(0, currentIndex - 1))}
                disabled={currentIndex === 0}
                className="px-6 py-2 text-gray-600 disabled:opacity-50 hover:text-gray-800 transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={handleNext}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                {currentIndex === questions.length - 1 ? 'Generate My Career Plan' : 'Next →'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
