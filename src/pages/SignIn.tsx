import { SignIn } from '@clerk/react-router'

export default function SignInPage() {
  return (
    <div className='h-screen w-full flex justify-center items-center bg-[url("/images/background.jpg")] relative'>
      <div className='absolute inset-0 bg-[rgba(0,0,0,0.75)]'></div>
      <SignIn />
    </div>
  )
}