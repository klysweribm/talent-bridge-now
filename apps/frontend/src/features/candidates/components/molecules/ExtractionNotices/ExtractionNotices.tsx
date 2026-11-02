export interface ExtractionNoticesProps {
  readonly missingLabels: readonly string[];
  readonly warnings: readonly string[];
}

export function ExtractionNotices({ missingLabels, warnings }: ExtractionNoticesProps): JSX.Element | null {
  if (missingLabels.length === 0 && warnings.length === 0) return null;

  return (
    <div className="flex flex-col gap-sm p-md rounded border border-status-warning bg-status-warning-bg">
      {missingLabels.length > 0 && (
        <p className="text-body-md text-text-primary">
          <strong>No se detectaron estos datos:</strong> {missingLabels.join(', ')}. Complétalos a mano; no se rellenan solos.
        </p>
      )}
      {warnings.length > 0 && (
        <ul className="list-disc pl-lg text-body-md text-text-primary">
          {warnings.map(warning => <li key={warning}>{warning}</li>)}
        </ul>
      )}
    </div>
  );
}
