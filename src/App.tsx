import "./index.css";
import { Route, Routes } from "react-router-dom";
import { auth } from "./config/firebase";
import { lazy, Suspense, useEffect, useState } from "react";
import { User } from "firebase/auth";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loading from "./components/Loading/Loading";
import { NotificationsProvider } from "./context/NotificationsContext";
import Forbidden from "./components/Error Page/Forbidden";

const AuthForm = lazy(() => import("./components/Auth Page/AuthForm"));
const Dashboard = lazy(() => import("./components/Dashboard Page/Dashboard"));
const Main = lazy(() => import("./components/Fish Feeding Page/Main"));
const Settings = lazy(() => import("./components/Settings Page/Settings"));
const Landing = lazy(() => import("./pages/Landing"));
const ResetPassword = lazy(
  () => import("./components/Auth Page/ResetPassword")
);
const VerifyOTP = lazy(() => import("./components/Auth Page/VerifyOTP"));

function App() {
  const [user, setUser] = useState<User | null>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <Loading />;
  }
  return (
    <NotificationsProvider>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route
            path="/dashboard"
            element={user ? <Dashboard /> : <AuthForm mode="signIn" />}
          />
          <Route
            path="/auth/login"
            element={user ? <Dashboard /> : <AuthForm mode="signIn" />}
          />
          <Route
            path="/auth/signup"
            element={user ? <Dashboard /> : <AuthForm mode="signUp" />}
          />
          <Route path="/auth/reset-password" element={<ResetPassword />} />
          <Route path="/auth/verify-otp" element={<VerifyOTP />} />
          <Route
            path="/dashboard"
            element={user ? <Dashboard /> : <AuthForm mode="signIn" />}
          />
          <Route path="/fish-feeding" element={user ? <Main /> : <AuthForm mode="signIn" />} />
          <Route path="/settings" element={user ? <Settings /> : <AuthForm mode="signIn" />} />
          <Route path="*" element={<Forbidden />} />
        </Routes>
      </Suspense>
      <ToastContainer />
    </NotificationsProvider>
  );
}
export default App;
