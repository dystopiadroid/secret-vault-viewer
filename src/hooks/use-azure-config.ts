import { useState, useEffect } from 'react';

interface AzureConfig {
  tenantId: string;
  clientId: string;
  isConfigured: boolean;
}

export function useAzureConfig(): AzureConfig {
  const [config, setConfig] = useState<AzureConfig>({
    tenantId: '',
    clientId: '',
    isConfigured: false
  });

  useEffect(() => {
    // Get config from environment variables
    const tenantId = import.meta.env.VITE_AZURE_TENANT_ID || '';
    const clientId = import.meta.env.VITE_AZURE_CLIENT_ID || '';
    
    setConfig({
      tenantId,
      clientId,
      isConfigured: Boolean(tenantId && clientId)
    });
  }, []);

  return config;
} 