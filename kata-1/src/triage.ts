export type UrgencyLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface Patient {
  name: string;
  age: number;
  urgency: UrgencyLevel;
  arrivalTime: string;
}

export interface TriageQueueEntry extends Patient {
  effectiveUrgency: UrgencyLevel;
}

export type TriageRule = (
  patient: Patient,
  currentUrgency: UrgencyLevel,
) => UrgencyLevel;

const urgencyScore: Record<UrgencyLevel, number> = {
  LOW: 0,
  MEDIUM: 1,
  HIGH: 2,
  CRITICAL: 3,
};

const urgencyLevels: UrgencyLevel[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

export const elderlyMediumUpgradeRule: TriageRule = (patient, currentUrgency) => {
  if (patient.age >= 60 && currentUrgency === "MEDIUM") {
    return "HIGH";
  }

  return currentUrgency;
};

export const minorPriorityBoostRule: TriageRule = (patient, currentUrgency) => {
  if (patient.age < 18) {
    return upgradeUrgency(currentUrgency, 1);
  }

  return currentUrgency;
};

export const defaultTriageRules: TriageRule[] = [
  elderlyMediumUpgradeRule,
  minorPriorityBoostRule,
];

export function calculateEffectiveUrgency(
  patient: Patient,
  rules: TriageRule[] = defaultTriageRules,
): UrgencyLevel {
  return rules.reduce(
    (currentUrgency, rule) => rule(patient, currentUrgency),
    patient.urgency,
  );
}

export function buildTriageQueue(
  patients: Patient[],
  rules: TriageRule[] = defaultTriageRules,
): TriageQueueEntry[] {
  return patients
    .map((patient, index) => ({
      patient,
      index,
      effectiveUrgency: calculateEffectiveUrgency(patient, rules),
      arrivalRank: parseArrivalTime(patient.arrivalTime),
    }))
    .sort((left, right) => {
      const priorityDifference =
        urgencyScore[right.effectiveUrgency] - urgencyScore[left.effectiveUrgency];

      if (priorityDifference !== 0) {
        return priorityDifference;
      }

      const arrivalDifference = left.arrivalRank - right.arrivalRank;

      if (arrivalDifference !== 0) {
        return arrivalDifference;
      }

      return left.index - right.index;
    })
    .map(({ patient, effectiveUrgency }) => ({
      ...patient,
      effectiveUrgency,
    }));
}

export function upgradeUrgency(
  urgency: UrgencyLevel,
  levelsToUpgrade: number,
): UrgencyLevel {
  const upgradedScore = Math.min(
    urgencyScore.CRITICAL,
    urgencyScore[urgency] + levelsToUpgrade,
  );

  return urgencyLevels[upgradedScore]!;
}

function parseArrivalTime(value: string): number {
  const trimmedValue = value.trim();
  const hhMmMatch = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(trimmedValue);

  if (hhMmMatch) {
    const [, hours, minutes] = hhMmMatch;
    return Number(hours) * 60 + Number(minutes);
  }

  const timestamp = Date.parse(trimmedValue);

  if (Number.isNaN(timestamp)) {
    throw new Error(`Invalid arrivalTime received: ${value}`);
  }

  return timestamp;
}
