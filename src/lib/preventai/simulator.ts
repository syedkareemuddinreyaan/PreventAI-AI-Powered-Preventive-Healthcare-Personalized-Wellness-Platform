export interface SimInputs {
  improved_sleep: boolean;
  regular_exercise: boolean;
  improved_bmi: boolean;
  quit_smoking: boolean;
  reduce_stress: boolean;
}

export function simulateFutureHealth(current: number, sim: SimInputs): number {
  let s = current;
  if (sim.improved_sleep) s += 10;
  if (sim.regular_exercise) s += 10;
  if (sim.improved_bmi) s += 15;
  if (sim.quit_smoking) s += 8;
  if (sim.reduce_stress) s += 7;
  return Math.min(100, s);
}
