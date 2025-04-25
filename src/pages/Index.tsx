import React, { useState } from "react";
import VaultHeader from "@/components/VaultHeader";
import VaultForm from "@/components/VaultForm";
import SearchBar from "@/components/SearchBar";
import SecretsTable from "@/components/SecretsTable";
import EmptyState from "@/components/EmptyState";
import LoadingState from "@/components/LoadingState";
import { Secret } from "@/services/mockVaultService";
import { fetchVaultSecrets } from "@/services/vaultService";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import DecryptDialog from "@/components/DecryptDialog";
import ExportDropdown from "@/components/ExportDropdown";
import { decryptValue } from "@/lib/utils";

const Index: React.FC = () => {
  const [secrets, setSecrets] = useState<Secret[]>([]);
  const [filteredSecrets, setFilteredSecrets] = useState<Secret[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [encryptionKey, setEncryptionKey] = useState("");
  const [isDecrypted, setIsDecrypted] = useState(false);
  const [decryptDialogOpen, setDecryptDialogOpen] = useState(false);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredSecrets(secrets);
      return;
    }

    const filtered = secrets.filter((secret) =>
      secret.name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredSecrets(filtered);
  };

  const handleFetchSecrets = async (
    vaultName: string,
    pemFile: File | null
  ) => {
    setIsLoading(true);
    try {
      // Fetch secrets with real Azure Key Vault integration
      const response = await fetchVaultSecrets(vaultName, pemFile);

      if (response.success && response.data) {
        // Use the encryption key from the vault response
        if (response.encryptionKey) {
          setEncryptionKey(response.encryptionKey);
        } else {
          // Fallback in case encryptionKey is not returned
          console.warn("Encryption key not returned from vault");
          setEncryptionKey("");
        }
        
        setSecrets(response.data);
        setFilteredSecrets(response.data);
        setSearchQuery("");
        setIsDecrypted(false);
        toast.success("Secrets fetched successfully");
      } else {
        toast.error(response.error || "Failed to fetch secrets");
      }
    } catch (error) {
      toast.error("An error occurred while fetching secrets");
      console.error("Error fetching secrets:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecryptAll = (key: string) => {
    setDecryptDialogOpen(false);
    
    if (key !== encryptionKey) {
      toast.error("Secret key value is wrong.");
      return;
    }

    // Decrypt all secrets
    const decryptedSecrets = secrets.map(secret => ({
      ...secret,
      value: decryptValue(secret.value, key)
    }));
    
    setSecrets(decryptedSecrets);
    
    // Update filtered secrets if search is active
    const decryptedFilteredSecrets = filteredSecrets.map(secret => ({
      ...secret,
      value: decryptValue(secret.value, key)
    }));
    
    setFilteredSecrets(decryptedFilteredSecrets);
    setIsDecrypted(true);
    toast.success("All secrets decrypted successfully");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-card pb-10">
      <div className="container mx-auto py-10 px-4">
        <VaultHeader title="AKV UTIL" />
        
        <VaultForm onFetchSecrets={handleFetchSecrets} isLoading={isLoading} />

        {isLoading ? (
          <LoadingState />
        ) : secrets.length > 0 ? (
          <>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
              <SearchBar
                searchQuery={searchQuery}
                onSearchChange={handleSearchChange}
                totalSecrets={filteredSecrets.length}
              />
              
              <div className="flex items-center space-x-2">
                {!isDecrypted && (
                  <Button 
                    variant="outline" 
                    onClick={() => setDecryptDialogOpen(true)}
                  >
                    Decrypt All
                  </Button>
                )}
                
                <ExportDropdown 
                  secrets={filteredSecrets} 
                  encryptionKey={encryptionKey} 
                  isDecrypted={isDecrypted}
                />
              </div>
            </div>

            <SecretsTable 
              secrets={filteredSecrets} 
              isDecrypted={isDecrypted} 
            />
          </>
        ) : (
          <EmptyState />
        )}
        
        <DecryptDialog
          open={decryptDialogOpen}
          onOpenChange={setDecryptDialogOpen}
          onDecrypt={handleDecryptAll}
        />
      </div>
    </div>
  );
};

export default Index;
