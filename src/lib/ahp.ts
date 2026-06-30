// Implementation of Analytical Hierarchy Process (AHP)

// Matrix of pairwise comparisons
export type ComparisonMatrix = number[][];

// Random Index for calculating Consistency Ratio (CR)
// Index values for n = 1 to 10
const RI = [0, 0, 0.58, 0.9, 1.12, 1.24, 1.32, 1.41, 1.45, 1.49];

/**
 * Calculate Priority Vector (Eigen Vector) and Consistency Ratio
 */
export function calculateAHP(matrix: ComparisonMatrix) {
  const n = matrix.length;
  
  // 1. Calculate column sums
  const colSums = new Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      colSums[j] += matrix[i][j];
    }
  }

  // 2. Normalize matrix
  const normalizedMatrix = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      normalizedMatrix[i][j] = matrix[i][j] / colSums[j];
    }
  }

  // 3. Calculate priority vector (eigen vector / weights)
  const weights = new Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      weights[i] += normalizedMatrix[i][j];
    }
    weights[i] /= n;
  }

  // 4. Calculate Consistency Ratio (CR)
  // Calculate weighted sum vector
  const weightedSum = new Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      weightedSum[i] += matrix[i][j] * weights[j];
    }
  }

  // Calculate lambda max (eigen value max)
  let lambdaMax = 0;
  for (let i = 0; i < n; i++) {
    lambdaMax += weightedSum[i] / weights[i];
  }
  lambdaMax /= n;

  // Calculate Consistency Index (CI)
  const CI = (lambdaMax - n) / (n - 1);
  
  // Calculate Consistency Ratio (CR)
  const CR = n > 2 ? CI / RI[n - 1] : 0;

  return {
    weights,
    lambdaMax,
    CI,
    CR,
    isConsistent: CR <= 0.1
  };
}

/**
 * Score Normalization
 * Convert raw values to normalized AHP scores (0-1 scale)
 */
export function normalizeBenefitCriteria(values: number[]): number[] {
  const max = Math.max(...values);
  return values.map(v => (max === 0 ? 0 : v / max));
}

export function normalizeCostCriteria(values: number[]): number[] {
  const min = Math.min(...values);
  return values.map(v => (v === 0 ? 0 : min / v));
}
