import { Career, CareerMatch, StudentProfile, DemandLevel } from '../types';

// Sample career data - in production, this would come from a database
const CAREERS: Career[] = [
  // ENGINEERING CAREERS
  {
    id: 'aero-eng-001',
    title: 'Aerospace Engineer',
    sector: 'infrastructure',
    description: 'Design, develop, and test aircraft, spacecraft, and related systems.',
    responsibilities: ['Design aircraft and spacecraft', 'Analyze flight data', 'Test prototypes', 'Ensure safety standards'],
    requiredEducation: 'bachelor',
    certifications: ['Professional Engineer (PE) License'],
    averageSalary: 118000,
    salaryRange: { min: 95000, max: 145000 },
    growthOutlook: 'Faster than average (8% growth)',
    onetCode: '17-2011.00'
  },
  {
    id: 'civil-eng-001',
    title: 'Civil Engineer',
    sector: 'infrastructure',
    description: 'Design and supervise construction of infrastructure projects.',
    responsibilities: ['Design bridges and roads', 'Analyze survey data', 'Manage construction projects', 'Ensure structural safety'],
    requiredEducation: 'bachelor',
    certifications: ['Professional Engineer (PE) License', 'EIT Certification'],
    averageSalary: 88000,
    salaryRange: { min: 70000, max: 110000 },
    growthOutlook: 'Faster than average (8% growth)',
    onetCode: '17-2051.00'
  },
  {
    id: 'mech-eng-001',
    title: 'Mechanical Engineer',
    sector: 'infrastructure',
    description: 'Design, develop, and test mechanical devices and systems.',
    responsibilities: ['Design mechanical systems', 'Analyze performance data', 'Test prototypes', 'Optimize designs'],
    requiredEducation: 'bachelor',
    certifications: ['Professional Engineer (PE) License'],
    averageSalary: 95000,
    salaryRange: { min: 75000, max: 120000 },
    growthOutlook: 'Average growth (4% growth)',
    onetCode: '17-2141.00'
  },
  {
    id: 'elec-eng-001',
    title: 'Electrical Engineer',
    sector: 'infrastructure',
    description: 'Design and develop electrical systems and equipment.',
    responsibilities: ['Design electrical systems', 'Test electrical equipment', 'Troubleshoot problems', 'Ensure safety compliance'],
    requiredEducation: 'bachelor',
    certifications: ['Professional Engineer (PE) License'],
    averageSalary: 103000,
    salaryRange: { min: 80000, max: 130000 },
    growthOutlook: 'Average growth (3% growth)',
    onetCode: '17-2071.00'
  },
  {
    id: 'struct-eng-001',
    title: 'Structural Engineer',
    sector: 'infrastructure',
    description: 'Design and analyze structural components of buildings and infrastructure.',
    responsibilities: ['Design building structures', 'Analyze load requirements', 'Ensure structural integrity', 'Review construction plans'],
    requiredEducation: 'bachelor',
    certifications: ['Professional Engineer (PE) License', 'Structural Engineer (SE) License'],
    averageSalary: 92000,
    salaryRange: { min: 75000, max: 115000 },
    growthOutlook: 'Faster than average (8% growth)',
    onetCode: '17-2051.01'
  },

  // HEALTHCARE CAREERS
  {
    id: 'rn-001',
    title: 'Registered Nurse',
    sector: 'healthcare',
    description: 'Provide and coordinate patient care, educate patients about health conditions.',
    responsibilities: ['Assess patient health', 'Administer medications', 'Operate medical equipment'],
    requiredEducation: 'associate',
    certifications: ['RN License', 'BLS Certification'],
    averageSalary: 75000,
    salaryRange: { min: 65000, max: 85000 },
    growthOutlook: 'Much faster than average (9% growth)',
    onetCode: '29-1141.00'
  },
  {
    id: 'ma-001',
    title: 'Medical Assistant',
    sector: 'healthcare',
    description: 'Perform administrative and clinical tasks to support doctors.',
    responsibilities: ['Take vital signs', 'Prepare patients', 'Schedule appointments'],
    requiredEducation: 'certificate',
    certifications: ['CMA or RMA Certification'],
    averageSalary: 37000,
    salaryRange: { min: 32000, max: 42000 },
    growthOutlook: 'Much faster than average (16% growth)',
    onetCode: '31-9092.00'
  },
  {
    id: 'lpn-001',
    title: 'Licensed Practical Nurse',
    sector: 'healthcare',
    description: 'Provide basic nursing care under direction of RNs and doctors.',
    responsibilities: ['Monitor patient health', 'Change bandages', 'Collect samples'],
    requiredEducation: 'certificate',
    certifications: ['LPN License'],
    averageSalary: 50000,
    salaryRange: { min: 45000, max: 55000 },
    growthOutlook: 'Faster than average (6% growth)',
    onetCode: '29-2061.00'
  },
  {
    id: 'chw-001',
    title: 'Community Health Worker',
    sector: 'healthcare',
    description: 'Assist communities to adopt healthy behaviors and access healthcare.',
    responsibilities: ['Conduct outreach', 'Provide counseling', 'Connect to resources'],
    requiredEducation: 'certificate',
    certifications: ['CHW Certification'],
    averageSalary: 43000,
    salaryRange: { min: 38000, max: 48000 },
    growthOutlook: 'Much faster than average (13% growth)',
    onetCode: '21-1094.00'
  },
  {
    id: 'emt-001',
    title: 'Emergency Medical Technician',
    sector: 'healthcare',
    description: 'Respond to emergency calls and provide medical care.',
    responsibilities: ['Assess patient condition', 'Provide emergency care', 'Transport patients'],
    requiredEducation: 'certificate',
    certifications: ['EMT Certification', 'CPR/AED'],
    averageSalary: 38000,
    salaryRange: { min: 33000, max: 43000 },
    growthOutlook: 'Faster than average (7% growth)',
    onetCode: '29-2041.00'
  },

  // INFRASTRUCTURE CAREERS
  {
    id: 'elec-001',
    title: 'Electrician',
    sector: 'infrastructure',
    description: 'Install, maintain, and repair electrical systems.',
    responsibilities: ['Read blueprints', 'Install systems', 'Inspect components'],
    requiredEducation: 'certificate',
    certifications: ['Electrician License', 'OSHA Safety'],
    averageSalary: 60000,
    salaryRange: { min: 50000, max: 70000 },
    growthOutlook: 'Faster than average (8% growth)',
    onetCode: '47-2111.00'
  },
  {
    id: 'plumb-001',
    title: 'Plumber',
    sector: 'infrastructure',
    description: 'Install and repair pipes for water, gas, and waste systems.',
    responsibilities: ['Install pipe systems', 'Repair plumbing', 'Read blueprints'],
    requiredEducation: 'certificate',
    certifications: ['Plumbing License'],
    averageSalary: 58000,
    salaryRange: { min: 48000, max: 68000 },
    growthOutlook: 'Faster than average (5% growth)',
    onetCode: '47-2152.00'
  },
  {
    id: 'hvac-001',
    title: 'HVAC Technician',
    sector: 'infrastructure',
    description: 'Install and maintain heating, ventilation, and air conditioning systems.',
    responsibilities: ['Install HVAC systems', 'Perform maintenance', 'Test performance'],
    requiredEducation: 'certificate',
    certifications: ['EPA Certification', 'HVAC License'],
    averageSalary: 52000,
    salaryRange: { min: 45000, max: 59000 },
    growthOutlook: 'Faster than average (5% growth)',
    onetCode: '49-9021.00'
  },
  {
    id: 'const-001',
    title: 'Construction Worker',
    sector: 'infrastructure',
    description: 'Perform physical labor at construction sites.',
    responsibilities: ['Operate equipment', 'Load materials', 'Follow safety protocols'],
    requiredEducation: 'high-school',
    certifications: ['OSHA 10 or 30'],
    averageSalary: 40000,
    salaryRange: { min: 35000, max: 45000 },
    growthOutlook: 'Average (4% growth)',
    onetCode: '47-2061.00'
  },
  {
    id: 'weld-001',
    title: 'Welder',
    sector: 'infrastructure',
    description: 'Join metal parts using heat and pressure.',
    responsibilities: ['Read blueprints', 'Set up equipment', 'Weld components'],
    requiredEducation: 'certificate',
    certifications: ['AWS Welding Certification'],
    averageSalary: 47000,
    salaryRange: { min: 40000, max: 54000 },
    growthOutlook: 'Slower than average (2% growth)',
    onetCode: '51-4121.00'
  },

  // TECHNOLOGY CAREERS
  {
    id: 'webdev-001',
    title: 'Web Developer',
    sector: 'technology',
    description: 'Design and create websites and web applications.',
    responsibilities: ['Write code', 'Design user interfaces', 'Test websites'],
    requiredEducation: 'associate',
    certifications: ['Various programming certifications'],
    averageSalary: 65000,
    salaryRange: { min: 50000, max: 80000 },
    growthOutlook: 'Much faster than average (13% growth)',
    onetCode: '15-1254.00'
  },
  {
    id: 'itsup-001',
    title: 'IT Support Specialist',
    sector: 'technology',
    description: 'Provide technical support and troubleshoot computer problems.',
    responsibilities: ['Diagnose problems', 'Install software', 'Train users'],
    requiredEducation: 'certificate',
    certifications: ['CompTIA A+', 'Microsoft certifications'],
    averageSalary: 45000,
    salaryRange: { min: 38000, max: 52000 },
    growthOutlook: 'Faster than average (8% growth)',
    onetCode: '15-1232.00'
  },
  {
    id: 'cyber-001',
    title: 'Cybersecurity Specialist',
    sector: 'technology',
    description: 'Protect computer systems and networks from cyber threats.',
    responsibilities: ['Monitor security', 'Investigate breaches', 'Implement protection'],
    requiredEducation: 'bachelor',
    certifications: ['CISSP', 'Security+', 'CEH'],
    averageSalary: 85000,
    salaryRange: { min: 70000, max: 100000 },
    growthOutlook: 'Much faster than average (35% growth)',
    onetCode: '15-1212.00'
  },

  // EDUCATION CAREERS
  {
    id: 'elem-teach-001',
    title: 'Elementary School Teacher',
    sector: 'education',
    description: 'Teach basic academic subjects to elementary school students.',
    responsibilities: ['Plan lessons', 'Assess student progress', 'Communicate with parents'],
    requiredEducation: 'bachelor',
    certifications: ['Teaching License', 'State Certification'],
    averageSalary: 55000,
    salaryRange: { min: 45000, max: 65000 },
    growthOutlook: 'Average (4% growth)',
    onetCode: '25-2021.00'
  },
  {
    id: 'para-001',
    title: 'Paraprofessional Educator',
    sector: 'education',
    description: 'Assist teachers in classroom instruction and student support.',
    responsibilities: ['Support instruction', 'Help individual students', 'Supervise activities'],
    requiredEducation: 'associate',
    certifications: ['Paraprofessional Certificate'],
    averageSalary: 32000,
    salaryRange: { min: 28000, max: 36000 },
    growthOutlook: 'Faster than average (8% growth)',
    onetCode: '25-9041.00'
  },

  // BUSINESS CAREERS
  {
    id: 'admin-001',
    title: 'Administrative Assistant',
    sector: 'business',
    description: 'Provide administrative support to executives and teams.',
    responsibilities: ['Schedule meetings', 'Manage correspondence', 'Organize files'],
    requiredEducation: 'certificate',
    certifications: ['Microsoft Office Specialist'],
    averageSalary: 38000,
    salaryRange: { min: 32000, max: 44000 },
    growthOutlook: 'Declining (-7% growth)',
    onetCode: '43-6011.00'
  },
  {
    id: 'sales-001',
    title: 'Sales Representative',
    sector: 'business',
    description: 'Sell products or services to businesses and consumers.',
    responsibilities: ['Contact customers', 'Present products', 'Negotiate deals'],
    requiredEducation: 'high-school',
    certifications: ['Sales certifications (optional)'],
    averageSalary: 48000,
    salaryRange: { min: 35000, max: 65000 },
    growthOutlook: 'Average (4% growth)',
    onetCode: '41-4012.00'
  },
  {
    id: 'account-001',
    title: 'Bookkeeper',
    sector: 'finance',
    description: 'Maintain financial records and prepare basic financial reports.',
    responsibilities: ['Record transactions', 'Reconcile accounts', 'Prepare reports'],
    requiredEducation: 'certificate',
    certifications: ['QuickBooks certification', 'Bookkeeping certificate'],
    averageSalary: 42000,
    salaryRange: { min: 35000, max: 49000 },
    growthOutlook: 'Declining (-3% growth)',
    onetCode: '43-3031.00'
  },

  // CREATIVE CAREERS
  {
    id: 'graph-001',
    title: 'Graphic Designer',
    sector: 'creative',
    description: 'Create visual concepts to communicate ideas and inspire consumers.',
    responsibilities: ['Design layouts', 'Select colors and images', 'Present concepts'],
    requiredEducation: 'associate',
    certifications: ['Adobe certifications'],
    averageSalary: 45000,
    salaryRange: { min: 35000, max: 55000 },
    growthOutlook: 'Average (3% growth)',
    onetCode: '27-1024.00'
  },
  {
    id: 'photo-001',
    title: 'Photographer',
    sector: 'creative',
    description: 'Capture and edit photographs for various purposes.',
    responsibilities: ['Take photographs', 'Edit images', 'Meet with clients'],
    requiredEducation: 'certificate',
    certifications: ['Photography certifications'],
    averageSalary: 38000,
    salaryRange: { min: 25000, max: 55000 },
    growthOutlook: 'Declining (-4% growth)',
    onetCode: '27-4021.00'
  },

  // PUBLIC SERVICE CAREERS
  {
    id: 'police-001',
    title: 'Police Officer',
    sector: 'public-service',
    description: 'Protect and serve communities by enforcing laws.',
    responsibilities: ['Patrol areas', 'Investigate crimes', 'Write reports'],
    requiredEducation: 'certificate',
    certifications: ['Police Academy certification'],
    averageSalary: 55000,
    salaryRange: { min: 45000, max: 65000 },
    growthOutlook: 'Average (5% growth)',
    onetCode: '33-3051.00'
  },
  {
    id: 'fire-001',
    title: 'Firefighter',
    sector: 'public-service',
    description: 'Respond to fires and emergency situations to protect life and property.',
    responsibilities: ['Fight fires', 'Rescue people', 'Provide emergency medical care'],
    requiredEducation: 'certificate',
    certifications: ['Fire Academy certification', 'EMT certification'],
    averageSalary: 52000,
    salaryRange: { min: 42000, max: 62000 },
    growthOutlook: 'Faster than average (8% growth)',
    onetCode: '33-2011.00'
  },

  // AGRICULTURE CAREERS
  {
    id: 'farm-001',
    title: 'Farm Worker',
    sector: 'agriculture',
    description: 'Plant, cultivate, and harvest crops on farms.',
    responsibilities: ['Plant seeds', 'Operate equipment', 'Harvest crops'],
    requiredEducation: 'high-school',
    certifications: ['Equipment operation licenses'],
    averageSalary: 28000,
    salaryRange: { min: 24000, max: 32000 },
    growthOutlook: 'Declining (-1% growth)',
    onetCode: '45-2092.00'
  },
  {
    id: 'vet-tech-001',
    title: 'Veterinary Technician',
    sector: 'agriculture',
    description: 'Assist veterinarians in caring for animals.',
    responsibilities: ['Assist in surgery', 'Take X-rays', 'Collect samples'],
    requiredEducation: 'associate',
    certifications: ['Veterinary Technician License'],
    averageSalary: 38000,
    salaryRange: { min: 32000, max: 44000 },
    growthOutlook: 'Much faster than average (16% growth)',
    onetCode: '29-2056.00'
  },

  // TRANSPORTATION CAREERS
  {
    id: 'truck-001',
    title: 'Truck Driver',
    sector: 'transportation',
    description: 'Drive trucks to transport goods over long distances.',
    responsibilities: ['Drive safely', 'Load/unload cargo', 'Maintain logs'],
    requiredEducation: 'certificate',
    certifications: ['CDL License'],
    averageSalary: 48000,
    salaryRange: { min: 40000, max: 56000 },
    growthOutlook: 'Faster than average (6% growth)',
    onetCode: '53-3032.00'
  },
  {
    id: 'auto-tech-001',
    title: 'Automotive Technician',
    sector: 'transportation',
    description: 'Diagnose and repair problems in automobiles.',
    responsibilities: ['Diagnose problems', 'Repair vehicles', 'Test systems'],
    requiredEducation: 'certificate',
    certifications: ['ASE Certification'],
    averageSalary: 44000,
    salaryRange: { min: 35000, max: 53000 },
    growthOutlook: 'Slower than average (1% growth)',
    onetCode: '49-3023.00'
  },

  // HOSPITALITY CAREERS
  {
    id: 'hotel-001',
    title: 'Hotel Front Desk Clerk',
    sector: 'hospitality',
    description: 'Provide customer service to hotel guests.',
    responsibilities: ['Check in guests', 'Handle reservations', 'Resolve complaints'],
    requiredEducation: 'high-school',
    certifications: ['Hospitality certifications (optional)'],
    averageSalary: 28000,
    salaryRange: { min: 24000, max: 32000 },
    growthOutlook: 'Average (4% growth)',
    onetCode: '43-4081.00'
  },
  {
    id: 'chef-001',
    title: 'Cook/Chef',
    sector: 'hospitality',
    description: 'Prepare and cook food in restaurants and food service establishments.',
    responsibilities: ['Prepare meals', 'Follow recipes', 'Maintain kitchen cleanliness'],
    requiredEducation: 'certificate',
    certifications: ['Culinary certifications', 'Food safety certification'],
    averageSalary: 35000,
    salaryRange: { min: 28000, max: 45000 },
    growthOutlook: 'Faster than average (6% growth)',
    onetCode: '35-2014.00'
  },

  // MANUFACTURING CAREERS
  {
    id: 'mach-001',
    title: 'Machine Operator',
    sector: 'manufacturing',
    description: 'Operate machinery to produce manufactured goods.',
    responsibilities: ['Set up machines', 'Monitor production', 'Perform quality checks'],
    requiredEducation: 'high-school',
    certifications: ['Machine operation certifications'],
    averageSalary: 38000,
    salaryRange: { min: 32000, max: 44000 },
    growthOutlook: 'Declining (-3% growth)',
    onetCode: '51-9061.00'
  },
  {
    id: 'qual-001',
    title: 'Quality Control Inspector',
    sector: 'manufacturing',
    description: 'Inspect products and materials for defects and compliance.',
    responsibilities: ['Test products', 'Document findings', 'Ensure quality standards'],
    requiredEducation: 'certificate',
    certifications: ['Quality control certifications'],
    averageSalary: 42000,
    salaryRange: { min: 35000, max: 49000 },
    growthOutlook: 'Declining (-4% growth)',
    onetCode: '51-9061.00'
  },

  // RETAIL CAREERS
  {
    id: 'retail-001',
    title: 'Retail Sales Associate',
    sector: 'retail',
    description: 'Assist customers with purchases in retail stores.',
    responsibilities: ['Help customers', 'Process transactions', 'Stock merchandise'],
    requiredEducation: 'high-school',
    certifications: ['Customer service certifications (optional)'],
    averageSalary: 26000,
    salaryRange: { min: 22000, max: 30000 },
    growthOutlook: 'Declining (-2% growth)',
    onetCode: '41-2031.00'
  },
  {
    id: 'cashier-001',
    title: 'Cashier',
    sector: 'retail',
    description: 'Process customer payments and provide customer service.',
    responsibilities: ['Ring up sales', 'Handle money', 'Assist customers'],
    requiredEducation: 'high-school',
    certifications: ['None required'],
    averageSalary: 24000,
    salaryRange: { min: 21000, max: 27000 },
    growthOutlook: 'Declining (-10% growth)',
    onetCode: '41-2011.00'
  }
];

export class CareerService {
  /**
   * Get all careers
   */
  static getAllCareers(): Career[] {
    return CAREERS;
  }

  /**
   * Get career by ID
   */
  static getCareerById(id: string): Career | null {
    return CAREERS.find(c => c.id === id) || null;
  }

  /**
   * Get career matches for a student profile
   */
  static getCareerMatches(profile: Partial<StudentProfile>, zipCode: string): CareerMatch[] {
    console.log('🔍 CareerService.getCareerMatches called with profile:', JSON.stringify(profile, null, 2));
    console.log('🔍 ZIP Code:', zipCode);
    
    const matches: CareerMatch[] = [];

    for (const career of CAREERS) {
      const matchScore = this.calculateMatchScore(profile, career);
      const reasoningFactors = this.generateReasoningFactors(profile, career, matchScore);
      const localDemand = this.estimateLocalDemand(career, zipCode);

      console.log(`🔍 Career: ${career.title}, Score: ${matchScore}%, Interests: ${profile.interests?.join(', ') || 'none'}`);

      matches.push({
        careerId: career.id,
        career,
        matchScore,
        reasoningFactors,
        localDemand,
        localSalary: {
          min: career.salaryRange.min,
          max: career.salaryRange.max,
          location: zipCode
        },
        localEmployers: this.getLocalEmployers(career, zipCode)
      });
    }

    // Sort by match score descending
    const sortedMatches = matches.sort((a, b) => b.matchScore - a.matchScore);
    console.log('🔍 Top 3 matches:', sortedMatches.slice(0, 3).map(m => `${m.career.title}: ${m.matchScore}%`));
    
    return sortedMatches;
  }

  /**
   * Calculate match score between profile and career
   */
  private static calculateMatchScore(profile: Partial<StudentProfile>, career: Career): number {
    let score = 0;
    let maxScore = 0;

    // Interest alignment (40 points)
    maxScore += 40;
    if (profile.interests) {
      const interestMatches = profile.interests.filter(interest => {
        const interestLower = interest.toLowerCase();
        const careerText = `${career.title} ${career.description}`.toLowerCase();
        
        // Direct text matching
        if (careerText.includes(interestLower)) return true;
        
        // Comprehensive sector-interest mapping for all 15 sectors
        const sectorMatches = {
          'Healthcare': ['healthcare'],
          'Infrastructure': ['infrastructure'],
          'Technology': ['technology'],
          'Education': ['education'],
          'Business': ['business', 'finance'],
          'Creative': ['creative'],
          'Public Service': ['public-service'],
          'Agriculture': ['agriculture'],
          'Transportation': ['transportation'],
          'Hospitality': ['hospitality'],
          'Manufacturing': ['manufacturing'],
          'Retail': ['retail'],
          'Finance': ['finance', 'business'],
          'Legal': ['legal'],
          'Science': ['science'],
          'Helping Others': ['healthcare', 'education', 'public-service'],
          'Hands-on Work': ['infrastructure', 'manufacturing', 'agriculture', 'transportation'],
          'Working with People': ['healthcare', 'education', 'hospitality', 'retail', 'public-service'],
          'Problem Solving': ['technology', 'legal', 'science', 'business'],
          'Community Impact': ['public-service', 'education', 'healthcare'],
          'Creativity': ['creative', 'business'],
          'Leadership': ['business', 'education', 'public-service'],
          'Outdoor Work': ['agriculture', 'infrastructure', 'public-service'],
          'Indoor Work': ['technology', 'business', 'finance', 'legal', 'education'],
          'Physical Work': ['infrastructure', 'manufacturing', 'agriculture', 'transportation', 'public-service']
        };
        
        const matchingSectors = sectorMatches[interest as keyof typeof sectorMatches] || [];
        return matchingSectors.includes(career.sector);
      });
      score += (interestMatches.length / Math.max(1, profile.interests.length)) * 40;
    }

    // Skill alignment (30 points)
    maxScore += 30;
    if (profile.skills) {
      const skillMatches = profile.skills.filter(skill => {
        const skillLower = skill.toLowerCase();
        return career.responsibilities.some(resp => resp.toLowerCase().includes(skillLower));
      });
      score += (skillMatches.length / Math.max(1, profile.skills.length)) * 30;
    }

    // Education alignment (20 points)
    maxScore += 20;
    if (profile.educationGoal) {
      const educationMatch = this.matchEducationLevel(profile.educationGoal, career.requiredEducation);
      score += educationMatch * 20;
    }

    // Work environment alignment (10 points) - Enhanced for all sectors
    maxScore += 10;
    if (profile.workEnvironment) {
      const indoorSectors = ['technology', 'business', 'finance', 'legal', 'education', 'healthcare'];
      const outdoorSectors = ['agriculture', 'infrastructure', 'transportation'];
      const mixedSectors = ['public-service', 'hospitality', 'retail', 'manufacturing', 'creative', 'science'];
      
      if (profile.workEnvironment === 'indoor' && indoorSectors.includes(career.sector)) {
        score += 10;
      } else if (profile.workEnvironment === 'outdoor' && outdoorSectors.includes(career.sector)) {
        score += 10;
      } else if (profile.workEnvironment === 'mixed' && mixedSectors.includes(career.sector)) {
        score += 10;
      } else if (profile.workEnvironment === 'mixed') {
        score += 7; // Mixed preference gets partial points for any environment
      } else {
        score += 5; // Partial points for environment mismatch
      }
    }

    return Math.round((score / maxScore) * 100);
  }

  /**
   * Match education levels
   */
  private static matchEducationLevel(studentGoal: string, careerRequired: string): number {
    const levels = { 'high-school': 1, 'certificate': 2, 'associate': 3, 'bachelor': 4 };
    const studentLevel = levels[studentGoal as keyof typeof levels] || 2;
    const careerLevel = levels[careerRequired as keyof typeof levels] || 2;

    if (studentLevel >= careerLevel) return 1.0;
    if (studentLevel === careerLevel - 1) return 0.7;
    return 0.4;
  }

  /**
   * Generate reasoning factors for the match
   */
  private static generateReasoningFactors(profile: Partial<StudentProfile>, career: Career, score: number): string[] {
    const factors: string[] = [];

    if (profile.interests) {
      const matchingInterests = profile.interests.filter(i => 
        i === 'Healthcare' && career.sector === 'healthcare' ||
        i === 'Infrastructure' && career.sector === 'infrastructure' ||
        i === 'Helping Others' && career.sector === 'healthcare'
      );
      if (matchingInterests.length > 0) {
        factors.push(`Strong interest alignment: ${matchingInterests.join(', ')}`);
      }
    }

    if (profile.skills && profile.skills.length > 0) {
      factors.push(`Your skills match this career's requirements`);
    }

    if (score > 80) {
      factors.push('Excellent overall match for your profile');
    } else if (score > 60) {
      factors.push('Good match with room to develop additional skills');
    }

    factors.push(`${career.growthOutlook}`);

    return factors;
  }

  /**
   * Estimate local demand (simplified - would use real data in production)
   */
  private static estimateLocalDemand(career: Career, zipCode: string): DemandLevel {
    // Healthcare generally has high demand in rural areas
    if (career.sector === 'healthcare') return 'high';
    // Infrastructure varies
    if (career.sector === 'infrastructure') return 'medium';
    return 'medium';
  }

  /**
   * Get local employers (simplified - would use real data in production)
   */
  private static getLocalEmployers(career: Career, zipCode: string): string[] {
    if (career.sector === 'healthcare') {
      return ['Local Hospital', 'Community Health Center', 'Private Practices'];
    }
    return ['Local Construction Companies', 'Utility Companies', 'Contractors'];
  }
}
