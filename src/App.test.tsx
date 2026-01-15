import { Route } from "@solidjs/router";
import Login from "./pages/Login";
import Chat from "./pages/Chat";

function App() {
  console.log("App component rendering");

  return (
    <div>
      <Route path="/login" component={Login} />
      <Route path="/" component={Chat} />
    </div>
  );
}

export default App;
