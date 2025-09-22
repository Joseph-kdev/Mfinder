import React from "react";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/react-router";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="flex items-center max-w-5xl justify-between mx-auto p-4  sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <h1 className="text-3xl font-RubikDirt text-foreground cursor-pointer">
        <Link to="/">Mfinder</Link>
      </h1>
      <div>
        <div className="cursor-pointer">
        <SignedOut>
          <SignInButton />
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
        </div>
      </div>
    </header>
  );
}
