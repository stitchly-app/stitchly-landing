import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create a Supabase client with the user's auth token
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Get the authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create admin client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    console.log('Starting account deletion for user:', user.id);

    // Delete all related data in correct order (respecting foreign key constraints)
    
    // 1. Delete exports (references projects and videos)
    const { error: exportsError } = await supabaseAdmin
      .from('exports')
      .delete()
      .eq('project_id', user.id);
    
    if (exportsError) {
      console.error('Error deleting exports:', exportsError);
    }

    // 2. Delete projects (references videos)
    const { error: projectsError } = await supabaseAdmin
      .from('projects')
      .delete()
      .eq('user_id', user.id);
    
    if (projectsError) {
      console.error('Error deleting projects:', projectsError);
    }

    // 3. Delete videos
    const { error: videosError } = await supabaseAdmin
      .from('videos')
      .delete()
      .eq('user_id', user.id);
    
    if (videosError) {
      console.error('Error deleting videos:', videosError);
    }

    // 4. Delete user roles
    const { error: rolesError } = await supabaseAdmin
      .from('user_roles')
      .delete()
      .eq('user_id', user.id);
    
    if (rolesError) {
      console.error('Error deleting user roles:', rolesError);
    }

    // 5. Delete profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', user.id);
    
    if (profileError) {
      console.error('Error deleting profile:', profileError);
    }

    // 6. Finally, delete the user from auth.users
    const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(user.id);

    if (deleteUserError) {
      console.error('Error deleting user from auth:', deleteUserError);
      return new Response(
        JSON.stringify({ error: 'Failed to delete user account', details: deleteUserError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Successfully deleted user account:', user.id);

    return new Response(
      JSON.stringify({ success: true, message: 'Account deleted successfully' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in delete-user-account function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
