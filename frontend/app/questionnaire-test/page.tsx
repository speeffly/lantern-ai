'use client';

import React, { useState, useEffect } from 'react';

interface Question {
  id: string;
  type: 'single_select' | 'multi_select' | 'text' | 'text_long' | 'matrix';
  label: string;
  options?: string[] | Array<{ key: string; label: string }>;
  rows?: string[];
  columns?: string[];
  required: boolean;
}

interface Questionnaire {
  version: string;
  title: string;
  description: string;
  questions: Question[];
}

export default function QuestionnaireTest() {
  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null);
  const [responses, setResponses] = useState<{ [key: string]: any }>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [progress, setProgress] = useState({ percentComplete: 0, completedQuestions: 0, totalQuestions: 0 });

  useEffect(() => {
    fetchQuestionnaire();
  }, []);

  useEffect(() => {
    if (questionnaire) {
      calculateProgress();
    }
  }, [responses, questionnaire]);

  const fetchQuestionnaire = async () => {
    try {
      console.log('🔍 Fetching questionnaire from /api/questionnaire...');
      const response = await fetch('/api/questionnaire');
      console.log('📡 Response status:', response.status);
      
      const data = await response.json();
      console.log('📊 Response data:', data);
      
      if (data.success) {
        console.log('✅ Questionnaire loaded successfully');
        console.log('📋 Questions:', data.data.questions.length);
        console.log('📊 All question IDs:', data.data.questions.map((q: any) => q.id));
        setQuestionnaire(data.data);
      } else {
        console.error('❌ Failed to fetch questionnaire:', data.error);
        alert('Failed to load questionnaire: ' + data.error);
      }
    } catch (error) {
      console.error('💥 Error fetching questionnaire:', error);
      alert('Error loading questionnaire. Please make sure the server is running.');
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = async () => {
    try {
      const response = await fetch('/api/questionnaire/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(responses)
      });
      const data = await response.json();
      
      if (data.success) {
        setProgress(data.data);
      }
    } catch (error) {
      console.error('Error calculating progress:', error);
    }
  };

  const handleInputChange = (questionId: string, value: any) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleMultiSelectChange = (questionId: string, optionKey: string, checked: boolean) => {
    setResponses(prev => {
      const currentValues = prev[questionId] || [];
      if (checked) {
        return {
          ...prev,
          [questionId]: [...currentValues, optionKey]
        };
      } else {
        return {
          ...prev,
          [questionId]: currentValues.filter((v: string) => v !== optionKey)
        };
      }
    });
  };

  const handleMatrixChange = (questionId: string, row: string, column: string) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        [row]: column
      }
    }));
  };

  const submitQuestionnaire = async () => {
    setSubmitting(true);
    try {
      const response = await fetch('/api/questionnaire/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(responses)
      });
      const data = await response.json();
      
      if (data.success) {
        setResults(data.data);
      } else {
        alert('Submission failed: ' + data.error);
      }
    } catch (error) {
      console.error('Error submitting questionnaire:', error);
      alert('Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const renderQuestion = (question: Question) => {
    const value = responses[question.id];

    switch (question.type) {
      case 'single_select':
        return (
          <div className="space-y-2">
            {question.options?.map((option) => {
              const optionValue = typeof option === 'string' ? option : option.key;
              const optionLabel = typeof option === 'string' ? option : option.label;
              
              return (
                <label key={optionValue} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name={question.id}
                    value={optionValue}
                    checked={value === optionValue}
                    onChange={(e) => handleInputChange(question.id, e.target.value)}
                    className="text-blue-600"
                  />
                  <span className="text-sm">{optionLabel}</span>
                </label>
              );
            })}
          </div>
        );

      case 'multi_select':
        return (
          <div className="space-y-2">
            {question.options?.map((option) => {
              const optionValue = typeof option === 'string' ? option : option.key;
              const optionLabel = typeof option === 'string' ? option : option.label;
              
              return (
                <label key={optionValue} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={(value || []).includes(optionValue)}
                    onChange={(e) => handleMultiSelectChange(question.id, optionValue, e.target.checked)}
                    className="text-blue-600"
                  />
                  <span className="text-sm">{optionLabel}</span>
                </label>
              );
            })}
          </div>
        );

      case 'text':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        );

      case 'text_long':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            rows={4}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        );

      case 'matrix':
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-6 gap-2 text-xs font-medium text-gray-600 mb-2">
              <div></div>
              {question.columns?.map((column) => (
                <div key={column} className="text-center">{column}</div>
              ))}
            </div>
            {question.rows?.map((row) => (
              <div key={row} className="grid grid-cols-6 gap-2 items-center">
                <span className="text-sm font-medium">{row}</span>
                {question.columns?.map((column) => (
                  <div key={column} className="text-center">
                    <input
                      type="radio"
                      name={`${question.id}_${row}`}
                      value={column}
                      checked={(value && value[row]) === column}
                      onChange={(e) => handleMatrixChange(question.id, row, e.target.value)}
                      className="text-blue-600"
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        );

      default:
        return <div>Unsupported question type: {question.type}</div>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading questionnaire...</p>
        </div>
      </div>
    );
  }

  if (results) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Career Recommendations</h1>
            
            {/* Student Profile Summary */}
            <div className="mb-8 p-4 bg-blue-50 rounded-lg">
              <h2 className="text-lg font-semibold text-blue-900 mb-2">Profile Summary</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Grade:</strong> {results.studentProfile.grade}th
                </div>
                <div>
                  <strong>ZIP Code:</strong> {results.studentProfile.zipCode}
                </div>
                <div>
                  <strong>Education Willingness:</strong> {results.studentProfile.educationWillingness}
                </div>
                <div>
                  <strong>Career Confidence:</strong> {results.studentProfile.careerConfidence}
                </div>
              </div>
            </div>

            {/* Top Clusters */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Career Areas</h2>
              <div className="space-y-3">
                {results.recommendations.top_clusters.map((cluster: any, index: number) => (
                  <div key={cluster.cluster_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <span className="font-medium">{index + 1}. {cluster.name}</span>
                      <p className="text-sm text-gray-600">{cluster.reasoning.join(', ')}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-blue-600">{cluster.score}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Career Recommendations */}
            <div className="space-y-6">
              {/* Best Fit */}
              <div>
                <h3 className="text-md font-semibold text-green-700 mb-3">Best Fit Careers</h3>
                <div className="space-y-2">
                  {results.recommendations.career_recommendations.best_fit.map((career: any) => (
                    <div key={career.career.career_id} className="p-3 bg-green-50 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-green-900">{career.career.name}</h4>
                          <p className="text-sm text-green-700">{career.reasoning.join(', ')}</p>
                          {career.feasibility_notes && (
                            <p className="text-xs text-orange-600 mt-1">Note: {career.feasibility_notes.join(', ')}</p>
                          )}
                        </div>
                        <span className="text-lg font-bold text-green-600">{career.score}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Good Fit */}
              <div>
                <h3 className="text-md font-semibold text-blue-700 mb-3">Good Fit Careers</h3>
                <div className="space-y-2">
                  {results.recommendations.career_recommendations.good_fit.map((career: any) => (
                    <div key={career.career.career_id} className="p-3 bg-blue-50 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-blue-900">{career.career.name}</h4>
                          <p className="text-sm text-blue-700">{career.reasoning.join(', ')}</p>
                          {career.feasibility_notes && (
                            <p className="text-xs text-orange-600 mt-1">Note: {career.feasibility_notes.join(', ')}</p>
                          )}
                        </div>
                        <span className="text-lg font-bold text-blue-600">{career.score}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stretch Options */}
              <div>
                <h3 className="text-md font-semibold text-purple-700 mb-3">Stretch Options</h3>
                <div className="space-y-2">
                  {results.recommendations.career_recommendations.stretch_options.map((career: any) => (
                    <div key={career.career.career_id} className="p-3 bg-purple-50 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-purple-900">{career.career.name}</h4>
                          <p className="text-sm text-purple-700">{career.reasoning.join(', ')}</p>
                          {career.feasibility_notes && (
                            <p className="text-xs text-orange-600 mt-1">Note: {career.feasibility_notes.join(', ')}</p>
                          )}
                        </div>
                        <span className="text-lg font-bold text-purple-600">{career.score}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Validation Warnings */}
            {results.validation.warnings.length > 0 && (
              <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
                <h3 className="text-md font-semibold text-yellow-800 mb-2">Suggestions for Better Results</h3>
                <ul className="text-sm text-yellow-700 space-y-1">
                  {results.validation.warnings.map((warning: string, index: number) => (
                    <li key={index}>• {warning}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-8 text-center">
              <button
                onClick={() => {
                  setResults(null);
                  setResponses({});
                  setCurrentQuestionIndex(0);
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Take Questionnaire Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!questionnaire) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Failed to load questionnaire</p>
          <p className="text-sm text-gray-500 mt-2">Check the browser console for details</p>
          <button 
            onClick={fetchQuestionnaire}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questionnaire.questions[currentQuestionIndex];

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No question data available</p>
          <p className="text-sm text-gray-500 mt-2">Current question: {currentQuestionIndex + 1}, Total questions: {questionnaire.questions.length}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">{questionnaire.title}</h1>
            <p className="text-gray-600 mt-2">{questionnaire.description}</p>
            
            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Question {currentQuestionIndex + 1} of {questionnaire.questions.length}</span>
                <span>{progress.percentComplete}% complete</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestionIndex + 1) / questionnaire.questions.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Question Navigation */}
          <div className="mb-6">
            <div className="text-sm text-gray-600 mb-2">
              Debug: Showing {questionnaire.questions.length} questions total
            </div>
            <div className="flex space-x-1 overflow-x-auto">
              {questionnaire.questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`px-2 py-1 text-xs rounded-md whitespace-nowrap ${
                    index === currentQuestionIndex
                      ? 'bg-blue-600 text-white'
                      : responses[questionnaire.questions[index].id]
                      ? 'bg-green-200 text-green-800'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Current Question */}
          <div className="mb-8">
            <div className="border-b border-gray-200 pb-6">
              <label className="block text-lg font-medium text-gray-900 mb-4">
                {currentQuestion.label}
                {currentQuestion.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              {renderQuestion(currentQuestion)}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
              disabled={currentQuestionIndex === 0}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <div className="flex space-x-2">
              {currentQuestionIndex < questionnaire.questions.length - 1 ? (
                <button
                  onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Next Question
                </button>
              ) : (
                <button
                  onClick={submitQuestionnaire}
                  disabled={submitting}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {submitting ? 'Generating Recommendations...' : 'Get My Recommendations'}
                </button>
              )}
            </div>
          </div>

          {/* Debug Info */}
          <div className="mt-4 p-2 bg-gray-100 rounded text-xs text-gray-600">
            Debug: Question {currentQuestionIndex + 1} ({currentQuestion.id}) - Type: {currentQuestion.type} - 
            Response: {JSON.stringify(responses[currentQuestion.id])}
          </div>
        </div>
      </div>
    </div>
  );
}