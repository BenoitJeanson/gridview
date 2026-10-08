/** Dense Cholesky, the one thing pf.py needed numpy for.
 *
 * The matrix dcpf solves is A·diag(b)·Aᵀ with the slack row and column struck
 * out: a weighted graph Laplacian of a connected component, grounded at one
 * node, hence symmetric positive definite. So LLᵀ is safe and costs half of an
 * LU. Row-major Float64Array throughout; both arguments are overwritten.
 */

/** In-place LLᵀ, lower triangle. Throws if `A` turns out not to be SPD, which
 *  for our assembly means the component was not actually connected. */
export function cholesky(A, n) {
  for (let j = 0; j < n; j++) {
    let d = A[j * n + j];
    for (let k = 0; k < j; k++) d -= A[j * n + k] * A[j * n + k];
    if (!(d > 0)) throw new Error(`not positive definite at pivot ${j}`);
    const Ljj = Math.sqrt(d);
    A[j * n + j] = Ljj;
    for (let i = j + 1; i < n; i++) {
      let s = A[i * n + j];
      for (let k = 0; k < j; k++) s -= A[i * n + k] * A[j * n + k];
      A[i * n + j] = s / Ljj;
    }
  }
  return A;
}

/** Solve A·x = b for SPD A, returning x in `b`. */
export function solveSPD(A, b, n) {
  cholesky(A, n);
  for (let i = 0; i < n; i++) {           // forward: L·y = b
    let s = b[i];
    for (let k = 0; k < i; k++) s -= A[i * n + k] * b[k];
    b[i] = s / A[i * n + i];
  }
  for (let i = n - 1; i >= 0; i--) {      // back: Lᵀ·x = y
    let s = b[i];
    for (let k = i + 1; k < n; k++) s -= A[k * n + i] * b[k];
    b[i] = s / A[i * n + i];
  }
  return b;
}
