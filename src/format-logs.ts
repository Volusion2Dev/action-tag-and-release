export function formatLogs(input: string): string {
  return input.replace(/^ {6}/gm, '* ')
}
