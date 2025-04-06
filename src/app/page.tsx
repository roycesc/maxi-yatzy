import Image from "next/image";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-heading mb-4">Maxi Yatzy Online</h1>
      <p className="text-lg text-neutral mb-8">Coming soon!</p>
      {/* Add Login/Signup buttons or links later */}
      {/* Example Login Button (requires NextAuth setup) */}
      {/* <button className="px-6 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90">
        Login
      </button> */}
    </div>
  );
}
