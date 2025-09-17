import { fetchGenres, fetchMoviesByGenre } from "@/services/movies";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Skeleton } from "./ui/skeleton";
import type { Genre, Movie } from "@/types";
import { Button } from "./ui/button";
import { motion } from "motion/react";
import Moviecard from "./moviecard";
import { ChevronsLeft, ChevronsRight } from "lucide-react";

export default function Genrefilter() {
  const [dragConstraints, setDragConstraints] = useState({ left: 0, right: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [page, setPage] = useState(1);

  const {
    data: genres,
    isLoading,
    isError,
  } = useQuery<Genre[]>({
    queryKey: ["genres"],
    queryFn: fetchGenres,
  });

  useEffect(() => {
    const updateConstraints = () => {
      if (containerRef.current && contentRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const contentWidth = contentRef.current.scrollWidth;
        const maxDrag = Math.max(0, contentWidth - containerWidth);
        setDragConstraints({ left: -maxDrag, right: 0 });
      }
    };

    updateConstraints();
    window.addEventListener("resize", updateConstraints);
    return () => window.removeEventListener("resize", updateConstraints);
  }, [genres, isLoading]);

  const handleGenreChange = async (genreId: number) => {
    const updatedGenres = selectedGenres.includes(genreId)
      ? selectedGenres.filter((id) => genreId !== id)
      : [...selectedGenres, genreId];
    setSelectedGenres(updatedGenres);
    setPage(1);
  };

  const { data: movieByGenres, isFetching } = useQuery({
    queryKey: ["movieByGenres", selectedGenres, page],
    queryFn: () => fetchMoviesByGenre({ selectedGenres, page }),
    placeholderData: keepPreviousData,
  });

  const totalPages = movieByGenres ? movieByGenres.total_pages : 5;

  const getPaginationNumbers = (
    currentPage: number,
    totalPages: number,
    visiblePages = 5
  ) => {
    let startPage = Math.max(1, currentPage - Math.floor(visiblePages / 2));
    const endPage = Math.min(totalPages, startPage + visiblePages - 1);

    if (endPage - startPage + 1 < visiblePages) {
      startPage = Math.max(1, endPage - visiblePages + 1);
    }

    const pageNumbers = [];
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return pageNumbers;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 2xl:p-0 min-h-screen">
      <div className="flex gap-2 mt-4 items-center">
        <div className="">
          <p className="min-w-[120px]">Pick by genres:</p>
        </div>
        <div
          className="flex-1 gap-2 overflow-hidden py-2 no-scrollbar cursor-grab active:cursor-grabbing"
          ref={containerRef}
        >
          <motion.div
            ref={contentRef}
            drag="x"
            dragConstraints={dragConstraints}
            dragElastic={0.1}
            dragMomentum={true}
            whileDrag={{ cursor: "grabbing" }}
            className="flex gap-2 w-fit"
          >
            {isLoading ? (
              <div className="flex gap-2">
                <Skeleton className="h-5 min-w-[60px] bg-amber-500" />
                <Skeleton className="h-5 min-w-[80px] bg-amber-500" />
                <Skeleton className="h-5 min-w-[100px] bg-amber-500" />
                <Skeleton className="h-5 min-w-[50px] bg-amber-500" />
                <Skeleton className="h-5 min-w-[50px] bg-amber-500" />
                <Skeleton className="h-5 min-w-[150px] bg-amber-500" />
              </div>
            ) : isError ? (
              <p>"Error fetching genres"</p>
            ) : (
              genres?.map((genre, index) => (
                <Button
                  variant="outline"
                  key={genre.id}
                  onClick={() => handleGenreChange(genre.id)}
                  style={{
                    "--genreIndex": index + 1,
                    backgroundColor: selectedGenres.includes(genre.id)
                      ? "#a3dcbc"
                      : "",
                  }}
                  className="wavy-fade"
                >
                  {genre.name}
                </Button>
              ))
            )}
          </motion.div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2 sm:gap-4 justify-items-center min-h-[800px] md:min-h-[760px]">
          {isFetching
            ? Array.from({ length: 20 }).map((_, index) => (
                <div key={index} className="w-full h-auto">
                  <div className="relative aspect-[2/3] overflow-hidden">
                    <Skeleton className="w-full h-full" />
                    <div className="absolute top-2 right-2">
                      <Skeleton className="h-6 w-12 rounded-md" />
                    </div>
                    <div className="mt-2">
                      <Skeleton className="h-4 w-full bg-white" />
                    </div>
                  </div>
                </div>
              ))
            : movieByGenres.results.map((movie: Movie) => (
                <div key={movie.id}>
                  <Moviecard movie={movie} />
                </div>
              ))}
      </div>
      <div className="flex items-center justify-center gap-2 my-8">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setPage((prev) => (prev > 1 ? prev - 1 : 1))}
          disabled={page === 1}
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>

        {getPaginationNumbers(page, totalPages).map((pageNumber) => (
          <Button
            key={pageNumber}
            variant={pageNumber === page ? "default" : "ghost"}
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={() => setPage(pageNumber)}
          >
            {pageNumber}
          </Button>
        ))}

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setPage((prev) => prev + 1)}
          disabled={isFetching}
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
