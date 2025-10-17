'use client';

type Props = {
  type: 'success' | 'error';
  message: string;
};

export default function FeedbackMessage({ type, message }: Props) {
  return (
    <div
      className={`mb-6 rounded-2xl border px-4 py-3 text-sm ${
        type === 'success'
          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
          : 'border-red-200 bg-red-50 text-red-600'
      }`}
    >
      {message}
    </div>
  );
}
