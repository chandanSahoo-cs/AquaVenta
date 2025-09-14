"use client";

import type React from "react";
import { useState, useTransition } from "react";
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
} from "lucide-react";
import { useRouter } from "next/navigation";
import { loginUser, registerUser } from "@/actions/user.actions";

export function OceanAuthForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [isLogin, setIsLogin] = useState(true);

  const [loginData, setLoginData] = useState({
    email: "",
    phone: "",
    password: "",
  });

  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    startTransition(async () => {
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        // setSuccess("Login successful!")
        await loginUser(loginData);
        router.push("/user/dashboard");
      } catch (err) {
        setError("Login failed. Please try again.");
      }
    });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    startTransition(async () => {
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        // setSuccess("Account created successfully!")
        await registerUser(signupData);
        router.push("/user/dashboard");
      } catch (err) {
        setError("Registration failed. Please try again.");
      }
    });
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setError("");
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Ocean Hazards */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-cyan-50 to-blue-100 p-8 xl:p-12 flex-col justify-between relative overflow-hidden">
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

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <Waves className="w-8 h-8 text-primary animate-pulse" />
            <h1 className="text-2xl font-bold text-primary">AquaVenta</h1>
          </div>

          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-4 text-balance">
                Protecting Our Oceans Together
              </h2>
              <p className="text-lg text-muted-foreground text-pretty">
                Join our mission to monitor and protect marine ecosystems from
                environmental hazards.
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-white/20 animate-in fade-in-50 slide-in-from-left-5 duration-700">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 text-amber-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">
                      Coral Bleaching
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Rising ocean temperatures cause coral to expel algae,
                      leading to widespread bleaching events.
                    </p>
                  </div>
                </div>
              </div>

              <div
                className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-white/20 animate-in fade-in-50 slide-in-from-left-5 duration-700"
                style={{ animationDelay: "200ms" }}>
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 text-red-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">
                      Plastic Pollution
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Over 8 million tons of plastic waste enter our oceans
                      annually, threatening marine life.
                    </p>
                  </div>
                </div>
              </div>

              <div
                className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-white/20 animate-in fade-in-50 slide-in-from-left-5 duration-700"
                style={{ animationDelay: "400ms" }}>
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 text-purple-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">
                      Ocean Acidification
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Increased CO₂ absorption makes oceans more acidic,
                      affecting shell-forming organisms.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <Button className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold px-8 py-3 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg">
            Learn More About Ocean Conservation
          </Button>
        </div>
      </div>

      {/* Right Side - Authentication */}
      <div className="w-full lg:w-1/2 bg-card flex items-center justify-center p-6 lg:p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4 lg:hidden">
              <Waves className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-bold text-primary">AquaVenta</h1>
            </div>
            <h2 className="text-2xl font-bold text-card-foreground mb-2">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h2>
            <p className="text-muted-foreground">
              {isLogin
                ? "Sign in to access your ocean monitoring dashboard"
                : "Join us in protecting our oceans"}
            </p>
          </div>

          <div className="relative">
            {/* Login Form */}
            {isLogin && (
              <div className="animate-in fade-in-50 slide-in-from-bottom-5 duration-500">
                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="space-y-2">
                    <Label
                      htmlFor="login-email"
                      className="text-sm font-medium text-card-foreground">
                      Email
                    </Label>
                    <Input
                      id="login-email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      value={loginData.email}
                      onChange={handleLoginChange}
                      className="h-12 bg-input border-border focus:border-primary focus:ring-primary transition-all duration-200 text-base"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="login-phone"
                      className="text-sm font-medium text-card-foreground">
                      Phone
                    </Label>
                    <Input
                      id="login-phone"
                      name="phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      value={loginData.phone}
                      onChange={handleLoginChange}
                      className="h-12 bg-input border-border focus:border-primary focus:ring-primary transition-all duration-200 text-base"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="login-password"
                      className="text-sm font-medium text-card-foreground">
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
                        className="h-12 bg-input border-border focus:border-primary focus:ring-primary pr-12 transition-all duration-200 text-base"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-card-foreground transition-colors duration-200">
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <Alert className="border-destructive/20 bg-destructive/10 animate-in fade-in-50 duration-300">
                      <AlertDescription className="text-destructive">
                        {error}
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all duration-300 hover:scale-[1.02] text-base"
                    disabled={isPending}>
                    {isPending ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </div>
            )}

            {/* Signup Form */}
            {!isLogin && (
              <div className="animate-in fade-in-50 slide-in-from-bottom-5 duration-500">
                <form onSubmit={handleSignup} className="space-y-5">
                  <div className="space-y-2">
                    <Label
                      htmlFor="signup-name"
                      className="text-sm font-medium text-card-foreground">
                      Full Name
                    </Label>
                    <Input
                      id="signup-name"
                      name="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={signupData.name}
                      onChange={handleSignupChange}
                      className="h-12 bg-input border-border focus:border-primary focus:ring-primary transition-all duration-200 text-base"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="signup-email"
                      className="text-sm font-medium text-card-foreground">
                      Email
                    </Label>
                    <Input
                      id="signup-email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      value={signupData.email}
                      onChange={handleSignupChange}
                      className="h-12 bg-input border-border focus:border-primary focus:ring-primary transition-all duration-200 text-base"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="signup-phone"
                      className="text-sm font-medium text-card-foreground">
                      Phone
                    </Label>
                    <Input
                      id="signup-phone"
                      name="phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      value={signupData.phone}
                      onChange={handleSignupChange}
                      className="h-12 bg-input border-border focus:border-primary focus:ring-primary transition-all duration-200 text-base"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="signup-password"
                      className="text-sm font-medium text-card-foreground">
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password"
                        value={signupData.password}
                        onChange={handleSignupChange}
                        className="h-12 bg-input border-border focus:border-primary focus:ring-primary pr-12 transition-all duration-200 text-base"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-card-foreground transition-colors duration-200">
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <Alert className="border-destructive/20 bg-destructive/10 animate-in fade-in-50 duration-300">
                      <AlertDescription className="text-destructive">
                        {error}
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all duration-300 hover:scale-[1.02] text-base"
                    disabled={isPending}>
                    {isPending ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
              </div>
            )}
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                onClick={toggleAuthMode}
                className="text-primary hover:text-primary/80 font-medium transition-colors duration-200 underline underline-offset-4">
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
