import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getConfiguredPassword, grantAccess, verifyPassword } from "@/lib/app-access";

type LoginPageProps = {
  onUnlocked: () => void;
};

export function LoginPage({ onUnlocked }: LoginPageProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!getConfiguredPassword()) {
      setError(
        "Senha não configurada. Defina VITE_APP_ACCESS_PASSWORD no ficheiro .env (veja .env.example).",
      );
      return;
    }

    if (!verifyPassword(password)) {
      setError("Senha incorreta.");
      return;
    }

    grantAccess();
    onUnlocked();
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md shadow-md">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Acesso</CardTitle>
          <CardDescription>
            Introduza a senha para continuar para a aplicação Pago Nube.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="app-password">Senha</Label>
              <Input
                id="app-password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(ev) => setPassword(ev.target.value)}
                placeholder="••••••••"
                aria-invalid={error ? true : undefined}
              />
            </div>
            {error ? (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            ) : null}
            <Button type="submit" className="w-full">
              Entrar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
