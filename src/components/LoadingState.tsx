import React from "react";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const LoadingState: React.FC = () => {
  return (
    <Card className="bg-card/60 backdrop-blur-sm border-muted/30">
      <CardContent className="flex flex-col items-center justify-center p-12">
        <div className="p-4 rounded-full bg-muted/20 mb-4">
          <Loader2 className="h-12 w-12 text-azure animate-spin" />
        </div>
        <h3 className="text-xl font-medium mb-2">Fetching Secrets...</h3>
        <p className="text-muted-foreground text-center max-w-md">
          Please wait while we securely connect to your Azure Key Vault and retrieve your secrets.
        </p>
      </CardContent>
    </Card>
  );
};

export default LoadingState; 