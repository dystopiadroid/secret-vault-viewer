
import React from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  totalSecrets: number;
}

const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  onSearchChange,
  totalSecrets,
}) => {
  return (
    <div className="relative mb-4 w-full md:w-96">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder="Search secret names..."
        className="pl-10 bg-background/50"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      <div className="text-xs text-muted-foreground mt-1">
        {totalSecrets} {totalSecrets === 1 ? "secret" : "secrets"} found
      </div>
    </div>
  );
};

export default SearchBar;
