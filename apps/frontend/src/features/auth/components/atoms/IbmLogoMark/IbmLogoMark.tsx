export interface IbmLogoMarkProps {
  readonly className?: string;
}

export function IbmLogoMark({ className = '' }: IbmLogoMarkProps) {
  return (
    <svg
      className={`w-5 h-5 flex-shrink-0 text-primary ${className}`}
      fill="currentColor"
      viewBox="0 0 32 32"
      aria-hidden="true"
    >
      <rect height="2" width="32" y="4" />
      <rect height="2" width="32" y="8" />
      <rect height="2" width="32" y="12" />
      <rect height="2" width="32" y="16" />
      <rect height="2" width="32" y="20" />
      <rect height="2" width="32" y="24" />
      <rect height="2" width="32" y="28" />
    </svg>
  );
}
