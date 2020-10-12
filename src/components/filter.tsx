import { useOreFilters, useCompressedFilters, useBonusFilters } from "../hooks"
import { primaryOres, oreBonuses } from "../data"
import Icon from "./icon"
import React from "react"
import styled from "styled-components"

const oreButtons = primaryOres
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

const OreFilterButton: React.FunctionComponent<{
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

const BonusFilterButton: React.FunctionComponent<{
  onClick: any
  enabled: boolean
}> = ({ children, onClick, enabled, ...props }) => {
  return (
    <div className="text-center">
      <button
        className={`w-30 min-w-full border-green-300 whitespace-no-wrap bg-transparent font-semibold px-1 leading-tight border-2 rounded text-xs mt-1 mr-1 pointer:hover:text-gray-900 pointer:hover:bg-gray-300 pointer:hover:border-transparent ${
          enabled ? "bg-green-300 text-green-900" : "text-gray-100"
        }`}
        {...props}
        onClick={onClick}
      >
        {children}
      </button>
    </div>
  )
}

const CompressedFilterButton: React.FunctionComponent<{
  onClick: any
  enabled: boolean
}> = ({ children, onClick, enabled, ...props }) => {
  return (
    <div className="text-center">
      <button
        className={`w-30 min-w-full border-pink-300 whitespace-no-wrap bg-transparent font-semibold px-1 leading-tight border-2 rounded text-xs mt-1 mr-1 pointer:hover:text-gray-900 pointer:hover:bg-gray-300 pointer:hover:border-transparent ${
          enabled ? "text-gray-900 bg-pink-300 " : "text-gray-100"
        }`}
        {...props}
        onClick={onClick}
      >
        {children}
      </button>
    </div>
  )
}

export default function Filter() {
  const [oreState, setOreState] = useOreFilters()
  const [bonusState, setBonusState] = useBonusFilters()
  const [compressedState, setCompressedState] = useCompressedFilters()

  return (
    <>
      <div className="w-screen grid xs:grid-rows-4  xxl:grid-rows-1 lg:grid-rows-2 grid-rows-8 grid-flow-col col-gap-1">
        {primaryOres.map((ore) => (
          <OreFilterButton
            key={ore.id}
            onClick={() =>
              setOreState((prevState) => ({
                ...prevState,
                [ore.id]: !prevState[ore.id],
              }))
            }
            enabled={oreState[ore.id]}
            color={ore.color}
          >
            <Icon id={ore.id} name={ore.name} className={"w-6"} /> {ore.name}
          </OreFilterButton>
        ))}
      </div>
      <div className="w-screen grid grid-cols-3 col-gap-1">
        {oreBonuses.map((bonus) => (
          <BonusFilterButton
            key={bonus}
            onClick={() =>
              setBonusState((prevState) => ({
                ...prevState,
                [bonus.toString()]: !prevState[bonus.toString()],
              }))
            }
            enabled={bonusState[bonus]}
          >
            +{bonus * 100}%
          </BonusFilterButton>
        ))}
      </div>
      <div className="w-screen grid grid-cols-2 col-gap-1">
        <CompressedFilterButton
          onClick={() =>
            setCompressedState((prevState) => ({
              ...prevState,
              [false.toString()]: !prevState[false.toString()],
            }))
          }
          enabled={compressedState[false.toString()]}
        >
          Uncompressed
        </CompressedFilterButton>
        <CompressedFilterButton
          onClick={() =>
            setCompressedState((prevState) => ({
              ...prevState,
              [true.toString()]: !prevState[true.toString()],
            }))
          }
          enabled={compressedState[true.toString()]}
        >
          Compressed
        </CompressedFilterButton>
      </div>
    </>
  )
}
