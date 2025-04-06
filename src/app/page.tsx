import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
      <h1 className="text-4xl font-bold font-heading mb-4 text-gray-800">
        Welcome to Maxi Yatzy Online!
      </h1>
      <p className="text-lg text-gray-600 mb-8 max-w-md">
        Ready to roll the dice? Sign in or create an account using the options in the header to start playing.
      </p>
      {/* You could add a primary call to action button here later, e.g.: */}
      {/* 
      <Link href="/play"> 
        <Button size="lg">Start Playing</Button>
      </Link> 
      */}
    </div>
  );
}
