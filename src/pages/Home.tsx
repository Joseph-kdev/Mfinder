import Genrefilter from "@/components/GenreFilter";
import Navbar from "@/components/navbar";
import Searchbar from "@/components/searchbar";
import { Search } from "lucide-react";
import { useState } from "react";

export default function Home() {
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);

  const handleSearchClick = () => {
    setIsSearchDialogOpen(true);
  };

  return (
    <div className="min-h-screen pb-4">
      <Navbar />
      <div className="mt-4 cursor-pointer">
        <Searchbar onClick={handleSearchClick} />
      </div>
      <Genrefilter />
      
      <Search
        open={isSearchDialogOpen} 
        onOpenChange={setIsSearchDialogOpen} 
      />
    </div>
  );
}
