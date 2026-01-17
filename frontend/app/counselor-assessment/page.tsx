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
  description?: string;
  options?: (string | { key: string; label: string })[];
  subjects?: string[];
  rows?: string[];
  columns?: (string | { key: string; label: string; placeholder?: string })[];
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
  // Conditional question properties
  isConditional?: boolean;
  conditionalParent?: string;
  conditionalTrigger?: string;
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
  // Support for new questionnaire structure
  constraints?: string[];
  supportLevel?: string;
  impactStatement?: string;
  // Allow any additional properties for dynamic question responses
  [key: string]: any;
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
  const [showSummary, setShowSummary] = useState(false);
  const ANSWER_STORAGE_KEY = 'counselorAssessmentAnswers';
  const RESULTS_STORAGE_KEY = 'counselorAssessmentResults';
  const ANSWER_STALE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
  const forceRetake = searchParams.get('retake') === 'true';

  // Function to get the next visible question index
  const getNextVisibleQuestionIndex = (currentIdx: number): number => {
    const visibleQuestions = getVisibleQuestions();
    
    // Find the current question in the visible list
    const currentQuestion = questions[currentIdx];
    const currentVisibleIndex = visibleQuestions.findIndex(q => q.id === currentQuestion?.id);
    
    if (currentVisibleIndex === -1) {
      // Current question is not visible, find the first visible question
      return visibleQuestions.length > 0 ? questions.findIndex(q => q.id === visibleQuestions[0].id) : 0;
    }
    
    // Return the next visible question index, or -1 if at the end
    if (currentVisibleIndex < visibleQuestions.length - 1) {
      const nextVisibleQuestion = visibleQuestions[currentVisibleIndex + 1];
      return questions.findIndex(q => q.id === nextVisibleQuestion.id);
    }
    
    return -1; // At the end
  };

  // Function to check if a question should be visible
  const isQuestionVisible = (question: CounselorQuestion): boolean => {
    // Always show non-conditional questions
    if (!question.isConditional) {
      console.log('✅ Showing non-conditional question:', question.id);
      return true;
    }
    
    // Skip separate "other" text questions since we handle them inline now
    if (question.id.includes('_other')) {
      console.log('⏭️ Skipping separate other question (handled inline):', question.id);
      return false;
    }
    
    // For conditional questions, check if the parent condition is met
    const parentAnswer = selectedAnswers[question.conditionalParent!];
    
    // Handle different types of parent answers
    let shouldShow = false;
    
    if (typeof parentAnswer === 'string') {
      // Direct string comparison for single select questions
      // Convert to lowercase for comparison to match backend expectations
      const normalizedParentAnswer = parentAnswer.toLowerCase();
      const normalizedTrigger = question.conditionalTrigger!.toLowerCase();
      shouldShow = normalizedParentAnswer === normalizedTrigger;
    } else if (typeof parentAnswer === 'object' && parentAnswer !== null) {
      // Handle object answers (like combined questions or "other" selections)
      if (question.conditionalParent === 'q3_career_knowledge') {
        // For career knowledge question, parentAnswer should be a string
        if (typeof parentAnswer === 'string') {
          const normalizedParentAnswer = parentAnswer.toLowerCase();
          const normalizedTrigger = question.conditionalTrigger!.toLowerCase();
          shouldShow = normalizedParentAnswer === normalizedTrigger;
        }
      } else if (parentAnswer && typeof parentAnswer === 'object' && 'type' in parentAnswer && parentAnswer.type === 'other') {
        // Don't show further conditionals for "other" selections since we handle them inline
        shouldShow = false;
      } else {
        // For other object answers, might need different handling
        shouldShow = parentAnswer[question.conditionalTrigger!] !== undefined;
      }
    }
    
    console.log('🔍 Checking conditional question:', {
      questionId: question.id,
      conditionalParent: question.conditionalParent,
      conditionalTrigger: question.conditionalTrigger,
      parentAnswer: parentAnswer,
      parentAnswerType: typeof parentAnswer,
      normalizedParentAnswer: typeof parentAnswer === 'string' ? parentAnswer.toLowerCase() : 'not-string',
      normalizedTrigger: question.conditionalTrigger!.toLowerCase(),
      shouldShow: shouldShow
    });
    
    return shouldShow;
  };

  // Function to get visible questions based on conditional logic
  const getVisibleQuestions = (): CounselorQuestion[] => {
    const visible = questions.filter(isQuestionVisible);
    
    console.log('📊 Visible questions:', visible.map(q => ({ id: q.id, isConditional: q.isConditional })));
    return visible;
  };

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

  // Re-calculate visible questions when selectedAnswers change
  useEffect(() => {
    if (questions.length > 0) {
      const visibleQuestions = getVisibleQuestions();
      console.log('🔄 Recalculating visible questions due to answer change');
      console.log('📊 Total questions:', questions.length);
      console.log('📊 Visible questions:', visibleQuestions.length);
      console.log('📊 Current index:', currentIndex);
      
      // If current index is beyond visible questions, adjust it
      if (currentIndex >= visibleQuestions.length && visibleQuestions.length > 0) {
        console.log('⚠️ Current index beyond visible questions, adjusting');
        setCurrentIndex(visibleQuestions.length - 1);
      }
    }
  }, [selectedAnswers, questions]);

  // Reapply stored answers once questions are loaded to avoid race conditions on first render
  useEffect(() => {
    // DISABLED: Auto-loading of stored answers
    // This ensures each assessment session starts fresh
    if (!hasRestoredAnswers && !isLoading && questions.length > 0) {
      console.log('🚫 Auto-loading of stored answers is disabled - starting fresh assessment');
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
    // DISABLED: Saving answers to localStorage
    // Each assessment session now starts fresh without persistence
    console.log('🚫 Answer saving is disabled - assessment will not persist between sessions');
    return;
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
    // DISABLED: Clearing assessment data - no longer needed since we don't save
    console.log('🆕 Starting fresh assessment (no data to clear)');
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
        console.log('🔍 Conditional questions:', data.data.questions?.filter((q: any) => q.isConditional).map((q: any) => ({ id: q.id, conditionalParent: q.conditionalParent, conditionalTrigger: q.conditionalTrigger })));
        
        const storedAnswers = null; // DISABLED: Always start fresh
        let initialSelectedAnswers = {};
        let initialResponses = {};

        // Handle prefilled data for authenticated users
        if (data.data.prefilledData) {
          console.log('📝 Prefilled data received:', data.data.prefilledData);
          setResponses(prev => ({
            ...prev,
            ...data.data.prefilledData
          }));
          initialResponses = {
            grade: data.data.prefilledData.grade,
            zipCode: data.data.prefilledData.zipCode
          };
          if (data.data.prefilledData.grade || data.data.prefilledData.zipCode) {
            initialSelectedAnswers = {
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
        
        // DISABLED: Auto-loading of stored answers for fresh sessions
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
          // DISABLED: Auto-loading stored answers - each session starts fresh
          console.log('🆕 Starting fresh assessment session');
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
    setSelectedAnswers(prev => {
      const newAnswers = {
        ...prev,
        [questionId]: value
      };
      console.log('📊 Updated selectedAnswers:', newAnswers);
      return newAnswers;
    });
  };

  const handleNext = () => {
    const visibleQuestions = getVisibleQuestions();
    const currentQuestion = visibleQuestions[currentIndex];
    
    if (!currentQuestion) {
      console.error('❌ No current question found');
      return;
    }
    
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
    } else if (currentQuestion.type === 'multi_select') {
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
    } else if (currentQuestion.type === 'matrix_radio' || currentQuestion.type === 'matrix') {
      if (!isOptional) {
        const subjects = currentQuestion.subjects || currentQuestion.rows || [];
        const answeredSubjects = Object.keys(currentAnswer || {});
        
        if (answeredSubjects.length < subjects.length) {
          const missingSubjects = subjects.filter(subject => !currentAnswer?.[subject]);
          alert(`Please rate your performance in all subjects. Missing: ${missingSubjects.join(', ')}`);
          return;
        }
      }
    } else if (currentQuestion.type === 'grid_text') {
      // Grid text questions are typically optional, but we can validate if needed
      // For now, no validation required since it's course history
    } else if (currentQuestion.type === 'subject_text') {
      // Subject text questions are typically optional
      // For now, no validation required since it's course history
    } else if (currentQuestion.type === 'subject_grid') {
      // Subject grid questions are typically optional
      // For now, no validation required since it's course history
    } else if (currentQuestion.type === 'free_text' || currentQuestion.type === 'text_long') {
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
      
      // Special validation for "other" text entries
      if (typeof currentAnswer === 'object' && currentAnswer?.type === 'other') {
        if (!currentAnswer.text || currentAnswer.text.trim().length === 0) {
          alert('Please specify your answer in the "Other" field');
          return;
        }
      }
    }

    // Update responses based on question type
    const newResponses = { ...responses };
    
    if (currentQuestion.id === 'q1_grade_zip') {
      newResponses.grade = parseInt(currentAnswer.grade);
      newResponses.zipCode = currentAnswer.zipCode;
    } else if (currentQuestion.id === 'q3_career_knowledge') {
      // Store the career knowledge answer
      newResponses[currentQuestion.id] = currentAnswer;
    } else if (currentQuestion.id.startsWith('q3a_')) {
      // Store career category selection
      newResponses[currentQuestion.id] = currentAnswer;
    } else if (currentQuestion.id === 'q4_academic_performance') {
      // Store academic performance matrix
      newResponses.academicPerformance = currentAnswer;
    } else if (currentQuestion.id.includes('_careers')) {
      // Store specific career selection - handle "other" format
      if (typeof currentAnswer === 'object' && currentAnswer?.type === 'other') {
        newResponses[currentQuestion.id] = currentAnswer.text;
        newResponses[currentQuestion.id + '_other'] = currentAnswer.text;
      } else {
        newResponses[currentQuestion.id] = currentAnswer;
      }
    } else if (currentQuestion.id.includes('_other')) {
      // Store other text responses
      newResponses[currentQuestion.id] = currentAnswer;
    } else if (currentQuestion.id === 'q4_academic_combined') {
      newResponses.academicPerformance = currentAnswer;
    } else if (currentQuestion.id === 'q5_education_willingness') {
      newResponses.educationCommitment = currentAnswer;
    } else if (currentQuestion.id === 'q14_constraints') {
      newResponses.constraints = Array.isArray(currentAnswer) ? currentAnswer : [currentAnswer];
    } else if (currentQuestion.id === 'q17_support_confidence') {
      newResponses.supportLevel = currentAnswer;
    } else if (currentQuestion.id === 'q19_20_impact_inspiration') {
      newResponses.impactStatement = currentAnswer;
    } else if (currentQuestion.id === 'q10_traits') {
      newResponses.personalTraits = currentAnswer;
    } else if (currentQuestion.id === 'q8_interests_text') {
      newResponses.interestsPassions = currentAnswer;
    } else if (currentQuestion.id === 'q9_experience_text') {
      newResponses.workExperience = currentAnswer;
    } else {
      // Generic mapping for other questions
      newResponses[currentQuestion.id] = currentAnswer;
    }

    setResponses(newResponses);

    if (currentIndex < visibleQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Show summary before final submission
      setShowSummary(true);
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
      
      // Extract userId from stored user object
      let userId: number | null = null;
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          userId = user.id || user.userId || null;
          console.log('👤 Extracted userId from user object:', userId);
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      } else {
        console.log('⚠️ No user data found in localStorage - submitting as anonymous');
      }

      // Check if there's a file to upload
      const hasFile = finalResponses.academicPerformance?.transcriptFile;
      
      let response;
      
      if (hasFile) {
        // Use FormData for file upload
        const formData = new FormData();
        formData.append('sessionId', sessionId || '');
        if (userId) {
          formData.append('userId', userId.toString());
        }
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
            userId: userId
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
        <div className="space-y-3">
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
                <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                  {fieldName.replace(/([A-Z])/g, ' $1').trim()}
                  {isZipCode && (
                    <span className="text-xs text-gray-500 ml-1">(5 digits)</span>
                  )}
                </label>
                {fieldConfig.type === 'select' ? (
                  <select
                    value={fieldValue}
                    onChange={(e) => handleAnswerChange(question.id, {
                      ...currentAnswer,
                      [fieldName]: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
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
                      className={`w-full px-3 py-2 border rounded-md focus:ring-1 transition-colors text-sm ${
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
                          <p className="text-xs text-red-600 flex items-center">
                            <span className="mr-1">❌</span>
                            {zipValidation.error || 'Invalid ZIP code'}
                          </p>
                        )}
                        {showZipSuccess && zipValidation && (
                          <p className="text-xs text-green-600 flex items-center">
                            <span className="mr-1">✅</span>
                            Valid ZIP code{zipValidation.region && zipValidation.state ? ` - ${zipValidation.region}, ${zipValidation.state}` : ''}
                          </p>
                        )}
                        {fieldValue.length > 0 && fieldValue.length < 5 && (
                          <p className="text-xs text-gray-500">
                            Enter {5 - fieldValue.length} more digit{5 - fieldValue.length !== 1 ? 's' : ''}
                          </p>
                        )}
                        {fieldValue.length === 0 && (
                          <p className="text-xs text-gray-500">
                            Enter your 5-digit ZIP code (e.g., 12345)
                          </p>
                        )}
                        {validationError && (
                          <p className="text-xs text-orange-600 flex items-center">
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

    if (question.type === 'single_choice' || question.type === 'single_select') {
      return (
        <div className="space-y-2">
          {question.options?.map((option, index) => {
            // Handle both string options (legacy) and object options (new format with key/label)
            const optionKey = typeof option === 'object' && option !== null && 'key' in option ? option.key : option;
            const optionLabel = typeof option === 'object' && option !== null && 'label' in option ? option.label : option;
            const optionText = typeof optionLabel === 'string' ? optionLabel : String(optionLabel);
            const isOtherOption = optionText.toLowerCase().includes('other');
            
            if (isOtherOption) {
              // Render as text input instead of radio button
              return (
                <div key={index} className="border border-gray-200 rounded-md p-3 hover:border-gray-300 transition-colors">
                  <label className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name={question.id}
                      value="other"
                      checked={currentAnswer === 'other' || (typeof currentAnswer === 'object' && currentAnswer?.type === 'other')}
                      onChange={() => {
                        // Set the answer to indicate "other" was selected
                        handleAnswerChange(question.id, { type: 'other', text: '' });
                      }}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div className="flex-1">
                      <span className="text-gray-700 font-medium text-sm">Other:</span>
                      <input
                        type="text"
                        placeholder="Please specify..."
                        value={typeof currentAnswer === 'object' && currentAnswer?.type === 'other' ? currentAnswer.text : ''}
                        onChange={(e) => {
                          handleAnswerChange(question.id, { type: 'other', text: e.target.value });
                        }}
                        onFocus={() => {
                          // Auto-select the radio button when text field is focused
                          if (currentAnswer !== 'other' && !(typeof currentAnswer === 'object' && currentAnswer?.type === 'other')) {
                            handleAnswerChange(question.id, { type: 'other', text: '' });
                          }
                        }}
                        className="ml-2 flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </label>
                </div>
              );
            } else {
              // Regular radio button option - use key for storage, label for display
              return (
                <button
                  key={index}
                  onClick={() => handleAnswerChange(question.id, optionKey)}
                  className={`w-full text-left px-4 py-3 rounded-md border transition-all text-sm ${
                    currentAnswer === optionKey
                      ? 'border-blue-600 bg-blue-50 text-blue-900'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {optionLabel}
                </button>
              );
            }
          })}
        </div>
      );
    }

    if (question.type === 'multiple_choice') {
      return (
        <div className="space-y-2">
          {question.options?.map((option, index) => {
            // Handle both string options (legacy) and object options (new format with key/label)
            const optionKey = typeof option === 'object' && option !== null && 'key' in option ? option.key : option;
            const optionLabel = typeof option === 'object' && option !== null && 'label' in option ? option.label : option;
            
            return (
              <label key={index} className="flex items-center space-x-3 p-3 border rounded-md hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Array.isArray(currentAnswer) ? currentAnswer.includes(optionKey) : false}
                  onChange={(e) => {
                    const currentArray = Array.isArray(currentAnswer) ? currentAnswer : [];
                    if (e.target.checked) {
                      handleAnswerChange(question.id, [...currentArray, optionKey]);
                    } else {
                      handleAnswerChange(question.id, currentArray.filter(item => item !== optionKey));
                    }
                  }}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm">{optionLabel}</span>
              </label>
            );
          })}
        </div>
      );
    }

    if (question.type === 'multi_select') {
      return (
        <div className="space-y-2">
          {question.options?.map((option, index) => {
            // Handle both string options (legacy) and object options (new format with key/label)
            const optionKey = typeof option === 'object' && option !== null && 'key' in option ? option.key : option;
            const optionLabel = typeof option === 'object' && option !== null && 'label' in option ? option.label : option;
            
            return (
              <label key={index} className="flex items-center space-x-3 p-3 border rounded-md hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Array.isArray(currentAnswer) ? currentAnswer.includes(optionKey) : false}
                  onChange={(e) => {
                    const currentArray = Array.isArray(currentAnswer) ? currentAnswer : [];
                    if (e.target.checked) {
                      handleAnswerChange(question.id, [...currentArray, optionKey]);
                    } else {
                      handleAnswerChange(question.id, currentArray.filter(item => item !== optionKey));
                    }
                  }}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm">{optionLabel}</span>
              </label>
            );
          })}
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
            {question.options?.map((option, index) => {
              // Handle both string options (legacy) and object options (new format with key/label)
              const optionKey = typeof option === 'object' && option !== null && 'key' in option ? option.key : option;
              const optionLabel = typeof option === 'object' && option !== null && 'label' in option ? option.label : option;
              
              return (
                <label key={index} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedOptions.includes(optionKey)}
                    onChange={(e) => {
                      const newSelected = e.target.checked
                        ? [...selectedOptions, optionKey]
                        : selectedOptions.filter((item: string) => item !== optionKey);
                      
                      handleAnswerChange(question.id, {
                        ...currentAnswer,
                        selected: newSelected
                      });
                    }}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span>{optionLabel}</span>
                </label>
              );
            })}
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

    if (question.type === 'free_text' || question.type === 'text_long') {
      const currentLength = (currentAnswer || '').length;
      const maxLength = question.maxLength || 500;
      const hasContent = currentLength > 0;
      
      return (
        <div>
          <textarea
            value={currentAnswer || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder={question.placeholder}
            rows={4}
            maxLength={maxLength}
            className={`w-full px-3 py-2 border rounded-md resize-none transition-colors text-sm ${
              hasContent 
                ? 'border-green-300 focus:border-green-500' 
                : 'border-gray-300 focus:border-blue-500'
            }`}
          />
          <div className="flex justify-between items-center mt-1">
            <div className={`text-xs ${
              currentLength === 0 
                ? 'text-gray-500'
                : 'text-green-600'
            }`}>
              {currentLength === 0 && (
                <span>Required field</span>
              )}
              {hasContent && (
                <span>✓ Complete</span>
              )}
            </div>
            <div className={`text-xs ${
              currentLength > maxLength * 0.9 ? 'text-red-500' : 'text-gray-500'
            }`}>
              {currentLength} / {maxLength}
            </div>
          </div>
        </div>
      );
    }

    if (question.type === 'matrix_radio' || question.type === 'matrix') {
      const currentAnswer = selectedAnswers[question.id] || {};
      
      return (
        <div className="space-y-3">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-3 font-medium text-gray-700 text-sm min-w-[200px]">
                    Subject
                  </th>
                  {(question.columns || question.options)?.map((option, index) => {
                    // For matrix questions, options should be strings (rating scales)
                    // But handle both formats for safety
                    const optionKey = typeof option === 'object' && option !== null && 'key' in option ? option.key : option;
                    const optionLabel = typeof option === 'object' && option !== null && 'label' in option ? option.label : option;
                    
                    return (
                      <th key={typeof optionKey === 'string' ? optionKey : index} className="text-center p-3 font-medium text-gray-700 min-w-[80px]">
                        <div className="text-xs leading-tight">{optionLabel}</div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {(question.rows || question.subjects)?.map((subject, index) => (
                  <tr key={subject} className={index % 2 === 0 ? "bg-white" : "bg-gray-25 hover:bg-gray-50"}>
                    <td className="p-3 font-medium text-gray-800 text-sm">
                      {subject}
                    </td>
                    {(question.columns || question.options)?.map((option, optIndex) => {
                      const optionKey = typeof option === 'object' && option !== null && 'key' in option ? option.key : option;
                      const optionValue = typeof optionKey === 'string' ? optionKey : String(optionKey);
                      
                      return (
                        <td key={typeof optionKey === 'string' ? optionKey : optIndex} className="text-center p-3">
                          <input
                            type="radio"
                            name={`${question.id}_${subject}`}
                            value={optionValue}
                            checked={currentAnswer[subject] === optionValue}
                            onChange={(e) => {
                              handleAnswerChange(question.id, {
                                ...currentAnswer,
                                [subject]: e.target.value
                              });
                            }}
                            className="text-blue-600 w-4 h-4"
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="text-xs text-gray-600 mt-2">
            Rate your performance in each subject. Select one option per row.
          </div>
        </div>
      );
    }

    if (question.type === 'grid_text') {
      const currentAnswer = selectedAnswers[question.id] || {};
      
      return (
        <div className="space-y-4">
          {question.description && (
            <p className="text-sm text-gray-600 mb-4">{question.description}</p>
          )}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-3 font-medium text-gray-700 text-sm min-w-[200px] border-b border-gray-200">
                    Subject Area
                  </th>
                  {question.columns?.map((column, index) => (
                    <th key={index} className="text-center p-3 font-medium text-gray-700 min-w-[250px] border-b border-gray-200">
                      <div className="text-sm">{typeof column === 'string' ? column : column.label}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {question.rows?.map((subject, subjectIndex) => (
                  <tr key={subject} className={subjectIndex % 2 === 0 ? 'bg-white' : 'bg-gray-25'}>
                    <td className="p-3 font-medium text-gray-800 text-sm align-top border-b border-gray-200">
                      {subject}
                    </td>
                    {question.columns?.map((column, columnIndex) => (
                      <td key={columnIndex} className="p-3 border-b border-gray-200">
                        <textarea
                          placeholder={typeof column === 'string' ? '' : (column.placeholder || '')}
                          value={currentAnswer[subject]?.[typeof column === 'string' ? column : column.key] || ''}
                          onChange={(e) => {
                            const columnKey = typeof column === 'string' ? column : column.key;
                            const newAnswer = {
                              ...currentAnswer,
                              [subject]: {
                                ...currentAnswer[subject],
                                [columnKey]: e.target.value
                              }
                            };
                            handleAnswerChange(question.id, newAnswer);
                          }}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm"
                          rows={2}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="text-xs text-gray-600 mt-2">
            List any relevant courses you've taken. Leave blank if none apply.
          </div>
        </div>
      );
    }

    if (question.type === 'subject_text') {
      const currentAnswer = selectedAnswers[question.id] || {};
      
      return (
        <div className="space-y-4">
          {question.description && (
            <p className="text-sm text-gray-600 mb-4">{question.description}</p>
          )}
          <div className="space-y-3">
            {question.subjects?.map((subject, subjectIndex) => (
              <div key={subject} className={`p-4 rounded-lg border ${subjectIndex % 2 === 0 ? 'bg-white border-gray-200' : 'bg-gray-25 border-gray-200'}`}>
                <label className="block font-medium text-gray-800 text-sm mb-2">
                  {subject}
                </label>
                <textarea
                  placeholder={question.placeholder || 'List any advanced or specialized courses...'}
                  value={currentAnswer[subject] || ''}
                  onChange={(e) => {
                    const newAnswer = {
                      ...currentAnswer,
                      [subject]: e.target.value
                    };
                    handleAnswerChange(question.id, newAnswer);
                  }}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm"
                  rows={2}
                />
              </div>
            ))}
          </div>
          <div className="text-xs text-gray-600 mt-2">
            List any AP, Honors, electives, or specialized courses you've taken in each subject area.
          </div>
        </div>
      );
    }

    if (question.type === 'subject_grid') {
      const currentAnswer = selectedAnswers[question.id] || {};
      
      console.log('Rendering subject_grid question:', question.id);
      console.log('Question subjects:', question.subjects);
      console.log('Current answer:', currentAnswer);
      
      return (
        <div className="space-y-4">
          {question.description && (
            <p className="text-sm text-gray-600 mb-4">{question.description}</p>
          )}
          <div className="w-full">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-3 font-medium text-gray-700 text-sm border-b border-gray-200 w-1/3">
                    Subject Area
                  </th>
                  <th className="text-left p-3 font-medium text-gray-700 text-sm border-b border-gray-200 w-2/3">
                    Courses Taken
                  </th>
                </tr>
              </thead>
              <tbody>
                {question.subjects?.map((subject, subjectIndex) => (
                  <tr key={subject} className={subjectIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="p-3 font-medium text-gray-800 text-sm align-top border-b border-gray-200">
                      {subject}
                    </td>
                    <td className="p-3 border-b border-gray-200">
                      <textarea
                        placeholder={question.placeholder || 'List any advanced or specialized courses...'}
                        value={currentAnswer[subject] || ''}
                        onChange={(e) => {
                          const newAnswer = {
                            ...currentAnswer,
                            [subject]: e.target.value
                          };
                          handleAnswerChange(question.id, newAnswer);
                        }}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm"
                        rows={2}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="text-xs text-gray-600 mt-2">
            List any AP, Honors, electives, or specialized courses you've taken in each subject area.
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

  // Function to render the summary slide
  const renderSummarySlide = () => {
    const visibleQuestions = getVisibleQuestions();
    
    // Organize responses by category
    const summaryData = {
      'Basic Information': [] as Array<{question: string, answer: string}>,
      'Career Interests': [] as Array<{question: string, answer: string}>,
      'Academic Performance': [] as Array<{question: string, answer: string}>,
      'Education & Support': [] as Array<{question: string, answer: string}>,
      'Personal Traits & Experience': [] as Array<{question: string, answer: string}>,
      'Constraints & Goals': [] as Array<{question: string, answer: string}>
    };

    visibleQuestions.forEach(question => {
      const answer = selectedAnswers[question.id];
      if (!answer) return;

      let formattedAnswer = '';
      let category = 'Basic Information';

      // Format answer based on question type and determine category
      if (question.id === 'q1_grade_zip') {
        formattedAnswer = `Grade ${answer.grade}, ZIP Code ${answer.zipCode}`;
        category = 'Basic Information';
      } else if (question.id === 'q3_career_knowledge') {
        formattedAnswer = answer;
        category = 'Career Interests';
      } else if (question.id.startsWith('q3a')) {
        if (typeof answer === 'object' && answer.type === 'other') {
          formattedAnswer = `Other: ${answer.text}`;
        } else {
          formattedAnswer = answer;
        }
        category = 'Career Interests';
      } else if (question.id === 'q4_academic_performance') {
        const subjects = Object.keys(answer);
        formattedAnswer = `${subjects.length} subjects rated`;
        category = 'Academic Performance';
      } else if (question.id === 'q5_education_willingness') {
        formattedAnswer = answer;
        category = 'Education & Support';
      } else if (question.id === 'q17_support_confidence') {
        formattedAnswer = answer;
        category = 'Education & Support';
      } else if (question.id === 'q10_traits') {
        formattedAnswer = Array.isArray(answer) ? answer.join(', ') : answer;
        category = 'Personal Traits & Experience';
      } else if (question.id === 'q8_interests_text' || question.id === 'q9_experience_text') {
        formattedAnswer = answer.length > 100 ? answer.substring(0, 100) + '...' : answer;
        category = 'Personal Traits & Experience';
      } else if (question.id === 'q14_constraints') {
        formattedAnswer = Array.isArray(answer) ? answer.join(', ') : answer;
        category = 'Constraints & Goals';
      } else if (question.id === 'q19_20_impact_inspiration') {
        formattedAnswer = answer.length > 100 ? answer.substring(0, 100) + '...' : answer;
        category = 'Constraints & Goals';
      } else {
        // Generic handling
        if (Array.isArray(answer)) {
          formattedAnswer = answer.join(', ');
        } else if (typeof answer === 'object') {
          formattedAnswer = JSON.stringify(answer);
        } else {
          formattedAnswer = String(answer);
        }
        category = 'Basic Information';
      }

      summaryData[category as keyof typeof summaryData].push({
        question: question.text,
        answer: formattedAnswer
      });
    });

    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Enhanced Career Assessment" />
        <div className="py-8 px-4">
          <div className="max-w-3xl mx-auto">
            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Assessment Summary
                </span>
                <span className="text-sm text-gray-500">
                  100% Complete
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full w-full"></div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="mb-6">
                <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full mb-3">
                  REVIEW
                </span>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Review Your Responses
                </h2>
                <p className="text-gray-600 text-sm">
                  Please review your responses below. You can edit any answer by clicking the "Edit" button.
                </p>
              </div>

              {/* Summary Content */}
              <div className="space-y-6">
                {Object.entries(summaryData).map(([category, responses]) => {
                  if (responses.length === 0) return null;
                  
                  return (
                    <div key={category} className="border-b border-gray-100 pb-6 last:border-b-0">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        {category}
                      </h3>
                      <div className="space-y-3">
                        {responses.map((item, index) => (
                          <div key={index} className="bg-gray-50 rounded-md p-4">
                            <div className="flex justify-between items-start mb-2">
                              <p className="text-sm font-medium text-gray-700 flex-1 mr-3">
                                {item.question}
                              </p>
                              <button
                                onClick={() => {
                                  // Find the question and go back to it
                                  const questionIndex = visibleQuestions.findIndex(q => q.text === item.question);
                                  if (questionIndex !== -1) {
                                    setCurrentIndex(questionIndex);
                                    setShowSummary(false);
                                  }
                                }}
                                className="text-xs text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap px-2 py-1 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
                              >
                                Edit
                              </button>
                            </div>
                            <p className="text-sm text-gray-600">
                              {item.answer}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex justify-between">
                <button
                  onClick={() => setShowSummary(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-gray-600 disabled:opacity-50 hover:text-gray-800 transition-colors text-sm"
                >
                  ← Back
                </button>
                <button
                  onClick={() => {
                    // Update responses and submit
                    const finalResponses = { ...responses };
                    
                    // Ensure all response mappings are up to date
                    visibleQuestions.forEach(question => {
                      const currentAnswer = selectedAnswers[question.id];
                      if (!currentAnswer) return;

                      if (question.id === 'q1_grade_zip') {
                        finalResponses.grade = parseInt(currentAnswer.grade);
                        finalResponses.zipCode = currentAnswer.zipCode;
                      } else if (question.id === 'q3_career_knowledge') {
                        finalResponses[question.id] = currentAnswer;
                      } else if (question.id.startsWith('q3a_')) {
                        finalResponses[question.id] = currentAnswer;
                      } else if (question.id === 'q4_academic_performance') {
                        finalResponses.academicPerformance = currentAnswer;
                      } else if (question.id === 'q5_education_willingness') {
                        finalResponses.educationCommitment = currentAnswer;
                      } else if (question.id === 'q14_constraints') {
                        finalResponses.constraints = Array.isArray(currentAnswer) ? currentAnswer : [currentAnswer];
                      } else if (question.id === 'q17_support_confidence') {
                        finalResponses.supportLevel = currentAnswer;
                      } else if (question.id === 'q19_20_impact_inspiration') {
                        finalResponses.impactStatement = currentAnswer;
                      } else if (question.id === 'q10_traits') {
                        finalResponses.personalTraits = currentAnswer;
                      } else if (question.id === 'q8_interests_text') {
                        finalResponses.interestsPassions = currentAnswer;
                      } else if (question.id === 'q9_experience_text') {
                        finalResponses.workExperience = currentAnswer;
                      } else {
                        finalResponses[question.id] = currentAnswer;
                      }
                    });

                    handleSubmit(finalResponses);
                  }}
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm"
                >
                  {isSubmitting ? 'Generating Results...' : 'Generate Results'}
                </button>
              </div>
            </div>
          </div>
        </div>
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

  // Show summary slide if requested
  if (showSummary) {
    return renderSummarySlide();
  }

  const visibleQuestions = getVisibleQuestions();
  const currentQuestion = visibleQuestions[currentIndex];

  // Safeguard: if currentIndex is out of bounds, reset it
  if (visibleQuestions.length > 0 && (currentIndex < 0 || currentIndex >= visibleQuestions.length)) {
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
                Question index {currentIndex} not found. Total visible questions: {visibleQuestions.length}
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
      <div className="py-8 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Test Profile Button */}
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                Question {currentIndex + 1} of {visibleQuestions.length}
              </span>
              <span className="text-sm text-gray-500">
                {Math.round(((currentIndex + 1) / visibleQuestions.length) * 100)}% Complete
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${((currentIndex + 1) / visibleQuestions.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Test Profile Button */}
          <div className="mb-4 text-center">
            <button
              onClick={() => router.push('/test-profiles')}
              className="inline-flex items-center px-3 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              🧪 Test Profiles
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-4">
              <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full mb-3">
                {currentQuestion.category.replace(/_/g, ' ').toUpperCase()}
              </span>
              <h2 className="text-xl font-semibold text-gray-900">
                {currentQuestion.text}
                <span className="text-red-500 ml-1">*</span>
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

            <div className="mt-6 flex justify-between">
              <button
                onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                disabled={currentIndex === 0}
                className="px-4 py-2 text-gray-600 disabled:opacity-50 hover:text-gray-800 transition-colors text-sm"
              >
                ← Back
              </button>
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors text-sm"
              >
                {currentIndex === visibleQuestions.length - 1 ? 'Summary →' : 'Next →'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
