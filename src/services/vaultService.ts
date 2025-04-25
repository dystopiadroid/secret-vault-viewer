import { SecretClient } from "@azure/keyvault-secrets";
import { InteractiveBrowserCredential } from "@azure/identity";
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

// Connect to real Azure Key Vault
export const fetchVaultSecrets = async (
  vaultName: string,
  pemFile: File | null,
  tenantId: string = import.meta.env.VITE_AZURE_TENANT_ID || "",
  clientId: string = import.meta.env.VITE_AZURE_CLIENT_ID || ""
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
        error: "Azure tenant ID and client ID are required. Please check your environment variables." 
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
      const credential = new InteractiveBrowserCredential({
        tenantId,
        clientId
      });
      
      // Create the Key Vault client
      const vaultUrl = `https://${vaultName}.vault.azure.net`;
      const secretClient = new SecretClient(vaultUrl, credential);
      
      // Fetch the encryption key first
      const encryptionKeySecret = await secretClient.getSecret("akv-util-password");
      const encryptionKey = encryptionKeySecret.value || "";
      
      if (!encryptionKey) {
        return { 
          success: false, 
          error: "Could not retrieve encryption key 'akv-util-password' from Azure Key Vault" 
        };
      }
      
      // Fetch all secrets
      const secretsIterator = secretClient.listPropertiesOfSecrets();
      const secrets: Secret[] = [];
      let index = 1;
      
      for await (const secretProperties of secretsIterator) {
        // Skip the encryption key in the returned list
        if (secretProperties.name === "akv-util-password") {
          continue;
        }
        
        // Get the full secret including value
        const secretResponse = await secretClient.getSecret(secretProperties.name);
        
        secrets.push({
          id: index++,
          name: secretProperties.name,
          value: encryptValue(secretResponse.value || "", encryptionKey),
          created: new Date(secretProperties.createdOn || new Date()),
          lastModified: new Date(secretProperties.updatedOn || new Date()),
          expires: secretProperties.expiresOn ? new Date(secretProperties.expiresOn) : null
        });
      }
      
      // Return the encryption key along with the data
      return { 
        success: true, 
        data: secrets,
        encryptionKey: encryptionKey
      };
    } catch (error) {
      console.error("Azure Key Vault connection error:", error);
      return { 
        success: false, 
        error: `Failed to connect to Azure Key Vault: ${(error as Error).message}` 
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