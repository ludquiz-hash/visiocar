import { supabaseAdmin } from '../config/supabase.js';

/**
 * Authentication middleware
 * Extracts JWT from Authorization header and validates user
 */
export async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        error: 'Authentication required',
        details: 'No token provided'
      });
    }

    // Verify token with Supabase
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return res.status(403).json({ 
        error: 'Invalid or expired token',
        details: error?.message || 'Token validation failed'
      });
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
    }

    // Attach user to request
    req.user = {
      ...user,
      profile: profile || null,
    };
    req.token = token;

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ 
      error: 'Authentication failed',
      details: error.message
    });
  }
}

/**
 * Optional authentication - doesn't reject if no token
 */
export async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
      if (!error && user) {
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        req.user = { ...user, profile: profile || null };
        req.token = token;
      }
    }

    next();
  } catch (error) {
    next();
  }
}