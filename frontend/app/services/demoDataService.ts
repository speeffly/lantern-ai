// Demo Data Service - Provides mock data for static deployment
export const demoDataService = {
  // Mock career results
  getCareerMatches: (answers: any) => [
    {
      id: "1",
      title: "Registered Nurse",
      onetCode: "29-1141.00",
      sector: "healthcare",
      description: "Assess patient health problems and needs, develop and implement nursing care plans, and maintain medical records. Administer nursing care to ill, injured, convalescent, or disabled patients.",
      averageSalary: 75330,
      educationLevel: "Associate's degree",
      matchPercentage: 92,
      skills: ["Patient Care", "Medical Knowledge", "Communication", "Critical Thinking", "Compassion"],
      tasks: [
        "Monitor, record, and report symptoms or changes in patients' conditions",
        "Maintain accurate, detailed reports and records",
        "Record patients' medical information and vital signs",
        "Order, interpret, and evaluate diagnostic tests to identify and assess patient's condition"
      ],
      workEnvironment: "Hospitals, clinics, nursing homes, and other healthcare facilities"
    },
    {
      id: "2", 
      title: "Elementary School Teacher",
      onetCode: "25-2021.00",
      sector: "education",
      description: "Teach students basic academic, social, and other formative skills in public or private schools at the elementary level.",
      averageSalary: 60940,
      educationLevel: "Bachelor's degree",
      matchPercentage: 88,
      skills: ["Teaching", "Classroom Management", "Curriculum Development", "Student Assessment", "Communication"],
      tasks: [
        "Establish and enforce rules for behavior and procedures for maintaining order",
        "Adapt teaching methods and instructional materials to meet students' varying needs",
        "Instruct students individually and in groups, using various teaching methods",
        "Plan and conduct activities for a balanced program of instruction"
      ],
      workEnvironment: "Elementary schools, both public and private"
    },
    {
      id: "3",
      title: "Agricultural Engineer", 
      onetCode: "17-2021.00",
      sector: "agriculture",
      description: "Apply knowledge of engineering technology and biological science to agricultural problems concerned with power and machinery, electrification, structures, soil and water conservation, and processing of agricultural products.",
      averageSalary: 84410,
      educationLevel: "Bachelor's degree",
      matchPercentage: 85,
      skills: ["Engineering Design", "Problem Solving", "Technical Analysis", "Project Management", "Agricultural Knowledge"],
      tasks: [
        "Design agricultural machinery components and equipment",
        "Test agricultural machinery and equipment to ensure adequate performance",
        "Design structures for crop storage, animal shelter, and loading facilities",
        "Provide advice on water quality and issues related to pollution management"
      ],
      workEnvironment: "Offices, laboratories, and outdoor agricultural sites"
    }
  ],

  // Mock job listings
  getJobListings: (careerTitle?: string, zipCode?: string) => [
    {
      id: "1",
      title: careerTitle || "Registered Nurse",
      company: "Rural Community Hospital",
      location: "Within 25 miles of your location",
      salary: "$28.50 - $35.00/hour",
      type: "Full-time",
      description: "Join our compassionate healthcare team serving rural communities. Excellent benefits and growth opportunities.",
      requirements: ["RN License", "2+ years experience preferred", "BLS certification"],
      applicationUrl: "#demo-application"
    },
    {
      id: "2", 
      title: careerTitle || "Staff Nurse",
      company: "Regional Medical Center",
      location: "Within 30 miles of your location", 
      salary: "$65,000 - $75,000/year",
      type: "Full-time",
      description: "Seeking dedicated nurses to provide quality patient care in our modern facility.",
      requirements: ["Active RN License", "Associate's degree in Nursing", "Strong communication skills"],
      applicationUrl: "#demo-application"
    },
    {
      id: "3",
      title: careerTitle || "School Nurse",
      company: "County School District",
      location: "Within 20 miles of your location",
      salary: "$45,000 - $55,000/year", 
      type: "Full-time",
      description: "Provide healthcare services to students and staff in our rural school district.",
      requirements: ["RN License", "School health experience preferred", "CPR certification"],
      applicationUrl: "#demo-application"
    }
  ],

  // Mock user authentication
  mockLogin: (email: string, password: string) => ({
    success: true,
    user: {
      id: "demo-user",
      email: email,
      name: "Demo Student",
      role: "student",
      profile: {
        grade: "11th",
        zipCode: "12345",
        interests: "Healthcare, helping others"
      }
    },
    token: "demo-jwt-token"
  }),

  // Mock registration
  mockRegister: (userData: any) => ({
    success: true,
    user: {
      id: "demo-user-" + Date.now(),
      ...userData,
      profile: userData
    },
    token: "demo-jwt-token"
  })
};

// Helper function to check if we're in demo mode
export const isDemoMode = () => {
  return process.env.NEXT_PUBLIC_DEMO_MODE === 'true' || 
         process.env.NEXT_PUBLIC_ENVIRONMENT === 'production';
};

// API wrapper that uses demo data when backend is unavailable
export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  if (isDemoMode()) {
    // Return demo data based on endpoint
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    
    if (endpoint.includes('/api/careers/')) {
      const careerId = endpoint.split('/').pop();
      const careers = demoDataService.getCareerMatches({});
      const career = careers.find(c => c.id === careerId) || careers[0];
      return { success: true, data: career };
    }
    
    if (endpoint.includes('/api/jobs')) {
      return { success: true, data: demoDataService.getJobListings() };
    }
    
    if (endpoint.includes('/api/auth-db/login')) {
      const body = JSON.parse(options.body as string);
      return demoDataService.mockLogin(body.email, body.password);
    }
    
    if (endpoint.includes('/api/auth-db/register')) {
      const body = JSON.parse(options.body as string);
      return demoDataService.mockRegister(body);
    }
    
    // Default success response
    return { success: true, data: null };
  }
  
  // Try real API call, fallback to demo data on error
  try {
    const response = await fetch(endpoint, options);
    return await response.json();
  } catch (error) {
    console.warn('API call failed, using demo data:', error);
    // Return appropriate demo data based on endpoint
    return { success: false, error: 'Demo mode - backend not available' };
  }
};