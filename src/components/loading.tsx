import React from "react"
// @ts-ignore
import rippleSpinner from "../images/ripple-spinner.svg"

const Loading = () => (
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

export default Loading
