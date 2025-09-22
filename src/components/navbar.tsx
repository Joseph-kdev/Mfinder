import React from "react";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/react-router";

export default function Navbar() {
  return (
    <header className="flex items-center max-w-5xl justify-between mx-auto p-4 2xl:px-0 sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <h1 className="text-2xl font-bold text-foreground">Mfinder</h1>
      <div>
        <SignedOut>
          <SignInButton />
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </header>
  );
}
