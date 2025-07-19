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
import { createNotification } from "../../utils/notifications";

const Main = () => {
  const [showTime, setShowTime] = useState(false);
  const [startTime, setStartTime] = useState("");
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentLifeStage, setCurrentLifeStage] = useState("fingerling");
  const [, setFishPopulation] = useState(100);
  const [, setFeedDuration] = useState(5);
  const [feedingSessions, setFeedingSessions] = useState(4);

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

      const scheduleList: Schedule[] = Object.entries(data as Record<string, Schedule>).map(
        ([id, value]) => ({
          id,
          start: value.start,
          lifeStage: value.lifeStage || currentLifeStage,
        })
      );

      scheduleList.sort((a, b) => a.start.localeCompare(b.start));
      setSchedules(scheduleList);
    });

    const fishDataRef = ref(database, `BANGUS/${uid}/fishData`);
    onValue(fishDataRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        if (data.lifeStage) setCurrentLifeStage(data.lifeStage);
        if (data.population) setFishPopulation(data.population);
        if (data.feedDuration) setFeedDuration(data.feedDuration);
        if (data.feedingSessions) setFeedingSessions(data.feedingSessions);
      }
    });

    return () => unsubscribe();
  }, [currentLifeStage]);

  // Removed triggerFeedNow function

  const getNextTimerIndex = async (uid: string) => {
    const timersRef = ref(database, `BANGUS/${uid}/timers`);
    const snapshot = await get(timersRef);
    const data = snapshot.val() || {};

    const existingIndices = Object.keys(data)
      .filter((key) => key.startsWith("timer") && /^timer\d+$/.test(key))
      .map((key) => parseInt(key.replace("timer", ""), 10))
      .filter((num) => !isNaN(num));

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

      if (schedules.length >= feedingSessions) {
        toast.error(
          `Maximum of ${feedingSessions} feeding sessions allowed for ${getLifeStageName(
            currentLifeStage
          )}`,
          {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: true,
          }
        );
        return;
      }

      // Check for conflicts with existing schedules
      const [startHour, startMinute] = startTime.split(":").map(Number);
      const newTimeInMinutes = startHour * 60 + startMinute;

      // Check if the new time is within 5 minutes of any existing schedule
      const conflictingSchedule = schedules.find(schedule => {
        const [scheduleHour, scheduleMinute] = schedule.start.split(":").map(Number);
        const scheduleTimeInMinutes = scheduleHour * 60 + scheduleMinute;

        const timeDifference = Math.abs(
          newTimeInMinutes - scheduleTimeInMinutes
        );

        return timeDifference < 5 || (1440 - timeDifference) < 5;
      });
      
      if (conflictingSchedule) {
        // Format the conflicting time for display
        const conflictTime = new Date(
          `2000-01-01T${conflictingSchedule.start}`
        ).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
        
        toast.error(
          <div>
            <p>Schedules must be at least 5 minutes apart</p>
            <p className="text-xs mt-1">
              Conflicts with existing schedule at {conflictTime}
            </p>
          </div>,
          {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: true,
            closeOnClick: true,
          }
        );
        
        // Still create a notification for the system log
        await createNotification(
          "schedule_conflict",
          "Feeding schedule conflict prevented",
          {
            description: "Schedules must be at least 5 minutes apart to ensure proper operation",
            attemptedTime: startTime,
            conflictingTime: conflictingSchedule.start
          }
        );
        
        return;
      }

      // Continue with creating the schedule as before
      const nextIndex = await getNextTimerIndex(uid);
      const timerId = `timer${nextIndex}`;
      const timerRef = ref(database, `BANGUS/${uid}/timers/${timerId}`);

      await set(timerRef, {
        start: startTime,
        lifeStage: currentLifeStage,
      });

      setStartTime("");
      setShowTime(false);

      toast.success("Feeding schedule created", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: true,
      });
    } catch (error) {
      console.error("Error creating schedule:", error);
      toast.error("Failed to create schedule", {
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
      const [startHour, startMinute] = startTime.split(":").map(Number);
      const newTimeInMinutes = startHour * 60 + startMinute;
      
      const conflictingSchedule = schedules.find(schedule => {
        if (schedule.id === editingId) return false;
        
        const [scheduleHour, scheduleMinute] = schedule.start.split(":").map(Number);
        const scheduleTimeInMinutes = scheduleHour * 60 + scheduleMinute;
      
        const timeDifference = Math.abs(newTimeInMinutes - scheduleTimeInMinutes);
      
        return timeDifference < 5 || (1440 - timeDifference) < 5;
      });
      
      if (conflictingSchedule) {
        const conflictTime = new Date(
          `2000-01-01T${conflictingSchedule.start}`
        ).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
        
        toast.error(
          <div>
            <p>Schedules must be at least 5 minutes apart</p>
            <p className="text-xs mt-1">
              Conflicts with existing schedule at {conflictTime}
            </p>
          </div>,
          {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: true,
            closeOnClick: true,
          }
        );
        
        await createNotification(
          "schedule_conflict",
          "Feeding schedule update conflict prevented",
          {
            description: "Schedules must be at least 5 minutes apart to ensure proper operation",
            attemptedTime: startTime,
            conflictingTime: conflictingSchedule.start
          }
        );
        
        return;
      }

      await set(ref(database, `BANGUS/${uid}/timers/${editingId}`), {
        start: startTime,
        lifeStage: currentLifeStage,
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

  const getLifeStageName = (stageId: string) => {
    const stages = {
      fry: "Fry",
      fingerling: "Fingerling",
      juvenile: "Juvenile",
      adult: "Adult",
    };
    return stages[stageId as keyof typeof stages] || stageId;
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
                {/* Removed Feed Now button */}
                <button
                  onClick={() => {
                    setShowTime(!showTime);
                    if (editingId) {
                      cancelEditing();
                    }
                  }}
                  className="px-6 py-2 bg-bangus-cyan text-white rounded-full hover:bg-bangus-teal transition-colors"
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
                  
                  <p className="text-xs text-gray-500 italic mt-1 text-center">
                    Note: Schedules must be at least 5 minutes apart to prevent conflicts
                  </p>
                  
                  <button
                    onClick={editingId ? updateSchedule : createSchedule}
                    className="px-6 py-2 bg-bangus-cyan text-white rounded-full hover:bg-bangus-teal transition-colors"
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
                          <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Life Stage
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
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                              {getLifeStageName(
                                schedule.lifeStage || currentLifeStage
                              )}
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
