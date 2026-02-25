import { supabaseAdmin } from '../config/supabase.js';
import { sendOTPEmail } from './email.js';

/**
 * Generate a random 6-digit code
 */
function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Send OTP to user
 */
export async function sendOTP(email) {
  try {
    // Generate code
    const code = generateCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store in database
    const { error } = await supabaseAdmin
      .from('otp_codes')
      .upsert({
        email,
        code,
        expires_at: expiresAt.toISOString(),
        used: false,
      }, {
        onConflict: 'email',
      });

    if (error) throw error;

    // Send email
    const emailResult = await sendOTPEmail(email, code);
    if (!emailResult.success) {
      throw new Error('Failed to send email');
    }

    return { success: true };
  } catch (error) {
    console.error('Send OTP error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Verify OTP
 */
export async function verifyOTP(email, code) {
  try {
    // Get stored code
    const { data, error } = await supabaseAdmin
      .from('otp_codes')
      .select('*')
      .eq('email', email)
      .eq('code', code)
      .eq('used', false)
      .single();

    if (error || !data) {
      return { success: false, error: 'Invalid code' };
    }

    // Check expiration
    if (new Date(data.expires_at) < new Date()) {
      return { success: false, error: 'Code expired' };
    }

    // Mark as used
    await supabaseAdmin
      .from('otp_codes')
      .update({ used: true })
      .eq('email', email);

    return { success: true };
  } catch (error) {
    console.error('Verify OTP error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Create or get user after OTP verification
 */
export async function createOrGetUser(email, fullName = '') {
  try {
    // Check if user exists
    let { data: existingUser } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (existingUser) {
      return { success: true, user: existingUser, isNew: false };
    }

    // Create auth user
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      email_confirm: true,
    });

    if (authError) throw authError;

    // Profile will be created automatically via trigger
    const { data: newProfile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', authUser.user.id)
      .single();

    // Update profile with name if provided
    if (fullName) {
      await supabaseAdmin
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', authUser.user.id);
    }

    return { success: true, user: newProfile || { id: authUser.user.id, email }, isNew: true };
  } catch (error) {
    console.error('Create user error:', error);
    return { success: false, error: error.message };
  }
}