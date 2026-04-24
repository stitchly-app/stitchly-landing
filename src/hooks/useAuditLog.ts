import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type AuditEntity = 'video' | 'project' | 'export';
type AuditAction = 'created' | 'updated' | 'deleted' | 'exported';

interface AuditLogParams {
  entity: AuditEntity;
  action: AuditAction;
  entityId?: string;
  payload?: Record<string, any>;
}

export const useAuditLog = () => {
  const { toast } = useToast();

  const logAction = async ({ entity, action, entityId, payload = {} }: AuditLogParams) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.warn('No user found for audit logging');
        return;
      }

      const { error } = await supabase
        .from('audit_log')
        .insert({
          actor_id: user.id,
          entity,
          action,
          payload_json: {
            entity_id: entityId,
            ...payload,
            timestamp: new Date().toISOString(),
          },
        });

      if (error) {
        console.error('Audit log error:', error);
      }
    } catch (error) {
      console.error('Failed to log action:', error);
    }
  };

  return { logAction };
};
