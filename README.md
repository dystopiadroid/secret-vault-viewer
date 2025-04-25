# AKV Util - Azure Key Vault Utility

A web-based tool designed to simplify interaction with Azure Key Vault (AKV). This application allows users to connect to an Azure Key Vault using a vault name and a PEM file, retrieve secrets, and display them in a tabular format with encrypted secret values.

## Features

- Connect to Azure Key Vault using vault name, tenant ID, client ID, and PEM certificate authentication
- Display secrets in a searchable, tabular format
- Encrypted secret values by default for security
- "Decrypt All" option to view decrypted values (requires encryption key)
- Export to Excel with options for encrypted or decrypted values
- Search functionality for easy filtering of secrets by name

## Requirements

- Azure Key Vault with secrets
- Azure AD application with certificate authentication configured
- Tenant ID and Client ID from your Azure AD application
- A PEM certificate file for authentication
- A secret named "akv-util-password" in your Key Vault that serves as the encryption key

## Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Run the development server:
   ```
   npm run dev:full
   ```

## Azure Setup

1. Create an Azure AD application registration
2. Upload your certificate public key to the application
3. Configure Key Vault access policies to allow the application to read secrets
4. Ensure you have a secret named "akv-util-password" in your Key Vault that will be used for encryption/decryption
5. Note down your Tenant ID and Client ID from the Azure AD application

## PEM Certificate

The application requires a valid PEM certificate file for authentication. The file should contain both the certificate and private key in the following format:

```
-----BEGIN CERTIFICATE-----
[certificate content]
-----END CERTIFICATE-----
-----BEGIN PRIVATE KEY-----
[private key content]
-----END PRIVATE KEY-----
```

## Usage

1. Enter the vault name (without the full URL, just the name part)
2. Enter your Azure Tenant ID and Client ID
3. Upload your PEM certificate file
4. Click "Connect to Vault" to fetch secrets
5. Use the search bar to filter secrets by name
6. Click "Decrypt All" and enter the encryption key to view decrypted values
7. Use "Export to Excel" dropdown to export data with encrypted or decrypted values

## Security Notes

- Secret values are always encrypted when displayed in the table
- Decryption requires the correct encryption key (stored as "akv-util-password" in your Key Vault)
- The application does not store the encryption key or secret values permanently
- All processing happens on the client side for better security
- No Azure credentials are stored in environment variables or local storage

## Development

Built with:
- React with TypeScript
- Azure SDK for JavaScript
- Tailwind CSS for styling
- crypto-js for encryption/decryption
- xlsx for Excel export functionality
