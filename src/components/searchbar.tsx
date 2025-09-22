import { SearchIcon } from "lucide-react";
import React from "react";
import { Input } from "./ui/input";

interface SearchbarProps {
  onClick?: () => void;
}

export default function Searchbar({ onClick }: SearchbarProps) {
  return (
    <div className="relative max-w-5xl mx-auto px-4 2xl:p-0" onClick={onClick}>
      <SearchIcon className="absolute left-8 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
      <Input
        placeholder="Search for movie..."
        className="pl-12 py-6 text-lg bg-muted/50 border-0 rounded-full 2xl:pl-16 cursor-pointer"
        readOnly
      />
    </div>
  );
}
