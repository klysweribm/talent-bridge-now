import { render, screen } from '@testing-library/react';
import { TodayInterviewRow } from './TodayInterviewRow';
import type { ITodayInterview } from '../../../types/processes.types';

const BASE: ITodayInterview = {
  id: 'i', candidateName: 'Ada Lovelace', processTitle: 'Backend', time: '09:30',
  referentName: 'Grace', status: 'confirmed', meetingUrl: 'https://meet.example.com/x',
};

describe('TodayInterviewRow', () => {
  it('should show candidate, process, time, referent, status and a single action', () => {
    render(<ul><TodayInterviewRow interview={BASE} /></ul>);
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    expect(screen.getByText(/Backend · Grace/)).toBeInTheDocument();
    expect(screen.getByText('09:30')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirmada')).toBeInTheDocument();
    expect(screen.getAllByRole('link')).toHaveLength(1);
    expect(screen.getByRole('link', { name: /Abrir enlace/ })).toHaveAttribute('href', BASE.meetingUrl);
  });

  it('should flag pending confirmation', () => {
    render(<ul><TodayInterviewRow interview={{ ...BASE, status: 'pending_confirmation' }} /></ul>);
    expect(screen.getByLabelText('Pendiente de confirmación')).toBeInTheDocument();
  });
});
