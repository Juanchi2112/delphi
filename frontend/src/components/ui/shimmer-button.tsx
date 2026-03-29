'use client'

import { cn } from '@/lib/utils'

interface ShimmerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode
  className?: string
}

export default function ShimmerButton({
  children = 'Shimmer',
  className,
  ...props
}: ShimmerButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex h-12 animate-[shimmer2_2s_infinite_linear] items-center justify-center rounded-xl border border-emerald-500/30 bg-[linear-gradient(110deg,#0C0A09,45%,#064e3b,55%,#0C0A09)] bg-[length:200%_100%] px-8 font-semibold text-emerald-400 transition-colors hover:border-emerald-500/50 hover:text-emerald-300 focus:outline-none focus-visible:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-stone-950',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
