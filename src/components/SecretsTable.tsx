import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Secret } from "@/services/mockVaultService";
import { formatDate } from "@/lib/utils";
import { ChevronDown, ChevronUp, Copy } from "lucide-react";
import { toast } from "sonner";

interface SecretsTableProps {
  secrets: Secret[];
  isDecrypted: boolean;
}

const SecretsTable: React.FC<SecretsTableProps> = ({ secrets, isDecrypted }) => {
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const toggleRowExpansion = (id: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const copyToClipboard = (text: string, secretName: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        toast.success(`Copied ${secretName} to clipboard`);
      },
      () => {
        toast.error("Failed to copy to clipboard");
      }
    );
  };

  return (
    <div className="rounded-md border border-muted/30 overflow-hidden overflow-x-auto">
      <Table>
        <TableHeader className="bg-muted/20">
          <TableRow>
            <TableHead className="w-12 text-center">S.No</TableHead>
            <TableHead className="w-[180px] md:w-auto">Secret Name</TableHead>
            <TableHead className="w-[180px] md:w-auto">
              Secret Value ({isDecrypted ? "Decrypted" : "Encrypted"})
            </TableHead>
            <TableHead className="hidden md:table-cell">Created Date</TableHead>
            <TableHead className="hidden md:table-cell">Last Modified Date</TableHead>
            <TableHead className="hidden md:table-cell">Expiry Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {secrets.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center py-10 text-muted-foreground"
              >
                No secrets found
              </TableCell>
            </TableRow>
          ) : (
            secrets.map((secret, index) => (
              <React.Fragment key={secret.id}>
                <TableRow className="bg-background/30">
                  <TableCell className="text-center">{index + 1}</TableCell>
                  <TableCell 
                    className={`font-medium relative ${
                      expandedRows[`name-${secret.id}`] 
                        ? "whitespace-normal break-words" 
                        : "overflow-hidden text-ellipsis max-w-[150px] truncate"
                    }`}
                  >
                    <div className="flex items-start group">
                      <div 
                        className={`${expandedRows[`name-${secret.id}`] ? "w-full pr-16" : "truncate max-w-[150px]"} cursor-pointer hover:text-azure transition-colors`}
                        onClick={() => toggleRowExpansion(`name-${secret.id}`)}
                      >
                        {secret.name}
                      </div>
                      {secret.name.length > 20 && (
                        <div className="absolute right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            className="p-1 rounded hover:bg-muted"
                            onClick={() => copyToClipboard(secret.name, "name")}
                            title="Copy to clipboard"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                          <button 
                            className="p-1 rounded hover:bg-muted"
                            onClick={() => toggleRowExpansion(`name-${secret.id}`)}
                            title={expandedRows[`name-${secret.id}`] ? "Collapse" : "Expand"}
                          >
                            {expandedRows[`name-${secret.id}`] ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell 
                    className={`font-mono text-sm relative ${
                      expandedRows[`value-${secret.id}`] 
                        ? "whitespace-normal break-words" 
                        : "overflow-hidden text-ellipsis max-w-[200px] truncate"
                    }`}
                  >
                    <div className="flex items-start group">
                      <div 
                        className={`${expandedRows[`value-${secret.id}`] ? "w-full pr-16" : "truncate max-w-[200px]"} cursor-pointer hover:text-azure transition-colors`}
                        onClick={() => toggleRowExpansion(`value-${secret.id}`)}
                      >
                        {secret.value}
                      </div>
                      <div className="absolute right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          className="p-1 rounded hover:bg-muted"
                          onClick={() => copyToClipboard(secret.value, secret.name)}
                          title="Copy to clipboard"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        <button 
                          className="p-1 rounded hover:bg-muted"
                          onClick={() => toggleRowExpansion(`value-${secret.id}`)}
                          title={expandedRows[`value-${secret.id}`] ? "Collapse" : "Expand"}
                        >
                          {expandedRows[`value-${secret.id}`] ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{formatDate(secret.created)}</TableCell>
                  <TableCell className="hidden md:table-cell">{formatDate(secret.lastModified)}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {secret.expires ? formatDate(secret.expires) : "No expiry"}
                  </TableCell>
                </TableRow>
                {/* Mobile-only row for dates */}
                <TableRow className="md:hidden bg-background/30 border-t-0">
                  <TableCell colSpan={3} className="pt-0 text-xs text-muted-foreground">
                    <div className="grid grid-cols-1 gap-1">
                      <div><span className="font-medium">Created:</span> {formatDate(secret.created)}</div>
                      <div><span className="font-medium">Modified:</span> {formatDate(secret.lastModified)}</div>
                      {secret.expires && (
                        <div><span className="font-medium">Expires:</span> {formatDate(secret.expires)}</div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default SecretsTable;
