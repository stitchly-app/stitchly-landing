import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useBrandName = () => {
  const [brandName, setBrandName] = useState("Video Platform");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBrandName = async () => {
      try {
        const { data, error } = await supabase
          .from('system_settings')
          .select('brand_name, logo_url')
          .limit(1)
          .maybeSingle();

        if (error) throw error;
        
        if (data?.brand_name) {
          setBrandName(data.brand_name);
        }
        if (data?.logo_url) {
          setLogoUrl(data.logo_url);
        }
      } catch (error) {
        console.error('Error fetching brand name:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBrandName();
  }, []);

  return { brandName, logoUrl, loading };
};
