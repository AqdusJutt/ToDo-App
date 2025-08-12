"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext"; // Re-enabled this import

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { user, signIn, signUp } = useAuth(); // Re-enabled this line

  const handleSubmit = async () => {
    // 1. Validation Checks (These are good)
    if (!email || !password || (isSignUp && !name)) {
      setError("Please enter all required fields.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    setError("");

    // 2. The Core Logic - TRY/CATCH BLOCK RESTORED
    try {
      if (isSignUp) {
        // If it's a new user, call the signUp function
        await signUp(email, password, name);
      } else {
        // If it's an existing user, call the signIn function
        await signIn(email, password);
      }
      // 3. Redirect on Success - THIS IS THE KEY PART
      router.push("/dashboard");

    } catch (error: unknown) {
      // If Firebase returns an error, display it
      const errorMessage = error instanceof Error ? error.message : "An error occurred. Please try again.";
      setError(errorMessage);
    } finally {
      // 4. Stop the loading indicator
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  // SVG for User/Email Icon
  const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );

  // SVG for Lock Icon
  const LockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-2 4h4m-11-8h14a2 2 0 002-2V7a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2z" />
    </svg>
  );

  // SVG for Eye Icon (show/hide password)
  const EyeIcon = ({ onClick, isVisible }: { onClick: () => void; isVisible: boolean }) => (
    <button type="button" onClick={onClick} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors">
      {isVisible ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
           <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.91-9.395-7.005a9.918 9.918 0 012.016-4.902m11.379 4.902a9.918 9.918 0 012.016-4.902M1 1l22 22" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      )}
    </button>
  );

  // SVG for a random placeholder icon (e.g., a simple list icon)
  const TodoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M17 17h.01" />
    </svg>
  );


  return (
    <div 
      className="relative min-h-screen flex items-center justify-center bg-cover bg-center p-4"
      style={{ backgroundImage: `url('/background.png')` }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black opacity-60"></div>

      {/* Header */}
      <header className="absolute top-0 left-0 right-0 p-4 md:p-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-2">
          <TodoIcon />
          <span className="text-white text-xl font-bold">TODO</span>
        </div>
        <nav>
          <ul className="flex items-center space-x-3 sm:space-x-6 text-sm sm:text-base">
            <li>
              <button 
                onClick={() => setIsSignUp(false)} 
                className={`text-white hover:text-red-400 transition-colors ${!isSignUp ? 'border-b-2 border-red-500' : 'border-b-2 border-transparent'}`}
              >
                Login
              </button>
            </li>
            <li>
              <button 
                onClick={() => setIsSignUp(true)} 
                className={`text-white hover:text-red-400 transition-colors ${isSignUp ? 'border-b-2 border-red-500' : 'border-b-2 border-transparent'}`}
              >
                Register
              </button>
            </li>
            <li className="hidden md:block"><a href="#" className="text-white hover:text-red-400 transition-colors">About Us</a></li>
            <li className="hidden md:block"><a href="#" className="text-white hover:text-red-400 transition-colors">Contact</a></li>
          </ul>
        </nav>
      </header>

      {/* Main Content (Login/Sign Up Form) */}
      <div className="relative bg-white p-6 sm:p-10 rounded-lg shadow-2xl w-full max-w-md z-10">
        
        <div className="flex justify-center mb-6">
          <img
            src="/icons/icon.png"
            alt="Profile Icon"
            className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
          />
        </div>

        {/* User is already logged in message */}
        {user && (
          <div className="text-center">
            <p className="text-gray-700">Welcome, you are already logged in as {user.email}.</p>
            <button 
              onClick={() => router.push('/dashboard')}
              className="mt-4 text-red-600 hover:underline"
            >
              Go to Dashboard
            </button>
          </div>
        )}

        {/* Form fields */}
        {!user && (
          <>
            {isSignUp && (
              <div className="mb-4 relative">
                <UserIcon />
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-800 placeholder-gray-500"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Username" 
                  disabled={loading}
                />
              </div>
            )}
            <div className="mb-4 relative">
              <UserIcon />
              <input
                type="email"
                className="w-full pl-10 pr-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-800 placeholder-gray-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Email" 
                disabled={loading}
              />
            </div>
            <div className="mb-4 relative">
              <LockIcon />
              <input
                type={showPassword ? "text" : "password"}
                className="w-full pl-10 pr-10 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-800 placeholder-gray-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Password" 
                disabled={loading}
              />
              <EyeIcon onClick={() => setShowPassword(!showPassword)} isVisible={showPassword} />
            </div>
            {error && (
              <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
            )}
            
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-red-600 text-white py-3 rounded-md font-bold text-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (isSignUp ? "Creating Account..." : "Logging In...") : (isSignUp ? "Create Account" : "Login")}
            </button>

            <div className="text-right text-sm mt-4">
              <a href="#" className="hover:underline text-red-500">Forgot Password?</a>
            </div>

             <div className="mt-6 text-center">
              <a href="#" className="text-gray-500 hover:underline text-sm">NEED HELP?</a>
            </div>
            
            <div className="mt-4 text-center border-t border-gray-200 pt-4">
              <button
                onClick={() => router.push("/admin")}
                className="text-gray-500 hover:text-gray-800 text-sm transition-colors"
              >
                Admin Login
              </button>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="absolute bottom-0 left-0 right-0 p-4 flex flex-col md:flex-row justify-between items-center z-10 text-gray-400 text-sm gap-4 md:gap-0">
        {/* LEFT SIDE */}
        <div className="flex gap-4">
          <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-white transition-colors">Terms Of Use</a>
        </div>
        {/* RIGHT SIDE */}
        <div className="flex items-center flex-col sm:flex-row gap-4">
           <span>© 2025 Key. All Rights Reserved | Design By STAUMZ</span>
            <div className="flex space-x-3">
              {/* Placeholder Social Icons */}
              <a href="#" className="hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.008 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.953H10.5a2.607 2.607 0 00-2.607 2.607V8.05h3.915L11.72 11.01h-3.915v5.625c3.823-.604 6.75-3.934 6.75-7.951z"/></svg>
              </a>
              <a href="#" className="hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.14 0-.282-.006-.422A6.685 6.685 0 0016 3.542a6.658 6.658 0 01-1.889.518 3.301 3.301 0 001.447-1.817 6.533 6.533 0 01-2.087.793A3.286 3.286 0 007.875 6.03a9.325 9.325 0 01-6.767-3.429 3.289 3.289 0 001.025 4.305A3.29 3.29 0 01.879 8.02c.003.03.006.06.009.091c0 3.341 2.376 6.102 5.475 6.741A7.87 7.87 0 01.64 15c-.105 0-.207-.013-.309-.025A9.302 9.302 0 005.026 15z"/></svg>
              </a>
            </div>
        </div>
      </footer>
    </div>
  );
}