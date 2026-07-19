const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const { registerUser } = await import('../lib/auth.ts');

  // Gunakan email acak unik agar tidak bentrok dengan data yang ada
  const randomSuffix = Math.floor(Math.random() * 100000);
  const email = `testuser_${randomSuffix}@gmail.com`;
  console.log(`Attempting to register user with email: ${email}`);

  try {
    const result = await registerUser(
      "Test User Public",
      email,
      "password123",
      "USER"
    );
    console.log('Registration Result:', result);
    
    if (result.ok) {
      console.log('SUCCESS! User created successfully.');
      
      // Clean up test user from DB
      await prisma.pengguna.deleteMany({
        where: { email: email }
      });
      console.log('Cleaned up test user from database.');
    } else {
      console.error('FAILED:', result.error);
    }
  } catch (error) {
    console.error('ERROR during registration:', error);
  }
}

main().finally(() => prisma.$disconnect());
