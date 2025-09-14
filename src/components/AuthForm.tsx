"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Eye,
  EyeOff,
  Waves,
  Fish,
  AlertTriangle,
  Droplets,
  Shell,
  Anchor,
} from "lucide-react";
// import oceanBackground from "@/assets/ocean-background.jpg";
import { useRouter } from "next/navigation";
import { loginUser, registerUser } from "@/actions/user.actions";
import Link from "next/link";

interface AuthFormData {
  name?: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword?: string;
}

export function OceanAuthForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLogin, setIsLogin] = useState(true);

  const [loginData, setLoginData] = useState<AuthFormData>({
    email: "",
    phone: "",
    password: "",
  });

  const [signupData, setSignupData] = useState<AuthFormData>({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setError("");
  };

  const handleSignupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSignupData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setError("");
  };

  const validateSignupForm = () => {
    if (!signupData.name?.trim()) {
      setError("Full name is required");
      return false;
    }
    if (!signupData.email?.trim()) {
      setError("Email is required");
      return false;
    }
    if (!signupData.phone?.trim()) {
      setError("Phone number is required");
      return false;
    }
    if (!signupData.password?.trim()) {
      setError("Password is required");
      return false;
    }
    if (signupData.password !== signupData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    if (signupData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }
    return true;
  };

  const validateLoginForm = () => {
    if (!loginData.email?.trim()) {
      setError("Email is required");
      return false;
    }
    if (!loginData.phone?.trim()) {
      setError("Phone number is required");
      return false;
    }
    if (!loginData.password?.trim()) {
      setError("Password is required");
      return false;
    }
    return true;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateLoginForm()) return;

    setIsPending(true);
    try {
      await loginUser(loginData);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSuccess("Welcome back! Redirecting to your dashboard...");
      setTimeout(() => router.push("/user/dashboard"), 1000);
    } catch (err) {
      setError("Login failed. Please check your credentials and try again.");
    } finally {
      setIsPending(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateSignupForm()) return;

    setIsPending(true);
    try {
      const data = {
        name: signupData.name!,
        email: signupData.email,
        phone: signupData.phone,
        password: signupData.password,
      };
      await registerUser(data);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSuccess(
        "Account created successfully! Redirecting to your dashboard..."
      );
      setTimeout(() => router.push("/user/dashboard"), 1000);
    } catch (err) {
      setError("Registration failed. Please try again.");
    } finally {
      setIsPending(false);
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setError("");
    setSuccess("");
  };

  return (
    <div className="min-h-screen flex overflow-hidden">
      {/* Left Side - Ocean Conservation */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-cyan-50 to-blue-100 p-8 xl:p-12 flex-col justify-center items-center relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <Waves className="absolute top-20 left-20 w-32 h-32 text-blue-600 animate-pulse" />
          <Fish
            className="absolute top-40 right-32 w-24 h-24 text-blue-500 animate-bounce"
            style={{ animationDuration: "3s" }}
          />
          <Droplets
            className="absolute bottom-40 left-32 w-28 h-28 text-cyan-600 animate-pulse"
            style={{ animationDelay: "1s" }}
          />
          <Waves
            className="absolute bottom-20 right-20 w-20 h-20 text-blue-400 animate-bounce"
            style={{ animationDuration: "4s", animationDelay: "2s" }}
          />
          <Fish
            className="absolute top-1/2 left-10 w-16 h-16 text-cyan-500 animate-pulse"
            style={{ animationDelay: "3s" }}
          />
        </div>

        {/* Centered Heading */}
        <div className="relative z-10 text-center space-y-6">
          <div className="flex justify-center items-center gap-3 mb-4">
            <p className="text-8xl  font-bold text-primary">
              AquaVenta
            </p>
          </div>
          <p className="text-lg xl:text-xl text-muted-foreground max-w-md mx-auto">
            Stay informed about coastal hazards in your region and their impact
            on communities and ecosystems.
          </p>

          <Button className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold px-8 py-3 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg mt-8">
            <Link href="https://www.indiascienceandtechnology.gov.in/listingpage/ocean-initiatives">
              Learn About Ocean Conservation
            </Link>
          </Button>
        </div>
      </div>

      {/* Right Side - Authentication */}
      <div className="w-full lg:w-1/2 bg-card flex items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-lg">
          <div className="text-center mb-12">
            {/* Mobile Brand */}
            <div className="flex items-center justify-center gap-3 mb-8 lg:hidden">
              <div className="relative">
                <Waves className="w-8 h-8 text-primary animate-pulse" />
                <div className="absolute inset-0 w-8 h-8 bg-primary/20 rounded-full animate-ripple" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primary">AquaVenta</h1>
                <p className="text-xs text-muted-foreground">
                  Ocean Conservation
                </p>
              </div>
            </div>

            <h2 className="text-4xl font-bold text-card-foreground mb-4">
              {isLogin ? "Welcome Back" : "Join Our Mission"}
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {isLogin
                ? "Sign in to access your ocean monitoring dashboard and continue protecting our marine ecosystems"
                : "Create your account and become part of the ocean conservation community"}
            </p>
          </div>

          <div className="relative">
            {/* Login Form */}
            {isLogin && (
              <div className="space-y-6">
                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-3">
                    <Label
                      htmlFor="login-email"
                      className="text-base font-semibold text-card-foreground">
                      Email Address
                    </Label>
                    <Input
                      id="login-email"
                      name="email"
                      type="email"
                      placeholder="Enter your email address"
                      value={loginData.email}
                      onChange={handleLoginChange}
                      className="h-14 bg-input/50 border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 text-base rounded-xl backdrop-blur-sm"
                      required
                    />
                  </div>

                  <div className="space-y-3">
                    <Label
                      htmlFor="login-phone"
                      className="text-base font-semibold text-card-foreground">
                      Phone Number
                    </Label>
                    <Input
                      id="login-phone"
                      name="phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      value={loginData.phone}
                      onChange={handleLoginChange}
                      className="h-14 bg-input/50 border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 text-base rounded-xl backdrop-blur-sm"
                      required
                    />
                  </div>

                  <div className="space-y-3">
                    <Label
                      htmlFor="login-password"
                      className="text-base font-semibold text-card-foreground">
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="login-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={loginData.password}
                        onChange={handleLoginChange}
                        className="h-14 bg-input/50 border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 pr-14 transition-all duration-300 text-base rounded-xl backdrop-blur-sm"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors duration-200">
                        {showPassword ? (
                          <EyeOff className="h-6 w-6" />
                        ) : (
                          <Eye className="h-6 w-6" />
                        )}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <Alert className="border-destructive/30 bg-destructive/10 rounded-xl">
                      <AlertDescription className="text-destructive font-medium text-base">
                        {error}
                      </AlertDescription>
                    </Alert>
                  )}

                  {success && (
                    <Alert className="border-success/30 bg-success/10 rounded-xl">
                      <AlertDescription className="text-success font-medium text-base">
                        {success}
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full h-14  hover:opacity-90 text-primary-foreground font-bold text-lg rounded-xl  transition-all duration-300 hover:scale-[1.02] "
                    disabled={isPending}>
                    {isPending ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-3" />
                        Signing In...
                      </>
                    ) : (
                      "Sign In to Dashboard"
                    )}
                  </Button>
                </form>
              </div>
            )}

            {/* Signup Form */}
            {!isLogin && (
              <div className="space-y-6">
                <form onSubmit={handleSignup} className="space-y-6">
                  <div className="space-y-3">
                    <Label
                      htmlFor="signup-name"
                      className="text-base font-semibold text-card-foreground">
                      Full Name
                    </Label>
                    <Input
                      id="signup-name"
                      name="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={signupData.name}
                      onChange={handleSignupChange}
                      className="h-14 bg-input/50 border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 text-base rounded-xl backdrop-blur-sm"
                      required
                    />
                  </div>

                  <div className="space-y-3">
                    <Label
                      htmlFor="signup-email"
                      className="text-base font-semibold text-card-foreground">
                      Email Address
                    </Label>
                    <Input
                      id="signup-email"
                      name="email"
                      type="email"
                      placeholder="Enter your email address"
                      value={signupData.email}
                      onChange={handleSignupChange}
                      className="h-14 bg-input/50 border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 text-base rounded-xl backdrop-blur-sm"
                      required
                    />
                  </div>

                  <div className="space-y-3">
                    <Label
                      htmlFor="signup-phone"
                      className="text-base font-semibold text-card-foreground">
                      Phone Number
                    </Label>
                    <Input
                      id="signup-phone"
                      name="phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      value={signupData.phone}
                      onChange={handleSignupChange}
                      className="h-14 bg-input/50 border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 text-base rounded-xl backdrop-blur-sm"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <Label
                        htmlFor="signup-password"
                        className="text-base font-semibold text-card-foreground">
                        Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="signup-password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Create password"
                          value={signupData.password}
                          onChange={handleSignupChange}
                          className="h-14 bg-input/50 border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 pr-14 transition-all duration-300 text-base rounded-xl backdrop-blur-sm"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors duration-200">
                          {showPassword ? (
                            <EyeOff className="h-6 w-6" />
                          ) : (
                            <Eye className="h-6 w-6" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label
                        htmlFor="signup-confirm-password"
                        className="text-base font-semibold text-card-foreground">
                        Confirm Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="signup-confirm-password"
                          name="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm password"
                          value={signupData.confirmPassword}
                          onChange={handleSignupChange}
                          className="h-14 bg-input/50 border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 pr-14 transition-all duration-300 text-base rounded-xl backdrop-blur-sm"
                          required
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors duration-200">
                          {showConfirmPassword ? (
                            <EyeOff className="h-6 w-6" />
                          ) : (
                            <Eye className="h-6 w-6" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {error && (
                    <Alert className="border-destructive/30 bg-destructive/10 rounded-xl">
                      <AlertDescription className="text-destructive font-medium text-base">
                        {error}
                      </AlertDescription>
                    </Alert>
                  )}

                  {success && (
                    <Alert className="border-success/30 bg-success/10 rounded-xl">
                      <AlertDescription className="text-success font-medium text-base">
                        {success}
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full h-14 hover:opacity-90 text-primary-foreground font-bold text-lg rounded-xl  transition-all duration-300 hover:scale-[1.02] "
                    disabled={isPending}>
                    {isPending ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-3" />
                        Creating Account...
                      </>
                    ) : (
                      "Create My Account"
                    )}
                  </Button>
                </form>
              </div>
            )}
          </div>

          <div className="mt-8 text-center">
            <p className="text-base text-muted-foreground">
              {isLogin
                ? "Don't have an account yet?"
                : "Already protecting our oceans?"}{" "}
              <button
                onClick={toggleAuthMode}
                className="text-primary hover:text-primary-glow font-bold transition-colors duration-300 underline underline-offset-4 decoration-2 hover:decoration-primary-glow">
                {isLogin ? "Join the Mission" : "Sign In Instead"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
