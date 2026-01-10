# Lantern AI Recommendation Engine v1

## Overview

The Lantern AI Recommendation Engine v1 is a **deterministic, rule-based career matching system** that provides consistent, explainable career recommendations for high school students. Unlike AI-based systems, this engine produces the same results for identical inputs, making it reliable and transparent.

## Key Features

### ✅ **Deterministic Output**
- Same input → Same output every time
- No randomness or AI variability
- Fully explainable recommendations

### ✅ **Comprehensive Assessment**
- 15+ question categories covering interests, academics, values, and constraints
- Multi-select and matrix questions for detailed profiling
- Optional reflection questions for deeper insights

### ✅ **Constraint-Aware Matching**
- Respects education willingness (work immediately vs. 4+ years college)
- Considers physical limitations and financial constraints
- Factors in support levels and risk tolerance

### ✅ **Structured Career Database**
- 80+ careers across 10 professional clusters
- Detailed metadata: education level, time to entry, physical demands, costs
- Primary and secondary cluster associations

### ✅ **Four-Year Planning**
- Grade-by-grade academic recommendations
- Career-specific course suggestions
- Post-graduation pathway planning

## Architecture

### Core Components

```
📁 Recommendation Engine v1
├── 📄 types/recommendation.ts          # TypeScript interfaces
├── 📄 config/cluster.config.ts        # Cluster definitions & mappings
├── 📄 data/careers.v1.json           # Career database (80+ careers)
├── 📄 services/recommendationEngine.ts # Core matching algorithm
├── 📄 routes/recommendations.ts        # API endpoints
└── 📄 test-recommendation.js          # Verification script
```

### API Endpoints

- **POST /api/recommendations** - Generate career recommendations
- **POST /api/recommendations/explanations** - Generate text explanations

## Career Clusters (Fixed)

The system uses 10 fixed career clusters with defined value profiles:

| Cluster | Name | Income | Stability | Helping | Risk |
|---------|------|--------|-----------|---------|------|
| **C1** | Skilled Trades & Technical | 0.6 | 0.8 | 0.5 | 0.3 |
| **C2** | Healthcare & Life Sciences | 0.7 | 0.9 | 0.9 | 0.2 |
| **C3** | Engineering & Technology | 0.8 | 0.65 | 0.4 | 0.55 |
| **C4** | Business, Finance & Management | 0.8 | 0.55 | 0.3 | 0.55 |
| **C5** | Arts, Media & Design | 0.45 | 0.35 | 0.4 | 0.75 |
| **C6** | Education & Social Services | 0.5 | 0.8 | 0.9 | 0.25 |
| **C7** | Law, Policy & Public Service | 0.65 | 0.8 | 0.6 | 0.25 |
| **C8** | Natural Sciences & Research | 0.55 | 0.55 | 0.6 | 0.5 |
| **C9** | Sales, Marketing & Communication | 0.65 | 0.45 | 0.3 | 0.75 |
| **C10** | Entrepreneurship & Innovation | 0.9 | 0.3 | 0.45 | 0.9 |

## Scoring Algorithm

### Weighted Scoring System
- **Interests & Preferences**: 35%
- **Academic Readiness**: 25%
- **Personality/Work Traits**: 20%
- **Values Alignment**: 20%
- **Experience Bonus**: Max 5%

### Constraint Application
1. **Education Mismatch Penalty**: -15 points per education level gap
2. **Time-to-Entry Penalty**: -10 points per year over 2 (if quick income needed)
3. **Physical Demand Penalty**: -20 points for high physical careers (if constraints exist)
4. **Cost Penalty**: -15 points for expensive careers with low support

### Career Categorization
- **Best Fit**: Score ≥70% with no feasibility issues
- **Good Fit**: Score ≥50%
- **Stretch Options**: Score ≥30% or high challenge level

## Sample Input/Output

### Input Profile
```json
{
  "grade": 11,
  "zipCode": "12345",
  "workEnvironment": ["Indoors (offices, hospitals, schools)"],
  "workStyle": ["Helping people directly"],
  "thinkingStyle": ["Helping people overcome challenges"],
  "educationWillingness": "2–4 years (college or technical school)",
  "academicInterests": ["Science (Biology, Chemistry, Physics)"],
  "academicPerformance": {
    "Science (Biology, Chemistry, Physics)": "Excellent"
  },
  "traits": ["Compassionate and caring", "Patient and persistent"],
  "helpingImportance": "Very important",
  "stabilityImportance": "Very important"
}
```

### Output Structure
```json
{
  "student_profile_summary": {
    "grade": 11,
    "readiness_level": "Moderate - Exploring options",
    "key_strengths": ["Science", "Compassionate and caring"],
    "primary_interests": ["Healthcare & Life Sciences"]
  },
  "top_clusters": [
    {
      "cluster_id": "C2",
      "name": "Healthcare & Life Sciences",
      "score": 87,
      "reasoning": ["Prefers indoor work", "Enjoys helping people", "Strong in science"]
    }
  ],
  "career_recommendations": {
    "best_fit": [
      {
        "career": {
          "name": "Registered Nurse",
          "edu_required_level": 3,
          "time_to_entry_years": 4
        },
        "score": 89,
        "reasoning": ["87% match with C2", "Strong science performance"]
      }
    ]
  },
  "four_year_plan": { /* Grade-by-grade planning */ },
  "comparison_questions": [ /* Career comparison prompts */ ]
}
```

## Testing & Verification

### Deterministic Testing
```bash
# Run the test script
cd backend
node test-recommendation.js
```

The test verifies:
- ✅ Same input produces identical output
- ✅ Constraint respect (education, physical, financial)
- ✅ Proper score calculation and categorization
- ✅ Complete output structure

### Frontend Testing
Visit `/recommendation-test` to test the API integration with a sample student profile.

## Integration with Existing System

### Compatibility
- **Coexists** with existing AI-powered recommendations
- **Supplements** counselor assessment with deterministic matching
- **Provides** fallback when AI services are unavailable

### Usage Scenarios
1. **Primary Matching**: Use for consistent, explainable recommendations
2. **AI Comparison**: Compare deterministic vs. AI recommendations
3. **Counselor Tool**: Provide counselors with rule-based baseline
4. **Student Confidence**: Offer transparent, understandable results

## Configuration

### Cluster Mappings
Modify `cluster.config.ts` to adjust how assessment responses map to career clusters:

```typescript
workStyle: {
  'Helping people directly': { C2: 1.0, C6: 1.0, C7: 0.5 },
  'Working with computers or technology': { C3: 1.0, C10: 0.5 }
}
```

### Career Database
Add careers to `careers.v1.json`:

```json
{
  "career_id": "new_career",
  "name": "New Career Title",
  "primary_cluster": "C2",
  "secondary_cluster": "C6",
  "edu_required_level": 2,
  "challenge_level": 1,
  "physical_demand": 1,
  "time_to_entry_years": 3,
  "cost_level": 0.4
}
```

### Scoring Weights
Adjust importance of different factors in `cluster.config.ts`:

```typescript
export const SCORING_WEIGHTS = {
  interests_preferences: 0.35,  // 35%
  academic_readiness: 0.25,     // 25%
  personality_traits: 0.20,     // 20%
  values: 0.20,                 // 20%
  experience_bonus: 0.05        // Max 5%
};
```

## Future Enhancements

### Planned Features
- [ ] **Local Job Market Integration**: Factor in regional employment data
- [ ] **Salary Predictions**: Include location-adjusted salary estimates
- [ ] **Pathway Optimization**: Multi-step career progression planning
- [ ] **Constraint Relaxation**: Suggest modifications to expand options
- [ ] **Comparison Tools**: Side-by-side career analysis
- [ ] **Progress Tracking**: Monitor student development over time

### Extensibility
- **New Clusters**: Add specialized career areas
- **Custom Weights**: Institution-specific scoring preferences
- **Regional Adaptation**: Location-based career availability
- **Multilingual Support**: Internationalization capabilities

## Acceptance Criteria ✅

- [x] **Deterministic**: Same input → same output
- [x] **Constraint Respect**: Education/physical/financial limitations honored
- [x] **Complete Output**: All required fields populated
- [x] **Career Database**: 80+ careers across 10 clusters
- [x] **API Integration**: RESTful endpoints with proper error handling
- [x] **Testing**: Verification script confirms functionality
- [x] **Documentation**: Comprehensive implementation guide

## Support

For questions or issues with the Recommendation Engine v1:

1. **Check the test script**: `node test-recommendation.js`
2. **Review configuration**: Verify cluster mappings and career data
3. **API testing**: Use `/recommendation-test` frontend page
4. **Logs**: Check console output for detailed scoring information

The Recommendation Engine v1 provides a solid, reliable foundation for career guidance that complements Lantern AI's existing AI-powered features while ensuring consistent, explainable results for all students.