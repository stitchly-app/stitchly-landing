import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, Save } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface SystemSettings {
  id?: string;
  storage_limit_gb: number;
  watermark_text: string;
  brand_name: string;
  logo_url?: string;
}

export const SystemSettings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<SystemSettings>({
    storage_limit_gb: 10,
    watermark_text: 'SAMPLE',
    brand_name: 'Video Editor',
    logo_url: undefined,
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [storageStats, setStorageStats] = useState({ used: 0, total: 0 });
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Use refs to access latest state without recreating the callback
  const settingsRef = useRef(settings);
  const logoFileRef = useRef(logoFile);
  
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);
  
  useEffect(() => {
    logoFileRef.current = logoFile;
  }, [logoFile]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // Try to get existing settings (get first row if multiple exist)
        const { data, error } = await supabase
          .from('system_settings')
          .select('*')
          .limit(1)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setSettings(data);
          if (data.logo_url) {
            setLogoPreview(data.logo_url);
          }
        } else {
          // No settings exist, create default row
          const { data: newSettings, error: insertError } = await supabase
            .from('system_settings')
            .insert({
              storage_limit_gb: 10,
              watermark_text: 'SAMPLE',
              brand_name: 'Video Editor',
            })
            .select()
            .single();

          if (insertError) {
            console.error('Error inserting settings:', insertError);
            throw insertError;
          }

          if (newSettings) {
            setSettings(newSettings);
          }
        }

        // Fetch storage stats
        const { data: videos } = await supabase
          .from('videos')
          .select('size');

        const totalUsed = videos?.reduce((sum, v) => sum + (v.size || 0), 0) || 0;
        const limitGb = data?.storage_limit_gb || 10;
        setStorageStats({
          used: totalUsed,
          total: limitGb * 1024 * 1024 * 1024
        });
      } catch (error) {
        console.error('Error fetching settings:', error);
        toast({
          title: "Error",
          description: "Failed to load system settings",
          variant: "destructive",
      });
    } finally {
      setLoading(false);
      setIsInitialized(true);
    }
    };

    fetchSettings();
  }, []);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Logo must be less than 2MB",
        variant: "destructive"
      });
      return;
    }

    setLogoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = async () => {
    if (!settings.id) {
      toast({
        title: "Error",
        description: "Cannot remove logo: settings not initialized",
        variant: "destructive",
      });
      return;
    }

    try {
      // Delete from storage if there's an existing logo
      if (settings.logo_url) {
        const logoPath = settings.logo_url.split('/').pop();
        if (logoPath) {
          const { error: deleteError } = await supabase.storage
            .from('logos')
            .remove([logoPath]);
          
          if (deleteError) {
            console.error('Error deleting logo:', deleteError);
          }
        }

        // Update database to remove logo_url
        const { error: updateError } = await supabase
          .from('system_settings')
          .update({ logo_url: null })
          .eq('id', settings.id);

        if (updateError) throw updateError;

        toast({
          title: "Logo deleted",
          description: "Logo has been removed successfully"
        });
      }

      setLogoFile(null);
      setLogoPreview(null);
      setSettings({ ...settings, logo_url: undefined });
    } catch (error) {
      console.error('Error removing logo:', error);
      toast({
        title: "Error",
        description: "Failed to delete logo",
        variant: "destructive"
      });
    }
  };

  const handleSave = useCallback(async () => {
    const currentSettings = settingsRef.current;
    const currentLogoFile = logoFileRef.current;
    
    setSaving(true);
    try {
      let logoUrl = currentSettings.logo_url;

      // Upload new logo if selected
      if (currentLogoFile) {
        setUploading(true);
        const fileExt = currentLogoFile.name.split('.').pop();
        const fileName = `logo-${Date.now()}.${fileExt}`;
        const filePath = fileName;

        const { error: uploadError } = await supabase.storage
          .from('logos')
          .upload(filePath, currentLogoFile, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('logos')
          .getPublicUrl(filePath);

        logoUrl = publicUrl;
        setUploading(false);
      }

      // Update or insert system settings
      if (currentSettings.id) {
        // Update existing settings
        const { error } = await supabase
          .from('system_settings')
          .update({
            storage_limit_gb: currentSettings.storage_limit_gb,
            watermark_text: currentSettings.watermark_text,
            brand_name: currentSettings.brand_name,
            logo_url: logoUrl,
          })
          .eq('id', currentSettings.id);

        if (error) throw error;
      } else {
        // Insert new settings
        const { data: newSettings, error } = await supabase
          .from('system_settings')
          .insert({
            storage_limit_gb: currentSettings.storage_limit_gb,
            watermark_text: currentSettings.watermark_text,
            brand_name: currentSettings.brand_name,
            logo_url: logoUrl,
          })
          .select()
          .single();

        if (error) throw error;

        if (newSettings) {
          setSettings({ ...currentSettings, id: newSettings.id });
        }
      }

      if (isInitialized) {
        toast({
          title: "Settings saved",
          description: "System settings have been updated successfully"
        });
      }

      setLogoFile(null);
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
      setUploading(false);
    }
  }, [toast, isInitialized]);

  if (loading) {
    return <div className="p-6">Loading settings...</div>;
  }

  const usagePercentage = (storageStats.used / storageStats.total) * 100;
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <Card className="border border-border rounded-lg bg-card p-6">
        <h3 className="text-xl font-semibold text-foreground mb-2">Storage</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-foreground">Plan limit: {settings.storage_limit_gb}GB</span>
            <span className="text-foreground">{usagePercentage.toFixed(1)}% utilized</span>
          </div>
          <Progress 
            value={usagePercentage} 
            className="h-2 bg-[#343750]"
            indicatorClassName="bg-[#A3A8C1]"
          />
          <p className="text-sm text-muted-foreground">
            Maximum storage allowed for all users combined
          </p>
        </div>
      </Card>

      <Card className="border border-border rounded-lg bg-card p-6">
        <h3 className="text-xl font-semibold text-foreground mb-6">Watermark</h3>
        <div className="space-y-2">
          <Label htmlFor="watermark-text" className="text-sm text-foreground">Watermark Text</Label>
          <Input
            id="watermark-text"
            value={settings.watermark_text}
            onChange={(e) => setSettings({
              ...settings,
              watermark_text: e.target.value
            })}
            placeholder="SAMPLE"
          />
          <p className="text-sm text-muted-foreground">
            Text overlay for visitor exports
          </p>
        </div>
      </Card>

      <Card className="border border-border rounded-lg bg-card p-6">
        <h3 className="text-xl font-semibold text-foreground mb-6">Branding</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="brand-name" className="text-sm text-foreground">Brand Name</Label>
            <Input
              id="brand-name"
              value={settings.brand_name}
              onChange={(e) => setSettings({
                ...settings,
                brand_name: e.target.value
              })}
              placeholder="Your Company Name"
            />
            <p className="text-sm text-muted-foreground">
              Displayed in the application header and metadata
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo-upload" className="text-sm text-foreground">Upload Logo</Label>
            <div className="flex items-center gap-4">
              {logoPreview && (
                <div className="relative">
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="h-16 w-16 object-contain border border-border rounded bg-[#343750] p-2"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={handleRemoveLogo}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
              <div>
                <Input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <Button
                  variant="secondary"
                  onClick={() => document.getElementById('logo-upload')?.click()}
                  className="gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Upload Logo
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Max 2MB. Displayed next to the brand name in header.
            </p>
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving || uploading}
          className="bg-[#40CCB7] hover:bg-[#40CCB7]/90 text-white border border-[#40CCB7]"
        >
          {saving || uploading ? 'Saving...' : 'Save Changes'}
          <Save className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};
