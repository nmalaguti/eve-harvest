import React, { useCallback, useMemo, useState } from "react"
import { Modal } from "./modal"
import { OreTable } from "./ore-table"

export default function App() {
  const [visible, setVisible] = useState(false)

  const showModal = useCallback(
    (event) => {
      event.preventDefault()
      setVisible(true)
    },
    [setVisible],
  )

  const hideModal = useCallback(() => {
    setVisible(false)
  }, [setVisible])

  const actions = useMemo(
    () => (
      <>
        <button
          className="text-sm px-4 py-2 mx-2 font-semibold leading-none border rounded text-gray-100 border-gray-100 hover:border-transparent hover:bg-gray-100 hover:text-gray-900"
          onClick={showModal}
        >
          About
        </button>
        <a
          href="https://github.com/nmalaguti/eve-harvest"
          title="Eve Harvest on GitHub"
          className="github inline-block mx-2"
        />
      </>
    ),
    [showModal],
  )

  return (
    <>
      <OreTable actions={actions} />
      <Modal isOpen={visible} close={hideModal} />
    </>
  )
}
