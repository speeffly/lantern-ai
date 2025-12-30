'use client';

import { useState } from 'react';

interface FeedbackWidgetProps {
  careerCode: string;
  careerTitle: string;
  userId?: number;
  sessionId?: string;
  recommendationId?: number;
  onFeedbackSubmitted?: () => void;
}

export default function FeedbackWidget({
  careerCode,
  careerTitle,
  userId,
  sessionId,
  recommendationId,
  onFeedbackSubmitted
}: FeedbackWidgetProps) {
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'rating' | 'helpful' | 'comment'>('rating');
  const [rating, setRating] = useState(0);
  const [isHelpful, setIsHelpful] = useState<boolean | null>(null);
  const [comment, setComment] = useState('');
  const [improvementSuggestions, setImprovementSuggestions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const submitFeedback = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const feedbackData = {
        userId,
        sessionId,
        recommendationId,
        careerCode,
        careerTitle,
        feedbackType,
        rating: feedbackType === 'rating' ? rating : undefined,
        isHelpful: feedbackType === 'helpful' ? isHelpful : undefined,
        comment: comment.trim() || undefined,
        improvementSuggestions: improvementSuggestions.trim() || undefined
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/feedback/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedbackData)
      });

      if (response.ok) {
        setSubmitted(true);
        setShowFeedback(false);
        onFeedbackSubmitted?.();
        
        // Reset form after a delay
        setTimeout(() => {
          setSubmitted(false);
          setRating(0);
          setIsHelpful(null);
          setComment('');
          setImprovementSuggestions('');
        }, 3000);
      } else {
        throw new Error('Failed to submit feedback');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = () => {
    switch (feedbackType) {
      case 'rating':
        return rating > 0;
      case 'helpful':
        return isHelpful !== null;
      case 'comment':
        return comment.trim().length > 0;
      default:
        return false;
    }
  };

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
        <div className="flex items-center">
          <div className="text-green-600 mr-2">✓</div>
          <div className="text-green-800">
            <p className="font-medium">Thank you for your feedback!</p>
            <p className="text-sm">Your input helps us improve our recommendations.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-gray-900">How helpful was this recommendation?</h4>
        {!showFeedback && (
          <button
            onClick={() => setShowFeedback(true)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Give Feedback
          </button>
        )}
      </div>

      {showFeedback && (
        <div className="space-y-4">
          {/* Feedback Type Selection */}
          <div className="flex space-x-4">
            <button
              onClick={() => setFeedbackType('rating')}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                feedbackType === 'rating'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Rate (1-5)
            </button>
            <button
              onClick={() => setFeedbackType('helpful')}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                feedbackType === 'helpful'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Helpful?
            </button>
            <button
              onClick={() => setFeedbackType('comment')}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                feedbackType === 'comment'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Comment
            </button>
          </div>

          {/* Rating Input */}
          {feedbackType === 'rating' && (
            <div>
              <p className="text-sm text-gray-600 mb-2">Rate this recommendation:</p>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={`text-2xl ${
                      star <= rating ? 'text-yellow-400' : 'text-gray-300'
                    } hover:text-yellow-400`}
                  >
                    ★
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-sm text-gray-600 mt-1">
                  {rating === 1 && 'Not helpful'}
                  {rating === 2 && 'Slightly helpful'}
                  {rating === 3 && 'Moderately helpful'}
                  {rating === 4 && 'Very helpful'}
                  {rating === 5 && 'Extremely helpful'}
                </p>
              )}
            </div>
          )}

          {/* Helpful/Not Helpful Input */}
          {feedbackType === 'helpful' && (
            <div>
              <p className="text-sm text-gray-600 mb-2">Was this recommendation helpful?</p>
              <div className="flex space-x-4">
                <button
                  onClick={() => setIsHelpful(true)}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    isHelpful === true
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  👍 Yes, helpful
                </button>
                <button
                  onClick={() => setIsHelpful(false)}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    isHelpful === false
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  👎 Not helpful
                </button>
              </div>
            </div>
          )}

          {/* Comment Input */}
          {feedbackType === 'comment' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your feedback:
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tell us what you think about this recommendation..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Improvement Suggestions (always shown) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              How can we improve this recommendation? (optional)
            </label>
            <textarea
              value={improvementSuggestions}
              onChange={(e) => setImprovementSuggestions(e.target.value)}
              placeholder="Suggestions for making this recommendation more helpful..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowFeedback(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={submitFeedback}
              disabled={!canSubmit() || isSubmitting}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                canSubmit() && !isSubmitting
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}