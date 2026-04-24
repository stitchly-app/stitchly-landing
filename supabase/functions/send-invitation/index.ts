import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InviteEntry {
  email: string;
  role: "user" | "admin";
}

interface InvitationRequest {
  invites: InviteEntry[];
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { invites }: InvitationRequest = await req.json();

    if (!invites || invites.length === 0) {
      return new Response(
        JSON.stringify({ error: "No invitations provided" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Get the site URL for the invitation link
    const siteUrl = Deno.env.get("SUPABASE_URL")?.replace(
      "supabase.co",
      "lovableproject.com"
    ) || "http://localhost:5173";

    // In a real implementation, you would:
    // 1. Use Resend or another email service to send emails
    // 2. Generate unique invitation tokens
    // 3. Store invitations in database with expiry and role
    // 4. Send personalized invitation links with role information

    // For now, we'll return a success response
    // You'll need to implement the actual email sending
    console.log("Sending invitations:");
    invites.forEach(invite => {
      console.log(`  - ${invite.email} as ${invite.role}`);
    });
    console.log(`Invitation URL: ${siteUrl}/auth`);

    // Placeholder response
    // Replace this with actual email sending logic using Resend
    const results = invites.map(invite => ({
      email: invite.email,
      role: invite.role,
      status: "pending",
      message: "Email service not configured. Please set up Resend API."
    }));

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Invitations queued. Note: Email service requires Resend API key configuration.",
        results
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-invitation function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
