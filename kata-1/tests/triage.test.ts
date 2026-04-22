import { describe, expect, it } from "vitest";

import {
  buildTriageQueue,
  calculateEffectiveUrgency,
  type Patient,
} from "../src/triage";

describe("buildTriageQueue", () => {
  it("prioritizes critical patients and preserves FIFO within the same urgency", () => {
    const patients: Patient[] = [
      { name: "Bruno", age: 41, urgency: "HIGH", arrivalTime: "09:05" },
      { name: "Ana", age: 29, urgency: "CRITICAL", arrivalTime: "09:10" },
      { name: "Carla", age: 38, urgency: "HIGH", arrivalTime: "08:55" },
    ];

    const queue = buildTriageQueue(patients);

    expect(queue.map((patient) => patient.name)).toEqual(["Ana", "Carla", "Bruno"]);
  });

  it("upgrades elderly patients with medium urgency to high", () => {
    const patient: Patient = {
      name: "Josefa",
      age: 67,
      urgency: "MEDIUM",
      arrivalTime: "10:00",
    };

    expect(calculateEffectiveUrgency(patient)).toBe("HIGH");
  });

  it("upgrades minors by one level and caps the boost at critical", () => {
    const mediumMinor: Patient = {
      name: "Davi",
      age: 15,
      urgency: "MEDIUM",
      arrivalTime: "11:00",
    };
    const criticalMinor: Patient = {
      name: "Lia",
      age: 7,
      urgency: "CRITICAL",
      arrivalTime: "11:05",
    };

    expect(calculateEffectiveUrgency(mediumMinor)).toBe("HIGH");
    expect(calculateEffectiveUrgency(criticalMinor)).toBe("CRITICAL");
  });

  it("keeps the original order when arrival time and priority are identical", () => {
    const patients: Patient[] = [
      { name: "Iris", age: 35, urgency: "LOW", arrivalTime: "14:00" },
      { name: "Marcos", age: 44, urgency: "LOW", arrivalTime: "14:00" },
    ];

    const queue = buildTriageQueue(patients);

    expect(queue.map((patient) => patient.name)).toEqual(["Iris", "Marcos"]);
  });
});
