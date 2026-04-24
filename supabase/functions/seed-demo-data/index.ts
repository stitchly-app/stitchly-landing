import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const results: string[] = [];

    // 1. Create demo admin user (admin@mail.com)
    let adminUserId: string | null = null;
    {
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      const existingAdmin = existingUsers?.users?.find(u => u.email === "admin@mail.com");
      
      if (existingAdmin) {
        adminUserId = existingAdmin.id;
        results.push(`Admin user already exists: ${adminUserId}`);
      } else {
        const { data, error } = await supabase.auth.admin.createUser({
          email: "admin@mail.com",
          password: "admin123",
          email_confirm: true,
          user_metadata: { first_name: "Demo", last_name: "Admin" },
        });
        if (error) {
          results.push(`Failed to create admin user: ${error.message}`);
        } else {
          adminUserId = data.user.id;
          results.push(`Created admin user: ${adminUserId}`);
        }
      }
    }

    // 2. Create demo standard user (test@mail.com)
    let testUserId: string | null = null;
    {
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      const existingTest = existingUsers?.users?.find(u => u.email === "test@mail.com");
      
      if (existingTest) {
        testUserId = existingTest.id;
        results.push(`Test user already exists: ${testUserId}`);
      } else {
        const { data, error } = await supabase.auth.admin.createUser({
          email: "test@mail.com",
          password: "test1234",
          email_confirm: true,
          user_metadata: { first_name: "Demo", last_name: "User" },
        });
        if (error) {
          results.push(`Failed to create test user: ${error.message}`);
        } else {
          testUserId = data.user.id;
          results.push(`Created test user: ${testUserId}`);
        }
      }
    }

    // 3. Ensure profiles exist (handle_new_user trigger should have created them, but let's be safe)
    if (adminUserId) {
      const { error } = await supabase.from("profiles").upsert({
        id: adminUserId,
        email: "admin@mail.com",
        name: "Demo Admin",
      }, { onConflict: "id" });
      if (error) results.push(`Admin profile upsert error: ${error.message}`);
      else results.push("Admin profile ensured");
    }

    if (testUserId) {
      const { error } = await supabase.from("profiles").upsert({
        id: testUserId,
        email: "test@mail.com",
        name: "Demo User",
      }, { onConflict: "id" });
      if (error) results.push(`Test profile upsert error: ${error.message}`);
      else results.push("Test profile ensured");
    }

    // 4. Set user roles
    if (adminUserId) {
      // Delete existing roles first to avoid duplicates
      await supabase.from("user_roles").delete().eq("user_id", adminUserId);
      const { error } = await supabase.from("user_roles").insert({
        user_id: adminUserId,
        role: "admin",
      });
      if (error) results.push(`Admin role error: ${error.message}`);
      else results.push("Admin role set");
    }

    if (testUserId) {
      await supabase.from("user_roles").delete().eq("user_id", testUserId);
      const { error } = await supabase.from("user_roles").insert({
        user_id: testUserId,
        role: "user",
      });
      if (error) results.push(`Test user role error: ${error.message}`);
      else results.push("Test user role set");
    }

    // 5. Update the reset_demo_admin_data function to use the correct test user ID
    if (testUserId) {
      // We need to update the hardcoded UUID in the reset function
      const { error } = await supabase.rpc("reset_demo_admin_data").catch(() => null) as any;
      // This might fail if no template data exists yet - that's ok
      results.push(`reset_demo_admin_data attempted (may need template data)`);
    }

    // 6. Seed demo video templates
    // Use public demo thumbnail URLs from the project's public folder
    const baseStorageUrl = `${supabaseUrl}/storage/v1/object/public/demo-thumbnails`;
    
    const { data: existingTemplates } = await supabase.from("demo_videos_template").select("id");
    
    if (!existingTemplates || existingTemplates.length === 0) {
      const demoVideos = [
        {
          original_name: "Winter_Forest_Landscape.mp4",
          file_url: `${baseStorageUrl}/winter_forest_thumbnail.png`, // placeholder - demo only shows thumbnails
          duration: 45.5,
          resolution: "1920x1080",
          aspect_ratio: "16:9",
          size: 8500000,
          thumbnail_url: `${baseStorageUrl}/winter_forest_thumbnail.png`,
        },
        {
          original_name: "Mountain_Adventure.mp4",
          file_url: `${baseStorageUrl}/mountains-thumbnail.jpg`,
          duration: 120.0,
          resolution: "1920x1080",
          aspect_ratio: "16:9",
          size: 25000000,
          thumbnail_url: `${baseStorageUrl}/mountains-thumbnail.jpg`,
        },
      ];

      const { data: insertedVideos, error: videoError } = await supabase
        .from("demo_videos_template")
        .insert(demoVideos)
        .select();

      if (videoError) {
        results.push(`Demo video template error: ${videoError.message}`);
      } else {
        results.push(`Inserted ${insertedVideos.length} demo video templates`);

        // 7. Seed demo project templates
        if (insertedVideos.length >= 2) {
          const demoProjects = [
            {
              name: "Winter Forest Edit",
              video_template_id: insertedVideos[0].id,
              edits_json: [
                { start_time: 0, end_time: 15.5, label: "Intro" },
                { start_time: 20, end_time: 35, label: "Main Scene" },
              ],
              format_settings_json: {
                aspectRatio: "16:9",
                cropMode: "fit",
                resolution: "1080p",
              },
            },
            {
              name: "Mountain Highlights",
              video_template_id: insertedVideos[1].id,
              edits_json: [
                { start_time: 5, end_time: 30, label: "Summit" },
                { start_time: 60, end_time: 90, label: "Descent" },
              ],
              format_settings_json: {
                aspectRatio: "9:16",
                cropMode: "fill",
                resolution: "1080p",
              },
            },
          ];

          const { data: insertedProjects, error: projectError } = await supabase
            .from("demo_projects_template")
            .insert(demoProjects)
            .select();

          if (projectError) {
            results.push(`Demo project template error: ${projectError.message}`);
          } else {
            results.push(`Inserted ${insertedProjects.length} demo project templates`);

            // 8. Seed demo export templates
            const demoExports = [
              {
                project_template_id: insertedProjects[0].id,
                video_template_id: insertedVideos[0].id,
                status: "done" as const,
                format: "mp4",
                aspect_ratio: "16:9",
                resolution: "1080p",
                output_urls: [{ url: "demo://placeholder", segment_index: 0 }],
                completed_at: new Date().toISOString(),
              },
              {
                project_template_id: insertedProjects[1].id,
                video_template_id: insertedVideos[1].id,
                status: "done" as const,
                format: "mp4",
                aspect_ratio: "9:16",
                resolution: "1080p",
                output_urls: [{ url: "demo://placeholder", segment_index: 0 }],
                completed_at: new Date().toISOString(),
              },
            ];

            const { error: exportError } = await supabase
              .from("demo_exports_template")
              .insert(demoExports);

            if (exportError) {
              results.push(`Demo export template error: ${exportError.message}`);
            } else {
              results.push("Inserted demo export templates");
            }
          }
        }
      }
    } else {
      results.push("Demo video templates already exist, skipping");
    }

    // 9. Update the hardcoded user ID in reset_demo_admin_data if test user has a different ID
    if (testUserId) {
      // Update the function to use the new test user ID
      const updateFnSql = `
        CREATE OR REPLACE FUNCTION public.reset_demo_admin_data()
        RETURNS void
        LANGUAGE plpgsql
        SECURITY DEFINER
        SET search_path TO 'public'
        AS $func$
        DECLARE
          _demo_user_id uuid := '${testUserId}';
          _video_mapping jsonb := '{}'::jsonb;
          _project_mapping jsonb := '{}'::jsonb;
          _template_video record;
          _template_project record;
          _template_export record;
          _new_video_id uuid;
          _new_project_id uuid;
        BEGIN
          DELETE FROM public.audit_log WHERE true;
          DELETE FROM public.exports WHERE true;
          DELETE FROM public.projects WHERE true;
          DELETE FROM public.videos WHERE true;
          
          FOR _template_video IN SELECT * FROM public.demo_videos_template LOOP
            INSERT INTO public.videos (
              user_id, original_name, file_url, duration, resolution, 
              aspect_ratio, size, thumbnail_url, is_visitor, created_at
            )
            VALUES (
              _demo_user_id,
              _template_video.original_name, _template_video.file_url,
              _template_video.duration, _template_video.resolution, _template_video.aspect_ratio,
              _template_video.size, _template_video.thumbnail_url, false, _template_video.created_at
            )
            RETURNING id INTO _new_video_id;
            _video_mapping := _video_mapping || jsonb_build_object(_template_video.id::text, _new_video_id::text);
          END LOOP;
          
          FOR _template_project IN SELECT * FROM public.demo_projects_template LOOP
            INSERT INTO public.projects (
              user_id, name, video_id, edits_json, format_settings_json, is_visitor, created_at
            )
            VALUES (
              _demo_user_id, _template_project.name,
              (_video_mapping->>_template_project.video_template_id::text)::uuid,
              _template_project.edits_json, _template_project.format_settings_json,
              false, _template_project.created_at
            )
            RETURNING id INTO _new_project_id;
            _project_mapping := _project_mapping || jsonb_build_object(_template_project.id::text, _new_project_id::text);
          END LOOP;
          
          FOR _template_export IN SELECT * FROM public.demo_exports_template LOOP
            INSERT INTO public.exports (
              project_id, video_id, status, format, aspect_ratio, resolution,
              output_urls, completed_at, is_visitor, created_at
            )
            VALUES (
              (_project_mapping->>_template_export.project_template_id::text)::uuid,
              (_video_mapping->>_template_export.video_template_id::text)::uuid,
              _template_export.status, _template_export.format, _template_export.aspect_ratio,
              _template_export.resolution, _template_export.output_urls, _template_export.completed_at,
              false, _template_export.created_at
            );
            
            INSERT INTO public.audit_log (actor_id, entity, action, payload_json, created_at)
            VALUES (
              _demo_user_id, 'export', 'exported',
              jsonb_build_object(
                'entity_id', (_project_mapping->>_template_export.project_template_id::text)::uuid,
                'format', _template_export.format,
                'timestamp', _template_export.created_at
              ),
              _template_export.created_at
            );
          END LOOP;
        END;
        $func$;
      `;
      
      // Execute the SQL to update the function - we need to use raw SQL
      // Since we can't run DDL from the client, we'll just note this needs a migration
      results.push(`NOTE: reset_demo_admin_data function needs updating to use test user ID: ${testUserId}`);
    }

    return new Response(
      JSON.stringify({ success: true, results, adminUserId, testUserId }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Seed error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
