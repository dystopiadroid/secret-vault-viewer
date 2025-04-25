
import React from "react";
import { LockKeyhole } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const EmptyState: React.FC = () => {
  return (
    <Card className="bg-card/60 backdrop-blur-sm border-muted/30">
      <CardContent className="flex flex-col items-center justify-center p-12">
        <div className="p-4 rounded-full bg-muted/20 mb-4">
          <LockKeyhole className="h-12 w-12 text-azure" />
        </div>
        <h3 className="text-xl font-medium mb-2">No Secrets Loaded</h3>
        <p className="text-muted-foreground text-center max-w-md">
          Enter your Azure Key Vault details above and upload a PEM file to securely
          fetch and view your vault secrets.
        </p>
      </CardContent>
    </Card>
  );
};

export default EmptyState;
