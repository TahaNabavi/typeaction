"use client";

import { useTransition, useState, useRef } from "react";
import { ActionFn, ActionOptions } from "./types";

const actionCache = new Map<string, unknown>();

export const cache = {
  getData: <T = unknown>(key: string): T | undefined =>
    actionCache.get(key) as T | undefined,
  setData: (key: string, value: unknown) => {
    actionCache.set(key, value);
  },
  invalidate: (key: string) => {
    actionCache.delete(key);
  },
  prefetch: async <T>(key: string, fn: () => Promise<T>) => {
    const data = await fn();
    actionCache.set(key, data);
    return data;
  },
};

export function createAction<TData, TResult>(fn: ActionFn<TData, TResult>) {
  return function useAction(options: ActionOptions<TData, TResult> = {}) {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<unknown>(null);
    const [data, setData] = useState<TResult | null>(
      (options.key ? (actionCache.get(options.key) as TResult) : null) ?? null
    );

    const abortRef = useRef<AbortController | null>(null);

    const reset = () => {
      setError(null);
      setData(null);
      if (options.key) actionCache.delete(options.key);
    };

    const mutate = async (input: TData): Promise<TResult> => {
      // Cancel previous
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      return new Promise<TResult>((resolve, reject) => {
        startTransition(async () => {
          let attempt = 0;
          let lastError: unknown = null;
          const rollbackData = data;

          // optimistic update
          if (options.optimisticUpdate) {
            const optimistic = options.optimisticUpdate(data, input);
            setData(optimistic);
            if (options.key) actionCache.set(options.key, optimistic);
          }

          while (attempt <= (options.retries ?? 0)) {
            if (controller.signal.aborted) {
              lastError = new Error("Aborted");

              // rollback immediately
              if (options.optimisticUpdate) {
                setData(rollbackData);
                if (options.key) actionCache.set(options.key, rollbackData);
              } else {
                setData(null);
                if (options.key) actionCache.delete(options.key);
              }

              setError(lastError);
              options.onError?.(lastError);
              options.onSettled?.(undefined, lastError);
              return reject(lastError);
            }

            try {
              const result = await fn(input);

              if (controller.signal.aborted) throw new Error("Aborted");

              setData(result);
              setError(null);
              if (options.key) actionCache.set(options.key, result);

              options.onSuccess?.(result);
              options.onSettled?.(result, undefined);

              return resolve(result);
            } catch (err) {
              lastError = err;
              attempt++;
              if (attempt > (options.retries ?? 0)) break;
            }
          }

          // rollback if optimistic failed
          if (options.optimisticUpdate) {
            setData(rollbackData);
            if (options.key) actionCache.set(options.key, rollbackData);
          }

          setError(lastError);
          options.onError?.(lastError);
          options.onSettled?.(undefined, lastError);
          reject(lastError);
        });
      });
    };

    const abort = () => {
      abortRef.current?.abort();
    };

    return { isPending, mutate, error, data, reset, abort };
  };
}
