import { Resend } from 'resend'
import { BRAND } from '@/lib/brand'

// Inisialisasi Resend
const resend = new Resend(process.env.RESEND_API_KEY || 're_placeholder')

// Email perantara yang menerima OTP
const OTP_RECIPIENT_EMAIL = process.env.OTP_RECIPIENT_EMAIL || 'disdikreset@gmail.com'

export async function sendOTPEmail(
  otp: string,
  adminEmail: string // Email admin dari database (untuk info)
) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'SIREDI Admin <onboarding@resend.dev>', // Ganti dengan domain verified jika sudah ada
      to: [OTP_RECIPIENT_EMAIL], // Email perantara yang menerima OTP
      subject: 'Kode OTP Reset Password - SIREDI Admin',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.accent} 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .otp-box { background: white; border: 2px dashed ${BRAND.accent}; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
            .otp-code { font-size: 32px; font-weight: bold; color: ${BRAND.accent}; letter-spacing: 8px; }
            .info-box { background: ${BRAND.lightBg}; border-left: 4px solid ${BRAND.primary}; padding: 15px; margin: 20px 0; border-radius: 4px; }
            .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Reset Password SIREDI Admin</h1>
            </div>
            <div class="content">
              <p>Halo,</p>
              <p>Ada permintaan reset password untuk akun admin SIREDI.</p>
              
              <div class="info-box">
                <strong>📧 Email Admin:</strong> ${adminEmail}
              </div>
              
              <div class="otp-box">
                <p style="margin: 0 0 10px 0; color: #6b7280;">Kode OTP untuk Reset Password:</p>
                <div class="otp-code">${otp}</div>
              </div>
              
              <div class="warning">
                <strong>⚠️ Penting:</strong>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li>Kode OTP ini berlaku selama <strong>10 menit</strong></li>
                  <li>Gunakan kode ini di halaman reset password</li>
                  <li>Jangan bagikan kode ini kepada siapapun</li>
                </ul>
              </div>
              
              <p style="margin-top: 30px;">Salam,<br><strong>Tim SIREDI</strong></p>
            </div>
            <div class="footer">
              <p>Email ini dikirim secara otomatis. Mohon jangan membalas email ini.</p>
              <p>© ${new Date().getFullYear()} Dinas Pendidikan Kota Banjarmasin</p>
            </div>
          </div>
        </body>
        </html>
      `,
    })

    if (error) {
      console.error('Resend error:', error)
      throw new Error('Gagal mengirim email OTP')
    }

    console.log('✅ OTP email sent via Resend to:', OTP_RECIPIENT_EMAIL, 'Message ID:', data?.id)
    return { success: true, messageId: data?.id }
  } catch (error) {
    console.error('❌ Error sending OTP email:', error)
    throw new Error('Gagal mengirim email OTP')
  }
}

// Test email connection
export async function testEmailConnection() {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error('❌ RESEND_API_KEY not set')
      return false
    }
    // Resend doesn't have a verify method, but we can test by checking if API key exists
    console.log('✅ Resend API key configured')
    return true
  } catch (error) {
    console.error('❌ Email service connection failed:', error)
    return false
  }
}


