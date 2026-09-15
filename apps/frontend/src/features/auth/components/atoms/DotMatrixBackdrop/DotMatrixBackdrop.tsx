export function DotMatrixBackdrop() {
  return (
    <div className="absolute inset-0 pointer-events-none opacity-40" aria-hidden="true">
      <svg className="w-full h-full text-outline-variant" height="100%" width="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern height="24" id="ibm-dot-matrix" patternUnits="userSpaceOnUse" width="24">
            <circle cx="2" cy="2" fill="currentColor" r="1.2" />
          </pattern>
          <linearGradient id="ibm-blue-wash" x1="0%" x2="100%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="#0f62fe" stopOpacity="0.08" />
            <stop offset="60%" stopColor="#dce1ff" stopOpacity="0.03" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect fill="url(#ibm-dot-matrix)" height="100%" width="100%" />
        <rect fill="url(#ibm-blue-wash)" height="100%" width="100%" />
      </svg>
    </div>
  );
}
