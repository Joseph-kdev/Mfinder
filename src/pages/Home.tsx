import Genrefilter from "@/components/genrefilter";
import Navbar from "@/components/navbar";
import SearchDialog from "@/components/Search";
import Searchbar from "@/components/searchbar";
import { useState } from "react";

export default function Home() {
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);

  const handleSearchClick = () => {
    console.log("clicked")
    setIsSearchDialogOpen(true);
  };

  return (
    <div className="min-h-screen pb-4 bg-background dark:bg-background">
      <Navbar />
      <div className="mt-4 cursor-pointer">
        <Searchbar onClick={handleSearchClick} />
      </div>
      <Genrefilter />
      
      <SearchDialog
        open={isSearchDialogOpen} 
        onOpenChange={setIsSearchDialogOpen} 
      />
    </div>
  );
}
