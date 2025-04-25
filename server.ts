import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { DefaultAzureCredential } from '@azure/identity';
import { SecretClient } from '@azure/keyvault-secrets';

interface VaultRequestBody {
  vaultName: string;
  tenantId: string;
  clientId: string;
}

interface Secret {
  id: number;
  name: string;
  value: string;
  created: Date;
  lastModified: Date;
  expires: Date | null;
}

interface VaultResponse {
  success: boolean;
  data?: Secret[];
  encryptionKey?: string;
  error?: string;
}

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Proxy endpoint for Azure Key Vault
app.post('/api/vault/secrets', async (req, res) => {
  try {
    const { vaultName, tenantId, clientId } = req.body as VaultRequestBody;
    
    if (!vaultName || !tenantId || !clientId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required parameters: vaultName, tenantId, or clientId' 
      });
    }

    // Server-side authentication with Azure
    const credential = new DefaultAzureCredential();
    const vaultUrl = `https://${vaultName}.vault.azure.net`;
    const secretClient = new SecretClient(vaultUrl, credential);
    
    // Fetch the encryption key first
    const encryptionKeySecret = await secretClient.getSecret("akv-util-password");
    const encryptionKey = encryptionKeySecret.value || "";
    
    if (!encryptionKey) {
      return res.status(404).json({ 
        success: false, 
        error: "Could not retrieve encryption key 'akv-util-password' from Azure Key Vault" 
      });
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
        value: secretResponse.value || "",
        created: new Date(secretProperties.createdOn || new Date()),
        lastModified: new Date(secretProperties.updatedOn || new Date()),
        expires: secretProperties.expiresOn ? new Date(secretProperties.expiresOn) : null
      });
    }
    
    // Return the secrets and encryption key
    return res.json({ 
      success: true, 
      data: secrets,
      encryptionKey: encryptionKey
    });
  } catch (error) {
    console.error("Error accessing Azure Key Vault:", error);
    return res.status(500).json({ 
      success: false, 
      error: `Failed to access Azure Key Vault: ${(error as Error).message}` 
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 