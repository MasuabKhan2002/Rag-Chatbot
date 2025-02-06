import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import SignInPage from './Components/signin/SignInPage';
import FirstTimeSignInPage from './Components/signin/FirstTimeSignInPage';
import AdminSignUp from './Components/admin/Signup';
import { RequireAuth, RequireAdminAuth } from './Firebase/auth';
import HomePage from './Components/homepage/HomePage';
import Admin from './Components/admin/Admin';
import reportWebVitals from './reportWebVitals';
import "primereact/resources/themes/mira/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <SignInPage />
  },
  {
    path: "/signUp",
    element: <FirstTimeSignInPage />
  },
  {
    path: "/admin/signup",
    element: <AdminSignUp/>
  },
  {
    path: "/",
    element: <RequireAuth/>,
    children:[
      {
        path: 'home/',
        element: <HomePage/>
      }
    ]
  },
  {
    path: "/admin",
    element: <RequireAdminAuth/>,
    children:[
      {
        path: "home/",
        element: <Admin/>
      }
    ]
  }
])

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <RouterProvider router={router} />
);

reportWebVitals();
