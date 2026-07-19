import { createBrowserRouter } from 'react-router-dom'
import { RootLayout } from '../layouts/RootLayout'
import { HomePage } from '../pages/home'
import { PlayPage } from '../pages/play'

// Data router. `RootLayout` is the shared shell; child routes render in its
// <Outlet />. Add new screens (leaderboard, multiplayer lobby, settings) here.
export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'play', element: <PlayPage /> },
    ],
  },
])
