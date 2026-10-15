import { StageChip, type ProcessStage } from '@shared/components/atoms/StageChip';
import { Avatar } from '@shared/components/atoms/Avatar';

export interface InterviewCardProps {
  readonly candidateName:  string;
  readonly role:           string;
  readonly stage:          ProcessStage;
  readonly date:           string;
  readonly time:           string;
  readonly referentName:   string;
  readonly onClick?:       () => void;
  readonly className?:     string;
}

function buildClassName(isClickable: boolean, className: string): string {
  return [
    'bg-surface-card border border-[#e0e0e0] rounded-lg p-base',
    'flex flex-col gap-sm',
    isClickable ? 'cursor-pointer hover:border-primary-interactive transition-colors duration-150' : '',
    className,
  ].join(' ');
}

interface IInterviewCardMetaProps {
  readonly date:         string;
  readonly time:         string;
  readonly referentName: string;
}

function InterviewCardMeta({ date, time, referentName }: IInterviewCardMetaProps): JSX.Element {
  return (
    <>
      <div className="flex items-center gap-xs text-body-md text-text-secondary">
        <span aria-hidden="true" className="material-symbols-outlined text-[16px]">calendar_today</span>
        <time dateTime={date}>{date}</time>
        <span aria-hidden="true" className="material-symbols-outlined text-[16px] ml-sm">schedule</span>
        <span>{time}</span>
      </div>
      <div className="flex items-center gap-xs text-body-md text-text-secondary">
        <span aria-hidden="true" className="material-symbols-outlined text-[16px]">person</span>
        <span>{referentName}</span>
      </div>
    </>
  );
}

interface IInterviewCardHeaderProps {
  readonly candidateName: string;
  readonly role:          string;
  readonly stage:         ProcessStage;
}

function InterviewCardHeader({ candidateName, role, stage }: IInterviewCardHeaderProps): JSX.Element {
  return (
    <div className="flex items-start justify-between gap-sm">
      <div className="flex items-center gap-sm min-w-0">
        <Avatar name={candidateName} size="md" />
        <div className="min-w-0">
          <p className="text-title-md text-text-primary truncate">{candidateName}</p>
          <p className="text-body-md text-text-secondary truncate">{role}</p>
        </div>
      </div>
      <StageChip stage={stage} />
    </div>
  );
}

export function InterviewCard({
  candidateName,
  role,
  stage,
  date,
  time,
  referentName,
  onClick,
  className = '',
}: InterviewCardProps): JSX.Element {
  const isClickable = Boolean(onClick);

  return (
    <article
      role={isClickable ? 'button' : 'article'}
      tabIndex={isClickable ? 0 : undefined}
      aria-label={`Entrevista con ${candidateName}`}
      onClick={onClick}
      onKeyDown={isClickable ? (e) => e.key === 'Enter' && onClick?.() : undefined}
      className={buildClassName(isClickable, className)}
    >
      <InterviewCardHeader candidateName={candidateName} role={role} stage={stage} />
      <InterviewCardMeta date={date} time={time} referentName={referentName} />
    </article>
  );
}
