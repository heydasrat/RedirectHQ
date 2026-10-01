import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import Loader from "../../components/Loader/Loader.jsx";

const ProtectedRoutes = () => {
    const location = useLocation();
    const { isLoading, isAuthenticated } = useSelector((state) => state.auth);

    if (isLoading) {
        return <Loader loading={isLoading} fullScreen={true}/>;
    }

    if (!isAuthenticated) {

        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <Outlet />;
};

export default ProtectedRoutes;