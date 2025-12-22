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
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      console.log('Fetching counselor questions from:', `${apiUrl}/api/counselor-assessment/questions`);
      
      const response = await fetch(`${apiUrl}/api/counselor-assessment/questions`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Received questions data:', data);
      
      if (data.success) {
        console.log('Number of questions received:', data.data.length);
        setQuestions(data.data.sort((a: CounselorQuestion, b: CounselorQuestion) => a.order - b.order));
        setIsLoading(false);
      } else {
        throw new Error(data.error || 'Failed to load questions');
      }
    } catch (error) {
      console.error('Error fetching counselor questions:', error);
      
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
        formData.append('transcriptFile', finalResponses.academicPerformance.transcriptFile);

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
                      : selectedOptions.filter(item => item !== option);
                    
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

  // Debug info
  console.log('Current questions array:', questions.length, 'questions loaded');
  console.log('Current question index:', currentIndex);
  console.log('Current question:', currentQuestion);

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Enhanced Career Assessment" />
        <div className="py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-red-600 mb-4">Error: No Question Found</h2>
              <p className="text-red-600">
                Question index {currentIndex} not found. Total questions: {questions.length}
              </p>
              <details className="mt-4">
                <summary className="cursor-pointer text-red-600">Show all questions</summary>
                <pre className="text-xs text-red-500 mt-2 overflow-auto">
                  {JSON.stringify(questions, null, 2)}
                </pre>
              </details>
            </div>
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