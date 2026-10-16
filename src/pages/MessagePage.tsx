import { useEffect, useState, type FormEvent } from "react";
import { Heart, Send, CheckCircle2, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { getPlayers, type Player } from "@/api/players";
import { postMessage } from "@/api/messages";
import { usePlayer } from "@/components/PlayerContext";

export default function MessagesPage() {
  const { player } = usePlayer();

  const [players, setPlayers] = useState<Player[]>([]);
  const [recipientId, setRecipientId] = useState<string>("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingPlayers, setLoadingPlayers] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    let cancelled = false;

    getPlayers()
      .then((data) => {
        if (cancelled) return;

        setPlayers(data);

        const recipient = data.find((item) => item.id !== player?.id);
        if (recipient) setRecipientId(String(recipient.id));
      })
      .catch(() => {
        if (!cancelled) {
          setError("No se pudieron cargar los jugadores.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingPlayers(false);
      });

    return () => {
      cancelled = true;
    };
  }, [player?.id]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const message = content.trim();
    const selectedRecipientId = Number(recipientId);

    if (
      !message ||
      loading ||
      !player ||
      !Number.isSafeInteger(selectedRecipientId) ||
      selectedRecipientId <= 0 ||
      selectedRecipientId === player.id
    ) {
      return;
    }

    setLoading(true);
    setError(null);
    setSent(false);

    try {
      await postMessage({
        senderId: player.id,
        content: message,
        recipientId: selectedRecipientId,
      });

      setContent("");
      setSent(true);
    } catch {
      setError("No se pudo enviar el mensaje. Intentá nuevamente.");
    } finally {
      setLoading(false);
    }
  }

  const recipients = players.filter((item) => item.id !== player?.id);

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Mensajes</h1>
        <p className="mt-1 text-muted-foreground">
          Dejá una pequeña sorpresa para tu persona favorita.
        </p>
      </header>

      <Card>
        <CardHeader className="items-center text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-primary/10">
            <Heart className="size-7 text-primary" strokeWidth={1.5} />
          </div>
          <CardTitle>Un mensaje para vos</CardTitle>
          <CardDescription>Escribí algo lindo para que lo encuentre después.</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label>Enviar desde</Label>
              <div className="flex items-center gap-3 rounded-lg border border-primary bg-primary/5 p-4">
                <UserRound className="size-5 text-primary" />
                <span>{player?.name ?? "Jugador no seleccionado"}</span>
              </div>
            </div>

            <fieldset
              disabled={loading || loadingPlayers || recipients.length === 0}
              className="space-y-3"
            >
              <Label>Enviar a</Label>

              <RadioGroup
                value={recipientId}
                onValueChange={setRecipientId}
                className="grid grid-cols-2 gap-3"
              >
                {recipients.map((recipient) => (
                  <Label
                    key={recipient.id}
                    htmlFor={`recipient-${recipient.id}`}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 ${recipientId === String(recipient.id)
                        ? "border-primary bg-primary/5"
                        : "border-border"
                      }`}
                  >
                    <RadioGroupItem value={String(recipient.id)} id={`recipient-${recipient.id}`} />
                    <span>{recipient.name}</span>
                  </Label>
                ))}
              </RadioGroup>
            </fieldset>

            {!loadingPlayers && recipients.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No hay otros jugadores disponibles para recibir mensajes.
              </p>
            )}

            <div className="space-y-2">
              <Label htmlFor="message-content">Tu mensaje</Label>
              <Textarea
                id="message-content"
                value={content}
                onChange={(event) => {
                  setContent(event.target.value);
                  setSent(false);
                }}
                placeholder="Escribí algo lindo..."
                maxLength={500}
                rows={5}
                required
                disabled={loading}
                className="resize-y"
              />
              <p className="text-right text-xs text-muted-foreground">{content.length}/500</p>
            </div>

            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}

            {sent && (
              <p role="status" className="flex items-center gap-2 text-sm text-primary">
                <CheckCircle2 className="size-4" />
                Mensaje enviado.
              </p>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={
                loading ||
                loadingPlayers ||
                !player ||
                !recipientId ||
                !content.trim() ||
                recipients.length === 0
              }
            >
              {loading ? (
                "Enviando..."
              ) : (
                <>
                  <Send className="mr-2 size-4" />
                  Enviar mensaje
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
