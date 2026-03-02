import { cn } from "@switch-to-eu/ui/lib/utils";
import { Container } from "./container";

export function Section({
  className,
  containerClassName,
  children,
  ...props
}: React.HTMLAttributes<HTMLElement> & { containerClassName?: string }) {
  return (
    <section className={cn("py-12 sm:py-16 md:py-20", className)} {...props}>
      <Container className={containerClassName}>{children}</Container>
    </section>
  );
}
