const EPSILON = 1e-9;

const finite = (value, label) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) throw new TypeError(`${label} muss endlich sein.`);
  return Object.is(numeric, -0) ? 0 : numeric;
};

const clean = (value) => Math.abs(value) < EPSILON ? 0 : Math.round(value * 1e9) / 1e9;
const numberText = (value) => Number.isInteger(value) ? String(value) : String(clean(value));

export function createEquation(leftX, leftConstant, rightX, rightConstant) {
  return Object.freeze({
    leftX: finite(leftX, "Linker x-Koeffizient"),
    leftConstant: finite(leftConstant, "Linke Konstante"),
    rightX: finite(rightX, "Rechter x-Koeffizient"),
    rightConstant: finite(rightConstant, "Rechte Konstante"),
  });
}

export function addToEquation(equation, leftDelta, rightDelta) {
  return createEquation(
    equation.leftX,
    equation.leftConstant + finite(leftDelta, "Linke Änderung"),
    equation.rightX,
    equation.rightConstant + finite(rightDelta, "Rechte Änderung"),
  );
}

export function divideEquation(equation, divisor) {
  const value = finite(divisor, "Divisor");
  if (Math.abs(value) < EPSILON) throw new RangeError("Division durch null ist unzulässig.");
  return createEquation(
    equation.leftX / value,
    equation.leftConstant / value,
    equation.rightX / value,
    equation.rightConstant / value,
  );
}

export function solveEquation(equation) {
  const coefficient = equation.leftX - equation.rightX;
  if (Math.abs(coefficient) < EPSILON) throw new RangeError("Die Gleichung hat keine eindeutige Lösung.");
  return clean((equation.rightConstant - equation.leftConstant) / coefficient);
}

export function formatEquationSide(xCoefficient, constant) {
  const x = clean(xCoefficient);
  const value = clean(constant);
  if (x === 0) return numberText(value);
  const xText = x === 1 ? "x" : x === -1 ? "−x" : `${numberText(x)}x`;
  if (value === 0) return xText;
  return `${xText} ${value < 0 ? "−" : "+"} ${numberText(Math.abs(value))}`;
}

export function equationModel(equation, referenceSolution = solveEquation(equation)) {
  const solution = clean(referenceSolution);
  const leftValue = clean(equation.leftX * solution + equation.leftConstant);
  const rightValue = clean(equation.rightX * solution + equation.rightConstant);
  const difference = clean(leftValue - rightValue);
  return Object.freeze({
    leftText: formatEquationSide(equation.leftX, equation.leftConstant),
    rightText: formatEquationSide(equation.rightX, equation.rightConstant),
    solution,
    leftValue,
    rightValue,
    difference,
    balanced: Math.abs(difference) < EPSILON,
  });
}
