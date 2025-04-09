import Clock from "./Clock";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { getAuth } from "firebase/auth";
import { ref, set, onValue, remove, get } from "firebase/database";
import Header from "../Dashboard Page/Header";
import { database } from "../../config/firebase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faEdit } from "@fortawesome/free-solid-svg-icons";
import { Schedule } from "../../types/schedule";

const Main = () => {
  const [showTime, setShowTime] = useState(false);
  const [startTime, setStartTime] = useState("");
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentLifeStage, setCurrentLifeStage] = useState("fingerling");
  const [fishPopulation, setFishPopulation] = useState(100);
  const [feedDuration, setFeedDuration] = useState(5);

  useEffect(() => {
    const uid = getAuth().currentUser?.uid;
    if (!uid) return;

    const timersRef = ref(database, `BANGUS/${uid}/timers`);
    const unsubscribe = onValue(timersRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setSchedules([]);
        return;
      }

      const scheduleList: Schedule[] = Object.entries(data).map(
        ([id, value]: [string, any]) => ({
          id,
          start: value.start,
        })
      );

      // Sort schedules by time
      scheduleList.sort((a, b) => a.start.localeCompare(b.start));
      setSchedules(scheduleList);
    });

    // Load fish data (life stage, population, feed duration)
    const fishDataRef = ref(database, `BANGUS/${uid}/fishData`);
    onValue(fishDataRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        if (data.lifeStage) setCurrentLifeStage(data.lifeStage);
        if (data.population) setFishPopulation(data.population);
        if (data.feedDuration) setFeedDuration(data.feedDuration);
      }
    });

    return () => unsubscribe();
  }, []);

  const triggerFeedNow = async () => {
    const uid = getAuth().currentUser?.uid;
    try {
      // Send feed command with life stage parameters
      await set(ref(database, `BANGUS/${uid}/feedNow`), {
        active: true,
        lifeStage: currentLifeStage,
        population: fishPopulation,
        duration: feedDuration,
      });

      console.log("Feed now triggered with life stage:", currentLifeStage);
      toast.success("Feed now triggered successfully!", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: true,
      });

      // Reset feedNow to false after the specified duration + buffer time
      setTimeout(async () => {
        await set(ref(database, `BANGUS/${uid}/feedNow`), {
          active: false,
          lifeStage: currentLifeStage,
          population: fishPopulation,
          duration: feedDuration,
        });
        console.log("Feed now reset");
      }, (feedDuration + 2) * 1000); // Add 2 seconds buffer
    } catch (error) {
      console.log("Error triggering feed now:", error);
      toast.error("An error occurred. Please try again.", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: true,
      });
    }
  };

  // Helper function to find the next available timer index
  const getNextTimerIndex = async (uid: string) => {
    const timersRef = ref(database, `BANGUS/${uid}/timers`);
    const snapshot = await get(timersRef);
    const data = snapshot.val() || {};

    // Find all existing sequential timer IDs
    const existingIndices = Object.keys(data)
      .filter((key) => key.startsWith("timer") && /^timer\d+$/.test(key))
      .map((key) => parseInt(key.replace("timer", ""), 10))
      .filter((num) => !isNaN(num));

    // Find the next available index
    let nextIndex = 0;
    while (existingIndices.includes(nextIndex)) {
      nextIndex++;
    }

    return nextIndex;
  };

  const createSchedule = async () => {
    if (!startTime) {
      toast.error("Please select a time", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: true,
      });
      return;
    }

    const uid = getAuth().currentUser?.uid;
    try {
      if (!uid) return;
      const nextIndex = await getNextTimerIndex(uid);
      const timerId = `timer${nextIndex}`;

      await set(ref(database, `BANGUS/${uid}/timers/${timerId}`), {
        start: startTime,
      });

      console.log("Schedule created with ID:", timerId);
      toast.success("Schedule created successfully!", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: true,
      });

      setStartTime("");
      setShowTime(false);
    } catch (error) {
      console.log("Error creating schedule:", error);
      toast.error("Error creating schedule: " + error, {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: true,
      });
    }
  };

  const updateSchedule = async () => {
    if (!startTime || !editingId) {
      toast.error("Please select a time", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: true,
      });
      return;
    }

    const uid = getAuth().currentUser?.uid;
    try {
      await set(ref(database, `BANGUS/${uid}/timers/${editingId}`), {
        start: startTime,
      });

      console.log("Schedule updated");
      toast.success("Schedule updated successfully!", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: true,
      });

      setStartTime("");
      setEditingId(null);
    } catch (error) {
      console.log("Error updating schedule:", error);
      toast.error("Error updating schedule: " + error, {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: true,
      });
    }
  };

  const deleteSchedule = async (id: string) => {
    const uid = getAuth().currentUser?.uid;
    try {
      await remove(ref(database, `BANGUS/${uid}/timers/${id}`));

      console.log("Schedule deleted");
      toast.success("Schedule deleted successfully!", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: true,
      });

      if (editingId === id) {
        setStartTime("");
        setEditingId(null);
      }
    } catch (error) {
      console.log("Error deleting schedule:", error);
      toast.error("Error deleting schedule: " + error, {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: true,
      });
    }
  };

  const startEditing = (schedule: Schedule) => {
    setStartTime(schedule.start);
    setEditingId(schedule.id);
    setShowTime(true);
  };

  const cancelEditing = () => {
    setStartTime("");
    setEditingId(null);
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        <main className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-md p-6 max-w-2xl mx-auto">
            <h1 className="app-header text-2xl text-center font-semibold text-gray-900 mb-8">
              Fish Feeding Automation
            </h1>
            <Clock />
            <div className="flex flex-col gap-4 items-center">
              <div className="flex gap-4">
                <button
                  onClick={triggerFeedNow}
                  className="px-6 py-2 bg-bangus-teal text-white rounded-full hover:bg-bangus-cyan transition-colors"
                >
                  Feed Now
                </button>
                <button
                  onClick={() => {
                    setShowTime(!showTime);
                    if (editingId) {
                      cancelEditing();
                    }
                  }}
                  className="px-6 py-2 bg-gray-50 text-gray-500 rounded-full hover:text-bangus-teal transition-colors"
                >
                  {editingId
                    ? "Cancel Edit"
                    : showTime
                    ? "Hide Form"
                    : "Add Schedule"}
                </button>
              </div>

              {showTime && (
                <div className="flex flex-col mt-2 gap-2 w-full max-w-xs">
                  <div className="flex justify-between items-center">
                    <label
                      htmlFor="startTime"
                      className="text-sm text-gray-600"
                    >
                      {editingId ? "Update Time:" : "Start Time:"}
                    </label>
                    <input
                      type="time"
                      id="startTime"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="px-2 py-1 border rounded-md text-sm"
                    />
                  </div>
                  <button
                    onClick={editingId ? updateSchedule : createSchedule}
                    className="px-6 py-2 bg-bangus-teal text-white rounded-full hover:bg-bangus-cyan transition-colors"
                  >
                    {editingId ? "Update Schedule" : "Add Schedule"}
                  </button>
                </div>
              )}

              <div className="w-full mt-6">
                <h2 className="app-header text-md font-medium text-gray-900 mb-3">
                  Feeding Schedules
                </h2>
                {schedules.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    No schedules yet. Add your first feeding schedule!
                  </p>
                ) : (
                  <div className="border rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Time
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {schedules.map((schedule) => (
                          <tr key={schedule.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {new Date(
                                `2000-01-01T${schedule.start}`
                              ).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                              })}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => startEditing(schedule)}
                                className="text-bangus-teal hover:text-bangus-cyan mr-4"
                                aria-label="Edit schedule"
                                title="Edit"
                              >
                                <FontAwesomeIcon icon={faEdit} />
                              </button>
                              <button
                                onClick={() => deleteSchedule(schedule.id)}
                                className="text-red-500 hover:text-red-700"
                                aria-label="Delete schedule"
                                title="Delete"
                              >
                                <FontAwesomeIcon icon={faTrash} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default Main;
