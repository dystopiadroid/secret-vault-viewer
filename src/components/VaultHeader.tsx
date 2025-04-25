
import React from "react";
import { cn } from "@/lib/utils";

interface VaultHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
}

const VaultHeader: React.FC<VaultHeaderProps> = ({
  title,
  className,
  ...props
}) => {
  return (
    <header className={cn("mb-8 text-center", className)} {...props}>
      <h1 className="text-4xl font-bold tracking-wider text-foreground">
        {title}
      </h1>
      <div className="mt-2 text-muted-foreground">
        Securely access and manage your Azure Key Vault secrets
      </div>
    </header>
  );
};

export default VaultHeader;
