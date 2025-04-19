import SensorsForm from "./SensorsForm";
import Header from "../Dashboard Page/Header";
import Population from "../Fish Feeding Page/Population";
import DeviceStatus from "../DeviceStatus/DeviceStatus";

const Settings = () => {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <main className="container max-w-7xl mx-auto">
          <h1 className="app-header text-2xl font-semibold text-gray-900 mb-8">
            Device Configuration
          </h1>

          <div className="mb-8">
            <DeviceStatus />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div>
              <h2 className="app-header text-xl font-medium text-gray-900 mb-4">
                Fish Population Settings
              </h2>
              <Population />
            </div>

            <div>
              <h2 className="app-header text-xl font-medium text-gray-900 mb-4">
                Sensor Configuration
              </h2>
              <SensorsForm />
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default Settings;
