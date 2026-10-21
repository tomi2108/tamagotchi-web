import { useCallback, useEffect, useState } from "react";
import {
  Check,
  CheckCircle2,
  Coins,
  Clock,
  ListChecks,
  LoaderCircle,
  Target,
} from "lucide-react";
import {
  completeMission as claimMission,
  getDailyMissions,
  type Mission,
} from "@/api/missions";
import { formatRemaining } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePet } from "@/components/PetContext";

type MissionType = "automatic" | "manual";

export default function MissionsPage() {
  const { pet } = usePet();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [claiming, setClaiming] = useState<number>();
  const [nextResetAt, setNextResetAt] = useState<string>();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const loadMissions = useCallback(async () => {
    try {
      setError(undefined);

      const data = await getDailyMissions();

      setMissions(data.missions);
      setNextResetAt(data.nextResetAt);
    } catch {
      setError("No se pudieron cargar las misiones. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!nextResetAt || now < new Date(nextResetAt).getTime()) return;
    void loadMissions();
  }, [now, nextResetAt, loadMissions]);

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
      setError(
        error instanceof Error
          ? error.message
          : "No se pudo completar la misión.",
      );
    } finally {
      setClaiming(undefined);
    }
  }

  const automaticMissions = missions.filter(
    (mission) => mission.type === "automatic",
  );
  const manualMissions = missions.filter(
    (mission) => mission.type === "manual",
  );

  const completedCount = missions.filter(
    (mission) => mission.completed_at !== null,
  ).length;

  const totalReward = missions.reduce(
    (total, mission) => total + mission.reward_coins,
    0,
  );

  const resetRemaining = nextResetAt ? formatRemaining(nextResetAt, now) : null;

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
          const progressPercent =
            mission.target > 0 ? (progress / mission.target) * 100 : 0;

          return (
            <Card
              key={mission.id}
              className={
                completed
                  ? "border-primary/25 bg-primary/[0.03]"
                  : "transition-colors"
              }
            >
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl ${
                      completed
                        ? "bg-primary/15 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {completed ? (
                      <Check className="size-5" />
                    ) : (
                      <ListChecks className="size-5" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <CardTitle className="text-base leading-snug">
                      {mission.title}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {mission.description.replaceAll(
                        "tu mascota",
                        pet?.name ?? "tu mascota",
                      )}
                    </p>
                  </div>

                  <span className="flex shrink-0 items-center gap-1 rounded-lg bg-amber-500/10 px-2 py-1 text-sm font-medium tabular-nums text-amber-600 dark:text-amber-400">
                    <Coins className="size-4" />
                    {mission.reward_coins}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="flex items-center gap-3 pt-0">
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      {completed && (
                        <CheckCircle2 className="size-3.5 text-primary" />
                      )}
                      <span className="sr-only">
                        {completed ? "Completada" : "Progreso"}
                      </span>
                    </span>

                    <span className="font-medium tabular-nums text-foreground">
                      {completed ? mission.target : progress}/{mission.target}
                    </span>
                  </div>

                  <Progress
                    value={completed ? 100 : progressPercent}
                    className="h-2"
                    aria-label={`Progreso de ${mission.title}`}
                  />
                </div>

                {canClaim && (
                  <Button
                    size="sm"
                    onClick={() => void handleComplete(mission.id)}
                    disabled={claiming !== undefined}
                    className="shrink-0"
                  >
                    {claiming === mission.id ? (
                      <LoaderCircle className="size-4 animate-spin" />
                    ) : (
                      <>
                        <Check className="size-4" />
                        Reclamar
                      </>
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

        {resetRemaining !== null && (
          <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock className="size-4" />
            Se renuevan en {resetRemaining}
          </p>
        )}
      </header>

      <Card>
        <CardContent className="space-y-4 py-5">
          <div className="flex items-center gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Target className="size-6 text-primary" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="font-pixel text-sm">Las misiones de hoy</p>
              <p className="mt-1 text-sm text-muted-foreground">
                <Coins className="mr-1 inline size-3.5 text-amber-500" />
                {totalReward} monedas en recompensas
              </p>
            </div>

            <Badge variant="secondary" className="shrink-0 tabular-nums">
              {completedCount}/{missions.length}
            </Badge>
          </div>

          <Progress
            value={
              missions.length > 0 ? (completedCount / missions.length) * 100 : 0
            }
            className="h-2.5"
            aria-label="Progreso de misiones diarias"
          />
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
          <TabsTrigger value="automatic">{pet?.name}</TabsTrigger>
          <TabsTrigger value="manual">Tú</TabsTrigger>
        </TabsList>

        <TabsContent value="automatic" className="space-y-3">
          {renderMissions("automatic")}
        </TabsContent>

        <TabsContent value="manual" className="space-y-3">
          {renderMissions("manual")}
        </TabsContent>
      </Tabs>
    </div>
  );
}
