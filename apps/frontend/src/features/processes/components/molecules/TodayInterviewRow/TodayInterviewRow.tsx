import { StatusBadge } from '@shared/components/atoms/StatusBadge';
import type { ITodayInterview } from '../../../types/processes.types';

export interface TodayInterviewRowProps {
  readonly interview: ITodayInterview;
}

export function TodayInterviewRow({ interview }: TodayInterviewRowProps): JSX.Element {
  const confirmed = interview.status === 'confirmed';

  return (
    <li className="p-base bg-surface rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-sm">
      <div className="flex flex-col min-w-0">
        <span className="text-body-md-medium text-text-primary truncate">{interview.candidateName}</span>
        <span className="text-label-md text-text-secondary truncate">
          {interview.processTitle} · {interview.referentName}
        </span>
      </div>
      <div className="flex items-center gap-sm flex-shrink-0">
        <time className="text-body-md-medium text-text-primary">{interview.time}</time>
        <StatusBadge
          variant={confirmed ? 'success' : 'warning'}
          label={confirmed ? 'Confirmada' : 'Pendiente de confirmación'}
        />
        <a
          href={interview.meetingUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Abrir enlace de la entrevista con ${interview.candidateName}`}
          className="text-label-md text-primary-interactive hover:underline whitespace-nowrap"
        >
          Abrir enlace
        </a>
      </div>
    </li>
  );
}
