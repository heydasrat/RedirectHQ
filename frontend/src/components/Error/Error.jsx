const ErrorMessage = ({ message }) => {
  if (!message) return null

  return (
    <div role="alert" className="ui-alert-error bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-3 text-sm">
      {message}
    </div>
  )
}

export default ErrorMessage