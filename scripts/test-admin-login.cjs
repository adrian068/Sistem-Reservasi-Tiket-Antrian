const bcrypt = require('bcryptjs')
const { PrismaClient } = require('@prisma/client')

async function main() {
  const p = new PrismaClient()
  try {
    const admins = await p.pengguna.findMany({
      where: { peran: { in: ['ADMIN', 'ADMIN_PAUD', 'SUPER_ADMIN'] } },
      select: { id: true, nama: true, email: true, peran: true, bidangSlug: true, passwordHash: true },
    })
    console.log('Admins:', admins.map((a) => ({ id: String(a.id), nama: a.nama, email: a.email, peran: a.peran })))

    for (const login of ['boy', 'adrian', 'boy123']) {
      const normalized = login.toLowerCase()
      let user = await p.pengguna.findUnique({ where: { email: normalized } })
      if (!user && !normalized.includes('@')) {
        user = await p.pengguna.findFirst({
          where: { email: { startsWith: `${normalized}@`, mode: 'insensitive' } },
        })
      }
      console.log('lookup', login, '=>', user ? user.email : 'NOT FOUND')
    }

    const adrian = await p.pengguna.findFirst({ where: { email: 'adrian@gmail.com' } })
    if (adrian) {
      for (const pw of ['boy12345', 'adrian123', 'Adrian123']) {
        console.log(`adrian password "${pw}":`, await bcrypt.compare(pw, adrian.passwordHash))
      }
    }
  } finally {
    await p.$disconnect()
  }
}

main().catch(console.error)
