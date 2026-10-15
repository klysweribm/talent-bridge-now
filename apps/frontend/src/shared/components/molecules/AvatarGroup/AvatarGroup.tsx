import { Avatar, type AvatarSize } from '@shared/components/atoms/Avatar';

export interface AvatarGroupItem {
  readonly name:      string;
  readonly imageUrl?: string;
}

export interface AvatarGroupProps {
  readonly avatars:    ReadonlyArray<AvatarGroupItem>;
  readonly max?:       number;
  readonly size?:      AvatarSize;
  readonly className?: string;
}

interface IOverflowBadgeProps {
  readonly count: number;
  readonly size:  AvatarSize;
}

function OverflowBadge({ count, size }: IOverflowBadgeProps): JSX.Element | null {
  if (count <= 0) return null;

  return (
    <span
      aria-label={`+${count} más`}
      className={[
        '-ml-2 rounded-full ring-2 ring-surface-card',
        'inline-flex items-center justify-center',
        'bg-surface-highest text-text-secondary font-medium',
        size === 'sm' ? 'w-6 h-6 text-[10px]' : 'w-8 h-8 text-[12px]',
      ].join(' ')}
    >
      +{count}
    </span>
  );
}

export function AvatarGroup({
  avatars,
  max       = 4,
  size      = 'sm',
  className = '',
}: AvatarGroupProps): JSX.Element {
  const visible = avatars.slice(0, max);

  return (
    <div
      className={`flex items-center ${className}`}
      aria-label={`${avatars.length} participantes`}
    >
      {visible.map((avatar, i) => (
        <span
          key={`${avatar.name}-${i}`}
          className="-ml-2 first:ml-0 rounded-full ring-2 ring-surface-card"
        >
          <Avatar name={avatar.name} imageUrl={avatar.imageUrl} size={size} />
        </span>
      ))}
      <OverflowBadge count={avatars.length - visible.length} size={size} />
    </div>
  );
}
