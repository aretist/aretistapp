import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { formationId, fullName, email, phone, paymentMethod } = await req.json()

    if (!formationId || !fullName || !email || !paymentMethod) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verificar que la formación existe y tiene plazas disponibles
    const { data: formation, error: formationError } = await supabase
      .from('formations')
      .select('id, title, spots_left, teacher_id, bizum_number, iban, payment_methods')
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