import { ClusterDefinition } from '../types/recommendation';

export const CLUSTERS: ClusterDefinition[] = [
  {
    id: 'C1',
    name: 'Skilled Trades & Technical',
    description: 'Hands-on work with tools, construction, maintenance, and technical skills',
    value_profile: { income: 0.6, stability: 0.8, helping: 0.5, risk: 0.3 }
  },
  {
    id: 'C2',
    name: 'Healthcare & Life Sciences',
    description: 'Caring for people, medical services, and life sciences',
    value_profile: { income: 0.7, stability: 0.9, helping: 0.9, risk: 0.2 }
  },
  {
    id: 'C3',
    name: 'Engineering & Technology',
    description: 'Problem-solving with technology, systems, and innovation',
    value_profile: { income: 0.8, stability: 0.65, helping: 0.4, risk: 0.55 }
  },
  {
    id: 'C4',
    name: 'Business, Finance & Management',
    description: 'Managing resources, finances, and business operations',
    value_profile: { income: 0.8, stability: 0.55, helping: 0.3, risk: 0.55 }
  },
  {
    id: 'C5',
    name: 'Arts, Media & Design',
    description: 'Creative expression, visual arts, and media production',
    value_profile: { income: 0.45, stability: 0.35, helping: 0.4, risk: 0.75 }
  },
  {
    id: 'C6',
    name: 'Education & Social Services',
    description: 'Teaching, counseling, and supporting community development',
    value_profile: { income: 0.5, stability: 0.8, helping: 0.9, risk: 0.25 }
  },
  {
    id: 'C7',
    name: 'Law, Policy & Public Service',
    description: 'Legal services, policy development, and government work',
    value_profile: { income: 0.65, stability: 0.8, helping: 0.6, risk: 0.25 }
  },
  {
    id: 'C8',
    name: 'Natural Sciences & Research',
    description: 'Scientific research, environmental work, and discovery',
    value_profile: { income: 0.55, stability: 0.55, helping: 0.6, risk: 0.5 }
  },
  {
    id: 'C9',
    name: 'Sales, Marketing & Communication',
    description: 'Persuasion, communication, and relationship building',
    value_profile: { income: 0.65, stability: 0.45, helping: 0.3, risk: 0.75 }
  },
  {
    id: 'C10',
    name: 'Entrepreneurship & Innovation',
    description: 'Starting businesses, innovation, and high-risk ventures',
    value_profile: { income: 0.9, stability: 0.3, helping: 0.45, risk: 0.9 }
  }
];

export const clusterMapping = {
  workEnvironment: {
    'outdoors': { C1: 1.0, C8: 0.5 },
    'indoors': { C2: 1.0, C3: 0.5, C4: 0.5, C6: 0.5, C7: 0.5 },
    'mixed': { C1: 0.75, C8: 0.75, C9: 0.5 },
    'remote': { C3: 1.0, C5: 0.5, C10: 0.5 },
    'traveling': { C9: 1.0, C10: 0.5, C7: 0.5 }
  },
  
  workStyle: {
    'tools': { C1: 1.0, C3: 0.5 },
    'helping': { C2: 1.0, C6: 1.0, C7: 0.5 },
    'technology': { C3: 1.0, C10: 0.5, C5: 0.5 },
    'data': { C4: 1.0, C3: 0.5, C8: 0.5 },
    'creative': { C5: 1.0, C9: 0.5, C10: 0.5 }
  },
  
  thinkingStyle: {
    'fixing': { C1: 1.0, C3: 0.5 },
    'helping_challenges': { C6: 1.0, C2: 0.5, C7: 0.5 },
    'systems': { C3: 1.0, C8: 0.5, C1: 0.5 },
    'creating': { C10: 1.0, C5: 0.5, C3: 0.5 },
    'organizing': { C4: 1.0, C7: 0.5, C6: 0.5 }
  },
  
  academicInterests: {
    'Math': { C3: 1.0, C4: 0.5, C8: 0.5 },
    'Science': { C2: 1.0, C8: 1.0, C3: 0.5 },
    'English / Language Arts': { C6: 1.0, C9: 0.5, C7: 0.5 },
    'Social Studies / History': { C7: 1.0, C6: 0.5, C9: 0.5 },
    'Art / Creative Subjects': { C5: 1.0, C9: 0.5 },
    'Physical Education / Health': { C2: 0.75, C6: 0.5, C1: 0.5 },
    'Technology / Computer Science': { C3: 1.0, C10: 0.5 },
    'Foreign Languages': { C7: 0.75, C9: 0.5, C6: 0.5 },
    'Business / Economics': { C4: 1.0, C10: 0.5, C9: 0.5 }
  },
  
  traits: {
    'creative': { C5: 1.0, C10: 0.5 },
    'analytical': { C3: 1.0, C4: 0.5, C8: 0.5 },
    'compassionate': { C2: 1.0, C6: 1.0 },
    'leadership': { C4: 1.0, C10: 0.5, C7: 0.5 },
    'detail_oriented': { C7: 1.0, C4: 0.5, C3: 0.5 },
    'adventurous': { C10: 1.0, C9: 0.5, C5: 0.5 },
    'patient': { C2: 1.0, C8: 0.5, C6: 0.5 },
    'outgoing': { C9: 1.0, C6: 0.5, C10: 0.5 },
    'independent': { C10: 1.0, C1: 0.5, C5: 0.5 },
    'collaborative': { C6: 1.0, C4: 0.5, C2: 0.5 },
    'curious': { C8: 1.0, C3: 0.5, C10: 0.5 },
    'hands_on': { C1: 1.0, C2: 0.5 }
  }
};

export const SCORING_WEIGHTS = {
  interests_preferences: 0.35,
  academic_readiness: 0.25,
  personality_traits: 0.20,
  values: 0.20,
  experience_bonus: 0.05 // max +5 points
};

export const VALUE_ENCODINGS = {
  performance: {
    'Excellent': 1.00,
    'Good': 0.67,
    'Average': 0.33,
    'Needs Improvement': 0.00,
    "Haven't taken yet": 0.33
  },
  
  values: {
    'Very important': 1.00,
    'Somewhat important': 0.67,
    'Not very important': 0.33,
    'I\'m not sure yet': 0.50
  },
  
  risk: {
    'Very comfortable': 1.00,
    'Somewhat comfortable': 0.67,
    'Prefer stability': 0.33,
    'I\'m not sure yet': 0.50
  },
  
  urgency: {
    'I\'m just exploring right now': 0.00,
    'I want to narrow things down this year': 0.33,
    'I need a clear plan soon': 0.67,
    'I already have a path in mind but want to confirm it': 1.00
  },
  
  support: {
    'Strong support': 1.00,
    'Some support': 0.67,
    'Limited support': 0.33,
    'I\'m not sure': 0.50
  },
  
  confidence: {
    'Very confident': 1.00,
    'Somewhat confident': 0.67,
    'Unsure': 0.33,
    'Very unsure': 0.00
  },
  
  education: {
    'Work immediately after high school': 0,
    'A few months to 2 years (certifications or training)': 1,
    '2–4 years (college or technical school)': 2,
    '4+ years (college and possibly graduate school)': 3,
    'I\'m not sure yet': 2
  }
};