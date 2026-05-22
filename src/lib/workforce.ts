import { supabase } from "./supabase";

export type AssignmentDecision = "eligible" | "needs-review" | "not-eligible";

export type OperatorSkill = {
  skillId: string;
  level: number;
  assessedAt?: string;
  certifiedUntil?: string;
};

export type WorkstationSkillRequirement = {
  skillId?: string;
  minimumLevel: number;
  required?: boolean;
};

export type WorkstationContext = {
  workstationId: string;
  workstationName?: string;
  minimumSkill: number;
  requirements: WorkstationSkillRequirement[];
};

export type OperatorContext = {
  operatorId: string;
  skills: OperatorSkill[];
  active?: boolean;
};

export type AssignmentValidationResult = {
  decision: AssignmentDecision;
  eligible: boolean;
  reasons: string[];
  matchedRequirements: string[];
  missingRequirements: string[];
};

export type WorkOrderDemand = {
  workOrderId: string;
  workOrderCode: string;
  workstation: WorkstationContext;
  requiredHeadcount: number;
};

export type OperatorRecommendation = {
  operatorId: string;
  score: number;
  decision: AssignmentDecision;
  matchedRequirements: string[];
  missingRequirements: string[];
  reasons: string[];
};

export type ManpowerSuggestion = {
  workOrderId: string;
  workOrderCode: string;
  workstationId: string;
  workstationName: string;
  requiredHeadcount: number;
  eligibleHeadcount: number;
  shortage: number;
  coverageRate: number;
  recommendations: OperatorRecommendation[];
  status: "covered" | "partial" | "shortage";
};

export type WorkstationCoverageSnapshot = {
  workstationId: string;
  workstationName: string;
  requiredHeadcount: number;
  assignedHeadcount: number;
  eligibleHeadcount: number;
  shortage: number;
  coverageRate: number;
};

export type WorkforceDashboardMetrics = {
  totalWorkstations: number;
  coveredWorkstations: number;
  coverageRate: number;
  shortageCount: number;
  shortageHeadcount: number;
  averageCoverageRate: number;
  snapshots: WorkstationCoverageSnapshot[];
};

export type WorkforceAnalyticsSnapshot = {
  source: "supabase" | "preview";
  suggestion: ManpowerSuggestion;
  metrics: WorkforceDashboardMetrics;
};

export function validateOperatorAssignment(
  operator: OperatorContext,
  workstation: WorkstationContext,
): AssignmentValidationResult {
  if (operator.active === false) {
    return {
      decision: "not-eligible",
      eligible: false,
      reasons: ["Operator nonaktif."],
      matchedRequirements: [],
      missingRequirements: [],
    };
  }

  const skillById = new Map(operator.skills.map((skill) => [skill.skillId, skill]));
  const matchedRequirements: string[] = [];
  const missingRequirements: string[] = [];
  const reasons: string[] = [];

  for (const requirement of workstation.requirements) {
    const requiredLevel = requirement.minimumLevel ?? workstation.minimumSkill;

    if (requirement.skillId) {
      const skill = skillById.get(requirement.skillId);
      if (!skill) {
        missingRequirements.push(`${requirement.skillId} (level ${requiredLevel})`);
        reasons.push(`Skill ${requirement.skillId} tidak dimiliki operator.`);
        continue;
      }

      if (skill.level < requiredLevel) {
        missingRequirements.push(`${requirement.skillId} (butuh ${requiredLevel}, punya ${skill.level})`);
        reasons.push(`Skill ${requirement.skillId} level ${skill.level} belum memenuhi minimum ${requiredLevel}.`);
        continue;
      }

      matchedRequirements.push(requirement.skillId);
      continue;
    }

    const hasMinimumSkill = operator.skills.some((skill) => skill.level >= workstation.minimumSkill);
    if (!hasMinimumSkill) {
      missingRequirements.push(`minimum skill ${workstation.minimumSkill}`);
      reasons.push(`Operator belum memenuhi minimum skill workstation ${workstation.minimumSkill}.`);
      continue;
    }

    matchedRequirements.push(`minimum skill ${workstation.minimumSkill}`);
  }

  if (missingRequirements.length > 0) {
    return {
      decision: missingRequirements.length > 1 ? "not-eligible" : "needs-review",
      eligible: false,
      reasons,
      matchedRequirements,
      missingRequirements,
    };
  }

  return {
    decision: "eligible",
    eligible: true,
    reasons: ["Semua requirement terpenuhi."],
    matchedRequirements,
    missingRequirements: [],
  };
}

export function getAssignmentPreview() {
  const operator: OperatorContext = {
    operatorId: "OP-001",
    active: true,
    skills: [
      { skillId: "SOLDER", level: 3 },
      { skillId: "INSPECT", level: 2 },
    ],
  };

  const workstation: WorkstationContext = {
    workstationId: "WS-CCU-01",
    minimumSkill: 2,
    requirements: [
      { skillId: "SOLDER", minimumLevel: 2, required: true },
      { skillId: "INSPECT", minimumLevel: 2, required: true },
    ],
  };

  return validateOperatorAssignment(operator, workstation);
}

function scoreOperatorForWorkstation(
  operator: OperatorContext,
  workstation: WorkstationContext,
): OperatorRecommendation {
  const validation = validateOperatorAssignment(operator, workstation);
  const matchedBonus = validation.matchedRequirements.length * 10;
  const skillScore = operator.skills.reduce((total, skill) => total + skill.level, 0);
  const completenessPenalty = validation.missingRequirements.length * 15;

  return {
    operatorId: operator.operatorId,
    score: skillScore + matchedBonus - completenessPenalty + (operator.active === false ? -100 : 0),
    decision: validation.decision,
    matchedRequirements: validation.matchedRequirements,
    missingRequirements: validation.missingRequirements,
    reasons: validation.reasons,
  };
}

export function suggestManpowerForWorkOrder(
  demand: WorkOrderDemand,
  operators: OperatorContext[],
): ManpowerSuggestion {
  const scoredOperators = operators
    .map((operator) => ({ operator, recommendation: scoreOperatorForWorkstation(operator, demand.workstation) }))
    .sort((left, right) => right.recommendation.score - left.recommendation.score);

  const eligibleRecommendations = scoredOperators
    .filter(({ recommendation }) => recommendation.decision === "eligible")
    .map(({ recommendation }) => recommendation);

  const recommendedOperators = scoredOperators
    .filter(({ recommendation }) => recommendation.decision === "eligible" || recommendation.decision === "needs-review")
    .slice(0, demand.requiredHeadcount)
    .map(({ recommendation }) => recommendation);

  const eligibleHeadcount = eligibleRecommendations.length;
  const shortage = Math.max(demand.requiredHeadcount - eligibleHeadcount, 0);
  const coverageRate = demand.requiredHeadcount === 0 ? 100 : Math.min((eligibleHeadcount / demand.requiredHeadcount) * 100, 100);

  return {
    workOrderId: demand.workOrderId,
    workOrderCode: demand.workOrderCode,
    workstationId: demand.workstation.workstationId,
    workstationName: demand.workstation.workstationName ?? demand.workstation.workstationId,
    requiredHeadcount: demand.requiredHeadcount,
    eligibleHeadcount,
    shortage,
    coverageRate,
    recommendations: recommendedOperators,
    status: shortage === 0 ? "covered" : eligibleHeadcount > 0 ? "partial" : "shortage",
  };
}

export function getManpowerSuggestionPreview() {
  const demand: WorkOrderDemand = {
    workOrderId: "WO-001",
    workOrderCode: "WO-CCU-2401",
    requiredHeadcount: 2,
    workstation: {
      workstationId: "WS-CCU-01",
      workstationName: "Workstation CCU 1",
      minimumSkill: 2,
      requirements: [
        { skillId: "SOLDER", minimumLevel: 2, required: true },
        { skillId: "INSPECT", minimumLevel: 2, required: true },
      ],
    },
  };

  const operators: OperatorContext[] = [
    {
      operatorId: "OP-001",
      active: true,
      skills: [
        { skillId: "SOLDER", level: 3 },
        { skillId: "INSPECT", level: 2 },
      ],
    },
    {
      operatorId: "OP-002",
      active: true,
      skills: [
        { skillId: "SOLDER", level: 2 },
        { skillId: "INSPECT", level: 1 },
      ],
    },
    {
      operatorId: "OP-003",
      active: true,
      skills: [
        { skillId: "SOLDER", level: 1 },
        { skillId: "INSPECT", level: 2 },
      ],
    },
    {
      operatorId: "OP-004",
      active: false,
      skills: [
        { skillId: "SOLDER", level: 4 },
        { skillId: "INSPECT", level: 4 },
      ],
    },
  ];

  return suggestManpowerForWorkOrder(demand, operators);
}

export function getWorkforceDashboardMetricsPreview(): WorkforceDashboardMetrics {
  const workstationSnapshots: Array<{ workstation: WorkstationContext; requiredHeadcount: number; eligibleOperators: OperatorContext[] }> = [
    {
      workstation: {
        workstationId: "WS-CCU-01",
        workstationName: "Workstation CCU 1",
        minimumSkill: 2,
        requirements: [
          { skillId: "SOLDER", minimumLevel: 2, required: true },
          { skillId: "INSPECT", minimumLevel: 2, required: true },
        ],
      },
      requiredHeadcount: 2,
      assignedHeadcount: 2,
      eligibleOperators: [
        {
          operatorId: "OP-001",
          active: true,
          skills: [
            { skillId: "SOLDER", level: 3 },
            { skillId: "INSPECT", level: 2 },
          ],
        },
        {
          operatorId: "OP-002",
          active: true,
          skills: [
            { skillId: "SOLDER", level: 2 },
            { skillId: "INSPECT", level: 2 },
          ],
        },
      ],
    },
    {
      workstation: {
        workstationId: "WS-CCU-02",
        workstationName: "Workstation CCU 2",
        minimumSkill: 2,
        requirements: [
          { skillId: "SOLDER", minimumLevel: 2, required: true },
        ],
      },
      requiredHeadcount: 2,
      assignedHeadcount: 1,
      eligibleOperators: [
        {
          operatorId: "OP-003",
          active: true,
          skills: [{ skillId: "SOLDER", level: 2 }],
        },
      ],
    },
    {
      workstation: {
        workstationId: "WS-USB-01",
        workstationName: "Workstation USB 1",
        minimumSkill: 2,
        requirements: [
          { skillId: "ASSEMBLY", minimumLevel: 2, required: true },
        ],
      },
      requiredHeadcount: 1,
      assignedHeadcount: 1,
      eligibleOperators: [
        {
          operatorId: "OP-004",
          active: true,
          skills: [{ skillId: "ASSEMBLY", level: 3 }],
        },
      ],
    },
  ];

  const snapshots = workstationSnapshots.map(({ workstation, requiredHeadcount, assignedHeadcount, eligibleOperators }) => {
    const eligibleCount = eligibleOperators.filter((operator) => validateOperatorAssignment(operator, workstation).eligible).length;
    const shortage = Math.max(requiredHeadcount - assignedHeadcount, 0);
    return {
      workstationId: workstation.workstationId,
      workstationName: workstation.workstationName ?? workstation.workstationId,
      requiredHeadcount,
      assignedHeadcount,
      eligibleHeadcount: eligibleCount,
      shortage,
      coverageRate: requiredHeadcount === 0 ? 100 : Math.min((eligibleCount / requiredHeadcount) * 100, 100),
    };
  });

  const totalWorkstations = snapshots.length;
  const coveredWorkstations = snapshots.filter((snapshot) => snapshot.shortage === 0).length;
  const shortageCount = snapshots.filter((snapshot) => snapshot.shortage > 0).length;
  const shortageHeadcount = snapshots.reduce((total, snapshot) => total + snapshot.shortage, 0);
  const averageCoverageRate = snapshots.reduce((total, snapshot) => total + snapshot.coverageRate, 0) / totalWorkstations;

  return {
    totalWorkstations,
    coveredWorkstations,
    coverageRate: (coveredWorkstations / totalWorkstations) * 100,
    shortageCount,
    shortageHeadcount,
    averageCoverageRate,
    snapshots,
  };
}

type SupabaseOperatorRow = {
  id: string;
  nik: string;
  name: string;
  active: boolean;
  operator_skills: Array<{
    skill_id: string | null;
    level: number;
    assessed_at?: string | null;
    certified_until?: string | null;
  }>;
};

type SupabaseWorkstationRow = {
  id: string;
  name: string;
  sequence: number;
  minimum_skill: number;
  active: boolean;
  workstation_skill_requirements: Array<{
    skill_id: string | null;
    minimum_level: number;
    required: boolean;
  }>;
  workstation_defaults: Array<{
    default_headcount: number;
    default_role: string;
    shift_type: string | null;
  }>;
};

type SupabaseAssignmentRow = {
  workstation_id: string;
  operator_id: string;
  active: boolean;
};

function getAssignedHeadcount(workstationId: string, assignments: SupabaseAssignmentRow[]): number {
  return assignments.filter((assignment) => assignment.workstation_id === workstationId && assignment.active).length;
}

function selectWorkstationDefaultHeadcount(workstation: SupabaseWorkstationRow): number {
  const defaultConfig = workstation.workstation_defaults[0];
  return defaultConfig?.default_headcount ?? 1;
}

function toWorkstationContext(workstation: SupabaseWorkstationRow): WorkstationContext {
  return {
    workstationId: workstation.id,
    workstationName: workstation.name,
    minimumSkill: workstation.minimum_skill,
    requirements: workstation.workstation_skill_requirements.map((requirement) => ({
      skillId: requirement.skill_id ?? undefined,
      minimumLevel: requirement.minimum_level,
      required: requirement.required,
    })),
  };
}

export async function fetchWorkforceAnalyticsSnapshot(): Promise<WorkforceAnalyticsSnapshot> {
  if (!supabase) {
    return {
      source: "preview",
      suggestion: getManpowerSuggestionPreview(),
      metrics: getWorkforceDashboardMetricsPreview(),
    };
  }

  const [workstationsResult, operatorsResult, assignmentsResult] = await Promise.all([
    supabase
      .from("workstations")
      .select("id,name,sequence,minimum_skill,active,workstation_skill_requirements(skill_id,minimum_level,required),workstation_defaults(default_headcount,default_role,shift_type)")
      .eq("active", true)
      .order("sequence", { ascending: true }),
    supabase
      .from("operators")
      .select("id,nik,name,active,operator_skills(skill_id,level,assessed_at,certified_until)")
      .eq("active", true)
      .order("name", { ascending: true }),
    supabase
      .from("manpower_assignments")
      .select("workstation_id,operator_id,active")
      .eq("active", true),
  ]);

  if (workstationsResult.error || operatorsResult.error || assignmentsResult.error) {
    return {
      source: "preview",
      suggestion: getManpowerSuggestionPreview(),
      metrics: getWorkforceDashboardMetricsPreview(),
    };
  }

  const workstations = (workstationsResult.data ?? []) as SupabaseWorkstationRow[];
  const operators = (operatorsResult.data ?? []) as SupabaseOperatorRow[];
  const assignments = (assignmentsResult.data ?? []) as SupabaseAssignmentRow[];

  if (workstations.length === 0 || operators.length === 0) {
    return {
      source: "preview",
      suggestion: getManpowerSuggestionPreview(),
      metrics: getWorkforceDashboardMetricsPreview(),
    };
  }

  const workstationContexts = workstations.map(toWorkstationContext);
  const snapshots = workstationContexts.map((workstation) => {
    const matchingRow = workstations.find((row) => row.id === workstation.workstationId);
    const requiredHeadcount = matchingRow ? selectWorkstationDefaultHeadcount(matchingRow) : 1;
    const eligibleHeadcount = operators.filter((operator) => validateOperatorAssignment(operator, workstation).eligible).length;
    const assignedHeadcount = getAssignedHeadcount(workstation.workstationId, assignments);
    const shortage = Math.max(requiredHeadcount - assignedHeadcount, 0);

    return {
      workstationId: workstation.workstationId,
      workstationName: workstation.workstationName ?? workstation.workstationId,
      requiredHeadcount,
      assignedHeadcount,
      eligibleHeadcount,
      shortage,
      coverageRate: requiredHeadcount === 0 ? 100 : Math.min((eligibleHeadcount / requiredHeadcount) * 100, 100),
    };
  });

  const targetSnapshot = [...snapshots].sort((left, right) => {
    if (right.shortage !== left.shortage) {
      return right.shortage - left.shortage;
    }

    return right.coverageRate - left.coverageRate;
  })[0];

  const targetWorkstation = workstationContexts.find((workstation) => workstation.workstationId === targetSnapshot.workstationId) ?? workstationContexts[0];
  const recommendation = suggestManpowerForWorkOrder(
    {
      workOrderId: `WO-${targetWorkstation.workstationId}`,
      workOrderCode: `WO-${targetWorkstation.workstationId}`,
      workstation: targetWorkstation,
      requiredHeadcount: targetSnapshot.requiredHeadcount,
    },
    operators.map((operator) => ({
      operatorId: operator.id,
      active: operator.active,
      skills: operator.operator_skills.map((skill) => ({
        skillId: skill.skill_id ?? "",
        level: skill.level,
        assessedAt: skill.assessed_at ?? undefined,
        certifiedUntil: skill.certified_until ?? undefined,
      })),
    })),
  );

  const totalWorkstations = snapshots.length;
  const coveredWorkstations = snapshots.filter((snapshot) => snapshot.shortage === 0).length;
  const shortageCount = snapshots.filter((snapshot) => snapshot.shortage > 0).length;
  const shortageHeadcount = snapshots.reduce((total, snapshot) => total + snapshot.shortage, 0);
  const averageCoverageRate = snapshots.reduce((total, snapshot) => total + snapshot.coverageRate, 0) / totalWorkstations;

  return {
    source: "supabase",
    suggestion: recommendation,
    metrics: {
      totalWorkstations,
      coveredWorkstations,
      coverageRate: (coveredWorkstations / totalWorkstations) * 100,
      shortageCount,
      shortageHeadcount,
      averageCoverageRate,
      snapshots,
    },
  };
}
