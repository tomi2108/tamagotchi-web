import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Coins, ListChecks, LoaderCircle, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { completeMission as claimMission, getDailyMissions, type Mission } from "@/api/missions";

type MissionType = "automatic" | "manual";

export default function MissionsPage() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [claiming, setClaiming] = useState<number>();

  const loadMissions = useCallback(async () => {
    try {
      setError(undefined);
      setMissions(await getDailyMissions());
    } catch {
      setError("No se pudieron cargar las misiones. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadMissions();
  }, [loadMissions]);

  async function handleComplete(missionId: number) {
    try {
      setClaiming(missionId);
      setError(undefined);

      await claimMission(missionId);
      await loadMissions();
    } catch (error) {
      setError(error instanceof Error ? error.message : "No se pudo completar la misión.");
    } finally {
      setClaiming(undefined);
    }
  }

  const automaticMissions = missions.filter((mission) => mission.type === "automatic");
  const manualMissions = missions.filter((mission) => mission.type === "manual");

  const completedCount = missions.filter((mission) => mission.completed_at !== null).length;

  const totalReward = missions.reduce((total, mission) => total + mission.reward_coins, 0);

  function renderMissions(type: MissionType) {
    const items = type === "automatic" ? automaticMissions : manualMissions;

    if (loading) {
      return (
        <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
          <LoaderCircle className="size-4 animate-spin" />
          Cargando misiones...
        </div>
      );
    }

    if (items.length === 0) {
      return (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            No hay misiones disponibles en esta categoría hoy.
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-3">
        {items.map((mission) => {
          const completed = mission.completed_at !== null;
          const canClaim = type === "manual" && !completed;
          const progress = Math.min(mission.progress, mission.target);

          return (
            <Card key={mission.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  {completed ? (
                    <CheckCircle2 className="mt-1 size-5 shrink-0 text-primary" />
                  ) : (
                    <ListChecks className="mt-1 size-5 shrink-0 text-muted-foreground" />
                  )}

                  <div className="min-w-0 flex-1 space-y-1">
                    <CardTitle className="text-base">{mission.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{mission.description}</p>
                  </div>

                  <span className="flex shrink-0 items-center gap-1 text-sm">
                    <Coins className="size-4 text-amber-500" />
                    {mission.reward_coins}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="flex items-center justify-between gap-3 pt-0">
                <div className="text-xs text-muted-foreground">
                  {completed ? (
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="size-4" />
                      Completada
                    </span>
                  ) : (
                    `Progreso: ${progress} / ${mission.target}`
                  )}
                </div>

                {canClaim && (
                  <Button
                    size="sm"
                    onClick={() => void handleComplete(mission.id)}
                    disabled={claiming !== undefined}
                  >
                    {claiming === mission.id ? (
                      <>
                        <LoaderCircle className="size-4 animate-spin" />
                        Reclamando...
                      </>
                    ) : (
                      "Completar"
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="font-pixel text-xl text-primary">Misiones diarias</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Pequeños objetivos para cuidar juntos a nuestra mascota.
        </p>
      </header>

      <Card>
        <CardContent className="flex items-center gap-4 py-5">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Target className="size-6 text-primary" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="font-pixel text-sm">Las misiones de hoy</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Ganá monedas completando objetivos.
            </p>
          </div>

          <Badge variant="secondary">
            {completedCount} / {missions.length}
          </Badge>
        </CardContent>
      </Card>

      {error && (
        <div
          role="alert"
          className="flex items-center justify-between gap-3 rounded-lg border border-destructive/30 p-3 text-sm text-destructive"
        >
          <p>{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void loadMissions()}
            disabled={loading}
          >
            Reintentar
          </Button>
        </div>
      )}

      <Tabs defaultValue="automatic" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="automatic">Automáticas ({automaticMissions.length})</TabsTrigger>
          <TabsTrigger value="manual">Manuales ({manualMissions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="automatic" className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Se completan automáticamente mientras cuidás a tu mascota.
          </p>
          {renderMissions("automatic")}
        </TabsContent>

        <TabsContent value="manual" className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Completá estos objetivos y reclamá tus monedas.
          </p>
          {renderMissions("manual")}
        </TabsContent>
      </Tabs>

      {!loading && missions.length > 0 && (
        <p className="text-center text-xs text-muted-foreground">
          Recompensas disponibles hoy: {totalReward} monedas.
        </p>
      )}
    </div>
  );
}
