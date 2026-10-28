// Answer states for contract fields of type A(T) (AGENTS.md, "Antwortzustände").
// "Unknown" is its own state. It is never 0, false or an empty text, and it is
// never shown as a value (an unknown price is not "Frei").

export const ANSWER_STATES = [
  "provided",
  "unknown",
  "not_applicable",
  "skipped",
  "unanswered",
] as const;

export type AnswerState = (typeof ANSWER_STATES)[number];

export type NoValueState = Exclude<AnswerState, "provided">;

export type Answer<T> =
  | { state: "provided"; value: T }
  | { state: NoValueState; value?: undefined };

export function provided<T>(value: T): Answer<T> {
  return { state: "provided", value };
}

export function noValue<T>(state: NoValueState): Answer<T> {
  return { state };
}

export function unanswered<T>(): Answer<T> {
  return { state: "unanswered" };
}

export function isProvided<T>(
  answer: Answer<T>,
): answer is { state: "provided"; value: T } {
  return answer.state === "provided";
}

// Only a provided answer carries a value. Everything else is null, so that a
// caller cannot mistake "no answer" for an empty value.
export function valueOrNull<T>(answer: Answer<T>): T | null {
  return answer.state === "provided" ? answer.value : null;
}

export function isAnswerState(value: unknown): value is AnswerState {
  return (
    typeof value === "string" &&
    (ANSWER_STATES as readonly string[]).includes(value)
  );
}
