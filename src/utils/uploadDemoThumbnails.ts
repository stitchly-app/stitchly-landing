import { supabase } from "@/integrations/supabase/client";

export async function uploadDemoThumbnails() {
  const thumbnails = [
    { path: '/demo-thumbnails/winter_forest_thumbnail.png', name: 'winter_forest_thumbnail.png' },
    { path: '/demo-thumbnails/mountains-thumbnail.jpg', name: 'mountains-thumbnail.jpg' },
    { path: '/demo-thumbnails/winter_forest_thumbnail-2.png', name: 'winter_forest_thumbnail-2.png' },
    { path: '/demo-thumbnails/mountains-thumbnail-2.jpg', name: 'mountains-thumbnail-2.jpg' }
  ];

  const results = [];

  for (const thumbnail of thumbnails) {
    try {
      // Fetch the file from public folder
      const response = await fetch(thumbnail.path);
      const blob = await response.blob();
      
      // Upload to Supabase Storage in demo-thumbnails bucket
      const { data, error } = await supabase.storage
        .from('demo-thumbnails')
        .upload(thumbnail.name, blob, {
          contentType: thumbnail.name.endsWith('.png') ? 'image/png' : 'image/jpeg',
          upsert: true
        });

      if (error) {
        console.error(`Error uploading ${thumbnail.name}:`, error);
        results.push({ name: thumbnail.name, success: false, error });
      } else {
        console.log(`Successfully uploaded ${thumbnail.name}`);
        results.push({ name: thumbnail.name, success: true, data });
      }
    } catch (err) {
      console.error(`Failed to upload ${thumbnail.name}:`, err);
      results.push({ name: thumbnail.name, success: false, error: err });
    }
  }

  return results;
}
