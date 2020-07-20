import { useOreFilters } from "./hooks"
import { primaryOres } from "./data"
import { Icon } from "./icon"
import React from "react"
import styled from "styled-components"

export const oreButtons = primaryOres
  .map(({ color }) => {
    const borderColor = `border-color: ${color};`
    return {
      [color]: {
        enabled: styled.button`
          background-color: ${color};
          ${borderColor}
        `,
        disabled: styled.button`
          ${borderColor}
        `,
      },
    }
  })
  .reduce((a, b) => ({ ...a, ...b }), {})

export const FilterButton: React.FunctionComponent<{
  onClick: any
  enabled: boolean
  color: string
}> = ({ children, onClick, enabled, color, ...props }) => {
  const Button = enabled
    ? oreButtons[color].enabled
    : oreButtons[color].disabled

  return (
    <div className="text-center">
      <Button
        className={`w-30 min-w-full whitespace-no-wrap bg-transparent font-semibold px-1 leading-tight border-2 rounded text-xs mt-1 mr-1 pointer:hover:text-gray-900 pointer:hover:bg-gray-300 pointer:hover:border-transparent ${
          enabled ? "text-gray-900" : "text-gray-100"
        }`}
        {...props}
        onClick={onClick}
      >
        {children}
      </Button>
    </div>
  )
}

export function Filter() {
  const [state, setState] = useOreFilters()

  return (
    <div className="w-screen xs:grid-rows-4 grid xxl:grid-rows-1 lg:grid-rows-2 grid-rows-8 grid-flow-col col-gap-1">
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
