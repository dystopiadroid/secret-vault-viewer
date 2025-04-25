
import React from "react";
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

interface SecretsTableProps {
  secrets: Secret[];
  isDecrypted: boolean;
}

const SecretsTable: React.FC<SecretsTableProps> = ({ secrets, isDecrypted }) => {
  return (
    <div className="rounded-md border border-muted/30 overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/20">
          <TableRow>
            <TableHead className="w-12 text-center">S.No</TableHead>
            <TableHead>Secret Name</TableHead>
            <TableHead>
              Secret Value ({isDecrypted ? "Decrypted" : "Encrypted"})
            </TableHead>
            <TableHead>Created Date</TableHead>
            <TableHead>Last Modified Date</TableHead>
            <TableHead>Expiry Date</TableHead>
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
              <TableRow key={secret.id} className="bg-background/30">
                <TableCell className="text-center">{index + 1}</TableCell>
                <TableCell className="font-medium">{secret.name}</TableCell>
                <TableCell className="font-mono text-sm overflow-hidden text-ellipsis max-w-[200px] truncate">
                  {secret.value}
                </TableCell>
                <TableCell>{formatDate(secret.created)}</TableCell>
                <TableCell>{formatDate(secret.lastModified)}</TableCell>
                <TableCell>
                  {secret.expires ? formatDate(secret.expires) : "No expiry"}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default SecretsTable;
