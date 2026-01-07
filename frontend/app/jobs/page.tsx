'use client';

import { useEffect, useState } from 'react';
import Header from '../components/Header';
import JobListings from '../components/JobListings';

export default function JobsPage() {
  const [zipCode, setZipCode] = useState('');
  const [searchKeywords, setSearchKeywords] = useState('');
  const [selectedCareer, setSelectedCareer] = useState('');
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    // Load saved ZIP code
    const savedZipCode = localStorage.getItem('zipCode');
    if (savedZipCode) {
      setZipCode(savedZipCode);
      setShowResults(true);
    }
  }, []);

  const handleSearch = () => {
    console.log('🔍 Search button clicked:', { zipCode, searchKeywords, selectedCareer });
    
    // Validate ZIP code format
    const zipCodeRegex = /^\d{5}$/;
    if (!zipCodeRegex.test(zipCode)) {
      console.log('❌ Invalid ZIP code:', zipCode);
      alert('Please enter a valid 5-digit ZIP code (e.g., 12345)');
      return;
    }
    
    console.log('✅ ZIP code valid, proceeding with search');
    
    if (zipCode) {
      localStorage.setItem('zipCode', zipCode);
      setShowResults(true);
      console.log('✅ Search results enabled');
    }
  };

  const popularCareers = [
    'Registered Nurse',
    'Electrician', 
    'Medical Assistant',
    'Construction Worker',
    'Teacher',
    'Software Developer',
    'Mechanic',
    'Administrative Assistant'
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Job Search" />
      
      <div className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              💼 Find Your Next Opportunity
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover real job opportunities in your area. Search by career, keywords, or browse entry-level positions perfect for students and new graduates.
            </p>
          </div>

          {/* Search Form */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-6">Search Jobs</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ZIP Code *
                </label>
                <input
                  type="text"
                  value={zipCode}
                  onChange={(e) => {
                    // Only allow digits and limit to 5 characters
                    const value = e.target.value.replace(/\D/g, '').slice(0, 5);
                    setZipCode(value);
                  }}
                  placeholder="Enter your ZIP code (5 digits)"
                  maxLength={5}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Keywords (Optional)
                </label>
                <input
                  type="text"
                  value={searchKeywords}
                  onChange={(e) => setSearchKeywords(e.target.value)}
                  placeholder="e.g., healthcare, technology"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specific Career (Optional)
                </label>
                <select
                  value={selectedCareer}
                  onChange={(e) => setSelectedCareer(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Careers</option>
                  {popularCareers.map((career) => (
                    <option key={career} value={career}>{career}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-end gap-4">
              <button
                onClick={handleSearch}
                disabled={!zipCode || zipCode.length !== 5}
                className={`w-full md:w-auto px-8 py-3 rounded-lg font-medium transition-all duration-200 ${
                  !zipCode || zipCode.length !== 5
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg active:bg-blue-800 cursor-pointer'
                }`}
              >
                🔍 Search Jobs
              </button>
              
              {/* Button Status Indicator */}
              <div className="text-sm text-gray-500">
                {!zipCode ? (
                  <span className="text-red-500">⚠️ Enter ZIP code to enable search</span>
                ) : zipCode.length !== 5 ? (
                  <span className="text-yellow-500">⚠️ ZIP code must be 5 digits</span>
                ) : (
                  <span className="text-green-500">✅ Ready to search</span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Career Buttons */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-6">Popular Career Paths</h2>
            <p className="text-gray-600 mb-6">
              Click on a career to see current job openings in your area:
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {popularCareers.map((career) => (
                <button
                  key={career}
                  onClick={() => {
                    console.log('🎯 Career selected:', career);
                    setSelectedCareer(career);
                    if (zipCode && zipCode.length === 5) {
                      setShowResults(true);
                      console.log('✅ Showing results for career:', career);
                    } else {
                      console.log('⚠️ Need valid ZIP code to show results');
                      alert('Please enter a valid 5-digit ZIP code first');
                    }
                  }}
                  className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 active:bg-blue-100 transition-all duration-200 text-left cursor-pointer"
                >
                  <div className="font-medium text-gray-900">{career}</div>
                  <div className="text-xs text-gray-500 mt-1">Click to search</div>
                </button>
              ))}
            </div>
          </div>

          {/* Results */}
          {showResults && zipCode && (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold">Job Results</h2>
                <div className="text-sm text-gray-500">
                  Showing jobs within 40 miles of {zipCode}
                </div>
              </div>

              <JobListings 
                careerTitle={selectedCareer || undefined}
                zipCode={zipCode}
                limit={20}
                showTitle={false}
              />
            </div>
          )}

          {/* No ZIP Code Message */}
          {!zipCode && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
              <div className="text-6xl mb-4">📍</div>
              <h3 className="text-xl font-semibold text-blue-900 mb-2">
                Enter Your Location to Get Started
              </h3>
              <p className="text-blue-700">
                We need your ZIP code to show you relevant job opportunities in your area.
              </p>
            </div>
          )}

          {/* Benefits Section */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-lg font-semibold mb-2">Targeted Results</h3>
              <p className="text-gray-600">
                Jobs matched to your interests and career goals from your assessment.
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl mb-4">📍</div>
              <h3 className="text-lg font-semibold mb-2">Local Focus</h3>
              <p className="text-gray-600">
                All positions are within 40 miles of your location for realistic commuting.
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-lg font-semibold mb-2">Direct Apply</h3>
              <p className="text-gray-600">
                Click to apply directly to employers and start your career journey.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}