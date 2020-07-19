import { createTheme } from "react-data-table-component"

createTheme("custom", {
  text: {
    primary: "#F7FAFC",
  },
  background: {
    default: "#1A202C",
  },
  divider: {
    default: "#E2E8F0",
  },
  sortFocus: {
    default: "#CBD5E0",
  },
  highlightOnHover: {
    default: "#DD6B20",
    text: "#F7FAFC",
  },
  striped: {
    default: "#2D3748",
    text: "#F7FAFC",
  },
})

export const customStyles = {
  headCells: {
    style: {
      fontSize: "1rem",
      fontWeight: 700,
    },
  },
  rows: {
    style: {
      fontSize: "1rem",
    },
    highlightOnHoverStyle: {
      transitionDuration: "0s",
      borderBottomColor: "#E2E8F0",
      outlineColor: "#E2E8F0",
    },
  },
}
