import React from "react";
import { Button } from "./ui/button";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/react-router";

export default function Navbar() {
  return (
    <header className="flex items-center max-w-4xl justify-between mx-auto p-4 2xl:p-0">
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
