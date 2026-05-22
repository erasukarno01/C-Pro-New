import { supabase } from "./supabase";

export type TrainingSessionStatus = "planned" | "scheduled" | "ongoing" | "completed" | "cancelled";
export type SkillAssessmentStatus = "draft" | "passed" | "failed" | "needs_retest";
export type SkillChangeType = "created" | "updated" | "deleted";

export type TrainingReferenceOption = {
  id: string;
  label: string;
};

export type TrainingSessionRecord = {
  id: string;
  trainingCode: string;
  operatorId: string;
  operatorName: string;
  operatorNik: string;
  skillId: string;
  skillCode: string;
  skillName: string;
  trainerName: string;
  scheduledAt: string;
  completedAt?: string | null;
  status: TrainingSessionStatus;
  location?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SkillAssessmentRecord = {
  id: string;
  trainingSessionId?: string | null;
  operatorId: string;
  operatorName: string;
  operatorNik: string;
  skillId: string;
  skillCode: string;
  skillName: string;
  previousLevel?: number | null;
  assessedLevel: number;
  status: SkillAssessmentStatus;
  assessedBy: string;
  assessedAt: string;
  evidenceUrl?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SkillChangeRecord = {
  id: string;
  assessmentId?: string | null;
  trainingSessionId?: string | null;
  operatorId: string;
  operatorName: string;
  operatorNik: string;
  skillId: string;
  skillCode: string;
  skillName: string;
  changeType: SkillChangeType;
  oldLevel?: number | null;
  newLevel?: number | null;
  oldStatus?: string | null;
  newStatus?: string | null;
  changedBy: string;
  reason?: string | null;
  changedAt: string;
  createdAt: string;
  updatedAt: string;
};

export type TrainingWorkspaceSnapshot = {
  source: "supabase" | "preview";
  operators: TrainingReferenceOption[];
  skills: TrainingReferenceOption[];
  sessions: TrainingSessionRecord[];
  assessments: SkillAssessmentRecord[];
  changes: SkillChangeRecord[];
};

export type OperatorSkillHistorySnapshot = {
  source: "supabase" | "preview";
  operators: TrainingReferenceOption[];
  skills: TrainingReferenceOption[];
  selectedOperatorId: string;
  selectedOperatorLabel: string;
  changes: SkillChangeRecord[];
  summary: {
    totalChanges: number;
    createdCount: number;
    updatedCount: number;
    deletedCount: number;
  };
};

export type TrainingSessionInput = {
  trainingCode: string;
  operatorId: string;
  skillId: string;
  trainerName: string;
  scheduledAt: string;
  completedAt?: string | null;
  status: TrainingSessionStatus;
  location?: string | null;
  notes?: string | null;
};

export type SkillAssessmentInput = {
  trainingSessionId?: string | null;
  operatorId: string;
  skillId: string;
  previousLevel?: number | null;
  assessedLevel: number;
  status: SkillAssessmentStatus;
  assessedBy: string;
  assessedAt: string;
  evidenceUrl?: string | null;
  notes?: string | null;
};

type OperatorRow = {
  id: string;
  nik: string;
  name: string;
  active: boolean;
};

type SkillRow = {
  id: string;
  code: string;
  name: string;
};

type TrainingSessionRow = {
  id: string;
  training_code: string;
  operator_id: string;
  skill_id: string;
  trainer_name: string;
  scheduled_at: string;
  completed_at?: string | null;
  status: TrainingSessionStatus;
  location?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
};

type SkillAssessmentRow = {
  id: string;
  training_session_id?: string | null;
  operator_id: string;
  skill_id: string;
  previous_level?: number | null;
  assessed_level: number;
  status: SkillAssessmentStatus;
  assessed_by: string;
  assessed_at: string;
  evidence_url?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
};

type SkillChangeRow = {
  id: string;
  assessment_id?: string | null;
  training_session_id?: string | null;
  operator_id: string;
  skill_id: string;
  change_type: SkillChangeType;
  old_level?: number | null;
  new_level?: number | null;
  old_status?: string | null;
  new_status?: string | null;
  changed_by: string;
  reason?: string | null;
  changed_at: string;
  created_at: string;
  updated_at: string;
};

function buildPreviewSnapshot(): TrainingWorkspaceSnapshot {
  const timestamp = new Date().toISOString();

  return {
    source: "preview",
    operators: [
      { id: "OP-001", label: "OP-001 - Budi Santoso" },
      { id: "OP-002", label: "OP-002 - Siti Rahma" },
      { id: "OP-003", label: "OP-003 - Andi Pratama" },
    ],
    skills: [
      { id: "SOLDER", label: "SOLDER - Soldering" },
      { id: "INSPECT", label: "INSPECT - Inspection" },
      { id: "ASSEMBLY", label: "ASSEMBLY - Assembly" },
    ],
    sessions: [
      {
        id: "training-preview-1",
        trainingCode: "TRN-2026-001",
        operatorId: "OP-001",
        operatorName: "Budi Santoso",
        operatorNik: "OP-001",
        skillId: "SOLDER",
        skillCode: "SOLDER",
        skillName: "Soldering",
        trainerName: "Supervisor Demo",
        scheduledAt: timestamp,
        completedAt: null,
        status: "completed",
        location: "Training Room A",
        notes: "Preview data",
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    ],
    assessments: [
      {
        id: "assessment-preview-1",
        trainingSessionId: "training-preview-1",
        operatorId: "OP-001",
        operatorName: "Budi Santoso",
        operatorNik: "OP-001",
        skillId: "SOLDER",
        skillCode: "SOLDER",
        skillName: "Soldering",
        previousLevel: 2,
        assessedLevel: 3,
        status: "passed",
        assessedBy: "Supervisor Demo",
        assessedAt: timestamp,
        evidenceUrl: null,
        notes: "Preview assessment",
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    ],
    changes: [
      {
        id: "change-preview-1",
        assessmentId: "assessment-preview-1",
        trainingSessionId: "training-preview-1",
        operatorId: "OP-001",
        operatorName: "Budi Santoso",
        operatorNik: "OP-001",
        skillId: "SOLDER",
        skillCode: "SOLDER",
        skillName: "Soldering",
        changeType: "created",
        oldLevel: 2,
        newLevel: 3,
        oldStatus: null,
        newStatus: "passed",
        changedBy: "Supervisor Demo",
        reason: "Preview audit log",
        changedAt: timestamp,
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    ],
  };
}

function getOperatorLabel(operator: OperatorRow) {
  return `${operator.nik} - ${operator.name}`;
}

function getSkillLabel(skill: SkillRow) {
  return `${skill.code} - ${skill.name}`;
}

function mapTrainingSession(row: TrainingSessionRow, operatorMap: Map<string, OperatorRow>, skillMap: Map<string, SkillRow>): TrainingSessionRecord {
  const operator = operatorMap.get(row.operator_id);
  const skill = skillMap.get(row.skill_id);

  return {
    id: row.id,
    trainingCode: row.training_code,
    operatorId: row.operator_id,
    operatorName: operator?.name ?? row.operator_id,
    operatorNik: operator?.nik ?? row.operator_id,
    skillId: row.skill_id,
    skillCode: skill?.code ?? row.skill_id,
    skillName: skill?.name ?? row.skill_id,
    trainerName: row.trainer_name,
    scheduledAt: row.scheduled_at,
    completedAt: row.completed_at,
    status: row.status,
    location: row.location,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapSkillAssessment(row: SkillAssessmentRow, operatorMap: Map<string, OperatorRow>, skillMap: Map<string, SkillRow>): SkillAssessmentRecord {
  const operator = operatorMap.get(row.operator_id);
  const skill = skillMap.get(row.skill_id);

  return {
    id: row.id,
    trainingSessionId: row.training_session_id,
    operatorId: row.operator_id,
    operatorName: operator?.name ?? row.operator_id,
    operatorNik: operator?.nik ?? row.operator_id,
    skillId: row.skill_id,
    skillCode: skill?.code ?? row.skill_id,
    skillName: skill?.name ?? row.skill_id,
    previousLevel: row.previous_level,
    assessedLevel: row.assessed_level,
    status: row.status,
    assessedBy: row.assessed_by,
    assessedAt: row.assessed_at,
    evidenceUrl: row.evidence_url,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapSkillChange(row: SkillChangeRow, operatorMap: Map<string, OperatorRow>, skillMap: Map<string, SkillRow>): SkillChangeRecord {
  const operator = operatorMap.get(row.operator_id);
  const skill = skillMap.get(row.skill_id);

  return {
    id: row.id,
    assessmentId: row.assessment_id,
    trainingSessionId: row.training_session_id,
    operatorId: row.operator_id,
    operatorName: operator?.name ?? row.operator_id,
    operatorNik: operator?.nik ?? row.operator_id,
    skillId: row.skill_id,
    skillCode: skill?.code ?? row.skill_id,
    skillName: skill?.name ?? row.skill_id,
    changeType: row.change_type,
    oldLevel: row.old_level,
    newLevel: row.new_level,
    oldStatus: row.old_status,
    newStatus: row.new_status,
    changedBy: row.changed_by,
    reason: row.reason,
    changedAt: row.changed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapTrainingError(errorMessage: string): Error {
  return new Error(`Supabase training workspace error: ${errorMessage}`);
}

export async function fetchTrainingWorkspaceSnapshot(): Promise<TrainingWorkspaceSnapshot> {
  if (!supabase) {
    return buildPreviewSnapshot();
  }

  const [operatorsResult, skillsResult, sessionsResult, assessmentsResult, changesResult] = await Promise.all([
    supabase.from("operators").select("id,nik,name,active").eq("active", true).order("nik", { ascending: true }),
    supabase.from("skills").select("id,code,name").order("code", { ascending: true }),
    supabase
      .from("operator_training_sessions")
      .select("id,training_code,operator_id,skill_id,trainer_name,scheduled_at,completed_at,status,location,notes,created_at,updated_at")
      .order("scheduled_at", { ascending: false }),
    supabase
      .from("operator_skill_assessments")
      .select("id,training_session_id,operator_id,skill_id,previous_level,assessed_level,status,assessed_by,assessed_at,evidence_url,notes,created_at,updated_at")
      .order("assessed_at", { ascending: false }),
    supabase
      .from("operator_skill_changes")
      .select("id,assessment_id,training_session_id,operator_id,skill_id,change_type,old_level,new_level,old_status,new_status,changed_by,reason,changed_at,created_at,updated_at")
      .order("changed_at", { ascending: false }),
  ]);

  if (operatorsResult.error) {
    throw mapTrainingError(operatorsResult.error.message);
  }

  if (skillsResult.error) {
    throw mapTrainingError(skillsResult.error.message);
  }

  if (sessionsResult.error) {
    throw mapTrainingError(sessionsResult.error.message);
  }

  if (assessmentsResult.error) {
    throw mapTrainingError(assessmentsResult.error.message);
  }

  if (changesResult.error) {
    throw mapTrainingError(changesResult.error.message);
  }

  const operators = (operatorsResult.data ?? []) as OperatorRow[];
  const skills = (skillsResult.data ?? []) as SkillRow[];
  const sessions = (sessionsResult.data ?? []) as TrainingSessionRow[];
  const assessments = (assessmentsResult.data ?? []) as SkillAssessmentRow[];
  const changes = (changesResult.data ?? []) as SkillChangeRow[];

  const operatorMap = new Map(operators.map((operator) => [operator.id, operator]));
  const skillMap = new Map(skills.map((skill) => [skill.id, skill]));

  return {
    source: "supabase",
    operators: operators.map((operator) => ({ id: operator.id, label: getOperatorLabel(operator) })),
    skills: skills.map((skill) => ({ id: skill.id, label: getSkillLabel(skill) })),
    sessions: sessions.map((session) => mapTrainingSession(session, operatorMap, skillMap)),
    assessments: assessments.map((assessment) => mapSkillAssessment(assessment, operatorMap, skillMap)),
    changes: changes.map((change) => mapSkillChange(change, operatorMap, skillMap)),
  };
}

function toDatabaseDate(value: string): string {
  return new Date(value).toISOString();
}

function toNullableDatabaseDate(value?: string | null): string | null {
  if (!value) {
    return null;
  }

  return toDatabaseDate(value);
}

async function ensureSupabaseReady() {
  if (!supabase) {
    throw new Error("Supabase client belum dikonfigurasi.");
  }
}

export async function saveTrainingSession(id: string | null, input: TrainingSessionInput): Promise<void> {
  await ensureSupabaseReady();

  const payload = {
    training_code: input.trainingCode,
    operator_id: input.operatorId,
    skill_id: input.skillId,
    trainer_name: input.trainerName,
    scheduled_at: toDatabaseDate(input.scheduledAt),
    completed_at: toNullableDatabaseDate(input.completedAt),
    status: input.status,
    location: input.location ?? null,
    notes: input.notes ?? null,
  };

  const query = id ? supabase.from("operator_training_sessions").update(payload).eq("id", id) : supabase.from("operator_training_sessions").insert(payload);
  const { error } = await query;

  if (error) {
    throw new Error(error.message);
  }
}

export async function deleteTrainingSession(id: string): Promise<void> {
  await ensureSupabaseReady();

  const { error } = await supabase.from("operator_training_sessions").delete().eq("id", id);
  if (error) {
    throw new Error(error.message);
  }
}

export async function saveSkillAssessment(id: string | null, input: SkillAssessmentInput): Promise<void> {
  await ensureSupabaseReady();

  const payload = {
    training_session_id: input.trainingSessionId ?? null,
    operator_id: input.operatorId,
    skill_id: input.skillId,
    previous_level: input.previousLevel ?? null,
    assessed_level: input.assessedLevel,
    status: input.status,
    assessed_by: input.assessedBy,
    assessed_at: toDatabaseDate(input.assessedAt),
    evidence_url: input.evidenceUrl ?? null,
    notes: input.notes ?? null,
  };

  const query = id ? supabase.from("operator_skill_assessments").update(payload).eq("id", id) : supabase.from("operator_skill_assessments").insert(payload);
  const { error } = await query;

  if (error) {
    throw new Error(error.message);
  }
}

export async function deleteSkillAssessment(id: string): Promise<void> {
  await ensureSupabaseReady();

  const { error } = await supabase.from("operator_skill_assessments").delete().eq("id", id);
  if (error) {
    throw new Error(error.message);
  }
}

export function getTrainingWorkspacePreview(): TrainingWorkspaceSnapshot {
  return buildPreviewSnapshot();
}

function buildPreviewOperatorHistorySnapshot(): OperatorSkillHistorySnapshot {
  const preview = buildPreviewSnapshot();
  const selectedOperator = preview.operators[0];
  const filteredChanges = preview.changes.filter((change) => change.operatorId === selectedOperator.id);

  return {
    source: preview.source,
    operators: preview.operators,
    skills: preview.skills,
    selectedOperatorId: selectedOperator.id,
    selectedOperatorLabel: selectedOperator.label,
    changes: filteredChanges,
    summary: {
      totalChanges: filteredChanges.length,
      createdCount: filteredChanges.filter((change) => change.changeType === "created").length,
      updatedCount: filteredChanges.filter((change) => change.changeType === "updated").length,
      deletedCount: filteredChanges.filter((change) => change.changeType === "deleted").length,
    },
  };
}

export async function fetchOperatorSkillHistorySnapshot(operatorId?: string): Promise<OperatorSkillHistorySnapshot> {
  if (!supabase) {
    return buildPreviewOperatorHistorySnapshot();
  }

  const [operatorsResult, skillsResult, changesResult] = await Promise.all([
    supabase.from("operators").select("id,nik,name,active").eq("active", true).order("nik", { ascending: true }),
    supabase.from("skills").select("id,code,name").order("code", { ascending: true }),
    operatorId
      ? supabase
          .from("operator_skill_changes")
          .select("id,assessment_id,training_session_id,operator_id,skill_id,change_type,old_level,new_level,old_status,new_status,changed_by,reason,changed_at,created_at,updated_at")
          .eq("operator_id", operatorId)
          .order("changed_at", { ascending: false })
      : supabase
          .from("operator_skill_changes")
          .select("id,assessment_id,training_session_id,operator_id,skill_id,change_type,old_level,new_level,old_status,new_status,changed_by,reason,changed_at,created_at,updated_at")
          .order("changed_at", { ascending: false }),
  ]);

  if (operatorsResult.error) {
    throw mapTrainingError(operatorsResult.error.message);
  }

  if (skillsResult.error) {
    throw mapTrainingError(skillsResult.error.message);
  }

  if (changesResult.error) {
    throw mapTrainingError(changesResult.error.message);
  }

  const operators = (operatorsResult.data ?? []) as OperatorRow[];
  const skills = (skillsResult.data ?? []) as SkillRow[];
  const changes = (changesResult.data ?? []) as SkillChangeRow[];

  const operatorMap = new Map(operators.map((operator) => [operator.id, operator]));
  const skillMap = new Map(skills.map((skill) => [skill.id, skill]));
  const selectedOperator = operatorId ? operators.find((operator) => operator.id === operatorId) : operators[0];
  const selectedOperatorId = selectedOperator?.id ?? operatorId ?? "";
  const selectedOperatorLabel = selectedOperator ? getOperatorLabel(selectedOperator) : operatorId ?? "-";

  return {
    source: "supabase",
    operators: operators.map((operator) => ({ id: operator.id, label: getOperatorLabel(operator) })),
    skills: skills.map((skill) => ({ id: skill.id, label: getSkillLabel(skill) })),
    selectedOperatorId,
    selectedOperatorLabel,
    changes: changes.map((change) => mapSkillChange(change, operatorMap, skillMap)),
    summary: {
      totalChanges: changes.length,
      createdCount: changes.filter((change) => change.change_type === "created").length,
      updatedCount: changes.filter((change) => change.change_type === "updated").length,
      deletedCount: changes.filter((change) => change.change_type === "deleted").length,
    },
  };
}