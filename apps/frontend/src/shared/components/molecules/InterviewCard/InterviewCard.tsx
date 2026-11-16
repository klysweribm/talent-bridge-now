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
    'bg-white border border-carbon-gray-20 p-base',
    'flex flex-col gap-sm',
    isClickable ? 'cursor-pointer hover:border-carbon-blue-60 transition-colors duration-150' : '',
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
      <div className="flex items-center gap-xs text-body text-carbon-gray-70">
        <span aria-hidden="true" className="material-symbols-outlined text-[16px]">calendar_today</span>
        <time dateTime={date}>{date}</time>
        <span aria-hidden="true" className="material-symbols-outlined text-[16px] ml-sm">schedule</span>
        <span>{time}</span>
      </div>
      <div className="flex items-center gap-xs text-body text-carbon-gray-70">
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
          <p className="text-h2 text-carbon-gray-100 truncate">{candidateName}</p>
          <p className="text-body text-carbon-gray-70 truncate">{role}</p>
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
