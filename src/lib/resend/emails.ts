import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.RESEND_FROM_EMAIL ?? 'hola@aretist.es'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://aretistapp.vercel.app'

// ================================================
// EMAIL: Bienvenida tras registro
// ================================================
export async function sendWelcomeEmail({
  to,
  fullName,
  username,
}: {
  to: string
  fullName: string
  username: string
}) {
  return resend.emails.send({
    from: `aretist <${FROM}>`,
    to,
    subject: `Bienvenido/a a Aretist, ${fullName.split(' ')[0]}`,
    html: `
      <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px; background: #F9F4F5;">
        <div style="background: white; border-radius: 16px; padding: 36px 32px; border: 0.5px solid #E0D4D7;">
          <p style="font-size: 26px; font-weight: 700; color: #B00020; margin: 0 0 24px; letter-spacing: -0.5px;">aretist</p>
          <h1 style="font-size: 22px; font-weight: 700; color: #111111; margin: 0 0 8px;">¡Bienvenido/a, ${fullName.split(' ')[0]}!</h1>
          <p style="font-size: 15px; color: #5C4B50; margin: 0 0 24px; line-height: 1.6;">
            Ya formas parte de la comunidad de artistas de Aretist. Tu perfil está listo en:
          </p>
          <div style="background: #FFF0F2; border-radius: 10px; padding: 14px 18px; margin-bottom: 24px;">
            <p style="font-size: 14px; color: #B00020; font-weight: 500; margin: 0;">
              aretist.es/${username}
            </p>
          </div>
          <p style="font-size: 15px; color: #5C4B50; margin: 0 0 24px; line-height: 1.6;">
            Completa tu perfil añadiendo tu bio, experiencia y portfolio para que las compañías y profesores puedan encontrarte.
          </p>
          <a href="${APP_URL}/profile" style="display: inline-block; background: #B00020; color: white; padding: 13px 28px; border-radius: 999px; font-size: 15px; font-weight: 600; text-decoration: none;">
            Completar mi perfil
          </a>
          <hr style="border: none; border-top: 0.5px solid #E0D4D7; margin: 32px 0;" />
          <p style="font-size: 12px; color: #5C4B50; margin: 0;">
            Recibes este email porque te registraste en aretist.es. Si no fuiste tú, ignora este mensaje.
          </p>
        </div>
      </div>
    `,
  })
}

// ================================================
// EMAIL: Notificación de nueva candidatura (al empleador)
// ================================================
export async function sendApplicationNotificationEmail({
  to,
  employerName,
  jobTitle,
  applicantName,
  applicantUsername,
}: {
  to: string
  employerName: string
  jobTitle: string
  applicantName: string
  applicantUsername: string
}) {
  return resend.emails.send({
    from: `aretist <${FROM}>`,
    to,
    subject: `Nueva candidatura para "${jobTitle}"`,
    html: `
      <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px; background: #F9F4F5;">
        <div style="background: white; border-radius: 16px; padding: 36px 32px; border: 0.5px solid #E0D4D7;">
          <p style="font-size: 26px; font-weight: 700; color: #B00020; margin: 0 0 24px; letter-spacing: -0.5px;">aretist</p>
          <h1 style="font-size: 20px; font-weight: 700; color: #111111; margin: 0 0 8px;">Nueva candidatura recibida</h1>
          <p style="font-size: 15px; color: #5C4B50; margin: 0 0 24px; line-height: 1.6;">
            Hola ${employerName.split(' ')[0]}, <strong style="color: #111111;">${applicantName}</strong> ha aplicado a tu oferta:
          </p>
          <div style="background: #FFF0F2; border-radius: 10px; padding: 14px 18px; margin-bottom: 24px;">
            <p style="font-size: 15px; font-weight: 600; color: #111111; margin: 0 0 4px;">${jobTitle}</p>
            <p style="font-size: 13px; color: #B00020; margin: 0;">Candidato: ${applicantName} · @${applicantUsername}</p>
          </div>
          <a href="${APP_URL}/u/${applicantUsername}" style="display: inline-block; background: #B00020; color: white; padding: 13px 28px; border-radius: 999px; font-size: 15px; font-weight: 600; text-decoration: none;">
            Ver perfil del candidato
          </a>
          <hr style="border: none; border-top: 0.5px solid #E0D4D7; margin: 32px 0;" />
          <p style="font-size: 12px; color: #5C4B50; margin: 0;">
            Gestiona todas tus candidaturas en <a href="${APP_URL}/jobs" style="color: #B00020;">aretist.es</a>
          </p>
        </div>
      </div>
    `,
  })
}

// ================================================
// EMAIL: Confirmación de reserva de formación (al alumno)
// ================================================
export async function sendBookingConfirmationEmail({
  to,
  studentName,
  formationTitle,
  teacherName,
  city,
  startDate,
  price,
}: {
  to: string
  studentName: string
  formationTitle: string
  teacherName: string
  city: string
  startDate: string
  price: number
}) {
  const formattedDate = new Date(startDate).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return resend.emails.send({
    from: `aretist <${FROM}>`,
    to,
    subject: `Plaza confirmada — ${formationTitle}`,
    html: `
      <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px; background: #F9F4F5;">
        <div style="background: white; border-radius: 16px; padding: 36px 32px; border: 0.5px solid #E0D4D7;">
          <p style="font-size: 26px; font-weight: 700; color: #B00020; margin: 0 0 24px; letter-spacing: -0.5px;">aretist</p>
          <h1 style="font-size: 20px; font-weight: 700; color: #111111; margin: 0 0 8px;">✓ Plaza confirmada</h1>
          <p style="font-size: 15px; color: #5C4B50; margin: 0 0 24px; line-height: 1.6;">
            Hola ${studentName.split(' ')[0]}, tu plaza está reservada:
          </p>
          <div style="background: #FFF0F2; border-radius: 10px; padding: 18px; margin-bottom: 24px;">
            <p style="font-size: 16px; font-weight: 700; color: #111111; margin: 0 0 8px;">${formationTitle}</p>
            <p style="font-size: 14px; color: #5C4B50; margin: 0 0 4px;">con ${teacherName}</p>
            <p style="font-size: 14px; color: #5C4B50; margin: 0 0 4px;">📍 ${city}</p>
            <p style="font-size: 14px; color: #5C4B50; margin: 0 0 4px;">📅 ${formattedDate}</p>
            <p style="font-size: 15px; font-weight: 600; color: #B00020; margin: 8px 0 0;">${price === 0 ? 'Gratuita' : `${price}€`}</p>
          </div>
          <a href="${APP_URL}/formations" style="display: inline-block; background: #B00020; color: white; padding: 13px 28px; border-radius: 999px; font-size: 15px; font-weight: 600; text-decoration: none;">
            Ver mis formaciones
          </a>
          <hr style="border: none; border-top: 0.5px solid #E0D4D7; margin: 32px 0;" />
          <p style="font-size: 12px; color: #5C4B50; margin: 0;">
            Si tienes alguna duda, contacta directamente con el profesor o escríbenos a <a href="mailto:${FROM}" style="color: #B00020;">${FROM}</a>
          </p>
        </div>
      </div>
    `,
  })
}

// ================================================
// EMAIL: Notificación al profesor cuando alguien reserva
// ================================================
export async function sendBookingNotificationEmail({
  to,
  teacherName,
  formationTitle,
  studentName,
  studentUsername,
  startDate,
}: {
  to: string
  teacherName: string
  formationTitle: string
  studentName: string
  studentUsername: string
  startDate: string
}) {
  const formattedDate = new Date(startDate).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return resend.emails.send({
    from: `aretist <${FROM}>`,
    to,
    subject: `Nueva reserva en "${formationTitle}"`,
    html: `
      <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px; background: #F9F4F5;">
        <div style="background: white; border-radius: 16px; padding: 36px 32px; border: 0.5px solid #E0D4D7;">
          <p style="font-size: 26px; font-weight: 700; color: #B00020; margin: 0 0 24px; letter-spacing: -0.5px;">aretist</p>
          <h1 style="font-size: 20px; font-weight: 700; color: #111111; margin: 0 0 8px;">Nueva reserva recibida</h1>
          <p style="font-size: 15px; color: #5C4B50; margin: 0 0 24px; line-height: 1.6;">
            Hola ${teacherName.split(' ')[0]}, <strong style="color: #111111;">${studentName}</strong> ha reservado una plaza en tu formación:
          </p>
          <div style="background: #FFF0F2; border-radius: 10px; padding: 18px; margin-bottom: 24px;">
            <p style="font-size: 16px; font-weight: 700; color: #111111; margin: 0 0 6px;">${formationTitle}</p>
            <p style="font-size: 14px; color: #5C4B50; margin: 0 0 4px;">📅 ${formattedDate}</p>
            <p style="font-size: 14px; color: #B00020; margin: 4px 0 0;">Alumno: ${studentName} · @${studentUsername}</p>
          </div>
          <a href="${APP_URL}/u/${studentUsername}" style="display: inline-block; background: #B00020; color: white; padding: 13px 28px; border-radius: 999px; font-size: 15px; font-weight: 600; text-decoration: none;">
            Ver perfil del alumno
          </a>
          <hr style="border: none; border-top: 0.5px solid #E0D4D7; margin: 32px 0;" />
          <p style="font-size: 12px; color: #5C4B50; margin: 0;">
            Gestiona tus formaciones en <a href="${APP_URL}/formations" style="color: #B00020;">aretist.es</a>
          </p>
        </div>
      </div>
    `,
  })
}

// ================================================
// EMAIL: Notificación de nueva conexión aceptada
// ================================================
export async function sendConnectionAcceptedEmail({
  to,
  recipientName,
  connectedName,
  connectedUsername,
}: {
  to: string
  recipientName: string
  connectedName: string
  connectedUsername: string
}) {
  return resend.emails.send({
    from: `aretist <${FROM}>`,
    to,
    subject: `${connectedName} ha aceptado tu solicitud de conexión`,
    html: `
      <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px; background: #F9F4F5;">
        <div style="background: white; border-radius: 16px; padding: 36px 32px; border: 0.5px solid #E0D4D7;">
          <p style="font-size: 26px; font-weight: 700; color: #B00020; margin: 0 0 24px; letter-spacing: -0.5px;">aretist</p>
          <h1 style="font-size: 20px; font-weight: 700; color: #111111; margin: 0 0 8px;">Nueva conexión</h1>
          <p style="font-size: 15px; color: #5C4B50; margin: 0 0 24px; line-height: 1.6;">
            Hola ${recipientName.split(' ')[0]}, <strong style="color: #111111;">${connectedName}</strong> ha aceptado tu solicitud de conexión. Ya podéis veros mutuamente en el feed.
          </p>
          <a href="${APP_URL}/u/${connectedUsername}" style="display: inline-block; background: #B00020; color: white; padding: 13px 28px; border-radius: 999px; font-size: 15px; font-weight: 600; text-decoration: none;">
            Ver su perfil
          </a>
          <hr style="border: none; border-top: 0.5px solid #E0D4D7; margin: 32px 0;" />
          <p style="font-size: 12px; color: #5C4B50; margin: 0;">
            Gestiona tus conexiones en <a href="${APP_URL}/connections" style="color: #B00020;">aretist.es</a>
          </p>
        </div>
      </div>
    `,
  })
}
