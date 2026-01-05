import { createBrowserRouter } from "react-router-dom";
import RouteGuard from '../RouteGuard'
import Invitation from "../page/Invitation";
import Main from "../page/Main";
import Ifream from '../page/Ifream'
import Cartoon from '../page/Cartoon'
const routes = createBrowserRouter([
    {
        path:'/',
        exact: true,
        element:<Invitation></Invitation>
      
    },
    {
        path:'/human',
        exact: true,
        replace:true,
        element:<RouteGuard><Main></Main></RouteGuard>
       
    },
    {
        path:'/cartoon',
        exact: true,
        replace:true,
        element:<RouteGuard><Cartoon></Cartoon></RouteGuard>
       
    },
    {
        path:'/next',
        exact: true,
        replace:true,
        element:<RouteGuard><Ifream></Ifream></RouteGuard>
       
    }
])
 
export default routes