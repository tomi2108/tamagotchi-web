import "./App.css";
// import EspStatus from "./components/EspStatus";
import MessageForm from "./components/MessageForm";

export default function App() {
  return (
    <main className="dark flex min-h-screen items-center justify-center">
      <MessageForm />
      {/* <EspStatus />*/}
    </main>
  );
}
