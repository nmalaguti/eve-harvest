import { useOreFilters } from "./hooks"
import { primaryOres } from "./data"
import { Icon } from "./icon"
import React from "react"
import styled from "styled-components"

export const FilterButton: React.FunctionComponent<{
  onClick: any
  enabled: boolean
  color: string
}> = ({ children, onClick, enabled, color, ...props }) => {
  const Button = styled.button`
    background-color: ${enabled ? color : "transparent"};
    border-color: ${color};
    &:hover {
      ${enabled ? "" : `background-color: ${color}`};
    }
  `
  return (
    <div className="text-center">
      <Button
        className={`w-30 min-w-full whitespace-no-wrap bg-transparent font-semibold px-1 leading-tight border-2 rounded text-xs mt-1 mr-1 hover:text-gray-900 ${
          enabled ? "text-gray-900 hover:bg-gray-300" : "text-gray-100"
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
