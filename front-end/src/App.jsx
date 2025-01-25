import {
  createBrowserRouter,
  RouterProvider
} from 'react-router-dom';
import axios from 'axios';

//import './index.css';
import './App.css';

import Layout from './Layout';
import AboutPage from  './pages/AboutPage';
import ArticlePage, {loader as articleLoader} from './pages/ArticlePage';
import ArticlesListPage from './pages/ArticlesListPage';
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';
import LoginPage from './pages/LoginPage';
import CreateAccountPage from './pages/CreateAccountPage';

//This will show links in all the pages ...
const routes = [{
  path: '/',
  element: <Layout />,
  errorElement: <NotFoundPage />,
  children: [{
    path: '/',
    element: <HomePage />
  },
  {
    path: '/about',
    element: <AboutPage />
  },
  {
    path: '/articles',
    element: <ArticlesListPage />
  },
  {
    path: '/articles/:name', // /articles/learn-react. Here 'name' is 'learn-react'.
    element: <ArticlePage />,
    loader: articleLoader
  },
  {
    path: '/login',
    element: <LoginPage />
  },
  {
    path: '/create-account',
    element: <CreateAccountPage />
  }
  ]
}]

const router = createBrowserRouter(routes);

function App() {

  return (
    <RouterProvider router={router} />
    //<h1>This is Test Page</h1>
  )
}

export default App
