import { useOreFilters } from "./hooks"
import { primaryOres } from "./data"
import { Icon } from "./icon"
import React from "react"

export const FilterButton: React.FunctionComponent<{
  onClick: any
  enabled: boolean
  color: string
}> = ({ children, onClick, enabled, color, ...props }) => (
  <button
    className={`bg-transparent font-semibold px-1 leading-tight border-2 rounded text-xs mx-1 ${
      enabled ? "text-gray-900" : "text-gray-100"
    }`}
    style={{
      backgroundColor: enabled ? color : undefined,
      borderColor: color,
    }}
    {...props}
    onClick={onClick}
  >
    {children}
  </button>
)

export function Filter() {
  const [state, setState] = useOreFilters()

  return (
    <div className="justify-around w-screen flex flex-wrap">
      {primaryOres.map((ore) => (
        <FilterButton
          key={ore.id}
          onClick={() =>
            setState((prevState) => ({
              ...prevState,
              [ore.id]: !prevState[ore.id],
            }))
          }
          enabled={state[ore.id]}
          color={ore.color}
        >
          <Icon id={ore.id} name={ore.name} className={"w-6"} /> {ore.name}
        </FilterButton>
      ))}
    </div>
  )
}
