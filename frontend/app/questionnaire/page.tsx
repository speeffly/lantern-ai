'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';

interface Question {
  id: string;
  order: number;
  text: string;
  type: string;
  category: string;
  required: boolean;
  appliesTo?: string[];
  branchingQuestion?: boolean;
  options?: Array<{
    value: string;
    label: string;
    description?: string;
    nextPath?: string;
  }>;
  fields?: any;
  subjects?: any[];
  ratingScale?: any[];
  placeholder?: string;
  minLength?: number;
  maxLength?: number;
  minSelections?: number;
  maxSelections?: number;
}

interface PathConfig {
  name: string;
  description: string;
  questionFlow: string[];
  totalQuestions: number;
  focusAreas: string[];
}

export default function QuestionnairePage() {
  const router = useRouter();
  const [assessment, setAssessment] = useState<any>(null);
  const [currentPath, setCurrentPath] = useState<string>('');
  const [pathConfig, setPathConfig] = useState<PathConfig | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<{ [key: string]: any }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    loadAssessment();
  }, []);

  useEffect(() => {
    if (questions.length > 0) {
      calculateProgress();
    }
  }, [currentQuestionIndex, questions]);

  const loadAssessment = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/assessment/v2`);
      const data = await response.json();
      
      if (data.success) {
        setAssessment(data.data);
        // Start with just the basic info question
        const basicInfoQuestion = data.data.questions.find((q: Question) => q.id === 'basic_info');
        if (basicInfoQuestion) {
          setQuestions([basicInfoQuestion]);
        }
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error loading assessment:', error);
      setIsLoading(false);
    }
  };

  const calculateProgress = () => {
    if (questions.length === 0) return;
    const completedQuestions = Object.keys(responses).length;
    const totalQuestions = questions.length;
    setProgress(Math.round((completedQuestions / totalQuestions) * 100));
  };

  const handleResponse = async (questionId: string, value: any) => {
    const newResponses = { ...responses, [questionId]: value };
    setResponses(newResponses);

    // If we just completed basic_info, show path selection
    if (questionId === 'basic_info' && currentQuestionIndex === 0) {
      showPathSelection();
    }
    
    // Check if this is the main work preference question
    if (questionId === 'work_preference_main') {
      // Load the rest of the questions for this path
      await loadRemainingQuestions();
    }
  };

  const showPathSelection = () => {
    // Show a simple path selection interface
    const pathSelectionQuestion: Question = {
      id: 'path_selection',
      order: 2,
      text: 'Do you have a clear idea of what type of work you want to do?',
      type: 'single_choice',
      category: 'path_selection',
      required: true,
      options: [
        {
          value: 'decided',
          label: 'Yes, I have some ideas about what I want to do',
          description: 'I have preferences about the type of work I want to do'
        },
        {
          value: 'undecided',
          label: 'No, I need help exploring different options',
          description: 'I\'m not sure what type of work would be good for me'
        }
      ]
    };
    
    setQuestions([...questions, pathSelectionQuestion]);
    setCurrentQuestionIndex(1);
  };

  const loadRemainingQuestions = async () => {
    if (!currentPath) return;
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/assessment/v2/questions/${currentPath}`);
      const data = await response.json();
      
      if (data.success) {
        // Replace current questions with the full path questions
        setQuestions(data.data.questions);
        setPathConfig(data.data.pathConfig);
        // Move to the next question after work preference
        const workPrefIndex = data.data.questions.findIndex((q: Question) => 
          q.id === 'work_preference_main'
        );
        setCurrentQuestionIndex(workPrefIndex + 1);
      }
    } catch (error) {
      console.error('Error loading remaining questions:', error);
    }
  };

  const handlePathSelection = async (selectedPath: string) => {
    setCurrentPath(selectedPath);
    
    // Load the work preference question for the selected path
    if (assessment) {
      const workPrefQuestion = assessment.questions.find((q: Question) => q.id === 'work_preference_main');
      
      if (workPrefQuestion) {
        setQuestions([questions[0], workPrefQuestion]); // Keep basic_info and add work preference
        setCurrentQuestionIndex(1);
      }
    }
  };

  const loadPathQuestions = async (path: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/assessment/v2/questions/${path}`);
      const data = await response.json();
      
      if (data.success) {
        setQuestions(data.data.questions);
        setPathConfig(data.data.pathConfig);
        // Reset to first question of the path
        setCurrentQuestionIndex(0);
      }
    } catch (error) {
      console.error('Error loading path questions:', error);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const submitAssessment = async () => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/assessment/v2/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          responses,
          path: currentPath
        })
      });

      const data = await response.json();
      if (data.success) {
        // Store results and original responses for the results page
        const resultsWithResponses = {
          ...data.data,
          originalResponses: responses
        };
        localStorage.setItem('improvedAssessmentResults', JSON.stringify(resultsWithResponses));
        
        // Redirect to improved results page
        router.push('/improved-results');
      } else {
        alert('Error submitting assessment: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error submitting assessment:', error);
      alert('Error submitting assessment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderQuestion = (question: Question) => {
    const currentResponse = responses[question.id];

    // Special handling for path selection
    if (question.id === 'path_selection') {
      return (
        <div className="space-y-3">
          {question.options?.map((option) => (
            <label key={option.value} className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="radio"
                name={question.id}
                value={option.value}
                checked={currentResponse === option.value}
                onChange={(e) => {
                  handleResponse(question.id, e.target.value);
                  handlePathSelection(e.target.value);
                }}
                className="mt-1"
              />
              <div>
                <div className="font-medium">{option.label}</div>
                {option.description && (
                  <div className="text-sm text-gray-600 mt-1">{option.description}</div>
                )}
              </div>
            </label>
          ))}
        </div>
      );
    }

    switch (question.type) {
      case 'single_choice':
        return (
          <div className="space-y-3">
            {question.options?.map((option) => (
              <label key={option.value} className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name={question.id}
                  value={option.value}
                  checked={currentResponse === option.value}
                  onChange={(e) => handleResponse(question.id, e.target.value)}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium">{option.label}</div>
                  {option.description && (
                    <div className="text-sm text-gray-600 mt-1">{option.description}</div>
                  )}
                </div>
              </label>
            ))}
          </div>
        );

      case 'multiple_choice':
        return (
          <div className="space-y-3">
            {question.options?.map((option) => (
              <label key={option.value} className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  value={option.value}
                  checked={Array.isArray(currentResponse) && currentResponse.includes(option.value)}
                  onChange={(e) => {
                    const currentArray = Array.isArray(currentResponse) ? currentResponse : [];
                    if (e.target.checked) {
                      handleResponse(question.id, [...currentArray, option.value]);
                    } else {
                      handleResponse(question.id, currentArray.filter(v => v !== option.value));
                    }
                  }}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium">{option.label}</div>
                  {option.description && (
                    <div className="text-sm text-gray-600 mt-1">{option.description}</div>
                  )}
                </div>
              </label>
            ))}
          </div>
        );

      case 'combined':
        return (
          <div className="space-y-4">
            {question.fields && Object.entries(question.fields).map(([fieldKey, fieldConfig]: [string, any]) => (
              <div key={fieldKey}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {fieldConfig.label}
                </label>
                {fieldConfig.type === 'select' ? (
                  <select
                    value={currentResponse?.[fieldKey] || ''}
                    onChange={(e) => handleResponse(question.id, { ...currentResponse, [fieldKey]: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select {fieldConfig.label}</option>
                    {fieldConfig.options?.map((option: string) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={fieldConfig.type}
                    placeholder={fieldConfig.placeholder}
                    maxLength={fieldConfig.maxLength}
                    value={currentResponse?.[fieldKey] || ''}
                    onChange={(e) => handleResponse(question.id, { ...currentResponse, [fieldKey]: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                )}
              </div>
            ))}
          </div>
        );

      case 'matrix':
        return (
          <div className="space-y-4">
            {question.subjects?.map((subject) => (
              <div key={subject.id} className="border rounded-lg p-4 bg-white">
                <div className="font-medium mb-2">{subject.label}</div>
                <div className="text-sm text-gray-600 mb-3">{subject.description}</div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Not Interested</span>
                  <div className="flex gap-4">
                    {question.ratingScale?.map((rating) => (
                      <label key={rating.value} className="flex flex-col items-center cursor-pointer">
                        <input
                          type="radio"
                          name={`${question.id}_${subject.id}`}
                          value={rating.value}
                          checked={currentResponse?.[subject.id] === rating.value}
                          onChange={(e) => handleResponse(question.id, { ...currentResponse, [subject.id]: e.target.value })}
                          className="mb-1"
                          required={question.required}
                        />
                        <span className="text-sm font-medium">{rating.label}</span>
                        <span className="text-xs text-gray-500 text-center">{rating.description}</span>
                      </label>
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">Very Interested</span>
                </div>
              </div>
            ))}
          </div>
        );

      case 'free_text':
        return (
          <textarea
            placeholder={question.placeholder}
            minLength={question.minLength}
            maxLength={question.maxLength}
            value={currentResponse || ''}
            onChange={(e) => handleResponse(question.id, e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[120px]"
            rows={4}
          />
        );

      default:
        return (
          <input
            type="text"
            placeholder={question.placeholder}
            value={currentResponse || ''}
            onChange={(e) => handleResponse(question.id, e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Career Assessment" />
        <div className="flex items-center justify-center pt-20">
          <div className="text-xl">Loading assessment...</div>
        </div>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Career Assessment" />
        <div className="flex items-center justify-center pt-20">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Assessment Not Available</h2>
            <p className="text-gray-600">Please try again later.</p>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  
  // Check if current question can proceed
  let canProceed = false;
  
  const response = responses[currentQuestion.id];
  
  if (currentQuestion.required) {
    if (currentQuestion.type === 'combined') {
      // For combined fields, check if all required fields are filled
      if (currentQuestion.fields && response) {
        canProceed = Object.entries(currentQuestion.fields).every(([fieldKey, fieldConfig]: [string, any]) => {
          if (fieldConfig.required) {
            return response[fieldKey] && response[fieldKey] !== '';
          }
          return true;
        });
      }
    } else if (currentQuestion.type === 'multiple_choice') {
      // For multiple choice, check minimum selections
      canProceed = Array.isArray(response) && response.length >= (currentQuestion.minSelections || 1);
    } else if (currentQuestion.type === 'matrix') {
      // For matrix questions (subject ratings), check if all subjects are rated
      if (currentQuestion.subjects && response) {
        canProceed = currentQuestion.subjects.every((subject: any) => {
          return response[subject.id] && response[subject.id] !== '';
        });
      }
    } else {
      // For other types, just check if response exists
      canProceed = response !== undefined && response !== '' && response !== null;
    }
  } else {
    // Optional questions can always proceed
    canProceed = true;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Career Assessment" />
      <div className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
              <span className="text-sm font-medium text-gray-700">{progress}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Path Information */}
          {pathConfig && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900">{pathConfig.name}</h3>
              <p className="text-sm text-blue-700">{pathConfig.description}</p>
              <div className="text-xs text-blue-600 mt-1">
                Focus areas: {pathConfig.focusAreas.join(', ')}
              </div>
            </div>
          )}

          {/* Question Card */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {currentQuestion.text}
              </h2>
              {currentQuestion.required && (
                <span className="text-sm text-red-600">* Required</span>
              )}
            </div>

            <div className="mb-8">
              {renderQuestion(currentQuestion)}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between">
              <button
                onClick={previousQuestion}
                disabled={currentQuestionIndex === 0}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {isLastQuestion ? (
                <button
                  onClick={submitAssessment}
                  disabled={!canProceed || isSubmitting}
                  className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : 'Get My Results'}
                </button>
              ) : (
                <button
                  onClick={nextQuestion}
                  disabled={!canProceed}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              )}
            </div>
          </div>

          {/* Help Text */}
          <div className="mt-6 text-center text-sm text-gray-600">
            <p>
              This assessment uses advanced AI to provide personalized career recommendations.
              Your responses help us understand your interests, strengths, and goals.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}