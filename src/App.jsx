import "./App.css";
import Allroutes from "./routes/Allroutes";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <div className="app">
      <Toaster position="top-center" />
      <Allroutes />
    </div>
  );
}
export default App;
