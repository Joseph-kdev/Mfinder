import type { Movie } from "@/types";
import { Star } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useOnClickOutside } from "usehooks-ts";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";

export default function MovieList({ movieResults }: { movieResults: Movie[] }) {
  const ref = useRef(null);
  const [hoveredMovie, setHoveredMovie] = useState<number | null>(null);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  useOnClickOutside(ref, () => setSelectedMovie(null));

  const shouldPositionLeft = (index: number) => {
    const screenWidth = window.innerWidth;
    let cols = 2; 
    if (screenWidth >= 768) cols = 5; 
    else if (screenWidth >= 640) cols = 4; 
    
    return (index + 1) % cols === 0;
  };

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2 sm:gap-4 justify-items-center">
      {movieResults.map((movie: Movie, index: number) => (
        <div key={movie.id} className="relative">
          <motion.div
            className="cursor-pointer"
            onHoverStart={() => setHoveredMovie(movie.id)}
            onHoverEnd={() => setHoveredMovie(null)}
            layout
          >
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full"
            >
              <motion.div
                layoutId={`movie-rating-${movie.id}`}
                className="flex items-center gap-1 absolute top-2 left-2 z-10 bg-black/70 text-white px-2 py-1 rounded-md text-xs"
              >
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <p className="text-yellow-400">
                  {movie.vote_average.toFixed(1)}
                </p>
              </motion.div>
              <motion.img
                layoutId={`movie-img-${movie.id}`}
                className="w-full h-full object-cover rounded-lg"
                src={
                  movie.poster_path
                    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                    : `https://placehold.co/600x400/1a1a1a/FFFFFF.png`
                }
                alt={movie.title}
                onClick={() => setSelectedMovie(movie)}
              />
            </motion.div>

            <AnimatePresence>
              {hoveredMovie === movie.id && (
                <motion.div
                  initial={{ opacity: 0, width: "400px" }}
                  animate={{ opacity: 1, width: "400px" }}
                  exit={{ opacity: 0, width: "400px" }}
                  transition={{ duration: 0.3 }}
                  className={`absolute top-0 z-20 p-4 rounded-lg bg-card border border-border shadow-2xl hidden lg:block ${
                    shouldPositionLeft(index) ? 'right-0' : 'left-0'
                  }`}
                >
                  <div className="flex gap-4 items-start max-w-[400px] relative">
                    <div className="min-w-[120px] relative">
                      <motion.div
                        layoutId={`movie-rating-${movie.id}`}
                        className="flex items-center gap-1 absolute -top-2 -right-2 z-10 bg-black/70 text-white px-2 py-1 rounded-md text-xs"
                      >
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <p className="text-yellow-400">
                          {movie.vote_average.toFixed(1)}
                        </p>
                      </motion.div>
                      <motion.img
                        className="w-full h-[200px] object-cover rounded-lg"
                        layoutId={`movie-img-${movie.id}`}
                        src={
                          movie.poster_path
                            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                            : `https://placehold.co/600x400/1a1a1a/FFFFFF.png`
                        }
                        alt={movie.title}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="space-y-3">
                        <motion.h3
                          layoutId={`movie-title-${movie.id}`}
                          className="font-semibold text-lg leading-tight text-foreground"
                        >
                          {movie.title}
                        </motion.h3>
                        <motion.p
                          initial={{ opacity: 0, filter: "blur(4px)" }}
                          animate={{ opacity: 1, filter: "blur(0px)" }}
                          exit={{ opacity: 0, filter: "blur(4px)" }}
                          transition={{ delay: 0.1 }}
                          className="text-sm text-muted-foreground line-clamp-4 leading-relaxed"
                        >
                          {movie.overview}
                        </motion.p>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            {new Date(movie.release_date).getFullYear()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ delay: 0.2 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full mt-4"
                  >
                    <Button asChild variant="default" className="w-full">
                      <Link to={`/movie/${movie.id}`}>View Details</Link>
                    </Button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      ))}
      <Dialog
        open={!!selectedMovie}
        onOpenChange={() => setSelectedMovie(null)}
      >
        <DialogContent className="max-w-sm mx-auto">
          {selectedMovie && (
            <>
              <DialogHeader>
                <DialogTitle className="text-left">
                  {selectedMovie.title}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="relative">
                  <img
                    src={
                      selectedMovie.poster_path
                        ? `https://image.tmdb.org/t/p/w500${selectedMovie.poster_path}`
                        : `https://placehold.co/600x400/1a1a1a/FFFFFF.png`
                    }
                    alt={selectedMovie.title}
                    className="w-full h-64 object-cover object-top rounded-lg"
                  />
                  <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/70 text-white px-2 py-1 rounded-md text-xs">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-yellow-400">
                      {selectedMovie.vote_average.toFixed(1)}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedMovie.release_date).getFullYear()}
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {selectedMovie.overview}
                  </p>
                </div>
                <Button asChild className="w-full">
                  <Link to={`/movie/${selectedMovie.id}`}>
                    View Full Details
                  </Link>
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
