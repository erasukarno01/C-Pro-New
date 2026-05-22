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
