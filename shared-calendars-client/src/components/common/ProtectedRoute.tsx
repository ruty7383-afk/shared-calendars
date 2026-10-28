import { Navigate ,Outlet} from "react-router-dom"
import { getToken } from "../../utils/token"


const ProtectedRoute = () => {
    const token = getToken()

    if (!token) {
                         

        return <Navigate to="/" replace />
    }

      return <Outlet />
}

export default ProtectedRoute