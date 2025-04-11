import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export const ContributeCta = () => {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 bg-[var(--green-bg)] p-4 sm:p-6 rounded-lg">
      <div className="w-40 h-40 sm:w-56 sm:h-56 relative flex-shrink-0 mr-6">
        <Image
          src="/images/contribute.svg"
          alt="Helper character illustration"
          fill
          className="object-contain p-4"
        />
      </div>
      <div className="flex-1">
        <h2 className="font-bold text-xl sm:text-2xl text-slate-800 mb-2 sm:mb-3">
          Can&apos;t find what you&apos;re looking for?
        </h2>
        <p className="text-slate-700 mb-4 sm:mb-6">
          If you have suggestions for new alternatives, consider
          contributing to the project!
        </p>
        <Button variant="red" asChild>
          <Link href="/contribute">Contribute Now</Link>
        </Button>
      </div>
    </div>
  );
};