const FOOTER_LINKS = ['Términos de servicio', 'Política de Privacidad', 'Soporte w3 Help'] as const;

export function AuthFooter(): JSX.Element {
  return (
    <footer className="flex flex-col items-center gap-sm text-center select-none max-w-[480px] w-full mt-lg">
      <div className="flex items-center gap-sm text-text-secondary">
        <span className="text-label-sm">IBM Talent Bridge v2.4.0</span>
        <span className="text-outline-variant">•</span>
        <span className="text-label-sm font-medium text-text-primary">IBM Consulting</span>
      </div>
      <div className="flex items-center gap-md">
        {FOOTER_LINKS.map((link, i) => (
          <span key={link} className="flex items-center gap-md">
            <a href="#" className="text-label-sm text-text-secondary no-underline">
              {link}
            </a>
            {i < FOOTER_LINKS.length - 1 && <span className="text-outline-variant">•</span>}
          </span>
        ))}
      </div>
    </footer>
  );
}
