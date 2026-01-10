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
    'Outdoors (construction sites, farms, parks)': { C1: 1.0, C8: 0.5 },
    'Indoors (offices, hospitals, schools)': { C2: 1.0, C3: 0.5, C4: 0.5, C6: 0.5, C7: 0.5 },
    'A mix of indoor and outdoor work': { C1: 0.75, C8: 0.75, C9: 0.5 },
    'From home / remote': { C3: 1.0, C5: 0.5, C10: 0.5 },
    'Traveling to different locations': { C9: 1.0, C10: 0.5, C7: 0.5 }
  },
  
  workStyle: {
    'Building, fixing, or working with tools': { C1: 1.0, C3: 0.5 },
    'Helping people directly': { C2: 1.0, C6: 1.0, C7: 0.5 },
    'Working with computers or technology': { C3: 1.0, C10: 0.5, C5: 0.5 },
    'Working with numbers, data, or analysis': { C4: 1.0, C3: 0.5, C8: 0.5 },
    'Creating designs, art, music, or media': { C5: 1.0, C9: 0.5, C10: 0.5 }
  },
  
  thinkingStyle: {
    'Troubleshooting and fixing things': { C1: 1.0, C3: 0.5 },
    'Helping people overcome challenges': { C6: 1.0, C2: 0.5, C7: 0.5 },
    'Understanding how systems or machines work': { C3: 1.0, C8: 0.5, C1: 0.5 },
    'Inventing or designing new solutions': { C10: 1.0, C5: 0.5, C3: 0.5 },
    'Planning, organizing, or managing projects': { C4: 1.0, C7: 0.5, C6: 0.5 }
  },
  
  academicInterests: {
    'Math': { C3: 1.0, C4: 0.5, C8: 0.5 },
    'Science (Biology, Chemistry, Physics)': { C2: 1.0, C8: 1.0, C3: 0.5 },
    'English / Language Arts': { C6: 1.0, C9: 0.5, C7: 0.5 },
    'Social Studies / History': { C7: 1.0, C6: 0.5, C9: 0.5 },
    'Art / Creative Subjects': { C5: 1.0, C9: 0.5 },
    'Physical Education / Health': { C2: 0.75, C6: 0.5, C1: 0.5 },
    'Technology / Computer Science': { C3: 1.0, C10: 0.5 },
    'Foreign Languages': { C7: 0.75, C9: 0.5, C6: 0.5 },
    'Business / Economics': { C4: 1.0, C10: 0.5, C9: 0.5 }
  },
  
  traits: {
    'Creative and artistic': { C5: 1.0, C10: 0.5 },
    'Analytical and logical': { C3: 1.0, C4: 0.5, C8: 0.5 },
    'Compassionate and caring': { C2: 1.0, C6: 1.0 },
    'Leadership-oriented': { C4: 1.0, C10: 0.5, C7: 0.5 },
    'Detail-oriented and organized': { C7: 1.0, C4: 0.5, C3: 0.5 },
    'Adventurous and willing to take risks': { C10: 1.0, C9: 0.5, C5: 0.5 },
    'Patient and persistent': { C2: 1.0, C8: 0.5, C6: 0.5 },
    'Outgoing and social': { C9: 1.0, C6: 0.5, C10: 0.5 },
    'Independent and self-reliant': { C10: 1.0, C1: 0.5, C5: 0.5 },
    'Collaborative and team-focused': { C6: 1.0, C4: 0.5, C2: 0.5 },
    'Curious and inquisitive': { C8: 1.0, C3: 0.5, C10: 0.5 },
    'Practical and hands-on': { C1: 1.0, C2: 0.5 }
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
    'Very': 1.00,
    'Somewhat important': 0.67,
    'Somewhat': 0.67,
    'Not very important': 0.33,
    'Not very': 0.33,
    'Not sure': 0.50
  },
  
  risk: {
    'Very comfortable with risk': 1.00,
    'Somewhat comfortable': 0.67,
    'Prefer stability': 0.33,
    'Not sure': 0.50
  },
  
  urgency: {
    'Just exploring options': 0.00,
    'Want to narrow this year': 0.33,
    'Need a plan soon': 0.67,
    'Ready to confirm path': 1.00
  },
  
  support: {
    'Strong family/financial support': 1.00,
    'Some support available': 0.67,
    'Limited support': 0.33,
    'Not sure about support': 0.50
  },
  
  confidence: {
    'Very confident': 1.00,
    'Somewhat confident': 0.67,
    'Unsure': 0.33,
    'Very unsure': 0.00
  },
  
  education: {
    'Start working right after high school': 0,
    'A few months to 2 years (certifications or training)': 1,
    '2–4 years (college or technical school)': 2,
    '4+ years (college and possibly graduate school)': 3,
    "I'm not sure yet": 2
  }
};