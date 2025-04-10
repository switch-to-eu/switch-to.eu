"use client"

import React from "react"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export interface RegionBadgeProps {
  region: 'eu' | 'non-eu'
  showTooltip?: boolean
  className?: string
}

export function RegionBadge({ region, showTooltip = true, className }: RegionBadgeProps) {
  const variant = region === 'eu' ? 'success' : 'destructive'
  const label = region === 'eu' ? 'EU' : 'Non-EU'
  const tooltipText = region === 'eu'
    ? 'This service is based in the European Union and follows EU regulations'
    : 'This service is based outside the European Union'

  const badge = (
    <Badge
      variant={variant}
      className={className}
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