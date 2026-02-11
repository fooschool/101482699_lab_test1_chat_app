import clsx from "clsx"

export default function Button({ onClick, type, children, className, disabled }) {
  return (
    <button
      type={type || "button"}
      onClick={onClick}
      disabled={disabled}
      className={clsx("bg-white text-black py-1.5 px-4 text-sm cursor-pointer hover:bg-zinc-300 disabled:opacity-50", className)}
    >
      {children}
    </button>
  )
}
