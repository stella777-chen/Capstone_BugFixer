export async function sendQuery(query: string): Promise<string> {
  await new Promise((r) => setTimeout(r, 500));
  return `You asked: "${query}". PLACEHOLDER`;
}