/**
 * auth.copy — textos de la pantalla de acceso (sin literales dispersos en los componentes).
 */
export const AUTH_COPY = {
  unavailable:        'No disponible en esta versión',
  ssoBadge:           'SSO Activo',
  tagline:            'Plataforma de Coordinación de Selección',
  emailLabel:         'Correo corporativo IBM',
  emailHint:          'w3id ID',
  emailPlaceholder:   'nombre.apellido',
  emailDomain:        '@ibm.com',
  passwordLabel:      'Contraseña',
  forgotPassword:     '¿Olvidaste tu contraseña?',
  rememberDevice:     'Recordar este dispositivo por 30 días',
  submit:             'Iniciar sesión',
  submitting:         'Iniciando sesión...',
  divider:            'o ingresar con credenciales corporativas',
  sso:                'Acceder con IBM w3id SSO',
  tlsNote:            'Conexión cifrada TLS 1.3 autenticada por IBM Trust Gateway',
  detectionTitle:     'Detección automática de perfil',
  detectionBody:      'Reclutador, Referente Técnico o PM según los permisos registrados en tu cuenta corporativa IBM.',
  footerEntries:      ['Términos de servicio', 'Política de Privacidad', 'Soporte w3 Help'],
} as const;
