import { act, renderHook, waitFor } from "@testing-library/react";
import { createAction, cache } from "../client";

type RequestData = { id: number };
type ResponseData = { message: string };

const mockAction = jest.fn(async (data: RequestData): Promise<ResponseData> => {
  if (data.id === -1) throw new Error("Invalid ID");
  return { message: `Hello ${data.id}` };
});

describe("createAction", () => {
  beforeEach(() => {
    cache.invalidate("test");
    cache.invalidate("retry");
    cache.invalidate("optimistic");
    cache.invalidate("prefetch");
    mockAction.mockClear();
  });

  it("runs mutate and returns data", async () => {
    const { result } = renderHook(() =>
      createAction(mockAction)({ key: "test" })
    );

    await act(async () => {
      const data = await result.current.mutate({ id: 1 });
      expect(data).toEqual({ message: "Hello 1" });
    });

    expect(result.current.data).toEqual({ message: "Hello 1" });
    expect(result.current.error).toBeNull();
    expect(cache.getData("test")).toEqual({ message: "Hello 1" });
  });

  it("handles error state", async () => {
    const { result } = renderHook(() =>
      createAction(mockAction)({ key: "test" })
    );

    await act(async () => {
      await expect(result.current.mutate({ id: -1 })).rejects.toThrow(
        "Invalid ID"
      );
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeInstanceOf(Error);
  });

  it("updates isPending while running", async () => {
    const slowAction = jest.fn(
      async () =>
        new Promise<{ ok: boolean }>((resolve) =>
          setTimeout(() => resolve({ ok: true }), 50)
        )
    );

    const { result } = renderHook(() =>
      createAction(slowAction)({ key: "slow" })
    );

    let mutatePromise: Promise<any>;

    await act(async () => {
      mutatePromise = result.current.mutate({ id: 0 });
      // Wait for isPending to become true
      await waitFor(() => expect(result.current.isPending).toBe(true));
      await mutatePromise;
    });

    expect(result.current.isPending).toBe(false);
    expect(result.current.data).toEqual({ ok: true });
  });

  it("supports retries", async () => {
    let attempt = 0;
    const flakyAction = jest.fn(async () => {
      attempt++;
      if (attempt < 2) throw new Error("fail once");
      return { message: "Success" };
    });

    const { result } = renderHook(() =>
      createAction(flakyAction)({ key: "retry", retries: 1 })
    );

    await act(async () => {
      const data = await result.current.mutate({ id: 0 });
      expect(data).toEqual({ message: "Success" });
    });

    expect(flakyAction).toHaveBeenCalledTimes(2);
  });

  it("supports optimistic updates and rollback on error", async () => {
    const failingAction = jest.fn(async (): Promise<ResponseData> => {
      throw new Error("fail");
    });

    const { result } = renderHook(() =>
      createAction<RequestData, ResponseData>(failingAction)({
        key: "optimistic",
        optimisticUpdate: (prev, input) => ({
          message: `Optimistic ${input.id}`,
        }),
      })
    );

    await act(async () => {
      await expect(result.current.mutate({ id: 5 })).rejects.toThrow("fail");
    });

    // Rollback should reset data to null
    expect(result.current.data).toBeNull();
  });

  it("supports reset", async () => {
    const { result } = renderHook(() =>
      createAction(mockAction)({ key: "test" })
    );

    await act(async () => {
      await result.current.mutate({ id: 1 });
    });

    expect(result.current.data).not.toBeNull();

    act(() => result.current.reset());

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
    expect(cache.getData("test")).toBeUndefined();
  });

  //   it("supports abort", async () => {
  //   const slowAction = jest.fn(
  //     async () =>
  //       new Promise<{ ok: boolean }>((resolve) =>
  //         setTimeout(() => resolve({ ok: true }), 100)
  //       )
  //   );

  //   const { result } = renderHook(() => createAction(slowAction)({ key: "slow" }));

  //   let caughtError: any = null;

  //   await act(async () => {
  //     const mutatePromise = result.current.mutate({ id: 0 }).catch(e => (caughtError = e));
  //     result.current.abort();
  //     await mutatePromise;
  //   });

  //   expect(caughtError).toBeInstanceOf(Error);
  //   expect(caughtError.message).toBe("Aborted");

  //   // wait for state rollback
  //   await waitFor(() => expect(result.current.data).toBeNull());
  //   expect(result.current.isPending).toBe(false);
  // });

  it("supports prefetch + cache", async () => {
    await act(async () => {
      const data = await cache.prefetch("prefetch", async () => ({
        message: "Prefetched",
      }));
      expect(data).toEqual({ message: "Prefetched" });
    });

    expect(cache.getData("prefetch")).toEqual({ message: "Prefetched" });
  });
});
