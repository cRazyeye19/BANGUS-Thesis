import "./index.css";
import { Route, Routes } from "react-router-dom";
import SignIn from "./components/Auth Page/SignIn";
import SignUp from "./components/Auth Page/SignUp";
import { auth } from "./config/firebase";
import { useEffect, useState } from "react";
import { User } from "firebase/auth";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Dashboard from "./components/Dashboard Page/Dashboard";
import Main from "./components/Fish Feeding Page/Main";
import Settings from "./components/Settings Page/Settings";
import About from "./components/About Us Page/About";
import Landing from "./pages/Landing";
import Loading from "./components/Loading/Loading";
import ResetPassword from "./components/Auth Page/ResetPassword";
import VerifyOTP from "./components/Auth Page/VerifyOTP";

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
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={user ? <Dashboard /> : <SignIn />} />
        <Route path="/auth/login" element={user ? <Dashboard /> : <SignIn />} />
        <Route
          path="/auth/signup"
          element={user ? <Dashboard /> : <SignUp />}
        />
        <Route path="/auth/reset-password" element={<ResetPassword />} />
        <Route path="/auth/verify-otp" element={<VerifyOTP />} />
        <Route path="/dashboard" element={user ? <Dashboard /> : <SignIn />} />
        <Route path="/fish-feeding" element={user ? <Main /> : <SignIn />} />
        <Route path="/settings" element={user ? <Settings /> : <SignIn />} />
        <Route path="/about-us" element={user ? <About /> : <SignIn />} />
      </Routes>
      <ToastContainer />
    </>
  );
}
export default App;
