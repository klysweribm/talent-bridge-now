import { DASHBOARD_COPY } from '../../../config/dashboard.copy';
import { DashboardSection } from '../../molecules/DashboardSection';
import { EmptyMessage } from '../../molecules/EmptyMessage';

// Sin capability de entrevistas/feedback no hay alertas que calcular: texto honesto, no "Todo al día".
export function AttentionList(): JSX.Element {
  return (
    <DashboardSection title={DASHBOARD_COPY.attentionTitle} headingId="attention-heading">
      <EmptyMessage text={DASHBOARD_COPY.attentionEmpty} />
    </DashboardSection>
  );
}
