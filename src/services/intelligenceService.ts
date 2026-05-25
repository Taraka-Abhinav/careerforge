import { UserProfile, RoadmapPhase, RoadmapNode, SkillItem, SKILL_TAXONOMY } from '../types';
import { supabase, isSupabaseConfigured } from '../supabase/client';

export const IntelligenceService = {
  /**
   * Generates a deeply personalized learning path based on known/target skills and career goals.
   */
  async generateDynamicRoadmap(userId: string, profile: UserProfile): Promise<RoadmapPhase[]> {
    const { goals, skills, time } = profile;
    const knownSkillNames = skills.known.map(s => s.name);
    
    // In a real V2 production env, this would call an LLM or a huge logic matrix.
    // For V2 prototype, we use targeted logic branching.
    let generatedPhases: RoadmapPhase[] = [];

    // Branch 1: AI Engineer Logic
    if (goals.career.includes('AI') || goals.career.includes('Data')) {
      const needsPython = !knownSkillNames.includes('Python');
      const needsMath = !knownSkillNames.includes('Statistics');
      
      const phase1: RoadmapPhase = {
        phase: 'Phase 1: Deep Foundations',
        duration: time.hoursPerWeek > 20 ? '2 Weeks' : '4 Weeks',
        items: []
      };

      if (needsPython) {
        phase1.items.push({ id: 'py-1', type: 'skill', title: 'Python Architectures', format: 'Interactive' });
      }
      if (needsMath) {
         phase1.items.push({ id: 'math-1', type: 'skill', title: 'Calculus & Linear Algebra', format: 'Video' });
      } else {
         phase1.items.push({ id: 'ml-1', type: 'skill', title: 'Machine Learning Theory', format: 'Reading' });
      }
      
      const phase2: RoadmapPhase = {
        phase: 'Phase 2: Network Architectures',
        duration: '4 Weeks',
        items: [
          { id: 'tf-1', type: 'skill', title: 'TensorFlow & PyTorch Foundations', format: 'Interactive' },
          { id: 'proj-1', type: 'project', title: 'Neural Pipeline Builder', format: 'Project' }
        ]
      };

      if (phase1.items.length === 0) {
        generatedPhases = [phase2];
      } else {
        generatedPhases = [phase1, phase2];
      }

    } 
    // Branch 2: Web / Software Engineer Logic
    else {
      const needsJs = !knownSkillNames.includes('JavaScript') && !knownSkillNames.includes('TypeScript');
      const needsReact = !knownSkillNames.includes('React');

      const phase1: RoadmapPhase = {
        phase: 'Phase 1: Core Protocols',
        duration: time.hoursPerWeek > 20 ? '3 Weeks' : '6 Weeks',
        items: []
      };

      if (needsJs) {
        phase1.items.push({ id: 'js-1', type: 'skill', title: 'JavaScript & DOM Manipulation', format: 'Interactive' });
      }
      if (needsReact) {
        phase1.items.push({ id: 'react-1', type: 'skill', title: 'React Ecosystem', format: 'Interactive' });
      }

      const phase2: RoadmapPhase = {
        phase: 'Phase 2: Scale & Systems',
        duration: '5 Weeks',
        items: [
          { id: 'sys-1', type: 'skill', title: 'System Design Patterns', format: 'Reading' },
          { id: 'proj-2', type: 'project', title: 'Distributed Micro-SaaS', format: 'Project' }
        ]
      };

      generatedPhases = phase1.items.length > 0 ? [phase1, phase2] : [phase2];
    }

    if (isSupabaseConfigured) {
       // We can persist the generated roadmap context if needed
       try {
         await supabase.from('roadmaps').upsert({
            user_id: userId,
            career_goal: goals.career,
            current_phase: generatedPhases[0]?.phase || 'Phase 1',
            status: 'active'
         });
       } catch(e) {
         console.error('Failed to sync roadmap to db', e);
       }
    }

    return generatedPhases;
  }
};