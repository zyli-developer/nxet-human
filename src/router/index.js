import { createBrowserRouter } from "react-router-dom";
import RouteGuard from '../RouteGuard'
import Invitation from "../page/Invitation";
import Main from "../page/Main";
 
const routes = createBrowserRouter([
    {
        path:'/',
        exact: true,
        element:<Invitation></Invitation>
      
    },
    {
        path:'/human',
        exact: true,
        element:<RouteGuard><Main></Main></RouteGuard>
       
    }
])
 
export default routes