import { useEffect, useState, useRef } from "react";
import { getAuth } from "firebase/auth";
import { onValue, ref, set } from "firebase/database";
import { database } from "../../config/firebase";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFish } from "@fortawesome/free-solid-svg-icons";

const LIFE_STAGES = [
  {
    id: "fry",
    name: "Fry (0-30 days)",
    feedAmount: "small",
    feedFrequency: "high",
    recommendedSessions: 6,
  },
  {
    id: "fingerling",
    name: "Fingerling (1-3 months)",
    feedAmount: "medium",
    feedFrequency: "medium-high",
    recommendedSessions: 4,
  },
  {
    id: "juvenile",
    name: "Juvenile (3-5 months)",
    feedAmount: "medium-large",
    feedFrequency: "medium",
    recommendedSessions: 3,
  },
  {
    id: "adult",
    name: "Adult (5+ months)",
    feedAmount: "large",
    feedFrequency: "medium-low",
    recommendedSessions: 2,
  },
];

const Population = () => {
  const [currentLifeStage, setCurrentLifeStage] = useState("fingerling");
  const [fishPopulation, setFishPopulation] = useState(100);
  const [feedDuration, setFeedDuration] = useState(5);
  const [feedingSessions, setFeedingSessions] = useState(4);
  const feedDurationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lifeStageTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const populationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const feedingSessionsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const uid = getAuth().currentUser?.uid;
    if (!uid) return;

    const fishDataRef = ref(database, `BANGUS/${uid}/fishData`);
    const unsubscribe = onValue(fishDataRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        if (data.lifeStage) setCurrentLifeStage(data.lifeStage);
        if (data.population) setFishPopulation(data.population);
        if (data.feedDuration) setFeedDuration(data.feedDuration);
      } else {
        const stage = LIFE_STAGES.find(
          (s) => s.id === (data.lifeStage || currentLifeStage)
        );
        if (stage) setFeedingSessions(stage.recommendedSessions);
      }
    });

    return () => unsubscribe();
  }, []);

  const updateLifeStage = async (stage: string) => {
    setCurrentLifeStage(stage);

    const stageData = LIFE_STAGES.find((s) => s.id === stage);
    if (stageData) {
      setFeedingSessions(stageData.recommendedSessions);
    }

    if (lifeStageTimeoutRef.current) {
      clearTimeout(lifeStageTimeoutRef.current);
    }

    lifeStageTimeoutRef.current = setTimeout(async () => {
      const uid = getAuth().currentUser?.uid;
      if (!uid) return;

      try {
        const updates: { [key: string]: any } = {
          lifeStage: stage,
        };

        if (stageData) {
          updates.feedingSessions = stageData.recommendedSessions;
        }

        await set(ref(database, `BANGUS/${uid}/fishData/lifeStage`), stage);
        toast.success("Life stage updated successfully!", {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: true,
        });
      } catch (error) {
        console.log("Error updating life stage:", error);
        toast.error("Error updating life stage", {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: true,
        });
      }
    }, 500); // 500ms delay
  };

  const updatePopulation = async (population: number) => {
    setFishPopulation(population);

    if (populationTimeoutRef.current) {
      clearTimeout(populationTimeoutRef.current);
    }

    populationTimeoutRef.current = setTimeout(async () => {
      const uid = getAuth().currentUser?.uid;
      if (!uid) return;

      try {
        await set(
          ref(database, `BANGUS/${uid}/fishData/population`),
          population
        );
        toast.success("Population updated successfully!", {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: true,
        });
      } catch (error) {
        console.log("Error updating population:", error);
        toast.error("Error updating population", {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: true,
        });
      }
    }, 500); // 500ms delay
  };

  const updateFeedDuration = async (duration: number) => {
    setFeedDuration(duration);

    if (feedDurationTimeoutRef.current) {
      clearTimeout(feedDurationTimeoutRef.current);
    }

    feedDurationTimeoutRef.current = setTimeout(async () => {
      const uid = getAuth().currentUser?.uid;
      if (!uid) return;

      try {
        await set(
          ref(database, `BANGUS/${uid}/fishData/feedDuration`),
          duration
        );
        toast.success("Feed duration updated successfully!", {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: true,
        });
      } catch (error) {
        console.log("Error updating feed duration:", error);
        toast.error("Error updating feed duration", {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: true,
        });
      }
    }, 500); // 500ms delay
  };

  const updateFeedingSessions = async (sessions: number) => {
    setFeedingSessions(sessions);

    if (feedingSessionsTimeoutRef.current) {
      clearTimeout(feedingSessionsTimeoutRef.current);
    }

    feedingSessionsTimeoutRef.current = setTimeout(async () => {
      const uid = getAuth().currentUser?.uid;
      if (!uid) return;

      try {
        await set(
          ref(database, `BANGUS/${uid}/fishData/feedingSessions`),
          sessions
        );
        toast.success("Feeding sessions updated successfully!", {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: true,
        });
      } catch (error) {
        console.log("Error updating feeding sessions:", error);
        toast.error("Error updating feeding sessions", {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: true,
        });
      }
    }, 500);
  };

  const getCurrentLifeStageName = () => {
    const stage = LIFE_STAGES.find((s) => s.id === currentLifeStage);
    return stage ? stage.name : "Unknown";
  };

  const getRecommendedFeedAmount = () => {
    const stage = LIFE_STAGES.find((s) => s.id === currentLifeStage);
    return stage ? stage.feedAmount : "medium";
  };

  const getRecommendedFeedFrequency = () => {
    const stage = LIFE_STAGES.find((s) => s.id === currentLifeStage);
    return stage ? stage.feedFrequency : "medium";
  };

  const getRecommendedFeedingSessions = () => {
    const stage = LIFE_STAGES.find((s) => s.id === currentLifeStage);
    return stage ? stage.recommendedSessions : 3;
  };

  return (
    <div className="bg-white shadow-md rounded-xl p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
        <FontAwesomeIcon icon={faFish} className="mr-2 text-bangus-teal" />
        Fish Population Management
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="lifeStage"
            className="block text-sm text-gray-600 my-2"
          >
            Current Life Stage:
          </label>
          <select
            id="lifeStage"
            value={currentLifeStage}
            onChange={(e) => updateLifeStage(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:border-bangus-cyan focus:ring-1 focus:ring-bangus-cyan"
          >
            {LIFE_STAGES.map((stage) => (
              <option key={stage.id} value={stage.id}>
                {stage.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="population"
            className="block text-sm text-gray-600 my-2"
          >
            Estimated Population:
          </label>
          <input
            type="number"
            id="population"
            value={fishPopulation}
            onChange={(e) => updatePopulation(parseInt(e.target.value))}
            min="1"
            className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:border-bangus-cyan focus:ring-1 focus:ring-bangus-cyan"
          />
        </div>
        <div>
          <label
            htmlFor="feedDuration"
            className="block text-sm text-gray-600 my-2"
          >
            Feed Duration (seconds):
          </label>
          <input
            type="number"
            id="feedDuration"
            value={feedDuration}
            onChange={(e) => updateFeedDuration(parseInt(e.target.value))}
            min="1"
            max="30"
            className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:border-bangus-cyan focus:ring-1 focus:ring-bangus-cyan"
          />
        </div>
        <div className="flex items-end">
          <div className="bg-white p-2 rounded border border-gray-200 w-full">
            <p className="text-xs text-gray-500">
              Recommended for {getCurrentLifeStageName()}:
            </p>
            <p className="text-sm font-medium">
              Feed Amount:{" "}
              <span className="text-bangus-teal">
                {getRecommendedFeedAmount()}
              </span>
            </p>
            <p className="text-sm font-medium">
              Feed Frequency:{" "}
              <span className="text-bangus-teal">
                {getRecommendedFeedFrequency()}
              </span>
            </p>
          </div>
        </div>
      </div>
      <div>
        <label
          htmlFor="feedingSessions"
          className="block text-sm text-gray-600 mb-2 mt-6"
        >
          Feeding Sessions Per Day:
        </label>
        <div className="flex items-center">
          <input
            type="number"
            id="feedingSessions"
            value={feedingSessions}
            onChange={(e) => updateFeedingSessions(parseInt(e.target.value))}
            min="1"
            max="10"
            className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:border-bangus-cyan focus:ring-1 focus:ring-bangus-cyan"
          />
          <button
            onClick={() =>
              updateFeedingSessions(getRecommendedFeedingSessions())
            }
            className="ml-2 p-3 bg-bangus-cyan text-sm text-white rounded hover:bg-bangus-teal"
            title="Reset to recommended value"
          >
            Reset
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Recommended: {getRecommendedFeedingSessions()} times per day for{" "}
          {getCurrentLifeStageName()}
        </p>
      </div>
    </div>
  );
};

export default Population;
