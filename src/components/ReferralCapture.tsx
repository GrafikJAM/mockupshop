'use client'
import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { captureReferralFromUrl } from '@/lib/referral'

// Mounted globally (see layout.tsx). Reads ?ref=code off the current URL,
// if present, and stores it — see src/lib/referral.ts for details.
export default function ReferralCapture() {
  const searchParams = useSearchParams()

  useEffect(() => {
    captureReferralFromUrl()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  return null
}
