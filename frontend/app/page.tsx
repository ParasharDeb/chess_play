import Link from "next/link";

export default function Landing() {
  return (
    <div className="h-screen flex flex-col justify-center items-center gap-6">
      <h1 className="text-4xl font-bold">Chess App</h1>

      <Link
        href="/game/new"
        className="px-6 py-3 bg-white text-black rounded-xl"
      >
        Start Playing
      </Link>
    </div>
  );
}
