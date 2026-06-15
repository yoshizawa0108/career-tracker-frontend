import { useState, useEffect, useCallback } from "react";

interface AsyncStateBase { refetch: () => Promise<void> }
interface AsyncIdle extends AsyncStateBase { status: "idle"; data: undefined; error: undefined }
interface AsyncLoading extends AsyncStateBase { status: "loading"; data: undefined; error: undefined }
interface AsyncSuccess<T> extends AsyncStateBase { status: "success"; data: T; error: undefined }
interface AsyncError extends AsyncStateBase { status: "error"; data: undefined; error: string }
type AsyncState<T> = AsyncIdle | AsyncLoading | AsyncSuccess<T> | AsyncError;

export function useAsync<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = []
): AsyncState<T> {
  const [state, setState] = useState<Omit<AsyncState<T>, "refetch">>({
    status: "loading",
    data: undefined,
    error: undefined,
  });

  const run = useCallback(async () => {
    setState({ status: "loading", data: undefined, error: undefined });
    try {
      const data = await fetcher();
      setState({ status: "success", data, error: undefined });
    } catch (e) {
      setState({ status: "error", data: undefined, error: (e as Error).message });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => { run(); }, [run]);

  return { ...state, refetch: run } as AsyncState<T>;
}

interface MutationStateBase { }
interface MutationIdle extends MutationStateBase { status: "idle"; data: undefined; error: undefined }
interface MutationLoading extends MutationStateBase { status: "loading"; data: undefined; error: undefined }
interface MutationSuccess<T> extends MutationStateBase { status: "success"; data: T; error: undefined }
interface MutationError extends MutationStateBase { status: "error"; data: undefined; error: string }
type MutationState<T> = MutationIdle | MutationLoading | MutationSuccess<T> | MutationError;

export function useMutation<TData, TInput>(
  mutator: (input: TInput) => Promise<TData>
) {
  const [state, setState] = useState<MutationState<TData>>({
    status: "idle",
    data: undefined,
    error: undefined,
  });

  const mutate = useCallback(
    async (input: TInput): Promise<TData> => {
      setState({ status: "loading", data: undefined, error: undefined });
      try {
        const data = await mutator(input);
        setState({ status: "success", data, error: undefined });
        return data;
      } catch (e) {
        setState({ status: "error", data: undefined, error: (e as Error).message });
        throw e;
      }
    },
    [mutator]
  );

  return { ...state, mutate };
}