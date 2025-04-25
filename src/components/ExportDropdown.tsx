import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import DecryptDialog from "@/components/DecryptDialog";
import { Secret } from "@/services/mockVaultService";
import * as XLSX from "xlsx";
import { decryptValue } from "@/lib/utils";
import { toast } from "sonner";

interface ExportDropdownProps {
  secrets: Secret[];
  encryptionKey: string;
  isDecrypted?: boolean;
}

const ExportDropdown: React.FC<ExportDropdownProps> = ({ 
  secrets, 
  encryptionKey,
  isDecrypted = false
}) => {
  const [decryptDialogOpen, setDecryptDialogOpen] = useState(false);

  const exportToExcel = (decrypted: boolean, key?: string) => {
    // Create a copy of the data for export
    const exportData = secrets.map((secret, index) => {
      const secretValue = decrypted 
        ? (isDecrypted ? secret.value : (key ? decryptValue(secret.value, key) : secret.value))
        : secret.value;
      
      return {
        "S.No": index + 1,
        "Secret Name": secret.name,
        [`Secret Value (${decrypted ? "Decrypted" : "Encrypted"})`]: secretValue,
        "Created Date": formatDate(secret.created),
        "Last Modified Date": formatDate(secret.lastModified),
        "Expiry Date": secret.expires ? formatDate(secret.expires) : "No expiry",
      };
    });

    // Create worksheet and workbook
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Secrets");

    // Generate Excel file
    XLSX.writeFile(workbook, `azure-key-vault-secrets-${decrypted ? "decrypted" : "encrypted"}.xlsx`);
  };

  const handleDecrypt = (key: string) => {
    setDecryptDialogOpen(false);
    if (key === encryptionKey) {
      exportToExcel(true, key);
    } else {
      // Show error if keys don't match
      toast.error("Secret key value is wrong.");
    }
  };

  // Helper function for date formatting in Excel
  const formatDate = (date: Date | string | null | undefined): string => {
    if (!date) return 'N/A';
    
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">Export to Excel</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => exportToExcel(false)}>
            Encrypted (Does not require enc key)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => {
            if (isDecrypted) {
              exportToExcel(true);
            } else {
              setDecryptDialogOpen(true);
            }
          }}>
            Decrypted {isDecrypted ? "(Already decrypted)" : "(Requires enc key)"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DecryptDialog
        open={decryptDialogOpen}
        onOpenChange={setDecryptDialogOpen}
        onDecrypt={handleDecrypt}
        title="Enter Encryption Key for Decrypted Export"
      />
    </>
  );
};

export default ExportDropdown;
