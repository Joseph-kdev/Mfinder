import { SignUp } from '@clerk/react-router'
import React from 'react'

export default function SignUpPage() {
  return (
    <div className='h-screen w-full flex justify-center items-center bg-[url("/images/background.jpg")] relative'>
      <div className='absolute inset-0 bg-[rgba(0,0,0,0.75)]'></div>
      <SignUp />
    </div>
  )
}
