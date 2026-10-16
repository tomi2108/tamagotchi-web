import { Heart, UserRound, ArrowLeft, PawPrint } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePlayer } from "@/components/PlayerContext";

export default function CaregiverPage() {
  const { player, changePlayer } = usePlayer();

  if (!player) return null;

  return (
    <main className="mx-auto w-full max-w-3xl space-y-6 p-4 md:p-8">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon">
          <Link to="/" aria-label="Volver a la mascota">
            <ArrowLeft className="size-5" />
          </Link>
        </Button>

        <div>
          <h1 className="font-pixel text-lg text-primary">Perfil del cuidador</h1>
          <p className="text-sm text-muted-foreground">Tu lugar en el mundo Tamagotchi</p>
        </div>
      </div>

      <Card className="overflow-hidden border-2 border-primary/30">
        <div className="h-2 bg-primary" />

        <CardContent className="flex flex-col items-center gap-4 py-8 text-center">
          <div className="flex size-24 items-center justify-center rounded-2xl border-2 border-primary/40 bg-primary/10">
            <UserRound className="size-12 text-primary" />
          </div>

          <div className="space-y-2">
            <p className="font-pixel text-[10px] uppercase tracking-widest text-muted-foreground">
              Cuidador oficial
            </p>
            <h2 className="font-pixel text-xl text-primary">{player.name}</h2>
            <p className="text-sm text-muted-foreground">
              Siempre hay lugar para un poco más de cariño.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm text-primary">
            <Heart className="size-4" />
            Parte del equipo de cuidado
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-pixel text-sm">
            <PawPrint className="size-5 text-primary" />
            Tu aventura
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>Cuidá a tu mascota, completá misiones, cultivá tu huerta y descubrí nuevos juegos.</p>
          <p>Cada pequeño gesto ayuda a que la aventura compartida siga creciendo.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-pixel text-sm">Cambiar de cuidador</CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            ¿Otra persona va a cuidar a la mascota? Podés cambiar el perfil activo desde acá.
          </p>

          <Button variant="outline" className="w-full" onClick={changePlayer}>
            <UserRound className="mr-2 size-4" />
            Elegir otro cuidador
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
