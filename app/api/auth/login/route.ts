import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser, createSession } from '@/lib/auth'
import { z } from 'zod'

const loginSchema = z.object({
  username: z
    .string()
    .min(3, 'Username minimal 3 karakter')
    .max(150, 'Username terlalu panjang'),
  password: z.string().min(1, 'Password harus diisi'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = loginSchema.parse(body)
    
    // Authenticate user
    const user = await authenticateUser(validatedData.username, validatedData.password)
    
    if (!user) {
      return NextResponse.json(
        {
          error:
            'Username atau password salah. Pastikan username sama persis seperti yang ditampilkan di Kelola Admin.',
        },
        { status: 401 },
      )
    }
    
    // Create session
    await createSession(user)
    
    return NextResponse.json({
      success: true,
      user: {
        nama: user.nama,
        email: user.email,
        peran: user.peran,
        bidangSlug: user.bidangSlug,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat login' },
      { status: 500 }
    )
  }
}



