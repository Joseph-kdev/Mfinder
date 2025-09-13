import Genrefilter from "@/components/genrefilter";
import Navbar from "../components/navbar";
import Searchbar from "../components/searchbar";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="mt-4 cursor-pointer">
        <Searchbar />
      </div>
      <Genrefilter />
    </div>
  );
}
