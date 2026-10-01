import { useEffect } from "react";
import { login, logout, setLoading } from "./app/features/authSlice.js";
import { Outlet } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import api from "./components/Axios/Axios.js";

const App = () => {
    const dispatch = useDispatch();
    const theme = useSelector((state) => state.auth.user?.preferences?.theme || "light");

    useEffect(() => {
        const isDark = theme === "dark";
        document.documentElement.classList.toggle("dark", isDark);
        document.documentElement.style.colorScheme = isDark ? "dark" : "light";
    }, [theme]);

    useEffect(() => {
        const fetchCurrentUser = async () => {
            dispatch(setLoading(true));

            try {
                const response = await api.get(
                    "/auth/me",
                    { withCredentials: true }
                );

                if (response.data.success) {
                    dispatch(login(response.data.data));
                } else {
                    dispatch(logout());
                }

            } catch {
                dispatch(logout());

            } finally {
                dispatch(setLoading(false));
            }
        };

        fetchCurrentUser();

    }, [dispatch]);

    return <Outlet />;
};

export default App;