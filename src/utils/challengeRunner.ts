/** Appended after user code to invoke the solution for arena/skill problems. */
export function buildRunner(invoke: string): string {
  return invoke.startsWith('return') ? invoke : `return ${invoke}`;
}

export function runWithInvoke(
  code: string,
  invoke: string,
  input: Record<string, unknown>
): unknown {
  const runner = new Function(
    'input',
    `${code}\n${buildRunner(invoke)}`
  );
  return runner(input);
}
