/**
 * Templates de correo HTML para IBM Talent Bridge.
 *
 * REGLAS (no negociables):
 * - HTML plano sin <script>, sin <link>, sin @import
 * - Estilos inline únicamente
 * - Compatible con clientes corporativos IBM (Outlook, Notes, webmail)
 * - Máximo ancho: 600px (estándar corporativo de email)
 * - Fuente: Arial, Helvetica, sans-serif (seguras en email)
 * - Colores IBM: #0F62FE (blue), #161616 (text), #F4F4F4 (bg)
 */

// ─── Layout Base ──────────────────────────────────────────────────────────────

const BASE_LAYOUT = (content: string, subject: string): string => `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#F4F4F4;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F4F4F4;">
    <tr>
      <td align="center" style="padding:24px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0"
               style="max-width:600px;width:100%;background-color:#FFFFFF;border:1px solid #E0E0E0;">
          <!-- Header IBM -->
          <tr>
            <td style="background-color:#0043CE;padding:20px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <span style="display:inline-block;background-color:#003099;color:#FFFFFF;
                                 font-size:16px;font-weight:700;padding:2px 8px;margin-right:8px;">IBM</span>
                    <span style="color:#FFFFFF;font-size:18px;font-weight:600;">Talent Bridge</span>
                  </td>
                  <td align="right">
                    <span style="color:#DBE1FF;font-size:11px;">IBM Consulting LatAm</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:32px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color:#F4F4F4;padding:16px 32px;border-top:1px solid #E0E0E0;">
              <p style="margin:0;font-size:11px;color:#525252;text-align:center;">
                IBM Talent Bridge — Plataforma interna IBM Consulting LatAm<br>
                Este correo fue generado automáticamente. No responder a este mensaje.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

// ─── Template: Invitación a Entrevista ────────────────────────────────────────

export interface InterviewInvitationData {
  readonly candidateName: string;
  readonly processTitle: string;
  readonly clientName: string;
  readonly scheduledDate: string;       // Ej: "lunes 16 de junio de 2025"
  readonly scheduledTime: string;       // Ej: "10:00 AM"
  readonly timezone: string;            // Ej: "America/Mexico_City (CDT)"
  readonly duration: number;            // minutos
  readonly meetingLink?: string;
  readonly recruiterName: string;
  readonly recruiterEmail: string;
}

export const interviewInvitationTemplate = (data: InterviewInvitationData): string => {
  const content = `
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:600;color:#161616;">
      Invitación a Entrevista
    </h1>
    <p style="margin:0 0 24px;font-size:14px;color:#525252;">
      Proceso: <strong style="color:#161616;">${data.processTitle}</strong> — ${data.clientName}
    </p>

    <p style="margin:0 0 16px;font-size:15px;color:#161616;">
      Estimado/a <strong>${data.candidateName}</strong>,
    </p>
    <p style="margin:0 0 24px;font-size:14px;color:#525252;line-height:1.6;">
      Nos complace informarle que ha sido seleccionado/a para participar en una entrevista
      dentro del proceso de selección indicado arriba. A continuación encontrará los detalles:
    </p>

    <!-- Detalles de la entrevista -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
           style="background-color:#F4F4F4;border-left:4px solid #0F62FE;margin-bottom:24px;">
      <tr>
        <td style="padding:16px 20px;">
          <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#525252;text-transform:uppercase;
                     letter-spacing:0.04em;">Detalles de la Sesión</p>
          <table role="presentation" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:4px 0;font-size:14px;color:#525252;width:120px;">Fecha:</td>
              <td style="padding:4px 0;font-size:14px;color:#161616;font-weight:600;">${data.scheduledDate}</td>
            </tr>
            <tr>
              <td style="padding:4px 0;font-size:14px;color:#525252;">Hora:</td>
              <td style="padding:4px 0;font-size:14px;color:#161616;font-weight:600;">${data.scheduledTime} (${data.timezone})</td>
            </tr>
            <tr>
              <td style="padding:4px 0;font-size:14px;color:#525252;">Duración:</td>
              <td style="padding:4px 0;font-size:14px;color:#161616;font-weight:600;">${data.duration} minutos</td>
            </tr>
            ${data.meetingLink ? `
            <tr>
              <td style="padding:4px 0;font-size:14px;color:#525252;">Enlace:</td>
              <td style="padding:4px 0;font-size:14px;">
                <a href="${data.meetingLink}" style="color:#0F62FE;text-decoration:none;font-weight:600;">
                  Unirse a la sesión →
                </a>
              </td>
            </tr>` : ''}
          </table>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 24px;font-size:14px;color:#525252;line-height:1.6;">
      Si tiene alguna pregunta o necesita reprogramar, comuníquese directamente con
      <strong>${data.recruiterName}</strong>:
      <a href="mailto:${data.recruiterEmail}" style="color:#0F62FE;">${data.recruiterEmail}</a>
    </p>

    <p style="margin:0;font-size:14px;color:#525252;">
      Atentamente,<br>
      <strong style="color:#161616;">Equipo de Talent Acquisition</strong><br>
      <span style="font-size:12px;">IBM Consulting LatAm</span>
    </p>`;

  return BASE_LAYOUT(content, `Invitación a Entrevista — ${data.processTitle}`);
};

// ─── Template: Confirmación de Entrevista ─────────────────────────────────────

export interface InterviewConfirmationData {
  readonly recruiterName: string;
  readonly candidateName: string;
  readonly processTitle: string;
  readonly scheduledDate: string;
  readonly scheduledTime: string;
  readonly timezone: string;
  readonly referentName: string;
}

export const interviewConfirmationTemplate = (data: InterviewConfirmationData): string => {
  const content = `
    <h1 style="margin:0 0 24px;font-size:22px;font-weight:600;color:#161616;">
      Entrevista Confirmada ✓
    </h1>

    <p style="margin:0 0 16px;font-size:15px;color:#161616;">
      Hola <strong>${data.recruiterName}</strong>,
    </p>
    <p style="margin:0 0 24px;font-size:14px;color:#525252;line-height:1.6;">
      La entrevista para el candidato <strong>${data.candidateName}</strong> en el proceso
      <strong>${data.processTitle}</strong> ha sido confirmada.
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
           style="background-color:#DEFBE6;border-left:4px solid #24A148;margin-bottom:24px;">
      <tr>
        <td style="padding:16px 20px;">
          <table role="presentation" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:4px 0;font-size:14px;color:#525252;width:140px;">Candidato:</td>
              <td style="padding:4px 0;font-size:14px;color:#161616;font-weight:600;">${data.candidateName}</td>
            </tr>
            <tr>
              <td style="padding:4px 0;font-size:14px;color:#525252;">Referente técnico:</td>
              <td style="padding:4px 0;font-size:14px;color:#161616;font-weight:600;">${data.referentName}</td>
            </tr>
            <tr>
              <td style="padding:4px 0;font-size:14px;color:#525252;">Fecha y hora:</td>
              <td style="padding:4px 0;font-size:14px;color:#161616;font-weight:600;">
                ${data.scheduledDate}, ${data.scheduledTime} (${data.timezone})
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <p style="margin:0;font-size:14px;color:#525252;line-height:1.6;">
      El archivo <strong>.ics</strong> para agregar esta cita a tu calendario fue adjuntado
      automáticamente. Compatible con Outlook, IBM Notes y Google Calendar.
    </p>`;

  return BASE_LAYOUT(content, `Entrevista Confirmada — ${data.candidateName}`);
};

// ─── Template: Reporte al Cliente ────────────────────────────────────────────

export interface ClientReportData {
  readonly clientName: string;
  readonly processTitle: string;
  readonly recruiterName: string;
  readonly reportUrl: string;
  readonly candidateCount: number;
  readonly periodLabel: string;    // Ej: "Q1 2025"
}

export const clientReportTemplate = (data: ClientReportData): string => {
  const content = `
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:600;color:#161616;">
      Reporte de Proceso de Selección
    </h1>
    <p style="margin:0 0 24px;font-size:14px;color:#525252;">
      ${data.periodLabel} — ${data.processTitle}
    </p>

    <p style="margin:0 0 16px;font-size:15px;color:#161616;">
      Estimado equipo de <strong>${data.clientName}</strong>,
    </p>
    <p style="margin:0 0 24px;font-size:14px;color:#525252;line-height:1.6;">
      Adjuntamos el reporte ejecutivo del proceso de selección
      <strong>${data.processTitle}</strong>, incluyendo el resumen de evaluaciones,
      feedback técnico consolidado y el estado actual de los
      <strong>${data.candidateCount} candidatos</strong> evaluados durante este período.
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
           style="margin-bottom:24px;">
      <tr>
        <td align="center">
          <a href="${data.reportUrl}"
             style="display:inline-block;background-color:#0F62FE;color:#FFFFFF;
                    font-size:14px;font-weight:600;padding:12px 32px;text-decoration:none;">
            Descargar Reporte PDF →
          </a>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 8px;font-size:14px;color:#525252;line-height:1.6;">
      Para cualquier consulta adicional, comuníquese con su reclutador asignado:
    </p>
    <p style="margin:0;font-size:14px;color:#161616;font-weight:600;">${data.recruiterName}</p>
    <p style="margin:4px 0 0;font-size:14px;color:#525252;">IBM Consulting LatAm — Talent Acquisition</p>`;

  return BASE_LAYOUT(content, `Reporte de Selección — ${data.processTitle}`);
};
