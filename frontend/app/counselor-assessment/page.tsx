'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
}

export default function CounselorAssessmentPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<CounselorQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<CounselorAssessmentResponse>({});
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: any }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/counselor-assessment/questions`);
      const data = await response.json();
      if (data.success) {
        setQuestions(data.data.sort((a: CounselorQuestion, b: CounselorQuestion) => a.order - b.order));
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error fetching counselor questions:', error);
      alert('Failed to load assessment questions');
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

    // Validate required answers
    if (currentQuestion.type === 'combined') {
      if (!currentAnswer?.grade || !currentAnswer?.zipCode) {
        alert('Please fill in both grade and ZIP code');
        return;
      }
    } else if (currentQuestion.type === 'multiple_choice') {
      if (!currentAnswer || currentAnswer.length === 0) {
        alert('Please select at least one option');
        return;
      }
    } else if (currentQuestion.type === 'free_text') {
      if (!currentAnswer || currentAnswer.length < (currentQuestion.minLength || 10)) {
        alert(`Please provide a more detailed response (minimum ${currentQuestion.minLength || 10} characters)`);
        return;
      }
    } else {
      if (!currentAnswer) {
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

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/counselor-assessment/submit`, {
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

      const data = await response.json();
      if (data.success) {
        // Store results for the results page
        localStorage.setItem('counselorAssessmentResults', JSON.stringify(data.data));
        localStorage.setItem('zipCode', finalResponses.zipCode || '');
        
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

    if (question.type === 'free_text') {
      return (
        <div>
          <textarea
            value={currentAnswer || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder={question.placeholder}
            rows={6}
            maxLength={question.maxLength}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none"
          />
          <div className="text-sm text-gray-500 mt-2">
            {(currentAnswer || '').length} / {question.maxLength} characters
            {question.minLength && (
              <span className="ml-2">
                (minimum {question.minLength} characters)
              </span>
            )}
          </div>
        </div>
      );
    }

    return null;
  };

  if (isLoading) {
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

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

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
              <h2 className="text-2xl font-semibold">{currentQuestion.text}</h2>
            </div>
            
            {renderQuestionInput(currentQuestion)}

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