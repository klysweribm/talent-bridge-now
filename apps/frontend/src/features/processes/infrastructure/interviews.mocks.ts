import type { ITodayInterview } from '../types/processes.types';

export const MOCK_TODAY_INTERVIEWS: readonly ITodayInterview[] = [
  { id: 'i1', candidateName: 'Sergio Vega', processTitle: 'Desarrollador React & Node.js Senior', time: '10:00', referentName: 'Carlos López', status: 'confirmed', meetingUrl: 'https://meet.example.com/i1' },
  { id: 'i2', candidateName: 'Lucía Morales', processTitle: 'Arquitecto Cloud AWS / IBM Cloud', time: '14:30', referentName: 'María Rodríguez', status: 'pending_confirmation', meetingUrl: 'https://meet.example.com/i2' },
  { id: 'i3', candidateName: 'Pablo Ramírez', processTitle: 'Data Engineer — Pipeline & MLOps', time: '16:00', referentName: 'Juan Pérez', status: 'confirmed', meetingUrl: 'https://meet.example.com/i3' },
];
