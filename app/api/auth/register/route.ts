import { NextRequest, NextResponse } from 'next/server'
import { createSession, registerUser } from '@/lib/auth'
import { z } from 'zod'

const registerSchema = z
  .object({
    nama: z.string().min(2, 'Nama minimal 2 karakter'),
    email: z.string().email('Email tidak valid'),
    password: z.string().min(8, 'Password minimal 8 karakter'),
    confirmPassword: z.string().min(1, 'Konfirmasi password harus diisi'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Konfirmasi password tidak cocok',
    path: ['confirmPassword'],
  })

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = registerSchema.parse(body)

    const result = await registerUser(
      validatedData.nama,
      validatedData.email,
      validatedData.password,
      'USER',
    )

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    await createSession(result.user)

    return NextResponse.json({
      success: true,
      user: {
        nama: result.user.nama,
        email: result.user.email,
        peran: result.user.peran,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 },
      )
    }

    console.error('Register route error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mendaftar' },
      { status: 500 },
    )
  }
}
