
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DecryptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDecrypt: (key: string) => void;
  title?: string;
}

const DecryptDialog: React.FC<DecryptDialogProps> = ({
  open,
  onOpenChange,
  onDecrypt,
  title = "Enter Encryption Key",
}) => {
  const [encryptionKey, setEncryptionKey] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onDecrypt(encryptionKey);
    setEncryptionKey("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="encryptionKey">akv-util-password</Label>
              <Input
                id="encryptionKey"
                type="password"
                placeholder="Enter encryption key"
                value={encryptionKey}
                onChange={(e) => setEncryptionKey(e.target.value)}
                className="bg-background/50"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Submit</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DecryptDialog;
