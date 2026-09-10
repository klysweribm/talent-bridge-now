export default function App() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'IBM Plex Sans, Arial, sans-serif',
      backgroundColor: '#f9f9f9',
      gap: '16px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{
          backgroundColor: '#0043CE',
          color: '#fff',
          fontWeight: 700,
          fontSize: '20px',
          padding: '2px 10px',
          borderRadius: '4px',
        }}>
          IBM
        </span>
        <span style={{ fontSize: '24px', fontWeight: 600, color: '#003099' }}>
          Talent Bridge
        </span>
      </div>
      <p style={{ color: '#525252', fontSize: '14px', margin: 0 }}>
        Plataforma de Coordinación de Selección — IBM Consulting LatAm
      </p>
      <div style={{
        marginTop: '8px',
        padding: '8px 16px',
        backgroundColor: '#DEFBE6',
        color: '#24A148',
        borderRadius: '4px',
        fontSize: '13px',
        fontWeight: 500,
      }}>
        ✅ Frontend corriendo correctamente
      </div>
    </div>
  );
}
