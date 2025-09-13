export type ActionFn<TData, TResult> = (data: TData) => Promise<TResult>;

export type ActionOptions<TData, TResult> = {
  key?: string; // cache key
  retries?: number; // retry attempts
  optimisticUpdate?: (prev: TResult | null, input: TData) => TResult;
  onSuccess?: (data: TResult) => void;
  onError?: (error: unknown) => void;
  onSettled?: (data?: TResult, error?: unknown) => void;
};
