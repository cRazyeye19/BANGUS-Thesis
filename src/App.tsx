import "./index.css";
import { Route, Routes } from "react-router-dom";
import { auth } from "./config/firebase";
import { lazy, Suspense, useEffect, useState } from "react";
import { User } from "firebase/auth";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loading from "./components/Loading/Loading";
import { NotificationsProvider } from "./context/NotificationsContext";

const SignIn = lazy(() => import("./components/Auth Page/SignIn"));
const SignUp = lazy(() => import("./components/Auth Page/SignUp"));
const Dashboard = lazy(() => import("./components/Dashboard Page/Dashboard"));
const Main = lazy(() => import("./components/Fish Feeding Page/Main"));
const Settings = lazy(() => import("./components/Settings Page/Settings"));
const About = lazy(() => import("./components/About Us Page/About"));
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
            element={user ? <Dashboard /> : <SignIn />}
          />
          <Route
            path="/auth/login"
            element={user ? <Dashboard /> : <SignIn />}
          />
          <Route
            path="/auth/signup"
            element={user ? <Dashboard /> : <SignUp />}
          />
          <Route path="/auth/reset-password" element={<ResetPassword />} />
          <Route path="/auth/verify-otp" element={<VerifyOTP />} />
          <Route
            path="/dashboard"
            element={user ? <Dashboard /> : <SignIn />}
          />
          <Route path="/fish-feeding" element={user ? <Main /> : <SignIn />} />
          <Route path="/settings" element={user ? <Settings /> : <SignIn />} />
          <Route path="/about-us" element={user ? <About /> : <SignIn />} />
        </Routes>
      </Suspense>
      <ToastContainer />
    </NotificationsProvider>
  );
}
export default App;
