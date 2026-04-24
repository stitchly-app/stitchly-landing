import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ExportRequest {
  exportId: string;
  projectId: string;
  videoId: string;
  outputUrls: string[];
  watermarkApplied: boolean;
  segmentsProcessed: number;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const exportRequest: ExportRequest = await req.json();
    console.log('Processing export request:', {
      exportId: exportRequest.exportId,
      segmentsProcessed: exportRequest.segmentsProcessed
    });

    const { exportId, outputUrls, watermarkApplied, segmentsProcessed } = exportRequest;

    // Update export record with completion status
    const { error: updateError } = await supabase
      .from('exports')
      .update({
        status: 'done',
        output_urls: outputUrls,
        completed_at: new Date().toISOString(),
      })
      .eq('id', exportId);

    if (updateError) {
      throw new Error(`Failed to update export: ${updateError.message}`);
    }

    console.log('Export completed successfully:', {
      exportId,
      segmentsProcessed,
      watermarkApplied
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        outputUrls,
        segmentsProcessed 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Error processing export:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
