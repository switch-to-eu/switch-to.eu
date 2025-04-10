import React from "react"
import Link from "next/link"
import { ChevronRightIcon, HomeIcon } from "@radix-ui/react-icons"
import { cn } from "@/lib/utils"

interface BreadcrumbsProps extends React.HTMLAttributes<HTMLDivElement> {
  segments: {
    name: string
    href: string
    isLast?: boolean
  }[]
  separator?: React.ReactNode
  home?: React.ReactNode
}

export function Breadcrumbs({
  segments,
  separator = <ChevronRightIcon className="h-4 w-4" />,
  home = <HomeIcon className="h-4 w-4" />,
  className,
  ...props
}: BreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumbs"
      className={cn(
        "flex items-center text-sm text-muted-foreground",
        className
      )}
      {...props}
    >
      <ol className="flex flex-wrap items-center gap-1.5">
        <li>
          <Link
            href="/"
            className="flex items-center gap-1 text-foreground hover:text-foreground/80"
          >
            {home}
            <span className="sr-only">Home</span>
          </Link>
        </li>
        {segments.map((segment, index) => (
          <li key={index} className="flex items-center gap-1.5">
            <span className="text-muted-foreground">{separator}</span>
            {segment.isLast ? (
              <span className="font-medium text-foreground" aria-current="page">
                {segment.name}
              </span>
            ) : (
              <Link
                href={segment.href}
                className="hover:text-foreground"
              >
                {segment.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}