import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, googleProvider } from "../../config/firebase";
import { toast } from "react-toastify";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import Logo from "../../assets/images/feed.png";
import { FirebaseError } from "firebase/app";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Sign in successful!", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: true,
      });
      navigate("/dashboard");
    } catch (error) {
      const firebaseError = error as FirebaseError;

      if (
        firebaseError.code === "auth/invalid-email" ||
        firebaseError.code === "auth/user-not-found"
      ) {
        setEmailError("Wrong credentials. Please try again.");
        toast.error("Wrong credentials. Please try again.", {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: true,
        });
      } else {
        setPasswordError("An error occurred. Please try again.");
        toast.error("An error occurred. Please try again.", {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: true,
        });
      }
    }
  };

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success("Sign in successful!", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: true,
      });
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bangus-white">
      <div className="w-full max-w-[400px] mx-4">
        <Link to="/" className="flex items-center justify-center mb-8">
          <img src={Logo} alt="BANGUS Logo" className="size-12" />
          <p className="header tracking-wider mx-1 mt-2 text-2xl font-bold text-bangus-cyan hover:text-bangus-teal transition-colors">
            BANGUS
          </p>
        </Link>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm text-gray-600">
              Email address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.address"
              className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:border-bangus-cyan focus:ring-1 focus:ring-bangus-cyan placeholder-gray-400"
              required
            />
            {emailError && <p className="text-xs text-red-500">{emailError}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm text-gray-600">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your secret password"
                className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:border-bangus-cyan focus:ring-1 focus:ring-bangus-cyan placeholder-gray-400"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </button>
            </div>
            {passwordError && (
              <p className="text-xs text-red-500">{passwordError}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-bangus-cyan text-white py-2 rounded hover:bg-bangus-teal transition-colors"
          >
            Sign In
          </button>

          <div className="relative flex items-center justify-center">
            <hr className="w-full border-gray-200" />
            <span className="absolute bg-bangus-white px-4 text-sm text-gray-500">
              or
            </span>
          </div>

          <button
            type="button"
            onClick={signInWithGoogle}
            className="w-full flex items-center justify-center gap-2 border border-gray-300 py-2 rounded hover:bg-gray-50 transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign in with Google
          </button>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Did you forget your password?{" "}
              <Link to="/auth/reset-password" className="text-bangus-cyan hover:underline">
                <span className="text-bangus-cyan">Reset it now</span>
              </Link>
            </p>
          </div>

          <div className="text-center space-y-1">
            <p className="text-sm text-gray-600">Don't have an account yet?</p>
            <Link
              to="/auth/signup"
              className="text-sm text-bangus-cyan hover:underline"
            >
              Sign up here
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignIn;
