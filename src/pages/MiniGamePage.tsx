import { Link } from "react-router-dom";
import { ArrowLeft, Gamepad2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  name: string;
  description: string;
};

export default function MinigamePage({ name, description }: Props) {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="outline">
          <Link to="/games">
            <ArrowLeft className="mr-2 size-4" />
            Sala de juegos
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="items-center text-center">
          <div className="flex size-14 items-center justify-center rounded-xl bg-primary/10">
            <Gamepad2 className="size-7 text-primary" />
          </div>
          <CardTitle className="font-pixel text-lg">{name}</CardTitle>
          <p className="text-sm text-muted-foreground">{description}</p>
        </CardHeader>

        <CardContent className="py-8 text-center">
          <p className="font-pixel text-sm text-primary">Próximamente</p>
          <p className="mt-3 text-sm text-muted-foreground">Estamos preparando este minijuego.</p>
        </CardContent>
      </Card>
    </div>
  );
}
