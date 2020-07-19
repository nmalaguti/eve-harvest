import React from "react"
// @ts-ignore
import rippleSpinner from "./ripple-spinner.svg"

export const Loading = () => (
  <div className="p-4">
    <img
      src={rippleSpinner}
      alt="loading"
      title="loading"
      className="w-20 inline-flex"
    />
    loading...
  </div>
)
