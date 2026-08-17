import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { signUpAsReviewer } from "@/lib/data.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import logo from "@/assets/fundezer-icon.png.asset.json";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — FundEzer Hospital Portal" },
      { name: "description", content: "Hospital reviewer sign-in for the FundEzer portal." },
      { property: "og:title", content: "Sign in — FundEzer Hospital Portal" },
      { property: "og:description", content: "Hospital reviewer sign-in for the FundEzer portal." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const signIn = async () => {
    if (!email.trim() || !password.trim()) {
      toast.error("Enter your email and password.");
      return;
    }
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setIsLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Signed in.");
    navigate({ to: "/" });
  };

  const signUp = async () => {
    if (!email.trim() || !password.trim()) {
      toast.error("Enter your email and password.");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    setIsLoading(true);
    try {
      await signUpAsReviewer({ data: { email: email.trim(), password } });
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Account created. You are now signed in as a reviewer.");
      navigate({ to: "/" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create account.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <img src={logo.url} alt="FundEzer logo" className="h-12 w-12" />
          </div>
          <CardTitle>FundEzer Hospital Portal</CardTitle>
          <CardDescription>Sign in as a hospital reviewer to update applications and manage payments.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Create account</TabsTrigger>
            </TabsList>
            <TabsContent value="signin" className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="reviewer@hospital.org"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              <Button className="w-full" onClick={signIn} disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </TabsContent>
            <TabsContent value="signup" className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="reviewer@hospital.org"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                />
              </div>
              <Button className="w-full" onClick={signUp} disabled={isLoading}>
                {isLoading ? "Creating account..." : "Create account"}
              </Button>
            </TabsContent>
          </Tabs>
          <p className="text-center text-sm text-muted-foreground">
            <Link to="/" className="text-primary underline">
              Continue without signing in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

