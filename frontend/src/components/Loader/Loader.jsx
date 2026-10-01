const SIZES = {
  sm: "h-4 w-4 border-2",
  md: "h-8 w-8 border-[3px]",
  lg: "h-12 w-12 border-4",
}

const Loader = ({ loading = false, fullScreen = false, size = "md", label = "", className = "text-blue-600" }) => {
  if (!loading) return null

  const spinner = (
    <span role="status" aria-live="polite" className="inline-flex flex-col items-center gap-3">
      <span
        className={`inline-block animate-spin rounded-full border-current border-t-transparent motion-reduce:animate-none ${SIZES[size]} ${className}`}
      />
      {label ? (
        <span className="text-sm font-medium text-slate-600">{label}</span>
      ) : (
        <span className="sr-only">Loading</span>
      )}
    </span>
  )

  if (fullScreen) {
    return <div className="fixed inset-0 z-[60] grid place-items-center bg-white/70 backdrop-blur-sm">{spinner}</div>
  }

  return spinner
}

export default Loader