import clsx from "clsx"

export default function Card({ children, className }) {
  return (
    <div className={clsx("m-auto p-4 sm:p-6 rounded-sm ring ring-white/20", className)}>
      {children}
    </div>
  )
}
