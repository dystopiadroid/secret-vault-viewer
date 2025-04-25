
import { encryptValue, generateRandomExpiryDate } from "@/lib/utils";

export interface Secret {
  id: number;
  name: string;
  value: string;
  created: Date;
  lastModified: Date;
  expires: Date | null;
}

// Mock secrets data to simulate Azure Key Vault response
const mockSecrets: Secret[] = [
  {
    id: 1,
    name: "db-connection-string",
    value: "Server=myserver;Database=mydb;User Id=admin;Password=strongpassword;",
    created: new Date("2023-01-15"),
    lastModified: new Date("2023-03-20"),
    expires: generateRandomExpiryDate(),
  },
  {
    id: 2,
    name: "api-key-production",
    value: "sk_prod_98a76b5c4d3e2f1g0h",
    created: new Date("2023-02-10"),
    lastModified: new Date("2023-02-10"),
    expires: generateRandomExpiryDate(),
  },
  {
    id: 3,
    name: "smtp-credentials",
    value: "username=noreply@example.com;password=emailpassword123",
    created: new Date("2022-11-05"),
    lastModified: new Date("2023-04-18"),
    expires: null,
  },
  {
    id: 4,
    name: "storage-account-key",
    value: "DefaultEndpointsProtocol=https;AccountName=mystorageacct;AccountKey=a1b2c3d4e5==;EndpointSuffix=core.windows.net",
    created: new Date("2023-03-01"),
    lastModified: new Date("2023-03-01"),
    expires: generateRandomExpiryDate(),
  },
  {
    id: 5,
    name: "jwt-secret-key",
    value: "v3ry-s3cr3t-jwt-k3y-n0b0dy-sh0uld-kn0w",
    created: new Date("2022-12-20"),
    lastModified: new Date("2023-01-05"),
    expires: null,
  },
  {
    id: 6,
    name: "cdn-access-key",
    value: "cdn-access-9876543210-abcdef",
    created: new Date("2023-04-05"),
    lastModified: new Date("2023-04-05"),
    expires: generateRandomExpiryDate(),
  },
  {
    id: 7,
    name: "redis-connection",
    value: "redis://default:password123@redis-12345.c14.us-east-1-2.ec2.cloud.redislabs.com:12345",
    created: new Date("2023-02-28"),
    lastModified: new Date("2023-02-28"),
    expires: null,
  },
  {
    id: 8,
    name: "payment-gateway-secret",
    value: "live_secret_key_abcdefghijklmnopqrstuvwxyz",
    created: new Date("2023-01-20"),
    lastModified: new Date("2023-05-15"),
    expires: generateRandomExpiryDate(),
  },
  {
    id: 9,
    name: "akv-util-password",
    value: "akv-util-password-value",
    created: new Date("2023-01-01"),
    lastModified: new Date("2023-01-01"),
    expires: null,
  },
];

export interface VaultResponse {
  success: boolean;
  data?: Secret[];
  error?: string;
}

// Simulate API call to Azure Key Vault
export const fetchVaultSecrets = async (
  vaultName: string,
  pemFile: File | null,
  encryptionKey: string
): Promise<VaultResponse> => {
  // Simulate API delay
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simple validation
      if (!vaultName.trim()) {
        resolve({ success: false, error: "Vault name is required" });
        return;
      }

      if (!pemFile) {
        resolve({ success: false, error: "PEM file is required" });
        return;
      }

      // Filter out the akv-util-password from the returned secrets
      const filteredSecrets = mockSecrets.filter(
        (secret) => secret.name !== "akv-util-password"
      );

      // Encrypt secret values before returning
      const encryptedSecrets = filteredSecrets.map((secret) => ({
        ...secret,
        value: encryptValue(secret.value, encryptionKey),
      }));

      resolve({ success: true, data: encryptedSecrets });
    }, 1500); // 1.5 second delay to simulate API call
  });
};
