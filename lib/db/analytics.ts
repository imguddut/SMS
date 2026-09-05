export interface ScholarRiskFactor {
  id: string;
  studentName: string;
  studentNumber: string;
  form: string;
  house: string;
  riskCategory: "ACADEMIC_DROP" | "ATTENDANCE_ANOMALY" | "BURSARY_STRESS" | "PASTORAL";
  riskScore: number; // 0 - 100
  attendanceDelta: string;
  homeworkLatencyAvg: string;
  mockExamVariance: string;
  prescriptiveIntervention: string;
  assignedStaff: string;
  status: "FLAGGED" | "INTERVENTION_PENDING" | "RESOLVED";
}

export interface CashFlowMonteCarloForecast {
  month: string;
  expectedRealization: number;
  optimisticUpside: number;
  conservativePessimistic: number;
  confidenceInterval: string;
  currency: string;
}

export interface FacultyOptimizationMetric {
  department: string;
  facultyCount: number;
  enrolledScholars: number;
  ratio: string;
  markingLoadWeeklyHours: number;
  capacityUtilization: number; // Percentage
  recommendation: string;
}

export interface FleetBenchmarkItem {
  campusName: string;
  location: string;
  enrolledCount: number;
  averageAnnualFee: number;
  realizationRate: string;
  ibAverageScore: number;
  ebitMargin: string;
  currency: string;
}

export interface ScenarioSimulationParams {
  feeAdjustmentPercent: number; // -10 to +20
  boardingExpansionBeds: number; // 0 to 100
  facultySalaryIndex: number; // 90 to 120
  bursaryAllocationInr: number; // 500,000 to 5,000,000
}

export interface ScenarioSimulationResult {
  projectedArr: number;
  baseArr: number;
  arrDeltaPercent: number;
  ebitMargin: number;
  baseEbitMargin: number;
  scholarRetentionRate: number;
  newNetScholarsCapacity: number;
  endowmentRealizationInr: number;
  breakEvenMonths: number;
  aiAdvisorySummary: string;
}

// Data Fetchers & Simulation Logic

export async function fetchPredictiveRiskScholars(): Promise<ScholarRiskFactor[]> {
  return [
    {
      id: "risk-01",
      studentName: "Rohan Singhania",
      studentNumber: "ADM-2024-003",
      form: "Class 12-A",
      house: "Ashoka House",
      riskCategory: "ACADEMIC_DROP",
      riskScore: 78,
      attendanceDelta: "-4.2% (last 14 days)",
      homeworkLatencyAvg: "+36 hours overdue",
      mockExamVariance: "-12% in Physics Pre-Board",
      prescriptiveIntervention: "Assign Peer Mentor in Physics & schedule doubt clearing sessions.",
      assignedStaff: "Mrs. Sunita Deshmukh",
      status: "FLAGGED",
    },
    {
      id: "risk-02",
      studentName: "Kabir Mehta",
      studentNumber: "ADM-2024-006",
      form: "Class 10-B",
      house: "Raman House",
      riskCategory: "ATTENDANCE_ANOMALY",
      riskScore: 65,
      attendanceDelta: "-6.8% (morning smart gate)",
      homeworkLatencyAvg: "+18 hours latency",
      mockExamVariance: "-5% in Mathematics",
      prescriptiveIntervention: "Automated parent SMS alert & counseling session with Class Coordinator.",
      assignedStaff: "Prof. Rajesh Verma",
      status: "INTERVENTION_PENDING",
    },
    {
      id: "risk-03",
      studentName: "Priya Patel",
      studentNumber: "ADM-2024-004",
      form: "Class 11-A",
      house: "Shivaji House",
      riskCategory: "BURSARY_STRESS",
      riskScore: 54,
      attendanceDelta: "Nominal (98.0%)",
      homeworkLatencyAvg: "On time",
      mockExamVariance: "Stable (94% Score)",
      prescriptiveIntervention: "Review installment fee schedule with Accounts Bureau.",
      assignedStaff: "Rameshwar Gupta (Accounts Officer)",
      status: "INTERVENTION_PENDING",
    },
  ];
}

export async function fetchCashFlowMonteCarlo(): Promise<CashFlowMonteCarloForecast[]> {
  return [
    {
      month: "Feb 2025",
      expectedRealization: 14500000,
      optimisticUpside: 15800000,
      conservativePessimistic: 13200000,
      confidenceInterval: "98.2%",
      currency: "INR",
    },
    {
      month: "Mar 2025",
      expectedRealization: 9800000,
      optimisticUpside: 11200000,
      conservativePessimistic: 8500000,
      confidenceInterval: "96.4%",
      currency: "INR",
    },
    {
      month: "Apr 2025",
      expectedRealization: 16800000,
      optimisticUpside: 18400000,
      conservativePessimistic: 15200000,
      confidenceInterval: "97.8%",
      currency: "INR",
    },
    {
      month: "May 2025",
      expectedRealization: 24500000,
      optimisticUpside: 26800000,
      conservativePessimistic: 21900000,
      confidenceInterval: "99.1%",
      currency: "INR",
    },
  ];
}

export async function fetchFacultyOptimizationMetrics(): Promise<FacultyOptimizationMetric[]> {
  return [
    {
      department: "Mathematics & Computer Science",
      facultyCount: 38,
      enrolledScholars: 850,
      ratio: "1 : 22.4",
      markingLoadWeeklyHours: 14.5,
      capacityUtilization: 92,
      recommendation: "Recruit 1 additional PGT Teacher for Class 12 Advanced Pure Mathematics.",
    },
    {
      department: "Senior Secondary Science & AI",
      facultyCount: 42,
      enrolledScholars: 920,
      ratio: "1 : 21.9",
      markingLoadWeeklyHours: 16.2,
      capacityUtilization: 88,
      recommendation: "Optimal workload. Capacity available for 40 additional admissions.",
    },
    {
      department: "Social Sciences & Commerce",
      facultyCount: 32,
      enrolledScholars: 740,
      ratio: "1 : 23.1",
      markingLoadWeeklyHours: 13.8,
      capacityUtilization: 84,
      recommendation: "Balanced department utilization across all senior sections.",
    },
    {
      department: "Languages & Co-Curricular Arts",
      facultyCount: 36,
      enrolledScholars: 740,
      ratio: "1 : 20.5",
      markingLoadWeeklyHours: 10.0,
      capacityUtilization: 72,
      recommendation: "Capacity available for inter-school sports & cultural events.",
    },
  ];
}

export async function fetchFleetInstitutionalBenchmarks(): Promise<FleetBenchmarkItem[]> {
  return [
    {
      campusName: "Delhi Public School, R.K. Puram (Flagship)",
      location: "New Delhi, India",
      enrolledCount: 3250,
      averageAnnualFee: 145000,
      realizationRate: "96.4%",
      ibAverageScore: 94.6,
      ebitMargin: "34.2%",
      currency: "INR",
    },
    {
      campusName: "National Public School, Indiranagar",
      location: "Bengaluru, Karnataka",
      enrolledCount: 2100,
      averageAnnualFee: 135000,
      realizationRate: "97.1%",
      ibAverageScore: 93.8,
      ebitMargin: "32.0%",
      currency: "INR",
    },
    {
      campusName: "The Cathedral & John Connon School",
      location: "Mumbai, Maharashtra",
      enrolledCount: 1650,
      averageAnnualFee: 180000,
      realizationRate: "95.8%",
      ibAverageScore: 95.2,
      ebitMargin: "36.5%",
      currency: "INR",
    },
    {
      campusName: "Sanskriti School, Chanakyapuri",
      location: "New Delhi, India",
      enrolledCount: 2600,
      averageAnnualFee: 120000,
      realizationRate: "96.0%",
      ibAverageScore: 92.5,
      ebitMargin: "29.8%",
      currency: "INR",
    },
  ];
}

export function runExecutiveScenarioSimulation(params: ScenarioSimulationParams): ScenarioSimulationResult {
  const baseArr = 158000000; // ₹15.8 Cr
  const baseEbitMargin = 32.4; // 32.4%
  const baseScholars = 3250;

  // Price elasticity & expansion formula
  const feeDeltaMultiplier = 1 + params.feeAdjustmentPercent / 100;
  const expansionRevenue = params.boardingExpansionBeds * 145000;
  const facultyCostMultiplier = (params.facultySalaryIndex - 100) * 0.004;
  const bursaryDeduction = params.bursaryAllocationInr || 500000;

  const projectedArr = Math.round(baseArr * feeDeltaMultiplier + expansionRevenue - bursaryDeduction);
  const arrDeltaPercent = Number((((projectedArr - baseArr) / baseArr) * 100).toFixed(2));

  // EBIT margin calculation
  let calculatedEbit = baseEbitMargin + (params.feeAdjustmentPercent * 0.35) - (facultyCostMultiplier * 100);
  if (params.boardingExpansionBeds > 30) calculatedEbit += 1.8; // Economies of scale
  const ebitMargin = Number(Math.max(15, Math.min(45, calculatedEbit)).toFixed(1));

  // Scholar retention probability
  let retention = 98.8;
  if (params.feeAdjustmentPercent > 8) retention -= (params.feeAdjustmentPercent - 8) * 0.3;
  if (params.bursaryAllocationInr > 1500000) retention += 0.6;
  const scholarRetentionRate = Number(Math.min(99.9, Math.max(90.0, retention)).toFixed(1));

  const newNetScholarsCapacity = baseScholars + params.boardingExpansionBeds;
  const endowmentRealizationInr = Math.round(projectedArr * (ebitMargin / 100) * 0.4);
  const breakEvenMonths = params.boardingExpansionBeds > 0 ? Math.round(18 - (params.feeAdjustmentPercent * 0.3)) : 0;

  let advisory = "";
  if (params.feeAdjustmentPercent >= 10 && params.bursaryAllocationInr < 1000000) {
    advisory = "Caution: Significant fee increase without adequate RTE / Merit scholarship expansion risks a 1.2% attrition in day scholar cohort.";
  } else if (params.boardingExpansionBeds >= 40 && params.facultySalaryIndex >= 105) {
    advisory = "Highly Recommended: Campus infrastructure expansion coupled with competitive faculty compensation yields +₹ 2.4 Cr in annual revenue.";
  } else {
    advisory = "Balanced Executive Strategy: Preserves a robust 32%+ operating margin while maintaining 98%+ student retention.";
  }

  return {
    projectedArr,
    baseArr,
    arrDeltaPercent,
    ebitMargin,
    baseEbitMargin,
    scholarRetentionRate,
    newNetScholarsCapacity,
    endowmentRealizationInr,
    breakEvenMonths,
    aiAdvisorySummary: advisory,
  };
}
