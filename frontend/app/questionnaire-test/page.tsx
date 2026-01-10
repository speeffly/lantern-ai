'use client';

import React, { useState, useEffect } from 'react';

interface Question {
  id: string;
  text: string;
  type: 'single_choice' | 'multi_select' | 'text' | 'text_area' | 'matrix';
  required: boolean;
  options?: string[];
  subjects?: string[];
  placeholder?: string;
}

interface QuestionnaireSection {
  id: string;
  title: string;
  questions: Question[];
}

interface Questionnaire {
  version: string;
  title: string;
  description: string;
  sections: QuestionnaireSection[];
}

export default function QuestionnaireTest() {
  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null);
  const [responses, setResponses] = useState<{ [key: string]: any }>({});
  const [currentSection, setCurrentSection] = useState(0);
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
      const response = await fetch('/api/questionnaire');
      const data = await response.json();
      
      if (data.success) {
        setQuestionnaire(data.data);
      } else {
        console.error('Failed to fetch questionnaire:', data.error);
      }
    } catch (error) {
      console.error('Error fetching questionnaire:', error);
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

  const handleMultiSelectChange = (questionId: string, option: string, checked: boolean) => {
    setResponses(prev => {
      const currentValues = prev[questionId] || [];
      if (checked) {
        return {
          ...prev,
          [questionId]: [...currentValues, option]
        };
      } else {
        return {
          ...prev,
          [questionId]: currentValues.filter((v: string) => v !== option)
        };
      }
    });
  };

  const handleMatrixChange = (questionId: string, subject: string, rating: string) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        [subject]: rating
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
      case 'single_choice':
        return (
          <div className="space-y-2">
            {question.options?.map((option) => (
              <label key={option} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={value === option}
                  onChange={(e) => handleInputChange(question.id, e.target.value)}
                  className="text-blue-600"
                />
                <span className="text-sm">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'multi_select':
        return (
          <div className="space-y-2">
            {question.options?.map((option) => (
              <label key={option} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={(value || []).includes(option)}
                  onChange={(e) => handleMultiSelectChange(question.id, option, e.target.checked)}
                  className="text-blue-600"
                />
                <span className="text-sm">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'text':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            placeholder={question.placeholder}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        );

      case 'text_area':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            placeholder={question.placeholder}
            rows={4}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        );

      case 'matrix':
        return (
          <div className="space-y-3">
            {question.subjects?.map((subject) => (
              <div key={subject} className="flex items-center justify-between">
                <span className="text-sm font-medium w-1/3">{subject}</span>
                <div className="flex space-x-2">
                  {question.options?.map((option) => (
                    <label key={option} className="flex items-center space-x-1">
                      <input
                        type="radio"
                        name={`${question.id}_${subject}`}
                        value={option}
                        checked={(value && value[subject]) === option}
                        onChange={(e) => handleMatrixChange(question.id, subject, e.target.value)}
                        className="text-blue-600"
                      />
                      <span className="text-xs">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );

      default:
        return <div>Unsupported question type</div>;
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
                  <strong>Readiness Level:</strong> {results.studentProfile.readinessLevel}
                </div>
                <div>
                  <strong>Key Strengths:</strong> {results.studentProfile.keyStrengths.join(', ')}
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
                  setCurrentSection(0);
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
        </div>
      </div>
    );
  }

  const currentSectionData = questionnaire.sections[currentSection];

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
                <span>Progress: {progress.completedQuestions} of {progress.totalQuestions} questions</span>
                <span>{progress.percentComplete}% complete</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress.percentComplete}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Section Navigation */}
          <div className="mb-6">
            <div className="flex space-x-2 overflow-x-auto">
              {questionnaire.sections.map((section, index) => (
                <button
                  key={section.id}
                  onClick={() => setCurrentSection(index)}
                  className={`px-3 py-1 text-sm rounded-md whitespace-nowrap ${
                    index === currentSection
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {index + 1}. {section.title}
                </button>
              ))}
            </div>
          </div>

          {/* Current Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{currentSectionData.title}</h2>
            
            <div className="space-y-6">
              {currentSectionData.questions.map((question) => (
                <div key={question.id} className="border-b border-gray-200 pb-6">
                  <label className="block text-sm font-medium text-gray-900 mb-3">
                    {question.text}
                    {question.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {renderQuestion(question)}
                </div>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
              disabled={currentSection === 0}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <div className="flex space-x-2">
              {currentSection < questionnaire.sections.length - 1 ? (
                <button
                  onClick={() => setCurrentSection(currentSection + 1)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Next Section
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
        </div>
      </div>
    </div>
  );
}