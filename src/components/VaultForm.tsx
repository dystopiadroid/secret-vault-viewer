import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { useAzureConfig } from "@/hooks/use-azure-config";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface VaultFormProps {
  onFetchSecrets: (
    vaultName: string,
    pemFile: File | null
  ) => Promise<void>;
  isLoading: boolean;
}

const VaultForm: React.FC<VaultFormProps> = ({ onFetchSecrets, isLoading }) => {
  const [vaultName, setVaultName] = useState("");
  const [pemFile, setPemFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const azureConfig = useAzureConfig();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      // Validate file extension (simple check, could be enhanced)
      if (file.name.endsWith(".pem")) {
        setPemFile(file);
        setFileName(file.name);
      } else {
        toast.error("Please upload a valid .pem file");
        e.target.value = ""; // Clear the input
        setPemFile(null);
        setFileName("");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!azureConfig.isConfigured) {
      toast.error("Azure environment variables are not configured");
      return;
    }
    
    if (!vaultName.trim()) {
      toast.error("Please enter a vault name");
      return;
    }

    if (!pemFile) {
      toast.error("Please upload a PEM file");
      return;
    }

    await onFetchSecrets(vaultName, pemFile);
  };

  return (
    <Card className="mb-8 bg-card/60 backdrop-blur-sm border-muted/30">
      <CardContent className="pt-6">
        {!azureConfig.isConfigured && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Azure Configuration Error</AlertTitle>
            <AlertDescription>
              Azure environment variables are missing. Please add VITE_AZURE_TENANT_ID and VITE_AZURE_CLIENT_ID to your .env file.
            </AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Vault Name Input */}
            <div className="space-y-2">
              <Label htmlFor="vaultName">Vault Name</Label>
              <Input
                id="vaultName"
                placeholder="Enter Azure vault name"
                value={vaultName}
                onChange={(e) => setVaultName(e.target.value)}
                className="bg-background/50"
              />
            </div>

            {/* PEM File Upload */}
            <div className="space-y-2">
              <Label htmlFor="pemFile">PEM File</Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full bg-background/50 truncate"
                  onClick={() =>
                    document.getElementById("pemFileInput")?.click()
                  }
                >
                  {fileName || "Upload PEM File"}
                </Button>
                <Input
                  id="pemFileInput"
                  type="file"
                  accept=".pem"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isLoading || !azureConfig.isConfigured}
              className="px-6 bg-azure hover:bg-azure-dark"
            >
              {isLoading ? "Fetching Secrets..." : "Connect & Fetch Secrets"}
            </Button>
          </div>
        </form>
      </CardContent>
      
      {azureConfig.isConfigured && (
        <CardFooter className="bg-muted/10 text-xs text-muted-foreground">
          <p>
            Configured with Azure Tenant ID: {azureConfig.tenantId.slice(0, 4)}...{azureConfig.tenantId.slice(-4)} | 
            Client ID: {azureConfig.clientId.slice(0, 4)}...{azureConfig.clientId.slice(-4)}
          </p>
        </CardFooter>
      )}
    </Card>
  );
};

export default VaultForm;
