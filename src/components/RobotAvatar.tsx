import React from 'react';
import { RobotColorId } from '../types/game';
import { ROBOT_THEMES } from '../managers/PlayerManager';

interface RobotAvatarProps {
  color: RobotColorId;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  mood?: 'happy' | 'excited' | 'sad' | 'victory';
  className?: string;
  rounded?: boolean;
}

const BASE = import.meta.env.BASE_URL || '/';

export const robotImageUrl = (color: RobotColorId) => `${BASE}images/robot-${color}.png`;

export const RobotAvatar: React.FC<RobotAvatarProps> = ({
  color,
  size = 'md',
  mood = 'happy',
  className = '',
  rounded = true,
}) => {
  const theme = ROBOT_THEMES[color];
  const dims =
    size === 'sm' ? 'w-10 h-10' : size === 'md' ? 'w-14 h-14' : size === 'lg' ? 'w-24 h-24' : 'w-36 h-36';

  const moodClass =
    mood === 'sad'
      ? 'grayscale-[0.6] rotate-[-8deg] brightness-90'
      : mood === 'victory'
      ? 'scale-105'
      : '';

  return (
    <div
      className={`relative inline-flex shrink-0 overflow-hidden ${dims} ${
        rounded ? 'rounded-2xl' : ''
      } border-2 ${className}`}
      style={{
        borderColor: theme.glowHex,
        boxShadow: `0 4px 14px ${theme.accentHex}66, inset 0 0 0 1px rgba(255,255,255,0.4)`,
      }}
    >
      <img
        src={robotImageUrl(color)}
        alt={theme.name}
        draggable={false}
        className={`w-full h-full object-cover transition-transform duration-300 ${moodClass}`}
      />
      {mood === 'sad' && (
        <span className="absolute bottom-0.5 right-1 text-xs">💧</span>
      )}
      {mood === 'victory' && (
        <span className="absolute top-0 right-0.5 text-xs animate-pulse">✨</span>
      )}
    </div>
  );
};
