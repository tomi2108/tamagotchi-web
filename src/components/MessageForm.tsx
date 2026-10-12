import { useState, type SubmitEvent } from "react";
import { Card, CardContent, CardFooter } from "./ui/card";
import { Button } from "./ui/button";
import { Spinner } from "./ui/spinner";
import { Input } from "@base-ui/react/input";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { api } from "@/api";

type Message = {
  senderId: string;
  content: string;
  recipientId: string;
};

async function postMessage(message: Message) {
  await api.post("/message", message)
}


function MessageForm() {
  const [recipientId, setRecipientId] = useState<"tomi" | "rochi">("tomi");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const clearForm = () => {
    setContent("");
  };

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    setLoading(true);
    e.preventDefault();
    //TODO: make screen to select senderId
    await postMessage({ senderId: "tomi", content, recipientId });
    clearForm();
    setLoading(false);
  };

  return (
    <Card className="w-full max-w-sm">
      <form onSubmit={handleSubmit}>
        <CardContent>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="mensaje">Mensaje</Label>
              <Input
                disabled={loading}
                id="mensaje"
                type="text"
                placeholder="Escribí un mensaje..."
                value={content}
                required
                onChange={(e) => setContent(e.target.value)}
              />
            </div>
          </div>
          <div className="mt-6">
            <RadioGroup
              disabled={loading}
              value={recipientId}
              onValueChange={setRecipientId}
              className="flex flex-row gap-6"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="tomi" id="tomi" />
                <Label htmlFor="tomi">Tomi</Label>
              </div>

              <div className="flex items-center gap-2">
                <RadioGroupItem value="rochi" id="rochi" />
                <Label htmlFor="rochi">Rochi</Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
        <CardFooter className="mt-6 flex-col gap-2">
          <Button disabled={loading} type="submit" className="w-full">
            {loading && (
              <>
                <Spinner data-icon="inline-start" />
                Enviando...
              </>
            )}
            {!loading && "Enviar"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

export default MessageForm;
