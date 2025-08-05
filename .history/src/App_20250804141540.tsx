import { ReactorPanel } from "@/panels/ReactorPanel";
import { TopBar } from "@/layout/TopBar";

function App() {
  return (
    <div className="min-h-screen bg-black p-4 text-white">
      <TopBar />
      <div className="mt-6">
        <ReactorPanel />
      </div>
    </div>
  );
}

export default App;
