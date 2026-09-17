'use client'
import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { captureReferralFromUrl } from '@/lib/referral'
import { capturePromoFromUrl } from '@/lib/promo'

// Mounted globally (see layout.tsx). Reads ?ref=code and ?promo=code off the
// current URL, if present, and stores them — see src/lib/referral.ts and
// src/lib/promo.ts for details. Lets a Black Friday email/Pinterest link
// pre-apply the promo code regardless of which page it lands on, not just
// the homepage.
export default function ReferralCapture() {
  const searchParams = useSearchParams()

  useEffect(() => {
    captureReferralFromUrl()
    capturePromoFromUrl()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  return null
}
