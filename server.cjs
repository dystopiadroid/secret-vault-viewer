const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { ClientCertificateCredential } = require('@azure/identity');
const { SecretClient } = require('@azure/keyvault-secrets');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3001;

// Configure multer for file uploads
const upload = multer({ dest: os.tmpdir() });

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Proxy endpoint for Azure Key Vault with file upload
app.post('/api/vault/secrets', upload.single('pemFile'), async (req, res) => {
  let tempPemPath = null;
  
  try {
    const { vaultName, tenantId, clientId } = req.body;
    
    if (!vaultName || !tenantId || !clientId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required parameters: vaultName, tenantId, or clientId' 
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Missing PEM file'
      });
    }

    // Read the uploaded PEM file
    const pemFilePath = req.file.path;
    const pemContent = fs.readFileSync(pemFilePath, 'utf8');
    
    // Create a temporary file with a proper .pem extension
    const randomFileName = crypto.randomBytes(16).toString('hex');
    tempPemPath = path.join(os.tmpdir(), `${randomFileName}.pem`);
    fs.writeFileSync(tempPemPath, pemContent);
    
    // Clean up the original temporary file
    fs.unlinkSync(pemFilePath);
    
    try {
      // Create credentials using the certificate file path
      const credential = new ClientCertificateCredential(
        tenantId,
        clientId,
        tempPemPath
      );
      
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
      const secrets = [];
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
      console.error('Azure Key Vault authentication error:', error);
      return res.status(401).json({
        success: false,
        error: `Authentication failed: ${error.message}`
      });
    }
  } catch (error) {
    console.error("Error accessing Azure Key Vault:", error);
    return res.status(500).json({ 
      success: false, 
      error: `Failed to access Azure Key Vault: ${error.message}` 
    });
  } finally {
    // Clean up any temporary files
    if (tempPemPath && fs.existsSync(tempPemPath)) {
      try {
        fs.unlinkSync(tempPemPath);
      } catch (error) {
        console.error("Error cleaning up temporary file:", error);
      }
    }
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 