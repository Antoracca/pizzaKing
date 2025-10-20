interface TypingIndicatorProps {
  name?: string | null;
  variant?: 'client' | 'agent';
}

export function TypingIndicator({ name, variant = 'client' }: TypingIndicatorProps) {
  const displayName = name || (variant === 'client' ? 'Client' : 'Support');

  return (
    <div className="mb-3 flex items-center gap-2">
      <div className={`flex items-center gap-1.5 rounded-2xl px-4 py-3 ${
        variant === 'agent'
          ? 'bg-white border border-orange-100'
          : 'bg-orange-50 border border-orange-100'
      }`}>
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((dot) => (
            <span
              key={dot}
              className={`h-2 w-2 rounded-full animate-bounce ${
                variant === 'agent' ? 'bg-orange-500' : 'bg-emerald-500'
              }`}
              style={{
                animationDelay: `${dot * 150}ms`,
                animationDuration: '1s',
              }}
            />
          ))}
        </div>
        <span className={`ml-1.5 text-xs ${
          variant === 'agent' ? 'text-orange-600' : 'text-emerald-600'
        }`}>
          {displayName} est en train d'écrire…
        </span>
      </div>
    </div>
  );
}
