"use client";

import { useFetchMessage } from "./hook";

export default function App() {
  const { mutate, data, error, isPending, reset, abort } = useFetchMessage({
    key: "message",
    optimisticUpdate: (prev: any, input: any) => ({
      message: `Optimistic ${input.id}`,
    }),
  });

  return (
    <div>
      <button onClick={() => mutate({ id: 1 })}>Fetch id=1</button>
      <button onClick={() => mutate({ id: -1 })}>Fetch Invalid</button>
      <button onClick={abort}>Abort</button>
      <button onClick={reset}>Reset</button>

      <div>Status: {isPending ? "Loading..." : "Idle"}</div>
      <div>Data: {data?.message ?? "No data"}</div>
      <div>Error: {error ? (error as Error).message : "No error"}</div>
    </div>
  );
}
