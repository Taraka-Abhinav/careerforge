import { supabase, isSupabaseConfigured } from '../supabase/client';

export interface ProjectSubmission {
  projectUrl: string;
  notes: string;
  submittedAt?: string;
}

const checkpointKey = (userId: string, moduleId: string) => `learning_checkpoints_${userId}_${moduleId}`;
const submissionKey = (userId: string, moduleId: string) => `learning_project_${userId}_${moduleId}`;

function getLocalCheckpointMap(userId: string, moduleId: string): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(checkpointKey(userId, moduleId));
    return raw ? JSON.parse(raw) as Record<string, boolean> : {};
  } catch {
    return {};
  }
}

function saveLocalCheckpointMap(userId: string, moduleId: string, map: Record<string, boolean>) {
  localStorage.setItem(checkpointKey(userId, moduleId), JSON.stringify(map));
}

function getLocalSubmission(userId: string, moduleId: string): ProjectSubmission | null {
  try {
    const raw = localStorage.getItem(submissionKey(userId, moduleId));
    return raw ? JSON.parse(raw) as ProjectSubmission : null;
  } catch {
    return null;
  }
}

function saveLocalSubmission(userId: string, moduleId: string, submission: ProjectSubmission) {
  localStorage.setItem(submissionKey(userId, moduleId), JSON.stringify(submission));
}

export const LearningDepthService = {
  async getCheckpointMap(userId: string, moduleId: string): Promise<Record<string, boolean>> {
    if (!isSupabaseConfigured) return getLocalCheckpointMap(userId, moduleId);

    const { data } = await supabase
      .from('learning_checkpoints')
      .select('checkpoint_key, is_completed')
      .eq('user_id', userId)
      .eq('module_id', moduleId);

    const map: Record<string, boolean> = {};
    (data || []).forEach((row) => {
      map[row.checkpoint_key as string] = Boolean(row.is_completed);
    });
    return map;
  },

  async setCheckpoint(
    userId: string,
    moduleId: string,
    checkpoint: string,
    isCompleted: boolean
  ): Promise<Record<string, boolean>> {
    if (!isSupabaseConfigured) {
      const map = getLocalCheckpointMap(userId, moduleId);
      map[checkpoint] = isCompleted;
      saveLocalCheckpointMap(userId, moduleId, map);
      return map;
    }

    await supabase.from('learning_checkpoints').upsert({
      user_id: userId,
      module_id: moduleId,
      checkpoint_key: checkpoint,
      is_completed: isCompleted,
      completed_at: isCompleted ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,module_id,checkpoint_key' });

    return this.getCheckpointMap(userId, moduleId);
  },

  async getProjectSubmission(userId: string, moduleId: string): Promise<ProjectSubmission | null> {
    if (!isSupabaseConfigured) return getLocalSubmission(userId, moduleId);

    const { data } = await supabase
      .from('learning_project_submissions')
      .select('project_url, notes, submitted_at')
      .eq('user_id', userId)
      .eq('module_id', moduleId)
      .maybeSingle();

    if (!data) return null;
    return {
      projectUrl: data.project_url || '',
      notes: data.notes || '',
      submittedAt: data.submitted_at || undefined,
    };
  },

  async saveProjectSubmission(
    userId: string,
    moduleId: string,
    submission: ProjectSubmission
  ): Promise<ProjectSubmission> {
    const payload = {
      user_id: userId,
      module_id: moduleId,
      project_url: submission.projectUrl,
      notes: submission.notes,
      submitted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (!isSupabaseConfigured) {
      saveLocalSubmission(userId, moduleId, { ...submission, submittedAt: payload.submitted_at });
      return { ...submission, submittedAt: payload.submitted_at };
    }

    await supabase.from('learning_project_submissions').upsert(payload, { onConflict: 'user_id,module_id' });
    return { ...submission, submittedAt: payload.submitted_at };
  },
};
