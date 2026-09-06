import { parseLoanAmount } from "./amounts";

function assertEqual(actual: unknown, expected: unknown) {
  if (actual !== expected) {
    throw new Error(
      `Expected ${expected}, received ${actual}`
    );
  }
}

assertEqual(parseLoanAmount(25000), 25000);

assertEqual(
  parseLoanAmount("$25,000"),
  25000
);

assertEqual(
  parseLoanAmount("25,000"),
  25000
);

assertEqual(
  parseLoanAmount(" $25,000 "),
  25000
);

let threw = false;

try {
  parseLoanAmount("$0");
} catch {
  threw = true;
}

assertEqual(threw, true);

threw = false;

try {
  parseLoanAmount("not a number");
} catch {
  threw = true;
}

assertEqual(threw, true);

console.log("Amount parser tests passed.");
