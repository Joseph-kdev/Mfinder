import { SearchIcon } from "lucide-react";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDebounceValue } from "usehooks-ts";
import { searchMovies } from "@/services/movies";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import MovieList from "./MovieList";
import type { Movie } from "@/types";
import '../global.css'

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SearchDialog({
  open,
  onOpenChange,
}: SearchDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery] = useDebounceValue(searchQuery, 500);

  const {
    data: searchResults,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["searchMovies", debouncedQuery],
    queryFn: () => searchMovies(debouncedQuery),
    enabled: !!debouncedQuery.trim(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const movies: Movie[] = searchResults?.results || [];

  const handleClose = () => {
    setSearchQuery("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="!max-w-5xl !w-[calc(100%-2rem)] sm:!w-[calc(100%-4rem)] h-[90vh] overflow-hidden flex flex-col mx-auto p-1 md:p-4 no-scrollbar">
        <DialogHeader>
          <DialogTitle className="text-center">Search</DialogTitle>
        </DialogHeader>

        <div className="relative max-w-4xl mx-auto px-4 2xl:p-0 w-full">
          <SearchIcon className="absolute left-8 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
          <Input
            placeholder="Search for movie..."
            className="pl-12 py-6 text-lg bg-muted/50 border-0 rounded-full 2xl:pl-16"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
        </div>

        <div className="flex-1 overflow-y-auto min-h-0">
          {isLoading && debouncedQuery && (
            <div className="flex justify-center items-center py-12">
              <div className="text-muted-foreground">Searching...</div>
            </div>
          )}

          {error && (
            <div className="flex justify-center items-center py-12">
              <div className="text-red-500">
                Error searching movies. Please try again.
              </div>
            </div>
          )}

          {!debouncedQuery && (
            <div className="flex justify-center items-center py-12">
              <div className="text-muted-foreground">
                Start typing to search for movies...
              </div>
            </div>
          )}

          {debouncedQuery && !isLoading && movies.length === 0 && !error && (
            <div className="flex justify-center items-center py-12">
              <div className="text-muted-foreground">
                No movies found for "{debouncedQuery}"
              </div>
            </div>
          )}

          {movies.length > 0 && (
            <div className="pb-4">
              <MovieList movieResults={movies} />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
