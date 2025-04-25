import { Secret } from "./mockVaultService"; // Still reusing the Secret interface
import { encryptValue } from "@/lib/utils";
import * as forge from "node-forge";

export interface VaultResponse {
  success: boolean;
  data?: Secret[];
  encryptionKey?: string;
  error?: string;
}

// Parse the PEM file and extract certificate information
const parsePemFile = async (pemFile: File): Promise<{
  cert: string;
  privateKey: string;
  thumbprint: string;
}> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const pemContent = event.target?.result as string;
        
        // Extract the certificate and private key parts
        const certMatch = pemContent.match(
          /-----BEGIN CERTIFICATE-----[\s\S]*?-----END CERTIFICATE-----/
        );
        const keyMatch = pemContent.match(
          /-----BEGIN PRIVATE KEY-----[\s\S]*?-----END PRIVATE KEY-----/
        );
        
        if (!certMatch || !keyMatch) {
          reject(new Error("Invalid PEM file format"));
          return;
        }
        
        const cert = certMatch[0];
        const privateKey = keyMatch[0];
        
        // Calculate thumbprint from certificate
        const certObj = forge.pki.certificateFromPem(cert);
        const der = forge.asn1.toDer(forge.pki.certificateToAsn1(certObj)).getBytes();
        const md = forge.md.sha1.create();
        md.update(der);
        const thumbprint = md.digest().toHex().toUpperCase();
        
        resolve({ cert, privateKey, thumbprint });
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = (error) => reject(error);
    reader.readAsText(pemFile);
  });
};

// Connect to real Azure Key Vault through our proxy server
export const fetchVaultSecrets = async (
  vaultName: string,
  pemFile: File | null,
  tenantId: string,
  clientId: string
): Promise<VaultResponse> => {
  try {
    if (!vaultName.trim()) {
      return { success: false, error: "Vault name is required" };
    }

    if (!pemFile) {
      return { success: false, error: "PEM file is required" };
    }
    
    if (!tenantId || !clientId) {
      return { 
        success: false, 
        error: "Azure tenant ID and client ID are required" 
      };
    }
    
    // Validate the PEM file
    try {
      await parsePemFile(pemFile);
    } catch (error) {
      return {
        success: false,
        error: `Invalid PEM file: ${(error as Error).message}`
      };
    }
    
    try {
      const formData = new FormData();
      formData.append('vaultName', vaultName);
      formData.append('tenantId', tenantId);
      formData.append('clientId', clientId);
      formData.append('pemFile', pemFile);
      
      // Use our proxy server instead of connecting directly to Azure Key Vault
      const response = await fetch('/api/vault/secrets', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        return { 
          success: false, 
          error: errorData.error || `Server responded with status ${response.status}` 
        };
      }
      
      const result = await response.json();
      
      if (!result.success) {
        return { 
          success: false, 
          error: result.error || "Unknown error occurred" 
        };
      }
      
      // Encrypt the secret values before returning them to the client
      if (result.data && result.encryptionKey) {
        const encryptedSecrets = result.data.map((secret: Secret) => ({
          ...secret,
          value: encryptValue(secret.value, result.encryptionKey as string)
        }));
        
        return {
          success: true,
          data: encryptedSecrets,
          encryptionKey: result.encryptionKey
        };
      }
      
      return result;
    } catch (error) {
      console.error("Error connecting to proxy server:", error);
      return { 
        success: false, 
        error: `Failed to connect to server: ${(error as Error).message}` 
      };
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return { 
      success: false, 
      error: `Failed to process request: ${(error as Error).message}` 
    };
  }
}; 