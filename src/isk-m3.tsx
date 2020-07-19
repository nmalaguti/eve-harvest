import React from "react"

export const IskM3 = ({ value }: { value: number }) =>
  value === 0 ? null : (
    <>
      {value.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}{" "}
      <span className="leading-5 text-xs">
        ISK/m<sup>3</sup>
      </span>
    </>
  )
