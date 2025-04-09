import SensorsForm from "./SensorsForm";
import Header from "../Dashboard Page/Header";

const Settings = () => {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <main className="container max-w-7xl mx-auto">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">
            Device Configuration
          </h1>
          <div className="flex justify-center">
            <SensorsForm />
          </div>
        </main>
      </div>
    </>
  );
};

export default Settings;
