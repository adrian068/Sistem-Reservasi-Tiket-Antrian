import { NextRequest, NextResponse } from 'next/server'
import {
  getSession,
  createSession,
  OFFLINE_ADMIN_SESSION_ID,
  getSessionProfile,
  isLocalUserId,
} from '@/lib/auth'
import { isAdminUser } from '@/lib/auth-shared'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const updateProfileSchema = z.object({
  nama: z.string().min(3, 'Nama minimal 3 karakter'),
  email: z.string().email('Email tidak valid'),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6, 'Password baru minimal 6 karakter').optional(),
  confirmPassword: z.string().optional(),
}).refine((data) => {
  if (data.newPassword && !data.currentPassword) {
    return false
  }
  if (data.newPassword && data.newPassword !== data.confirmPassword) {
    return false
  }
  return true
}, {
  message: 'Password baru dan konfirmasi password harus sama',
  path: ['confirmPassword'],
})

// GET - Get admin profile
export async function GET(request: NextRequest) {
  try {
    const user = await getSession()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (!isAdminUser(user)) {
      return NextResponse.json(
        { error: 'Akses ditolak. Hanya admin.' },
        { status: 403 }
      )
    }

    const profile = await getSessionProfile(user)

    if (!profile) {
      return NextResponse.json(
        { error: 'User tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: profile,
    })
  } catch (error) {
    console.error('Get profile error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data profil' },
      { status: 500 }
    )
  }
}

// PUT - Update admin profile
export async function PUT(request: NextRequest) {
  try {
    const user = await getSession()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (!isAdminUser(user)) {
      return NextResponse.json(
        { error: 'Akses ditolak. Hanya admin.' },
        { status: 403 }
      )
    }

    if (user.id === OFFLINE_ADMIN_SESSION_ID || isLocalUserId(user.id)) {
      return NextResponse.json(
        {
          error:
            'Profil tidak dapat diubah saat database tidak terhubung. Perbaiki DATABASE_URL di .env untuk sinkron ke Supabase.',
        },
        { status: 503 }
      )
    }

    const body = await request.json()
    
    // Validate input
    const validatedData = updateProfileSchema.parse(body)

    // Get current user data
    const pengguna = await prisma.pengguna.findUnique({
      where: { id: BigInt(user.id) },
    })

    if (!pengguna) {
      return NextResponse.json(
        { error: 'User tidak ditemukan' },
        { status: 404 }
      )
    }

    // Check if email is already taken by another user
    if (validatedData.email !== pengguna.email) {
      const existingUser = await prisma.pengguna.findUnique({
        where: { email: validatedData.email },
      })

      if (existingUser) {
        return NextResponse.json(
          { error: 'Email sudah digunakan' },
          { status: 400 }
        )
      }
    }

    // Prepare update data
    const updateData: any = {
      nama: validatedData.nama,
      email: validatedData.email,
      updatedAt: new Date(),
    }

    // If changing password
    if (validatedData.currentPassword && validatedData.newPassword) {
      // Verify current password
      const isValid = await bcrypt.compare(validatedData.currentPassword, pengguna.passwordHash)
      
      if (!isValid) {
        return NextResponse.json(
          { error: 'Password saat ini tidak sesuai' },
          { status: 400 }
        )
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(validatedData.newPassword, 10)
      updateData.passwordHash = hashedPassword
    }

    // Update user
    const updatedUser = await prisma.pengguna.update({
      where: { id: BigInt(user.id) },
      data: updateData,
      select: {
        id: true,
        nama: true,
        email: true,
        peran: true,
        updatedAt: true,
      },
    })

    // Update session with new data
    await createSession({
      id: updatedUser.id.toString(),
      nama: updatedUser.nama,
      email: updatedUser.email,
      peran: updatedUser.peran,
    })

    return NextResponse.json({
      success: true,
      message: 'Profil berhasil diperbarui',
      data: {
        id: updatedUser.id.toString(),
        nama: updatedUser.nama,
        email: updatedUser.email,
        peran: updatedUser.peran,
        updatedAt: updatedUser.updatedAt,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    
    console.error('Update profile error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat memperbarui profil' },
      { status: 500 }
    )
  }
}
