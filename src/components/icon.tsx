import React from "react"

const Icon = ({
  id,
  name,
  className,
  style,
  ...props
}: {
  id: number
  name: string
  className?: string
  style?: object
}) => (
  <img
    src={`https://images.evetech.net/types/${id}/icon?size=32`}
    alt={name}
    title={name}
    className={`inline rounded ${className || ""}`}
    style={style}
    {...props}
  />
)

export default Icon
