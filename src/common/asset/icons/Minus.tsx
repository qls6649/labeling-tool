import React from "react"

export function Minus(props: React.HTMLProps<HTMLSpanElement>) {
  return (
    <span role={"img"} {...props}>
      <svg
        width={"1em"}
        height={"1em"}
        focusable={false}
        aria-hidden={true}
        fill={"none"}
        viewBox={"0 0 24 24"}
        stroke={"currentColor"}
        stroke-width={"2"}
        stroke-linecap={"round"}
        stroke-linejoin={"round"}
      >
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    </span>
  )
}
