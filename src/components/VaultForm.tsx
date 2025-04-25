import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface VaultFormProps {
  onFetchSecrets: (
    vaultName: string,
    pemFile: File | null,
    tenantId: string,
    clientId: string
  ) => Promise<void>;
  isLoading: boolean;
}

const VaultForm: React.FC<VaultFormProps> = ({ onFetchSecrets, isLoading }) => {
  const [vaultName, setVaultName] = useState("");
  const [pemFile, setPemFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [tenantId, setTenantId] = useState("");
  const [clientId, setClientId] = useState("");

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
    
    if (!vaultName.trim()) {
      toast.error("Please enter a vault name");
      return;
    }

    if (!tenantId.trim()) {
      toast.error("Please enter a Tenant ID");
      return;
    }

    if (!clientId.trim()) {
      toast.error("Please enter a Client ID");
      return;
    }

    if (!pemFile) {
      toast.error("Please upload a PEM file");
      return;
    }

    await onFetchSecrets(vaultName, pemFile, tenantId, clientId);
  };

  return (
    <Card className="mb-8 bg-card/60 backdrop-blur-sm border-muted/30">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Vault Name Input - Full Width */}
          <div className="space-y-2">
            <Label htmlFor="vaultName">Vault Name</Label>
            <Input
              id="vaultName"
              placeholder="Enter Azure vault name"
              value={vaultName}
              onChange={(e) => setVaultName(e.target.value)}
              className="bg-background/50"
              disabled={isLoading}
            />
          </div>

          {/* Azure Credentials - Two Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tenant ID Input */}
            <div className="space-y-2">
              <Label htmlFor="tenantId">Tenant ID</Label>
              <Input
                id="tenantId"
                placeholder="Enter Azure Tenant ID"
                value={tenantId}
                onChange={(e) => setTenantId(e.target.value)}
                className="bg-background/50"
                disabled={isLoading}
              />
            </div>

            {/* Client ID Input */}
            <div className="space-y-2">
              <Label htmlFor="clientId">Client ID</Label>
              <Input
                id="clientId"
                placeholder="Enter Azure Client ID"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="bg-background/50"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* PEM File Upload - Full Width */}
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
                disabled={isLoading}
              >
                {fileName || "Upload PEM File"}
              </Button>
              <Input
                id="pemFileInput"
                type="file"
                accept=".pem"
                className="hidden"
                onChange={handleFileChange}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isLoading}
              className="px-6 bg-azure hover:bg-azure-dark"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span>Fetching Secrets...</span>
                </>
              ) : (
                "Connect & Fetch Secrets"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default VaultForm;
