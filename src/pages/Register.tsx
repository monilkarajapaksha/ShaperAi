
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { auth, googleProvider } from "@/lib/firebase";
import { signInWithPopup, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useState, FormEvent } from "react";
import { toast } from "sonner";

const authErrorMessage = (error: unknown) => {
  const code = (error as { code?: string })?.code ?? "";
  const messages: Record<string, string> = {
    "auth/email-already-in-use": "An account with this email already exists.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/weak-password": "Password must be at least 6 characters.",
    "auth/invalid-credential": "Incorrect email or password.",
    "auth/user-not-found": "Incorrect email or password.",
    "auth/wrong-password": "Incorrect email or password.",
    "auth/too-many-requests": "Too many attempts. Please try again later.",
    "auth/operation-not-allowed": "Email/password sign-in is not enabled for this project.",
  };
  return messages[code] ?? "Something went wrong. Please try again.";
};

const Register = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleEmailSignup = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      if (name.trim()) await updateProfile(cred.user, { displayName: name.trim() });
      toast.success("Account created successfully!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error signing up with email", error);
      toast.error(authErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success("Account created successfully!");
      navigate("/");
    } catch (error) {
      console.error("Error signing up with Google", error);
      toast.error("Failed to sign up with Google");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Link 
          to="/" 
          className="inline-flex items-center text-sm text-body hover:text-heading mb-8 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>
        
        <div className="bg-card border border-border rounded-2xl p-8 shadow-2xl backdrop-blur-sm relative overflow-hidden">
          {/* Glow effect */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tighter text-heading mb-2">Create Account</h1>
            <p className="text-body text-sm">Join the future of algorithmic surfboard design</p>
          </div>

          <div className="space-y-4">
            <Button 
              type="button"
              variant="outline" 
              className="w-full h-12 border-primary/20 hover:bg-primary/10 text-heading font-medium rounded-xl transition-all duration-300"
              onClick={handleGoogleSignup}
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with email</span>
              </div>
            </div>

            <form className="space-y-6" onSubmit={handleEmailSignup}>
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  type="text" 
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Kelly Slater" 
                  className="bg-secondary border-input focus:border-primary/50 text-heading placeholder:text-muted-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="designer@shaper.ai" 
                  className="bg-secondary border-input focus:border-primary/50 text-heading placeholder:text-muted-foreground"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  required
                  minLength={6}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-secondary border-input focus:border-primary/50 text-heading"
                />
              </div>

              <Button type="submit" disabled={submitting} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium py-6 rounded-xl text-base shadow-[0_0_20px_rgba(var(--primary),0.25)] hover:shadow-[0_0_30px_rgba(var(--primary),0.4)] transition-all duration-300">
                {submitting ? "Creating account..." : "Sign Up"}
              </Button>
            </form>
          </div>

          <div className="mt-8 text-center text-sm text-body">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Log in
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
