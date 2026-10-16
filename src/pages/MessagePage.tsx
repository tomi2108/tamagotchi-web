import { useState, type FormEvent } from "react";
import { Heart, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { postMessage } from "@/api/messages";
import { Textarea } from "@/components/ui/textarea";

type UserId = "tomi" | "rochi";

export default function MessagesPage() {
  const [senderId, setSenderId] = useState<UserId>("tomi");
  const [recipientId, setRecipientId] = useState<UserId>("rochi");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const message = content.trim();
    if (!message || loading) return;

    setLoading(true);
    setError(null);
    setSent(false);

    try {
      await postMessage({ senderId, content: message, recipientId });
      setContent("");
      setSent(true);
    } catch {
      setError("No se pudo enviar el mensaje. Intentá nuevamente.");
    } finally {
      setLoading(false);
    }
  }

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
            <fieldset disabled={loading} className="space-y-3">
              <Label>Enviar desde</Label>
              <RadioGroup
                value={senderId}
                onValueChange={(value) => setSenderId(value as UserId)}
                className="grid grid-cols-2 gap-3"
              >
                {(["tomi", "rochi"] as const).map((user) => (
                  <Label
                    key={user}
                    htmlFor={`sender-${user}`}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 ${senderId === user ? "border-primary bg-primary/5" : "border-border"
                      }`}
                  >
                    <RadioGroupItem value={user} id={`sender-${user}`} />
                    <span>{user === "tomi" ? "Tomi" : "Rochi"}</span>
                  </Label>
                ))}
              </RadioGroup>
            </fieldset>

            <fieldset disabled={loading} className="space-y-3">
              <Label>Enviar a</Label>
              <RadioGroup
                value={recipientId}
                onValueChange={(value) => setRecipientId(value as UserId)}
                className="grid grid-cols-2 gap-3"
              >
                {(["tomi", "rochi"] as const).map((user) => (
                  <Label
                    key={user}
                    htmlFor={`recipient-${user}`}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 ${recipientId === user ? "border-primary bg-primary/5" : "border-border"
                      }`}
                  >
                    <RadioGroupItem value={user} id={`recipient-${user}`} />
                    <span>{user === "tomi" ? "Tomi" : "Rochi"}</span>
                  </Label>
                ))}
              </RadioGroup>
            </fieldset>

            {senderId === recipientId && (
              <p className="text-sm text-muted-foreground">
                Estás enviando un mensaje a la misma persona que lo envía.
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
              <p role="status" className="text-sm text-primary">
                ¡Mensaje enviado! ❤️
              </p>
            )}

            <Button type="submit" className="w-full" disabled={loading || !content.trim()}>
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
