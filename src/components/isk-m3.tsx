import React from "react"

const IskM3 = ({ value, titleValue }: { value: number; titleValue?: number }) =>
  value === 0 ? null : (
    <span
      title={
        titleValue === undefined
          ? undefined
          : `Individual price: ${titleValue.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })} ISK`
      }
    >
      {value.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}{" "}
      <span className="leading-5 text-xs">
        ISK/m<sup>3</sup>
      </span>
    </span>
  )

export default IskM3
