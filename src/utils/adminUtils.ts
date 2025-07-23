import { supabase } from '@/integrations/supabase/client';

/**
 * Set user role to admin
 * This should be called manually for the first admin user
 */
export const setUserAsAdmin = async (userEmail: string) => {
  try {
    // First, get the user ID from auth.users (this requires admin access)
    const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) {
      console.error('Error fetching users:', userError);
      return { error: userError };
    }

    const user = userData.users.find((u: any) => u.email === userEmail);
    
    if (!user) {
      return { error: { message: 'User not found' } };
    }

    // Update or insert user role
    const { error: roleError } = await supabase
      .from('user_roles')
      .upsert([
        {
          user_id: user.id,
          role: 'admin'
        }
      ]);

    if (roleError) {
      console.error('Error setting admin role:', roleError);
      return { error: roleError };
    }

    return { success: true };
  } catch (error) {
    console.error('Error setting admin role:', error);
    return { error };
  }
};

/**
 * Create user role entry if it doesn't exist
 * This can be called after user login to ensure role exists
 */
export const ensureUserRole = async (userId: string) => {
  try {
    // Check if user role exists
    const { data: existingRole, error: checkError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      // Error other than "not found"
      console.error('Error checking user role:', checkError);
      return { error: checkError };
    }

    if (!existingRole) {
      // Create default user role
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert([
          {
            user_id: userId,
            role: 'user'
          }
        ]);

      if (insertError) {
        console.error('Error creating user role:', insertError);
        return { error: insertError };
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Error ensuring user role:', error);
    return { error };
  }
};
