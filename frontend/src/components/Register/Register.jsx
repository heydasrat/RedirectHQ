import { useState } from 'react'
import { Link } from 'react-router-dom'
import ErrorMessage from '../Error/Error.jsx'
import api from '../Axios/Axios.js'
import { useDispatch } from 'react-redux'
import { login } from '../../app/features/authSlice.js'

const RegisterCMP = () => {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [fetching, setFetching] = useState(false)

  const dispatch = useDispatch()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if ([fullName, email, username].some((value) => !value.trim())) {
      setError("Complete all fields before creating your account.")
      return
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.")
      return
    }

    setFetching(true)
    try {
      await api.post("/auth/register", { fullName, email, username, password })
      const response = await api.post("/auth/login", { identifier: email, password })
      dispatch(login(response.data.data))
    } catch (error) {
      setError(error.response?.data?.message || "Unable to create your account. Please try again.")
    } finally {
      setFetching(false)
    }

  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="ui-card bg-white p-8 rounded-xl shadow-sm border border-gray-200">
          <h1 className="text-2xl font-semibold text-center text-gray-900 mb-1">
            Create your account
          </h1>

          <p className="text-center text-sm text-gray-500 mb-6">
            Get started in a few seconds
          </p>

          {error && <ErrorMessage message={error} />}

          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div>
              <label
                htmlFor="fullName"
                className="ui-label block text-sm font-medium text-gray-700 mb-1"
              >
                Full Name
              </label>

              <input
                id="fullName"
                type="text"
                autoFocus
                autoComplete="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="ui-input w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="ui-label block text-sm font-medium text-gray-700 mb-1"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="ui-input w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="username"
                className="ui-label block text-sm font-medium text-gray-700 mb-1"
              >
                Username
              </label>

              <input
                id="username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="ui-input w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="ui-label block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="ui-input w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />

              <p className="text-xs text-gray-400 mt-1">
                Must be at least 8 characters
              </p>
            </div>

            <button
              type="submit"
              disabled={fetching}
              className="ui-button-primary w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium text-sm hover:bg-blue-700 active:bg-blue-800 transition"
            >
              {fetching ? <p>Registering</p> : "Register"}
            </button>
          </form>
        </div>

        <p className="text-center mt-6 text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-blue-600 font-medium hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

export default RegisterCMP

