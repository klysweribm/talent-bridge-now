import type { JSX } from 'react';
import { avatarClassName, getColorFromName, getInitials, type AvatarSize } from './avatar.utils';

export type { AvatarSize };

export interface AvatarProps {
  readonly name:      string;
  readonly imageUrl?: string;
  readonly size?:     AvatarSize;
  readonly className?: string;
}

export function Avatar({ name, imageUrl, size = 'md', className = '' }: AvatarProps): JSX.Element {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name}
        className={avatarClassName(size, 'image', className)}
      />
    );
  }

  return (
    <span
      aria-label={name}
      title={name}
      style={{ backgroundColor: getColorFromName(name) }}
      className={avatarClassName(size, 'initials', className)}
    >
      {getInitials(name)}
    </span>
  );
}
