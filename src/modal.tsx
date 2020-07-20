import React, { useCallback, useEffect } from "react"

function BodyModalOpen({ close }: { close: () => void }) {
  const escFunction = useCallback(
    (event) => {
      let isEscape: boolean
      if ("key" in event) {
        isEscape = event.key === "Escape" || event.key === "Esc"
      } else {
        isEscape = event.keyCode === 27
      }
      if (isEscape) {
        close()
      }
    },
    [close],
  )

  useEffect(() => {
    const body = document.querySelector("body")!
    body.classList.add("modal-active")
    document.addEventListener("keydown", escFunction, false)

    return () => {
      body.classList.remove("modal-active")
      document.removeEventListener("keydown", escFunction, false)
    }
  }, [escFunction])

  return null
}

export function Modal({
  isOpen,
  close,
}: {
  isOpen: boolean
  close: () => void
}) {
  return (
    <div
      className={`modal ${
        isOpen ? "" : "opacity-0 pointer-events-none"
      } fixed w-full h-full top-0 left-0 flex items-center justify-center`}
    >
      {isOpen ? <BodyModalOpen close={close} /> : null}

      <div
        onClick={close}
        className="modal-overlay absolute w-full h-full bg-gray-900 opacity-50"
      />

      <div className="modal-container bg-gray-100 text-gray-900 w-11/12 md:max-w-md mx-auto rounded shadow-lg z-50 overflow-y-auto">
        <div
          onClick={close}
          className="absolute top-0 right-0 cursor-pointer flex flex-col items-center mt-4 mr-4 text-white text-sm z-50"
        >
          <svg
            className="fill-current text-white"
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 18 18"
          >
            <path d="M14.53 4.53l-1.06-1.06L9 7.94 4.53 3.47 3.47 4.53 7.94 9l-4.47 4.47 1.06 1.06L9 10.06l4.47 4.47 1.06-1.06L10.06 9z" />
          </svg>
          <span className="text-sm">(Esc)</span>
        </div>

        <div className="modal-content py-4 text-left px-6 leading-loose">
          <div className="flex justify-between items-center pb-3">
            <p className="text-2xl font-bold">About Eve Harvest</p>
            <div onClick={close} className="cursor-pointer z-50">
              <svg
                className="fill-current text-black"
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 18 18"
              >
                <path d="M14.53 4.53l-1.06-1.06L9 7.94 4.53 3.47 3.47 4.53 7.94 9l-4.47 4.47 1.06 1.06L9 10.06l4.47 4.47 1.06-1.06L10.06 9z" />
              </svg>
            </div>
          </div>

          <p>This was inspired by:</p>
          <ul className="list-inside list-disc px-4">
            <li>
              <a href="https://eve-industry.org/mining/">
                https://eve-industry.org/mining/
              </a>
            </li>
            <li>
              <a href="http://evedeposit.dropsnorz.com/">
                http://evedeposit.dropsnorz.com/
              </a>
            </li>
            <li>
              <a href="https://www.fuzzwork.co.uk/ore/">
                https://www.fuzzwork.co.uk/ore/
              </a>
            </li>
          </ul>
          <p>
            The pricing data is from{" "}
            <a href="https://market.fuzzwork.co.uk/">
              https://market.fuzzwork.co.uk/
            </a>
            .
          </p>
          <br />
          <p>
            All prices are based on The Forge. <em>Minerals price</em> is based
            on a 70.0% refine. <em>Perfect Minerals price</em> is based on a max
            refine of 89.34% from{" "}
            <a href="https://docs.google.com/spreadsheets/d/1HlDcxHWJAvYpkNg16lD6u-w8NQVQKkyfJ7Xjl69tTfE/edit?usp=sharing">
              this calculator
            </a>
            .
          </p>
          <br />
          <p>
            If you found this useful and would like to donate some ISK, please
            send it to <strong className="text-red-800">Hiro Logos</strong>.
          </p>

          <div className="flex justify-end pt-2">
            <button
              onClick={close}
              className="px-4 bg-gray-700 leading-snug font-semibold p-2 rounded-lg text-gray-100 hover:bg-orange-600"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
