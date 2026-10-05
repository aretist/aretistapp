import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const { formationId, fullName, email, phone, paymentMethod } = await req.json()

    if (!formationId || !fullName || !email || !paymentMethod) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // Verificar que la formación existe y tiene plazas disponibles
    const { data: formation, error: formationError } = await supabase
      .from('formations')
      .select('id, title, spots_left, teacher_id, bizum_number, iban, payment_methods, start_date, end_date, location, city, price')
      .eq('id', formationId)
      .single()

    if (formationError || !formation) {
      return NextResponse.json(
        { error: 'Formación no encontrada' },
        { status: 404 }
      )
    }

    if (formation.spots_left !== null && formation.spots_left <= 0) {
      return NextResponse.json(
        { error: 'No quedan plazas disponibles' },
        { status: 409 }
      )
    }

    // Obtener nombre del profesor desde public users
    const { data: teacherProfile } = await supabase
      .from('users')
      .select('full_name')
      .eq('id', formation.teacher_id)
      .single()

    // Obtener email del profesor desde auth.users (el email no está en la tabla pública)
    const { data: teacherAuth } = await supabase.auth.admin.getUserById(formation.teacher_id)
    const teacherEmail = teacherAuth?.user?.email ?? null
    const teacherName = teacherProfile?.full_name ?? null

    // Crear la reserva
    const { data: booking, error: bookingError } = await supabase
      .from('formation_bookings')
      .insert({
        formation_id: formationId,
        full_name: fullName,
        email,
        phone: phone || null,
        payment_method: paymentMethod,
        status: 'pending',
      })
      .select()
      .single()

    if (bookingError) {
      console.error('Error creando reserva:', bookingError)
      return NextResponse.json(
        { error: 'Error al crear la reserva' },
        { status: 500 }
      )
    }

    // Decrementar plazas disponibles
    if (formation.spots_left !== null) {
      await supabase
        .from('formations')
        .update({ spots_left: formation.spots_left - 1 })
        .eq('id', formationId)
    }

    // Formatear fecha
    const startDate = formation.start_date
      ? new Date(formation.start_date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
      : null

    const locationText = formation.location || formation.city || null

    const PAYMENT_LABELS: Record<string, string> = {
      bizum: 'Bizum',
      transferencia: 'Transferencia bancaria',
      efectivo: 'Efectivo en la clase',
      card: 'Tarjeta',
    }

    // Información de pago
    let paymentInstructions = ''
    if (paymentMethod === 'bizum' && formation.bizum_number) {
      paymentInstructions = `
        <div style="background:#fff8f0;border:1px solid #fed7aa;border-radius:8px;padding:16px;margin-top:16px;">
          <p style="font-weight:600;margin:0 0 8px;color:#9a3412;">Último paso: realiza el pago</p>
          <p style="margin:0 0 8px;color:#374151;">Envía <strong>${formation.price} €</strong> por Bizum a <strong>${teacherName ?? ''}</strong>:</p>
          <p style="font-size:20px;font-weight:700;letter-spacing:2px;margin:0;color:#111827;">${formation.bizum_number}</p>
          <p style="font-size:13px;color:#6b7280;margin-top:8px;">Concepto: <strong>${formation.title} + tu nombre</strong></p>
        </div>`
    } else if (paymentMethod === 'transferencia' && formation.iban) {
      paymentInstructions = `
        <div style="background:#fff8f0;border:1px solid #fed7aa;border-radius:8px;padding:16px;margin-top:16px;">
          <p style="font-weight:600;margin:0 0 8px;color:#9a3412;">Último paso: realiza la transferencia</p>
          <p style="margin:0 0 8px;color:#374151;">Transfiere <strong>${formation.price} €</strong> al siguiente IBAN:</p>
          <p style="font-size:16px;font-weight:700;letter-spacing:1px;margin:0;color:#111827;">${formation.iban}</p>
          <p style="font-size:13px;color:#6b7280;margin-top:8px;">Concepto: <strong>${formation.title} + tu nombre</strong></p>
        </div>`
    }

    // Email al alumno
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: email,
      subject: `✅ Plaza reservada: ${formation.title}`,
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 20px;color:#111827;">
          <h1 style="font-size:22px;font-weight:700;margin-bottom:8px;">¡Plaza reservada!</h1>
          <p style="color:#6b7280;margin-bottom:24px;">Hola ${fullName}, tu reserva se ha confirmado correctamente.</p>

          <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:18px;margin-bottom:20px;">
            <p style="font-weight:700;font-size:16px;margin:0 0 6px;">${formation.title}</p>
            ${startDate ? `<p style="color:#6b7280;margin:0 0 4px;">📅 ${startDate}</p>` : ''}
            ${locationText ? `<p style="color:#6b7280;margin:0 0 4px;">📍 ${locationText}</p>` : ''}
            <p style="color:#6b7280;margin:0;">💳 Pago: ${PAYMENT_LABELS[paymentMethod] ?? paymentMethod}</p>
          </div>

          ${paymentInstructions}

          <p style="font-size:13px;color:#9ca3af;margin-top:32px;">Si tienes dudas puedes responder a este email o contactar directamente con ${teacherName ?? 'el/la profesor/a'}.</p>
          <p style="font-size:12px;color:#d1d5db;margin-top:8px;">Aretist · La plataforma de las artes escénicas</p>
        </div>
      `,
    })

    // Email al profesor
    if (teacherEmail) {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL!,
        to: teacherEmail,
        subject: `Nueva inscripción en "${formation.title}"`,
        html: `
          <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 20px;color:#111827;">
            <h1 style="font-size:22px;font-weight:700;margin-bottom:8px;">Nueva inscripción</h1>
            <p style="color:#6b7280;margin-bottom:24px;">Alguien se ha apuntado a tu formación.</p>

            <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:18px;margin-bottom:20px;">
              <p style="font-weight:700;font-size:16px;margin:0 0 12px;">${formation.title}</p>
              <p style="margin:0 0 4px;"><strong>Nombre:</strong> ${fullName}</p>
              <p style="margin:0 0 4px;"><strong>Email:</strong> ${email}</p>
              ${phone ? `<p style="margin:0 0 4px;"><strong>Teléfono:</strong> ${phone}</p>` : ''}
              <p style="margin:0;"><strong>Método de pago:</strong> ${PAYMENT_LABELS[paymentMethod] ?? paymentMethod}</p>
            </div>

            <p style="font-size:13px;color:#9ca3af;">Puedes ver y gestionar todos los inscritos en tu panel de Aretist.</p>
            <p style="font-size:12px;color:#d1d5db;margin-top:8px;">Aretist · La plataforma de las artes escénicas</p>
          </div>
        `,
      })
    }

    return NextResponse.json({
      ok: true,
      bookingId: booking.id,
      paymentInfo: {
        bizumNumber: formation.bizum_number,
        iban: formation.iban,
        paymentMethods: formation.payment_methods,
      },
    })
  } catch (err) {
    console.error('Error en /api/formations/book:', err)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
