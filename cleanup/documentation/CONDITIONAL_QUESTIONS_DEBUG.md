# Conditional Questions Debug Guide

## 🔍 Issue Identified
The conditional questions weren't working because of a case mismatch:
- **Frontend sends**: "Yes" and "No" (capitalized)
- **Backend expects**: "yes" and "no" (lowercase)

## ✅ Fix Applied
Updated the frontend conditional logic to normalize both the parent answer and trigger to lowercase before comparison.

## 🧪 How to Test

### 1. Start the Assessment
Go to: http://localhost:3000/counselor-assessment

### 2. Test "Yes" Branch
1. **Q1**: Enter grade (e.g., "11") and ZIP code (e.g., "12345")
2. **Q3**: Select "Yes" 
3. **Expected**: Should show "Which of these career categories are you interested in?"
4. **Select a category** (e.g., "Trade")
5. **Expected**: Should show specific trade careers
6. **Select "Other"**: Should show text field

### 3. Test "No" Branch
1. **Q1**: Enter grade and ZIP code
2. **Q3**: Select "No"
3. **Expected**: Should show three questions:
   - Q10: "What traits best describe you?" (multi-select)
   - Q8: "What are your interests or hobbies?" (text)
   - Q9: "What work, volunteer, or hands-on experience do you have?" (text)

## 🔧 Debug Information

### Backend API Check
```bash
# Check conditional questions are created
curl -s http://localhost:3002/api/counselor-assessment/questions | jq '.data.questions[] | select(.conditionalParent == "q3_career_knowledge") | {id, conditionalTrigger, text}'
```

### Expected Output
```json
{
  "id": "q3a_career_categories",
  "conditionalTrigger": "yes",
  "text": "Which of these career categories are you interested in?"
}
{
  "id": "q10_traits", 
  "conditionalTrigger": "no",
  "text": "What traits best describe you?"
}
{
  "id": "q8_interests_text",
  "conditionalTrigger": "no", 
  "text": "What are your interests or hobbies?"
}
{
  "id": "q9_experience_text",
  "conditionalTrigger": "no",
  "text": "What work, volunteer, or hands-on experience do you have?"
}
```

## 🎯 Expected Behavior

### Question Flow:
```
Q1: Grade + ZIP Code
↓
Q3: Do you know what career you want to pursue?
├── Yes → Q3a: Career Categories (11 options)
│   ├── Trade → Q3a1: Trade Careers (12 + Other)
│   │   └── Other → Q3a1_other: Specify Trade (text)
│   ├── Engineering → Q3a2: Engineering Careers (12 + Other)
│   │   └── Other → Q3a2_other: Specify Engineering (text)
│   └── [9 more categories with same pattern]
└── No → Q10: Traits (multi-select)
         Q8: Interests (text)
         Q9: Experience (text)
↓
Q5: Education Willingness
↓
Q14: Constraints
↓
Q17: Support Confidence  
↓
Q19-20: Impact & Inspiration
```

## 🐛 Debugging Tips

1. **Open Browser Console** to see debug logs
2. **Look for logs** starting with "🔍 Checking conditional question:"
3. **Verify** `shouldShow` is `true` for expected questions
4. **Check** `normalizedParentAnswer` and `normalizedTrigger` match

## ✅ Success Indicators

- ✅ "Yes" shows career categories
- ✅ Selecting a category shows specific careers  
- ✅ "Other" options show text fields
- ✅ "No" shows traits, interests, and experience questions
- ✅ All conditional questions are required
- ✅ Can complete full assessment flow