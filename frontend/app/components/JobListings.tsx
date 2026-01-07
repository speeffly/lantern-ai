'use client';

import { useEffect, useState } from 'react';

interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  salary?: string;
  description: string;
  requirements: string[];
  postedDate: string;
  applicationUrl: string;
  source: 'indeed' | 'linkedin' | 'local' | 'government';
  experienceLevel: 'entry' | 'mid' | 'senior';
  educationRequired: string;
  distanceFromStudent?: number;
}

interface JobListingsProps {
  careerTitle?: string;
  zipCode?: string;
  keywords?: string;
  limit?: number;
  showTitle?: boolean;
}

export default function JobListings({ 
  careerTitle, 
  zipCode, 
  keywords,
  limit = 5, 
  showTitle = true 
}: JobListingsProps) {
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log('🔧 JobListings component rendered with props:', {
    careerTitle,
    zipCode,
    keywords,
    limit,
    showTitle
  });

  useEffect(() => {
    console.log('🔧 JobListings useEffect triggered:', { zipCode, careerTitle, keywords, limit });
    if (zipCode) {
      console.log('✅ ZIP code exists, calling fetchJobs');
      fetchJobs();
    } else {
      console.log('❌ No ZIP code, skipping fetchJobs');
    }
  }, [careerTitle, zipCode, keywords, limit]);

  const fetchJobs = async () => {
    try {
      setIsLoading(true);
      setError(null);

      let url = `${process.env.NEXT_PUBLIC_API_URL}/api/jobs/search?zipCode=${zipCode}&limit=${limit}`;
      
      // Priority: keywords > careerTitle
      if (keywords && keywords.trim()) {
        url += `&keywords=${encodeURIComponent(keywords.trim())}`;
        console.log('🔍 Searching with keywords:', keywords.trim());
      } else if (careerTitle) {
        url += `&career=${encodeURIComponent(careerTitle)}`;
        console.log('🎯 Searching with career:', careerTitle);
      }

      console.log('📡 Job search URL:', url);

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        console.log('✅ Jobs found:', data.data.length);
        setJobs(data.data);
      } else {
        console.log('❌ Job search failed:', data.error);
        setError('Failed to load job listings');
      }
    } catch (error) {
      console.error('❌ Error fetching jobs:', error);
      setError('Failed to connect to job service');
    } finally {
      setIsLoading(false);
    }
  };

  const getSourceIcon = (source: string) => {
    const icons = {
      indeed: '🔍',
      linkedin: '💼',
      local: '🏘️',
      government: '🏛️'
    };
    return icons[source as keyof typeof icons] || '💼';
  };

  const getExperienceBadge = (level: string) => {
    const badges = {
      entry: { color: 'bg-green-100 text-green-800', label: 'Entry Level' },
      mid: { color: 'bg-blue-100 text-blue-800', label: 'Mid Level' },
      senior: { color: 'bg-purple-100 text-purple-800', label: 'Senior Level' }
    };
    return badges[level as keyof typeof badges] || badges.entry;
  };

  const formatPostedDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 14) return '1 week ago';
    return `${Math.floor(diffDays / 7)} weeks ago`;
  };

  if (!zipCode) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <p className="text-gray-600">Enter your ZIP code to see local job opportunities</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {showTitle && <h3 className="text-lg font-semibold text-gray-900">Current Job Openings</h3>}
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-lg p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">{error}</p>
        <button 
          onClick={fetchJobs}
          className="mt-2 text-red-600 hover:text-red-800 text-sm underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <p className="text-gray-600">
          No current openings found for 
          {keywords && keywords.trim() ? ` "${keywords.trim()}"` : 
           careerTitle ? ` ${careerTitle}` : ' entry-level positions'} in your area.
        </p>
        <p className="text-gray-500 text-sm mt-2">
          Try different keywords or check back regularly as new positions are posted frequently.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {showTitle && (
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Current Job Openings
            {keywords && keywords.trim() && ` - "${keywords.trim()}"`}
            {!keywords && careerTitle && ` - ${careerTitle}`}
          </h3>
          <span className="text-sm text-gray-500">
            {jobs.length} position{jobs.length !== 1 ? 's' : ''} found
          </span>
        </div>
      )}
      
      <div className="space-y-3">
        {jobs.map((job) => (
          <div key={job.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-gray-900">{job.title}</h4>
                  <span className="text-lg">{getSourceIcon(job.source)}</span>
                </div>
                <p className="text-gray-600 text-sm">{job.company} • {job.location}</p>
                {job.distanceFromStudent && (
                  <p className="text-gray-500 text-xs">{job.distanceFromStudent} miles away</p>
                )}
              </div>
              <div className="text-right">
                {job.salary && (
                  <p className="font-semibold text-green-600 text-sm">{job.salary}</p>
                )}
                <p className="text-gray-500 text-xs">{formatPostedDate(job.postedDate)}</p>
              </div>
            </div>

            <p className="text-gray-700 text-sm mb-3 line-clamp-2">{job.description}</p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 text-xs rounded-full ${getExperienceBadge(job.experienceLevel).color}`}>
                  {getExperienceBadge(job.experienceLevel).label}
                </span>
                <span className="text-xs text-gray-500">{job.educationRequired}</span>
              </div>
              
              <a
                href={job.applicationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
              >
                Apply Now →
              </a>
            </div>

            {job.requirements.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-600 mb-1">Key Requirements:</p>
                <div className="flex flex-wrap gap-1">
                  {job.requirements.slice(0, 3).map((req, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                      {req}
                    </span>
                  ))}
                  {job.requirements.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                      +{job.requirements.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="text-center pt-4">
        <p className="text-xs text-gray-500">
          Job listings are updated regularly. Apply early for best consideration.
        </p>
      </div>
    </div>
  );
}