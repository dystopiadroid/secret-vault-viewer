import { useState } from 'react';

interface AzureConfig {
  tenantId: string;
  clientId: string;
  isConfigured: boolean;
}

export function useAzureConfig(): AzureConfig {
  // Always return empty values
  return {
    tenantId: '',
    clientId: '',
    isConfigured: false
  };
} 