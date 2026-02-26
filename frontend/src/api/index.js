import { supabase } from '../lib/supabase.js';

const API_URL = import.meta.env.VITE_API_URL;

// Check if backend is configured
const hasBackend = !!API_URL && !API_URL.includes('localhost');

// Mock data for development/demo mode
const mockData = {
  garage: {
    id: 'demo-garage',
    name: 'Mon Garage',
    company_name: 'Mon Entreprise',
    company_phone: '',
    company_email: '',
    plan_type: 'starter',
    is_subscribed: false,
    trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
  members: [],
  usage: {
    claims_created: 0,
    claims_limit: 15,
  },
  claims: [],
};

/**
 * Helper to check if Supabase is properly configured
 */
function isSupabaseConfigured() {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  return !!(url && key && !url.includes('your-project'));
}

/**
 * Generic API request helper
 */
async function apiRequest(endpoint, options = {}) {
  // If no backend configured, return mock data
  if (!hasBackend) {
    console.warn(`[API] Backend not configured. Using mock data for ${endpoint}`);
    return getMockResponse(endpoint);
  }

  const session = await supabase.auth.getSession().then(({ data }) => data.session);
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (session?.access_token) {
    headers.Authorization = `Bearer ${session.access_token}`;
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const error = new Error(data?.error || 'Request failed');
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    console.error(`[API] Error calling ${endpoint}:`, error);
    // Fallback to mock data on error
    return getMockResponse(endpoint);
  }
}

/**
 * Get mock response based on endpoint
 */
function getMockResponse(endpoint) {
  if (endpoint.includes('/garage/members')) return { data: mockData.members };
  if (endpoint.includes('/garage')) return { data: mockData.garage };
  if (endpoint.includes('/garage/usage')) return { data: mockData.usage };
  if (endpoint.includes('/claims')) {
    if (endpoint.match(/\/claims\/[^\/]+$/)) return { data: null };
    return { data: mockData.claims };
  }
  if (endpoint.includes('/auth/me')) return { data: { user: null } };
  return { data: null };
}

/**
 * Auth API
 */
export const authApi = {
  async getMe() {
    return apiRequest('/auth/me');
  },

  async updateProfile(updates) {
    return apiRequest('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  async signInWithOtp(email) {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Supabase not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in environment variables.' };
    }
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  },

  async verifyOtp(email, token) {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Supabase not configured' };
    }
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    });
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  },

  async signOut() {
    return supabase.auth.signOut();
  },
};

/**
 * Claims API
 */
export const claimsApi = {
  async getClaims(params = {}) {
    // If Supabase configured, use it directly
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('claims')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('[Claims] Error fetching:', error);
        return { data: [] };
      }
      return { data: data || [] };
    }
    return apiRequest('/claims');
  },

  async getClaim(id) {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('claims')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) return { data: null };
      return { data };
    }
    return apiRequest(`/claims/${id}`);
  },

  async createClaim(data) {
    if (isSupabaseConfigured()) {
      const { data: result, error } = await supabase
        .from('claims')
        .insert([{ ...data, created_at: new Date().toISOString() }])
        .select()
        .single();
      
      if (error) throw error;
      return { data: result };
    }
    return apiRequest('/claims', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateClaim(id, data) {
    if (isSupabaseConfigured()) {
      const { data: result, error } = await supabase
        .from('claims')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return { data: result };
    }
    return apiRequest(`/claims/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async deleteClaim(id) {
    if (isSupabaseConfigured()) {
      const { error } = await supabase.from('claims').delete().eq('id', id);
      if (error) throw error;
      return { success: true };
    }
    return apiRequest(`/claims/${id}`, {
      method: 'DELETE',
    });
  },

  async generatePDF(id) {
    return apiRequest(`/claims/${id}/pdf`, {
      method: 'POST',
    });
  },

  async getClaimHistory(id) {
    return apiRequest(`/claims/${id}/history`);
  },
};

/**
 * Garage API
 */
export const garageApi = {
  async getGarage() {
    if (isSupabaseConfigured()) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: mockData.garage };
      
      const { data, error } = await supabase
        .from('garages')
        .select('*')
        .eq('owner_id', user.id)
        .single();
      
      if (error || !data) return { data: mockData.garage };
      return { data };
    }
    return apiRequest('/garage');
  },

  async updateGarage(data) {
    if (isSupabaseConfigured()) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      const { data: result, error } = await supabase
        .from('garages')
        .upsert({ ...data, owner_id: user.id, updated_at: new Date().toISOString() })
        .select()
        .single();
      
      if (error) throw error;
      return { data: result };
    }
    return apiRequest('/garage', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async getMembers() {
    return { data: [] }; // Placeholder
  },

  async inviteMember(email, role) {
    throw new Error('Feature not available in demo mode');
  },

  async updateMember(memberId, data) {
    throw new Error('Feature not available in demo mode');
  },

  async removeMember(memberId) {
    throw new Error('Feature not available in demo mode');
  },

  async getUsage() {
    if (isSupabaseConfigured()) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: mockData.usage };
      
      const { count, error } = await supabase
        .from('claims')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());
      
      if (error) return { data: mockData.usage };
      return { data: { claims_created: count || 0, claims_limit: 15 } };
    }
    return apiRequest('/garage/usage');
  },
};

/**
 * Stripe API
 */
export const stripeApi = {
  async createCheckoutSession(planId, garageId) {
    throw new Error('Payments not configured in demo mode');
  },

  async createPortalSession() {
    throw new Error('Payments not configured in demo mode');
  },
};

/**
 * Storage API (direct Supabase)
 */
export const storageApi = {
  async uploadFile(bucket, path, file) {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase storage not configured');
    }
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return publicUrl;
  },

  async deleteFile(bucket, path) {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase storage not configured');
    }
    
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) throw error;
    return true;
  },
};
