import { Container } from "@switch-to-eu/blocks/components/container";
import { Banner } from "@switch-to-eu/blocks/components/banner";

export default function Loading() {
  return (
    <Container noPaddingMobile>
      <div className="inline-flex items-center gap-1.5 text-brand-green/40 text-sm mb-3 px-4 sm:px-0 pt-2">
        <span>&larr;</span>
        <span className="h-3 w-20 bg-brand-green/10 rounded animate-pulse" />
      </div>
      <Banner color="bg-brand-navy">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">
          <div className="space-y-4">
            <div className="h-12 w-2/3 bg-white/10 rounded animate-pulse" />
            <div className="h-4 w-full bg-white/10 rounded animate-pulse" />
            <div className="h-4 w-5/6 bg-white/10 rounded animate-pulse" />
            <div className="flex gap-2 pt-2">
              <div className="h-8 w-32 bg-white/10 rounded-full animate-pulse" />
              <div className="h-8 w-40 bg-white/10 rounded-full animate-pulse" />
            </div>
          </div>
          <div className="h-48 md:h-64 w-full bg-white/5 rounded-2xl animate-pulse" />
        </div>
      </Banner>
    </Container>
  );
}
