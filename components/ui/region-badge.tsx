"use client"

import React from "react"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export interface RegionBadgeProps {
  region: 'eu' | 'non-eu' | 'eu-friendly'
  showTooltip?: boolean
  className?: string
}

export function RegionBadge({ region, showTooltip = true, className }: RegionBadgeProps) {
  let variant: "default" | "success" | "destructive" | "secondary" | "outline" | null | undefined = 'default'
  let label = ''
  let tooltipText = ''

  // Define badge class based on region type
  let badgeClass = ''

  if (region === 'eu') {
    variant = 'success'
    label = 'EU'
    tooltipText = 'This service is based in the European Union and follows EU regulations'
  } else if (region === 'eu-friendly') {
    variant = 'default' // Will be overridden by our custom class
    label = 'EU-Friendly'
    tooltipText = 'This service is based outside the EU but adheres to EU privacy standards'
    badgeClass = 'badge-eu-friendly'
  } else {
    variant = 'destructive'
    label = 'Non-EU'
    tooltipText = 'This service is based outside the European Union'
  }

  const badge = (
    <Badge
      variant={variant}
      className={cn(badgeClass, className)}
    >
      {label}
    </Badge>
  )

  if (!showTooltip) {
    return badge
  }

  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <span className="cursor-help">{badge}</span>
        </TooltipTrigger>
        <TooltipContent>
          <p className="whitespace-nowrap font-medium text-slate-800">{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}