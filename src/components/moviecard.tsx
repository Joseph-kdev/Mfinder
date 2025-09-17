import type { Movie } from "@/types";
import { Star } from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useOnClickOutside } from "usehooks-ts";
import { Button } from "./ui/button";

export default function Moviecard({ movie }: { movie: Movie }) {
  const [clicked, setClicked] = useState<Movie | null>(null);
  const ref = useRef(null);

  useOnClickOutside(ref, () => setClicked(null));

  return (
    <div>
      <motion.div
        className="aspect-[2/3] cursor-pointer relative"
        layoutId={`movie-${movie.id}`}
        whileHover={{ scale: 1.03 }}
        onClick={() => setClicked(movie)}
      >
        <motion.div layoutId={`movie-rating-${movie.id}`} className="flex items-center gap-1 absolute top-1 right-1">
          <Star className="w-5 h-5 border-0" color="gold" fill="gold" />
          <p className="text-[gold]">{movie.vote_average.toFixed(1)}</p>
        </motion.div>
        <motion.img
          layoutId={`movie-img-${movie.id}`}
          className="w-full h-auto"
          src={
            movie.poster_path
              ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
              : `https://placehold.co/600x400/1a1a1a/FFFFFF.png`
          }
          alt={`${movie.title}`}
        />
      </motion.div>
      {clicked ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-[rgba(0,0,0,0.7)] flex justify-center items-center z-50"
        >
          <motion.div
            layoutId={`movie-${movie.id}`}
            className="p-4 rounded-lg bg-white"
            ref={ref}
          >
            <div className="flex gap-2 items-start max-w-[500px] relative">
              <div className="min-w-[120px]">
                {" "}
                <motion.div layoutId={`movie-rating-${movie.id}`} className="flex items-center gap-1 absolute top-0 right-1">
                  <Star className="w-5 h-5 border-0" color="gold" fill="gold" />
                  <p className="text-[gold]">{movie.vote_average.toFixed(1)}</p>
                </motion.div>
                <motion.img
                  className="w-full h-[180px]"
                  layoutId={`movie-img-${movie.id}`}
                  src={
                    movie.poster_path
                      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                      : `https://placehold.co/600x400/1a1a1a/FFFFFF.png`
                  }
                  alt={movie.title}
                />
              </div>
              <div>
                <div>
                  <motion.h3
                    layoutId={`movie-title-${movie.id}`}
                    className="font-serif text-lg md:text-xl pr-4"
                  >
                    {movie.title}
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0, filter: "blur(4px)" }}
                    animate={{ opacity: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0, filter: "blur(4px)" }}
                    className="font-sans text-sm"
                  >
                    {movie.overview}
                  </motion.p>
                </div>
              </div>
            </div>
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              whileTap={{ scale: 0.95 }}
              className="w-full mt-1"
            >
              <Button variant="default" className="w-full">
                <Link
                  to={`/movie/${movie.id}`}
                  className="m-1 bg-light-accent dark:bg-dark-accent p-2 rounded-md font-Tilt_Neon flex justify-center text-dark-background dark:text-light-background"
                >
                  More
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      ) : null}
    </div>
  );
}
