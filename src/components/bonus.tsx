import React from "react"

const Bonus = ({ bonus }: { bonus: string }) =>
  bonus !== "0%" ? (
    <span className="px-2 ml-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-300 text-green-900">
      {bonus}
    </span>
  ) : null

export default Bonus
