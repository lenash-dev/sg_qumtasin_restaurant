import Image from "next/image";
import Link from "next/link";

export function Brand() {
  return (
    <Link href="/" className="flex items-center gap-3 rounded-2xl px-1 py-1" aria-label="Qumt'asim, ir al panel">
      <span className="relative block size-11 shrink-0 overflow-hidden rounded-full bg-wine-800 ring-1 ring-cream-50/20">
        <Image src="/brand/cholita.png" alt="" width={443} height={469} priority className="absolute top-[8%] left-[-4%] w-[118%] max-w-none" />
      </span>
      <span className="min-w-0">
        <Image src="/brand/wordmark.png" alt="Qumt'asim" width={924} height={194} priority className="h-[18px] w-auto" />
        <span className="mt-1 block text-[0.6rem] font-bold tracking-[0.3em] text-cream-300 uppercase">Sistema de gestión</span>
      </span>
    </Link>
  );
}
