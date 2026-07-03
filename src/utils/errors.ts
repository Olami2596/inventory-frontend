import axios from 'axios';

export function getErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    return err.response?.data?.message ?? 'Something went wrong. Please try again.';
  }
  return 'Something went wrong. Please try again.';
}

export function getFieldErrors(err: unknown): Record<string, string> {
  if (axios.isAxiosError(err) && err.response?.data?.errors) {
    const errors = err.response.data.errors as Record<string, string[]>;
    const fieldErrors: Record<string, string> = {};
    for (const field in errors) {
      fieldErrors[field] = errors[field][0]; // just take the first message per field
    }
    return fieldErrors;
  }
  return {};
}