'use client';

import React, { useState } from 'react';

// Static questionnaire data for testing
const staticQuestionnaire: {
  version: string;
  title: string;
  description: string;
  sections: {
    id: string;
    title: string;
    questions: Question[];
  }[];
} = {
  "version": "v1",
  "title": "Lantern AI Career Questionnaire",
  "description": "Comprehensive career exploration questionnaire for high school students",
  "sections": [
    {
      "id": "basic_info",
      "title": "Basic Information",
      "questions": [
        {
          "id": "grade",
          "text": "Grade (single choice)",
          "type": "single_select",
          "required": true,
          "options": ["9th", "10th", "11th", "12th"]
        },
        {
          "id": "zipCode",
          "text": "ZIP code (text) - check for validity",
          "type": "text",
          "required": true,
          "placeholder": "12345"
        }
      ]
    },
    {
      "id": "work_environment",
      "title": "Work Environment Preferences",
      "questions": [
        {
          "id": "workEnvironment",
          "text": "Where do you see yourself working most comfortably? (multi-select)",
          "type": "multi_select",
          "required": true,
          "options": [
            "Outdoors (construction sites, farms, parks)",
            "Indoors (offices, hospitals, schools)",
            "A mix of indoor and outdoor work",
            "From home / remote",
            "Traveling to different locations"
          ]
        }
      ]
    },
    {
      "id": "work_style",
      "title": "Work Style",
      "questions": [
        {
          "id": "workStyle",
          "text": "How do you prefer to work? (multi-select)",
          "type": "multi_select",
          "required": true,
          "options": [
            "Building, fixing, or working with tools",
            "Helping people directly",
            "Working with computers or technology",
            "Working with numbers, data, or analysis",
            "Creating designs, art, music, or media"
          ]
        }
      ]
    }
  ]
};

interface Question {
  id: string;
  text: string;
  type: 'single_select' | 'multi_select' | 'text' | 'text_area' | 'matrix';
  required: boolean;
  options?: string[];
  subjects?: string[];
  placeholder?: string;
}

export default function QuestionnaireDebug() {
  const [currentSection, setCurrentSection] = useState(0);
  const [responses, setResponses] = useState<{ [key: string]: any }>({});
  const [apiTest, setApiTest] = useState<string>('Not tested');

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

  const testAPI = async () => {
    try {
      setApiTest('Testing...');
      const response = await fetch('/api/questionnaire');
      const data = await response.json();
      
      if (data.success) {
        setApiTest(`✅ API Working - ${data.data.sections.length} sections loaded`);
      } else {
        setApiTest(`❌ API Error: ${data.error}`);
      }
    } catch (error) {
      setApiTest(`💥 Network Error: ${error}`);
    }
  };

  const renderQuestion = (question: Question) => {
    const value = responses[question.id];

    switch (question.type) {
      case 'single_select':
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

      default:
        return <div>Unsupported question type: {question.type}</div>;
    }
  };

  const currentSectionData = staticQuestionnaire.sections[currentSection];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Questionnaire Debug Page</h1>
            <p className="text-gray-600 mt-2">Testing questionnaire display with static data</p>
            
            {/* API Test */}
            <div className="mt-4 p-3 bg-gray-100 rounded">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">API Status: {apiTest}</span>
                <button 
                  onClick={testAPI}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                  Test API
                </button>
              </div>
            </div>
          </div>

          {/* Section Navigation */}
          <div className="mb-6">
            <div className="flex space-x-2 overflow-x-auto">
              {staticQuestionnaire.sections.map((section, index) => (
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
            
            {/* Debug info */}
            <div className="mb-4 p-2 bg-yellow-100 rounded text-xs text-gray-700">
              <strong>Debug Info:</strong><br/>
              Section: {currentSection + 1} of {staticQuestionnaire.sections.length}<br/>
              Questions in section: {currentSectionData.questions.length}<br/>
              Current responses: {JSON.stringify(responses, null, 2)}
            </div>
            
            <div className="space-y-6">
              {currentSectionData.questions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No questions in this section
                </div>
              ) : (
                currentSectionData.questions.map((question) => (
                  <div key={question.id} className="border-b border-gray-200 pb-6">
                    <label className="block text-sm font-medium text-gray-900 mb-3">
                      {question.text}
                      {question.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    <div className="mb-2 text-xs text-gray-500">
                      Type: {question.type} | ID: {question.id} | Options: {question.options?.length || 0}
                    </div>
                    {renderQuestion(question)}
                  </div>
                ))
              )}
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

            <button
              onClick={() => setCurrentSection(Math.min(staticQuestionnaire.sections.length - 1, currentSection + 1))}
              disabled={currentSection === staticQuestionnaire.sections.length - 1}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next Section
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}