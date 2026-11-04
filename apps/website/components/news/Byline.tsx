import Image from "next/image";
import { getAuthor } from "@/lib/authors";

/** Photo and "By name". Renders nothing for an author without a profile. */
export function Byline({
  name,
  label,
  className = "",
}: {
  name: string;
  label: string;
  className?: string;
}) {
  const author = getAuthor(name);
  if (!author) return null;
  return (
    <p className={`flex items-center gap-3 ${className}`}>
      <Image
        src={author.photo}
        alt=""
        width={40}
        height={40}
        className="h-10 w-10 rounded-full object-cover"
      />
      <span className="font-semibold">{label}</span>
    </p>
  );
}
