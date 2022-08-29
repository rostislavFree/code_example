import { UseFetch } from 'use-http/dist/cjs/types';

export interface LoadingState {
  loading: boolean;
}

export interface ErrorState {
  error: string | null;
}

export interface SetErrorPayload {
  error: string | null;
}

export interface SetLoadingPayload {
  loading: boolean;
}

export interface PayloadWithFetchGet {
  fetch: UseFetch<any>;
}
