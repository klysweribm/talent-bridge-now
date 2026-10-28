import { useAttentionItemsQuery } from '../../../hooks/useAttentionItemsQuery';
import { AttentionRow } from '../../molecules/AttentionRow';
import { DashboardSection } from '../../molecules/DashboardSection';
import { EmptyMessage } from '../../molecules/EmptyMessage';

export function AttentionList(): JSX.Element | null {
  const { data } = useAttentionItemsQuery();
  if (!data) return null;

  return (
    <DashboardSection title="Requiere atención" headingId="attention-heading">
      {data.length === 0 ? (
        <EmptyMessage text="Todo al día" />
      ) : (
        <ul className="flex flex-col gap-xs">
          {data.map(item => <AttentionRow key={item.id} item={item} />)}
        </ul>
      )}
    </DashboardSection>
  );
}
