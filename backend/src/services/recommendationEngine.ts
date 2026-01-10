import { StudentProfile, Career, ClusterScore, CareerRecommendation, RecommendationResult } from '../types/recommendation';
import { CLUSTERS, clusterMapping, SCORING_WEIGHTS, VALUE_ENCODINGS } from '../config/cluster.config';
import careersData from '../data/careers.v1.json';

export class RecommendationEngine {
  private static careers: Career[] = careersData.careers;

  /**
   * Generate comprehensive career recommendations
   */
  static generateRecommendations(profile: StudentProfile): RecommendationResult {
    console.log('🎯 Starting recommendation generation for student profile');
    
    // Step 1: Compute cluster scores
    const clusterScores = this.computeClusterScores(profile);
    console.log('📊 Cluster scores computed:', clusterScores.map(c => `${c.cluster_id}: ${c.score}`));
    
    // Step 2: Compute career scores
    const careerScores = this.computeCareerScores(profile, clusterScores);
    console.log('🎯 Career scores computed for', careerScores.length, 'careers');
    
    // Step 3: Apply feasibility constraints
    const feasibleCareers = this.applyFeasibilityConstraints(profile, careerScores);
    console.log('✅ Feasibility constraints applied, remaining:', feasibleCareers.length, 'careers');
    
    // Step 4: Categorize careers
    const categorizedCareers = this.categorizeCareers(feasibleCareers);
    console.log('📂 Careers categorized:', {
      best_fit: categorizedCareers.best_fit.length,
      good_fit: categorizedCareers.good_fit.length,
      stretch_options: categorizedCareers.stretch_options.length
    });
    
    // Step 5: Generate four-year plan
    const fourYearPlan = this.generateFourYearPlan(profile, categorizedCareers.best_fit[0]);
    
    // Step 6: Generate comparison questions
    const comparisonQuestions = this.generateComparisonQuestions(categorizedCareers);
    
    // Step 7: Create student profile summary
    const profileSummary = this.createProfileSummary(profile, clusterScores);
    
    const result: RecommendationResult = {
      student_profile_summary: profileSummary,
      top_clusters: clusterScores.slice(0, 3),
      career_recommendations: {
        best_fit: categorizedCareers.best_fit.slice(0, 3),
        good_fit: categorizedCareers.good_fit.slice(0, 3),
        stretch_options: categorizedCareers.stretch_options.slice(0, 2)
      },
      four_year_plan: fourYearPlan,
      comparison_questions: comparisonQuestions,
      disclaimer: "These recommendations are based on your assessment responses and are meant to guide your exploration. Consider your personal circumstances, local opportunities, and changing interests as you make decisions about your future.",
      generated_at: new Date().toISOString()
    };
    
    console.log('✅ Recommendation generation complete');
    return result;
  }

  /**
   * Compute cluster scores based on student profile
   */
  private static computeClusterScores(profile: StudentProfile): ClusterScore[] {
    const clusterScores = new Map<string, { score: number; reasoning: string[] }>();
    
    // Initialize all clusters with 0 score
    CLUSTERS.forEach(cluster => {
      clusterScores.set(cluster.id, { score: 0, reasoning: [] });
    });

    // 1. Interests & Preferences (35% weight)
    const interestScore = this.computeInterestScore(profile, clusterScores);
    
    // 2. Academic Readiness (25% weight)
    const academicScore = this.computeAcademicScore(profile, clusterScores);
    
    // 3. Personality/Work Traits (20% weight)
    const personalityScore = this.computePersonalityScore(profile, clusterScores);
    
    // 4. Values Alignment (20% weight)
    const valuesScore = this.computeValuesScore(profile, clusterScores);
    
    // 5. Experience Bonus (max 5% weight)
    const experienceBonus = this.computeExperienceBonus(profile, clusterScores);

    // Combine all scores with weights
    const finalScores: ClusterScore[] = [];
    
    clusterScores.forEach((data, clusterId) => {
      const cluster = CLUSTERS.find(c => c.id === clusterId)!;
      const totalScore = Math.min(100, Math.max(0, data.score + experienceBonus));
      
      finalScores.push({
        cluster_id: clusterId,
        name: cluster.name,
        score: Math.round(totalScore),
        reasoning: data.reasoning
      });
    });

    // Sort by score descending
    return finalScores.sort((a, b) => b.score - a.score);
  }

  /**
   * Compute interest-based scores (35% weight)
   */
  private static computeInterestScore(profile: StudentProfile, clusterScores: Map<string, { score: number; reasoning: string[] }>): void {
    const weight = SCORING_WEIGHTS.interests_preferences;
    
    // Work Environment
    profile.workEnvironment.forEach(env => {
      const mapping = clusterMapping.workEnvironment[env as keyof typeof clusterMapping.workEnvironment];
      if (mapping) {
        Object.entries(mapping).forEach(([clusterId, score]) => {
          const current = clusterScores.get(clusterId)!;
          current.score += score * weight * 25; // 25 points max per category
          current.reasoning.push(`Prefers ${env.toLowerCase()} work environment`);
        });
      }
    });

    // Work Style
    profile.workStyle.forEach(style => {
      const mapping = clusterMapping.workStyle[style as keyof typeof clusterMapping.workStyle];
      if (mapping) {
        Object.entries(mapping).forEach(([clusterId, score]) => {
          const current = clusterScores.get(clusterId)!;
          current.score += score * weight * 25;
          current.reasoning.push(`Enjoys ${style.toLowerCase()}`);
        });
      }
    });

    // Thinking Style
    profile.thinkingStyle.forEach(thinking => {
      const mapping = clusterMapping.thinkingStyle[thinking as keyof typeof clusterMapping.thinkingStyle];
      if (mapping) {
        Object.entries(mapping).forEach(([clusterId, score]) => {
          const current = clusterScores.get(clusterId)!;
          current.score += score * weight * 25;
          current.reasoning.push(`Likes ${thinking.toLowerCase()}`);
        });
      }
    });
  }

  /**
   * Compute academic readiness scores (25% weight)
   */
  private static computeAcademicScore(profile: StudentProfile, clusterScores: Map<string, { score: number; reasoning: string[] }>): void {
    const weight = SCORING_WEIGHTS.academic_readiness;
    
    // Academic Interests
    profile.academicInterests.forEach(subject => {
      const mapping = clusterMapping.academicInterests[subject as keyof typeof clusterMapping.academicInterests];
      if (mapping) {
        Object.entries(mapping).forEach(([clusterId, score]) => {
          const current = clusterScores.get(clusterId)!;
          current.score += score * weight * 15; // 15 points max per subject
          current.reasoning.push(`Strong interest in ${subject}`);
        });
      }
    });

    // Academic Performance
    Object.entries(profile.academicPerformance).forEach(([subject, performance]) => {
      const performanceScore = VALUE_ENCODINGS.performance[performance as keyof typeof VALUE_ENCODINGS.performance] || 0.33;
      const mapping = clusterMapping.academicInterests[subject as keyof typeof clusterMapping.academicInterests];
      
      if (mapping && performanceScore > 0.5) { // Only count good performance
        Object.entries(mapping).forEach(([clusterId, score]) => {
          const current = clusterScores.get(clusterId)!;
          current.score += score * performanceScore * weight * 10; // 10 points max per subject
          if (performanceScore >= 0.67) {
            current.reasoning.push(`Strong performance in ${subject}`);
          }
        });
      }
    });
  }

  /**
   * Compute personality/traits scores (20% weight)
   */
  private static computePersonalityScore(profile: StudentProfile, clusterScores: Map<string, { score: number; reasoning: string[] }>): void {
    const weight = SCORING_WEIGHTS.personality_traits;
    
    profile.traits.forEach(trait => {
      const mapping = clusterMapping.traits[trait as keyof typeof clusterMapping.traits];
      if (mapping) {
        Object.entries(mapping).forEach(([clusterId, score]) => {
          const current = clusterScores.get(clusterId)!;
          current.score += score * weight * 20; // 20 points max per trait
          current.reasoning.push(`${trait} personality trait`);
        });
      }
    });
  }

  /**
   * Compute values alignment scores (20% weight)
   */
  private static computeValuesScore(profile: StudentProfile, clusterScores: Map<string, { score: number; reasoning: string[] }>): void {
    const weight = SCORING_WEIGHTS.values;
    
    // Encode values
    const incomeValue = VALUE_ENCODINGS.values[profile.incomeImportance as keyof typeof VALUE_ENCODINGS.values] || 0.5;
    const stabilityValue = VALUE_ENCODINGS.values[profile.stabilityImportance as keyof typeof VALUE_ENCODINGS.values] || 0.5;
    const helpingValue = VALUE_ENCODINGS.values[profile.helpingImportance as keyof typeof VALUE_ENCODINGS.values] || 0.5;
    const riskValue = VALUE_ENCODINGS.risk[profile.riskTolerance as keyof typeof VALUE_ENCODINGS.risk] || 0.5;

    // Calculate alignment with each cluster's value profile
    CLUSTERS.forEach(cluster => {
      const current = clusterScores.get(cluster.id)!;
      
      // Calculate similarity between student values and cluster values
      const incomeSimilarity = 1 - Math.abs(incomeValue - cluster.value_profile.income);
      const stabilitySimilarity = 1 - Math.abs(stabilityValue - cluster.value_profile.stability);
      const helpingSimilarity = 1 - Math.abs(helpingValue - cluster.value_profile.helping);
      const riskSimilarity = 1 - Math.abs(riskValue - cluster.value_profile.risk);
      
      const averageSimilarity = (incomeSimilarity + stabilitySimilarity + helpingSimilarity + riskSimilarity) / 4;
      
      current.score += averageSimilarity * weight * 20; // 20 points max for values alignment
      
      if (averageSimilarity > 0.7) {
        current.reasoning.push(`Values align well with ${cluster.name.toLowerCase()}`);
      }
    });
  }

  /**
   * Compute experience bonus (max 5% weight)
   */
  private static computeExperienceBonus(profile: StudentProfile, clusterScores: Map<string, { score: number; reasoning: string[] }>): number {
    const hasExperience = profile.experience && profile.experience.toLowerCase() !== 'none yet' && profile.experience.trim().length > 10;
    
    if (hasExperience) {
      // Simple bonus for having experience - could be made more sophisticated
      return SCORING_WEIGHTS.experience_bonus * 100; // 5 points max
    }
    
    return 0;
  }

  /**
   * Compute career scores based on cluster scores
   */
  private static computeCareerScores(profile: StudentProfile, clusterScores: ClusterScore[]): Array<{ career: Career; score: number; reasoning: string[] }> {
    const clusterScoreMap = new Map(clusterScores.map(cs => [cs.cluster_id, cs.score]));
    
    return this.careers.map(career => {
      const primaryScore = clusterScoreMap.get(career.primary_cluster) || 0;
      const secondaryScore = career.secondary_cluster ? (clusterScoreMap.get(career.secondary_cluster) || 0) : 0;
      
      // Base score: 75% primary cluster + 25% secondary cluster
      const baseScore = (primaryScore * 0.75) + (secondaryScore * 0.25);
      
      const reasoning = [`${Math.round(primaryScore)}% match with ${career.primary_cluster}`];
      if (career.secondary_cluster) {
        reasoning.push(`${Math.round(secondaryScore)}% secondary match with ${career.secondary_cluster}`);
      }
      
      return {
        career,
        score: baseScore,
        reasoning
      };
    });
  }

  /**
   * Apply feasibility constraints and penalties
   */
  private static applyFeasibilityConstraints(profile: StudentProfile, careerScores: Array<{ career: Career; score: number; reasoning: string[] }>): Array<{ career: Career; score: number; reasoning: string[]; feasibility_notes: string[] }> {
    const educationLevel = VALUE_ENCODINGS.education[profile.educationWillingness as keyof typeof VALUE_ENCODINGS.education] || 2;
    const supportLevel = VALUE_ENCODINGS.support[profile.supportLevel as keyof typeof VALUE_ENCODINGS.support] || 0.5;
    const hasPhysicalConstraints = profile.constraints.includes('Physical work may be difficult for me');
    const needsQuickIncome = profile.constraints.includes('Start earning money as soon as possible');
    
    return careerScores.map(({ career, score, reasoning }) => {
      let adjustedScore = score;
      const feasibilityNotes: string[] = [];
      
      // Education mismatch penalty
      if (career.edu_required_level > educationLevel) {
        const penalty = (career.edu_required_level - educationLevel) * 15; // 15 points per level
        adjustedScore -= penalty;
        feasibilityNotes.push(`Requires ${this.getEducationLevelName(career.edu_required_level)} (higher than your stated preference)`);
      }
      
      // Time-to-entry penalty for quick income needs
      if (needsQuickIncome && career.time_to_entry_years > 2) {
        const penalty = (career.time_to_entry_years - 2) * 10; // 10 points per year over 2
        adjustedScore -= penalty;
        feasibilityNotes.push(`Takes ${career.time_to_entry_years} years to enter (you prefer quick income)`);
      }
      
      // Physical demand penalty
      if (hasPhysicalConstraints && career.physical_demand >= 2) {
        adjustedScore -= 20; // 20 point penalty
        feasibilityNotes.push('Involves significant physical demands');
      }
      
      // Cost penalty for low support
      if (supportLevel < 0.5 && career.cost_level > 0.6) {
        adjustedScore -= 15; // 15 point penalty
        feasibilityNotes.push('High education costs with limited support');
      }
      
      return {
        career,
        score: Math.max(0, adjustedScore), // Don't go below 0
        reasoning,
        feasibility_notes: feasibilityNotes
      };
    });
  }

  /**
   * Categorize careers into best fit, good fit, and stretch options
   */
  private static categorizeCareers(careerScores: Array<{ career: Career; score: number; reasoning: string[]; feasibility_notes: string[] }>): {
    best_fit: CareerRecommendation[];
    good_fit: CareerRecommendation[];
    stretch_options: CareerRecommendation[];
  } {
    // Sort by score descending
    const sortedCareers = careerScores.sort((a, b) => b.score - a.score);
    
    const best_fit: CareerRecommendation[] = [];
    const good_fit: CareerRecommendation[] = [];
    const stretch_options: CareerRecommendation[] = [];
    
    // Get the top score to use for relative thresholds
    const topScore = sortedCareers.length > 0 ? sortedCareers[0].score : 0;
    
    sortedCareers.forEach(({ career, score, reasoning, feasibility_notes }) => {
      const recommendation: CareerRecommendation = {
        career,
        score: Math.round(score),
        fit_category: 'best_fit', // Will be updated below
        reasoning,
        feasibility_notes: feasibility_notes.length > 0 ? feasibility_notes : undefined
      };
      
      // Use both absolute and relative thresholds
      const relativeScore = topScore > 0 ? (score / topScore) : 0;
      
      if ((score >= 45 || relativeScore >= 0.85) && feasibility_notes.length === 0) {
        recommendation.fit_category = 'best_fit';
        best_fit.push(recommendation);
      } else if (score >= 35 || relativeScore >= 0.70) {
        recommendation.fit_category = 'good_fit';
        good_fit.push(recommendation);
      } else if (score >= 25 || career.challenge_level >= 2) {
        recommendation.fit_category = 'stretch_option';
        stretch_options.push(recommendation);
      }
    });
    
    return { best_fit, good_fit, stretch_options };
  }

  /**
   * Generate four-year plan based on top career recommendation
   */
  private static generateFourYearPlan(profile: StudentProfile, topCareer?: CareerRecommendation): any {
    const currentGrade = profile.grade;
    const plan: any = {};
    
    // Generate plans for remaining high school years
    for (let grade = currentGrade; grade <= 12; grade++) {
      const gradeKey = `grade_${grade}`;
      plan[gradeKey] = this.generateYearPlan(grade, topCareer?.career);
    }
    
    // Post-graduation plan
    plan.post_graduation = this.generatePostGradPlan(topCareer?.career);
    
    return plan;
  }

  /**
   * Generate plan for specific grade year
   */
  private static generateYearPlan(grade: number, career?: Career): any {
    const baseCourses = {
      9: ['English I', 'Algebra I', 'Biology', 'World History', 'PE/Health'],
      10: ['English II', 'Geometry', 'Chemistry', 'World Geography', 'PE/Health'],
      11: ['English III', 'Algebra II', 'Physics', 'US History', 'Government'],
      12: ['English IV', 'Pre-Calculus/Statistics', 'Economics', 'Electives']
    };
    
    const courses = baseCourses[grade as keyof typeof baseCourses] || ['Core Academic Courses'];
    
    // Add career-specific courses
    if (career) {
      if (career.primary_cluster === 'C2') { // Healthcare
        courses.push('Health Sciences', 'Anatomy & Physiology');
      } else if (career.primary_cluster === 'C1') { // Skilled Trades
        courses.push('Shop Class', 'Construction Technology');
      } else if (career.primary_cluster === 'C3') { // Technology
        courses.push('Computer Science', 'Advanced Mathematics');
      }
    }
    
    return {
      focus: this.getGradeFocus(grade, career),
      courses,
      activities: this.getGradeActivities(grade, career),
      milestones: this.getGradeMilestones(grade, career)
    };
  }

  /**
   * Generate post-graduation plan
   */
  private static generatePostGradPlan(career?: Career): any {
    if (!career) {
      return {
        immediate_steps: ['Complete high school', 'Explore career options', 'Apply to programs'],
        education_path: 'To be determined based on career choice',
        timeline: '1-4 years depending on path',
        estimated_cost: '$5,000 - $50,000 depending on program'
      };
    }
    
    return {
      immediate_steps: [
        'Complete high school with strong GPA',
        `Research ${this.getEducationLevelName(career.edu_required_level)} programs`,
        'Apply for financial aid and scholarships',
        'Gain relevant work/volunteer experience'
      ],
      education_path: this.getEducationLevelName(career.edu_required_level),
      timeline: `${career.time_to_entry_years} years to career entry`,
      estimated_cost: this.getEstimatedCost(career.cost_level)
    };
  }

  /**
   * Generate comparison questions
   */
  private static generateComparisonQuestions(categorizedCareers: any): any[] {
    const allCareers = [
      ...categorizedCareers.best_fit,
      ...categorizedCareers.good_fit,
      ...categorizedCareers.stretch_options
    ];
    
    if (allCareers.length < 2) return [];
    
    const questions = [];
    
    // Compare top 2 careers
    if (allCareers.length >= 2) {
      questions.push({
        question: `Which appeals to you more: ${allCareers[0].career.name} or ${allCareers[1].career.name}?`,
        career_a: allCareers[0].career.name,
        career_b: allCareers[1].career.name,
        factors: ['Work environment', 'Education requirements', 'Income potential', 'Job security']
      });
    }
    
    return questions;
  }

  /**
   * Create student profile summary
   */
  private static createProfileSummary(profile: StudentProfile, clusterScores: ClusterScore[]): any {
    const topCluster = clusterScores[0];
    const readinessLevel = this.assessReadinessLevel(profile);
    const keyStrengths = this.identifyKeyStrengths(profile);
    const primaryInterests = this.identifyPrimaryInterests(profile, clusterScores);
    
    return {
      grade: profile.grade,
      readiness_level: readinessLevel,
      key_strengths: keyStrengths,
      primary_interests: primaryInterests
    };
  }

  // Helper methods
  private static getEducationLevelName(level: number): string {
    const levels = {
      0: 'High school diploma',
      1: 'Certificate or apprenticeship',
      2: 'Associate degree (2-4 years)',
      3: 'Bachelor\'s degree or higher'
    };
    return levels[level as keyof typeof levels] || 'Unknown';
  }

  private static getEstimatedCost(costLevel: number): string {
    if (costLevel <= 0.3) return '$5,000 - $15,000';
    if (costLevel <= 0.5) return '$15,000 - $30,000';
    if (costLevel <= 0.7) return '$30,000 - $60,000';
    return '$60,000+';
  }

  private static getGradeFocus(grade: number, career?: Career): string {
    const focuses = {
      9: 'Build strong academic foundation and explore interests',
      10: 'Develop skills and gain experience through activities',
      11: 'Focus on career preparation and college planning',
      12: 'Finalize plans and prepare for next steps'
    };
    return focuses[grade as keyof typeof focuses] || 'Academic and career preparation';
  }

  private static getGradeActivities(grade: number, career?: Career): string[] {
    const baseActivities = ['Join relevant clubs', 'Volunteer in community', 'Part-time work experience'];
    
    if (career?.primary_cluster === 'C2') {
      baseActivities.push('HOSA (Health Occupations)', 'Hospital volunteering');
    } else if (career?.primary_cluster === 'C1') {
      baseActivities.push('Skills USA', 'Construction/trade clubs');
    }
    
    return baseActivities;
  }

  private static getGradeMilestones(grade: number, career?: Career): string[] {
    const milestones = {
      9: ['Maintain good grades', 'Explore career interests', 'Join activities'],
      10: ['Take relevant courses', 'Gain work experience', 'Build skills'],
      11: ['Take SAT/ACT', 'Research programs', 'Apply for scholarships'],
      12: ['Complete applications', 'Secure funding', 'Plan transition']
    };
    return milestones[grade as keyof typeof milestones] || ['Continue academic progress'];
  }

  private static assessReadinessLevel(profile: StudentProfile): string {
    const confidenceScore = VALUE_ENCODINGS.confidence[profile.careerConfidence as keyof typeof VALUE_ENCODINGS.confidence] || 0.5;
    const urgencyScore = VALUE_ENCODINGS.urgency[profile.decisionPressure as keyof typeof VALUE_ENCODINGS.urgency] || 0.5;
    
    const readinessScore = (confidenceScore + urgencyScore) / 2;
    
    if (readinessScore >= 0.75) return 'High - Ready to make decisions';
    if (readinessScore >= 0.5) return 'Moderate - Exploring options';
    return 'Early - Just beginning exploration';
  }

  private static identifyKeyStrengths(profile: StudentProfile): string[] {
    const strengths: string[] = [];
    
    // Check academic performance
    Object.entries(profile.academicPerformance).forEach(([subject, performance]) => {
      if (performance === 'Excellent' || performance === 'Good') {
        strengths.push(subject);
      }
    });
    
    // Add top traits
    strengths.push(...profile.traits.slice(0, 3));
    
    return strengths.slice(0, 5); // Limit to top 5
  }

  private static identifyPrimaryInterests(profile: StudentProfile, clusterScores: ClusterScore[]): string[] {
    const interests: string[] = [];
    
    // Add top clusters
    interests.push(...clusterScores.slice(0, 3).map(cs => cs.name));
    
    // Add work styles
    interests.push(...profile.workStyle.slice(0, 2));
    
    return interests.slice(0, 4); // Limit to top 4
  }
}