import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { Eye, EyeOff } from 'lucide-react'
import api from '../Axios/Axios.js'
import ErrorMessage from '../Error/Error.jsx'
import { login } from '../../app/features/authSlice.js'

const LoginCMP = () => {
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [error, setError] = useState("")
  const [fieldErrors, setFieldErrors] = useState({})

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()

  const validate = () => {
    const errors = {}
    if (!identifier.trim()) {
      errors.identifier = "Enter your username or email"
    }
    if (!password) {
      errors.password = "Enter your password"
    } else if (password.length < 8) {
      errors.password = "Password must be at least 8 characters"
    }
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!validate()) return

    setFetching(true)
    try {
      const response = await api.post("/auth/login", { identifier, password })
      if (response.data.success) {
        dispatch(login(response.data.data))
        const redirectTo = location.state?.from?.pathname || "/"
        navigate(redirectTo, { replace: true })
      } else {
        setError(response.data.message)
      }
    } catch (error) {
      setError(error.response?.data?.message || "Something went wrong. Please try again.")
    } finally {
      setFetching(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="ui-card bg-white p-8 rounded-xl shadow-sm border border-gray-200">
          <h1 className="text-2xl font-semibold text-center text-gray-900 mb-1">
            Welcome back
          </h1>
          <p className="text-center text-sm text-gray-500 mb-6">
            Sign in to continue
          </p>

          {error && <ErrorMessage message={error} />}

          <form onSubmit={handleSubmit} noValidate className="space-y-4 mt-2">
            <div>
              <label htmlFor="identifier" className="ui-label block text-sm font-medium text-gray-700 mb-1">
                Username or Email
              </label>
              <input
                id="identifier"
                type="text"
                autoFocus
                autoComplete="username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className={`ui-input w-full border rounded-lg px-3 py-2.5 text-sm outline-none transition
                  focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  ${fieldErrors.identifier ? "border-red-400" : "border-gray-300"}`}
              />
              {fieldErrors.identifier && (
                <p className="text-xs text-red-500 mt-1">{fieldErrors.identifier}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="ui-label block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`ui-input w-full border rounded-lg px-3 py-2.5 pr-10 text-sm outline-none transition
                    focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                    ${fieldErrors.password ? "border-red-400" : "border-gray-300"}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-xs text-red-500 mt-1">{fieldErrors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={fetching}
              className="ui-button-primary w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium text-sm
                hover:bg-blue-700 active:bg-blue-800 transition
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {fetching ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>

        <p className="text-center mt-6 text-sm text-gray-600">
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-600 font-medium hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}

export default LoginCMP