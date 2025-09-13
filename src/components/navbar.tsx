import React from 'react'
import { Button } from './ui/button'
import { User } from 'lucide-react'

export default function Navbar() {
  return (
    <header className="flex items-center max-w-4xl justify-between mx-auto p-4 2xl:p-0">
        <h1 className="text-2xl font-bold text-foreground">Mfinder</h1>
        <Button variant="ghost" size="icon" className="rounded-full">
          <User className="h-5 w-5" />
        </Button>
      </header>
  )
}
