import type { SupabaseClient } from '@supabase/supabase-js';

type FakeResult = { data?: unknown; error: unknown; count?: number | null };

function createQueryBuilder(result: FakeResult) {
  const builder: Record<string, unknown> = {
    select: () => builder,
    eq: () => builder,
    order: () => builder,
    limit: () => builder,
    single: () => builder,
    then: (resolve: (value: FakeResult) => unknown) =>
      Promise.resolve(result).then(resolve),
  };
  return builder;
}

export function createFakeSupabase(result: FakeResult): SupabaseClient {
  return {
    from: () => createQueryBuilder(result),
  } as unknown as SupabaseClient;
}

export function createFakeSupabaseSequence(results: FakeResult[]): SupabaseClient {
  const queue = [...results];
  return {
    from: () => createQueryBuilder(queue.shift() ?? { data: null, error: null }),
  } as unknown as SupabaseClient;
}
