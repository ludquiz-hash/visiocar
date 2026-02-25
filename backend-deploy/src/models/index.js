import { supabaseAdmin } from '../config/supabase.js';

/**
 * User Model
 */
export const UserModel = {
  async findById(id) {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async findByEmail(email) {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async update(id, updates) {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getGarageMemberships(userId) {
    const { data, error } = await supabaseAdmin
      .from('garage_members')
      .select('*, garage:garage_id(*)')
      .eq('user_id', userId)
      .eq('is_active', true);
    
    if (error) throw error;
    return data;
  },
};

/**
 * Garage Model
 */
export const GarageModel = {
  async findById(id) {
    const { data, error } = await supabaseAdmin
      .from('garages')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async findByOwner(ownerId) {
    const { data, error } = await supabaseAdmin
      .from('garages')
      .select('*')
      .eq('owner_id', ownerId);
    
    if (error) throw error;
    return data;
  },

  async create(garageData) {
    const { data, error } = await supabaseAdmin
      .from('garages')
      .insert(garageData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id, updates) {
    const { data, error } = await supabaseAdmin
      .from('garages')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getMembers(garageId) {
    const { data, error } = await supabaseAdmin
      .from('garage_members')
      .select('*')
      .eq('garage_id', garageId)
      .eq('is_active', true);
    
    if (error) throw error;
    return data;
  },

  async addMember(memberData) {
    const { data, error } = await supabaseAdmin
      .from('garage_members')
      .insert(memberData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateMember(memberId, updates) {
    const { data, error } = await supabaseAdmin
      .from('garage_members')
      .update(updates)
      .eq('id', memberId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getUsageCounter(garageId, year, month) {
    const { data, error } = await supabaseAdmin
      .from('usage_counters')
      .select('*')
      .eq('garage_id', garageId)
      .eq('year', year)
      .eq('month', month)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async incrementUsageCounter(garageId, year, month) {
    const existing = await this.getUsageCounter(garageId, year, month);
    
    if (existing) {
      const { data, error } = await supabaseAdmin
        .from('usage_counters')
        .update({ claims_created: existing.claims_created + 1 })
        .eq('id', existing.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabaseAdmin
        .from('usage_counters')
        .insert({
          garage_id: garageId,
          year,
          month,
          claims_created: 1,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }
  },
};

/**
 * Claim Model
 */
export const ClaimModel = {
  async findById(id) {
    const { data, error } = await supabaseAdmin
      .from('claims')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async findByGarage(garageId, options = {}) {
    let query = supabaseAdmin
      .from('claims')
      .select('*')
      .eq('garage_id', garageId);
    
    if (options.status) {
      query = query.eq('status', options.status);
    }
    
    if (options.orderBy) {
      query = query.order(options.orderBy, { ascending: options.ascending ?? false });
    } else {
      query = query.order('created_at', { ascending: false });
    }
    
    if (options.limit) {
      query = query.limit(options.limit);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data;
  },

  async create(claimData) {
    const { data, error } = await supabaseAdmin
      .from('claims')
      .insert(claimData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id, updates) {
    const { data, error } = await supabaseAdmin
      .from('claims')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabaseAdmin
      .from('claims')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },

  async search(garageId, searchTerm) {
    const { data, error } = await supabaseAdmin
      .from('claims')
      .select('*')
      .eq('garage_id', garageId)
      .or(`reference.ilike.%${searchTerm}%,vehicle_data->>brand.ilike.%${searchTerm}%,vehicle_data->>model.ilike.%${searchTerm}%,client_data->>name.ilike.%${searchTerm}%`);
    
    if (error) throw error;
    return data;
  },
};

/**
 * Claim History Model
 */
export const ClaimHistoryModel = {
  async findByClaim(claimId) {
    const { data, error } = await supabaseAdmin
      .from('claim_history')
      .select('*')
      .eq('claim_id', claimId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async create(historyData) {
    const { data, error } = await supabaseAdmin
      .from('claim_history')
      .insert(historyData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
};