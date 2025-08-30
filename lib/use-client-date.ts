"use client"

import { useState, useEffect } from "react"

/**
 * Hook to safely get the current date on the client side
 * Prevents hydration mismatches by returning null during SSR
 */
export function useClientDate() {
  const [currentDate, setCurrentDate] = useState<Date | null>(null)

  useEffect(() => {
    setCurrentDate(new Date())
  }, [])

  return currentDate
}

/**
 * Hook to get stable date references that won't cause hydration issues
 */
export function useStableDates() {
  const [dates, setDates] = useState<{
    now: Date | null
    today: Date | null
    weekFromNow: Date | null
    monthFromNow: Date | null
    weekAgo: Date | null
  }>({
    now: null,
    today: null,
    weekFromNow: null,
    monthFromNow: null,
    weekAgo: null,
  })

  useEffect(() => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
    const monthFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    setDates({
      now,
      today,
      weekFromNow,
      monthFromNow,
      weekAgo,
    })
  }, [])

  return dates
}
