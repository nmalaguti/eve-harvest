import React from "react"

export const Bonus = ({ amount }: { amount: number }) =>
  amount > 0 ? (
    <span className="px-2 ml-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-300 text-green-900">
      +{amount * 100}%
    </span>
  ) : null
