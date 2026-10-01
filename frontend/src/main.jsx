import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Provider } from 'react-redux'
import store from './app/store/store.js'
import { createBrowserRouter, RouterProvider, Link } from 'react-router-dom'
import { Login, Register, Home,Links,Setting } from './Pages/index.js'
import { ProtectedRoutes, AuthRoutes } from './routes/index.js'

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        element: <AuthRoutes />, 
        children: [
          { path: "register", element: <Register /> },
          { path: "login", element: <Login /> },
        ]
      },
      {
        element: <ProtectedRoutes />, 
        children: [
          { path: "/", element: <Home /> },
          { path: "/links", element: <Links /> },
          { path: "/settings", element: <Setting /> },
        ]
      },
      {
        path: "*",
        element: (
          <main className="grid min-h-screen place-content-center gap-3 px-4 text-center">
            <h1 className="text-3xl font-semibold text-slate-900">Page not found</h1>
            <p className="text-slate-600">This RedirectHQ page does not exist.</p>
            <Link to="/" className="font-medium text-blue-700 hover:underline">Return to dashboard</Link>
          </main>
        ),
      },
    ]
  }
])

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <RouterProvider router={router} />
  </Provider>
)