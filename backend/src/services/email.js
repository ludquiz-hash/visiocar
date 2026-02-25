import { Resend } from 'resend';

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Default sender domain
const SENDER_DOMAIN = process.env.RESEND_DOMAIN || 'resend.dev';

/**
 * Send OTP email
 */
export async function sendOTPEmail(to, code) {
  try {
    const { data, error } = await resend.emails.send({
      from: `VisioCar <noreply@${SENDER_DOMAIN}>`,
      to: [to],
      subject: 'Votre code de connexion VisioCar',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #007AFF;">VisioCar - Expertise Automobile</h2>
          <p>Bonjour,</p>
          <p>Voici votre code de vérification :</p>
          <div style="background: #f0f0f0; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #007AFF;">${code}</span>
          </div>
          <p>Ce code est valable pendant 10 minutes.</p>
          <p>Si vous n'avez pas demandé ce code, ignorez cet email.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">VisioCar - Expertise automobile intelligente</p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send welcome email
 */
export async function sendWelcomeEmail(to, name) {
  try {
    const { data, error } = await resend.emails.send({
      from: `VisioCar <noreply@${SENDER_DOMAIN}>`,
      to: [to],
      subject: 'Bienvenue sur VisioCar !',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #007AFF;">Bienvenue sur VisioCar !</h2>
          <p>Bonjour ${name},</p>
          <p>Votre compte a été créé avec succès.</p>
          <p>Vous pouvez maintenant :</p>
          <ul>
            <li>Créer des dossiers d'expertise</li>
            <li>Générer des rapports PDF</li>
            <li>Gérer votre équipe</li>
          </ul>
          <p>Bonne utilisation !</p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: error.message };
  }
}