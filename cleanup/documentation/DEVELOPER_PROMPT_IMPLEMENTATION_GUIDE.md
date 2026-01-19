# Developer Implementation Guide: Lantern AI Career Guidance Prompt

## Status: ✅ ALREADY IMPLEMENTED

The new Lantern AI career guidance prompt has been successfully implemented in the system. This guide documents the implementation for reference and future maintenance.

## Implementation Location

**File:** `backend/src/services/aiRecommendationService.ts`
**Methods Updated:**
- `callGemini()` - Line ~400-500
- `callOpenAI()` - Line ~600-700

## Current Implementation

### System Prompt (Both OpenAI and Gemini)

```typescript
const systemPrompt = `You are an AI system supporting Lantern AI, a career guidance platform for high school students. Your task is to analyze structured responses from the Lantern AI career assessment questionnaire and generate career recommendations along with a personalized career plan. The guidance must be realistic, student-friendly, and explainable. You must not invent job roles, ignore constraints, or override a student's explicitly stated career goal. Your recommendations should clearly reflect the student's actual responses rather than generic assumptions.

You must first determine whether the student already has a career direction. If the student indicates that they already know what career they want to pursue, you must respect that choice and focus your output on helping the student understand how to achieve that goal. In this case, you should not suggest unrelated careers. Your response should primarily consist of a clear, step-by-step career plan describing the education, skills, experiences, and milestones needed to reach the stated role. If the goal requires long-term or advanced education, you must clearly explain the timeline and expectations without discouraging the student.

If the student indicates that they do not yet have a career idea, you must recommend five to six relevant careers that align with the student's traits, interests, experiences, education willingness, and stated constraints. These careers should come from one or two related career categories rather than spanning unrelated fields. The goal is to help the student explore and narrow options, not to lock them into a single path. In this case, you must also provide a career exploration and preparation plan that includes practical short-term, mid-term, and longer-term steps to help the student move forward while continuing to learn about their interests.

All stated constraints must be respected. If a student indicates a need to start earning money soon, careers with long training timelines should not be prioritized. If a student indicates physical limitations, physically demanding roles should be avoided. If a student's education willingness does not match the typical requirements of a career, you must clearly explain that gap. The tone must remain encouraging, clear, and realistic, avoiding jargon and judgment. Your output must be structured, consistent, and focused on helping students either clarify their direction or confidently pursue their chosen goal, with the understanding that career paths can evolve over time.`;
```

## Key Implementation Features

### 1. Career Direction Analysis
- **Implemented**: AI first determines if student has career direction
- **Logic**: Analyzes student responses to identify career certainty
- **Branching**: Different guidance paths for decided vs. undecided students

### 2. Constraint Awareness
- **Implemented**: System respects all stated constraints
- **Examples**: Financial needs, physical limitations, education willingness
- **Validation**: AI cannot override explicit student goals

### 3. Personalization
- **Implemented**: Uses student's actual words and experiences
- **Source**: Free text responses from assessment
- **Application**: References specific interests, values, and experiences

### 4. Structured Output
- **Implemented**: Maintains existing JSON response format
- **Components**: academicPlan, careerPathway, skillGaps, actionItems
- **Compatibility**: Works with existing frontend and database systems

## Testing the Implementation

### 1. Verify AI Provider Configuration
```bash
# Check environment variables
echo $OPENAI_API_KEY
echo $GEMINI_API_KEY
echo $AI_PROVIDER
echo $USE_REAL_AI
```

### 2. Test with Sample Student Profile
```javascript
// Use existing test files
node backend/test-ai-personalization.js
node backend/test-career-matching.js
```

### 3. Monitor AI Response Quality
- Check logs for prompt usage
- Verify constraint respect in responses
- Confirm personalization using student data

## Configuration Options

### Environment Variables
```bash
# AI Provider Selection
AI_PROVIDER=openai  # or 'gemini'
USE_REAL_AI=true    # or 'false' for fallback mode

# API Keys
OPENAI_API_KEY=your_openai_key
GEMINI_API_KEY=your_gemini_key
```

### Fallback Behavior
- If `USE_REAL_AI=false`: Uses rule-based recommendations
- If API fails: Automatically falls back to structured recommendations
- If JSON parsing fails: Progressive fallback strategies implemented

## Monitoring and Maintenance

### 1. Response Quality Metrics
- Monitor constraint adherence
- Check personalization accuracy
- Verify career direction analysis

### 2. Error Handling
- JSON parsing errors logged and handled
- API failures trigger fallback mode
- Malformed responses cleaned automatically

### 3. Performance Monitoring
- Track AI response times
- Monitor API usage and costs
- Log successful vs. fallback responses

## Future Enhancements

### Potential Improvements
1. **Dynamic Prompt Adjustment**: Adapt prompt based on student grade level
2. **Constraint Weighting**: Prioritize constraints based on importance
3. **Career Database Integration**: Reference specific local career data
4. **Feedback Loop**: Incorporate student feedback to improve recommendations

### Implementation Considerations
- Maintain backward compatibility with existing API
- Preserve JSON response structure
- Keep fallback mechanisms robust
- Monitor AI provider changes and updates

## Troubleshooting

### Common Issues
1. **JSON Parsing Errors**: Check `fixMalformedJSON()` method
2. **Constraint Violations**: Verify prompt includes all student constraints
3. **Generic Responses**: Ensure student data is properly formatted in context
4. **API Failures**: Check environment variables and API key validity

### Debug Commands
```bash
# Test AI configuration
node backend/debug-ai-config.js

# Test specific student profile
node backend/test-ai-career-pathway-fix.js

# Monitor AI responses
tail -f backend/logs/ai-recommendations.log
```

## Status Summary

✅ **Implementation Complete**: New prompt successfully integrated
✅ **Testing Verified**: All existing functionality maintained
✅ **Error Handling**: Robust fallback mechanisms in place
✅ **Documentation**: Complete implementation guide provided

The Lantern AI career guidance prompt is now active and providing structured, constraint-aware, personalized career recommendations for high school students.