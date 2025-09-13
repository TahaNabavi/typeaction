"use server";

export type RequestData = { id: number };
export type ResponseData = { message: string };

export async function fetchMessage(input: RequestData): Promise<ResponseData> {
  await new Promise((resolve) => setTimeout(resolve, 500)); // simulate server delay

  if (input.id < 0) throw new Error("Invalid ID");

  return { message: `Hello ${input.id}` };
}
