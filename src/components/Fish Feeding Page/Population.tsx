import { useEffect, useState, useRef } from "react";
import { getAuth } from "firebase/auth";
import { onValue, ref, set } from "firebase/database";
import { database } from "../../config/firebase";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFish } from "@fortawesome/free-solid-svg-icons";
import { FishData } from "../../types/fish";

const LIFE_STAGES = [
  {
    id: "fingerling",
    name: "Fingerling (1-3 months)",
    feedAmount: "10% of body weight",
    feedFrequency: "4-6 times per day",
    recommendedSessions: 4,
    minWeight: 5, // in grams
    maxWeight: 70, // in grams
    feedPercentage: 0.10, // 10% of body weight
  },
  {
    id: "juvenile",
    name: "Juvenile (3-5 months)",
    feedAmount: "7-8% of body weight",
    feedFrequency: "3-4 times per day",
    recommendedSessions: 3,
    minWeight: 70, // in grams
    maxWeight: 170, // in grams
    feedPercentage: 0.075, // 7.5% of body weight (average of 7-8%)
  },
  {
    id: "adult",
    name: "Adult (5+ months)",
    feedAmount: "3-4% of body weight",
    feedFrequency: "2-3 per day",
    recommendedSessions: 2,
    minWeight: 170, // in grams
    maxWeight: 1000, // in grams (1kg)
    feedPercentage: 0.035, // 3.5% of body weight (average of 3-4%)
  },
  {
    id: "broodstock",
    name: "Broodstock (3-5 years)",
    feedAmount: "3% of body weight",
    feedFrequency: "1-2 per day",
    recommendedSessions: 1,
    minWeight: 1000, // in grams (1kg)
    maxWeight: 11000, // in grams (11kg)
    feedPercentage: 0.03, // 3% of body weight
  },
];

const Population = () => {
  const [currentLifeStage, setCurrentLifeStage] = useState("fingerling");
  const [fishPopulation, setFishPopulation] = useState(100);
  const [feedingSessions, setFeedingSessions] = useState(4);
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
      } else {
        const stage = LIFE_STAGES.find(
          (s) => s.id === (data.lifeStage || currentLifeStage)
        );
        if (stage) setFeedingSessions(stage.recommendedSessions);
      }
    });

    return () => unsubscribe();
  }, [currentLifeStage]);

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
        const updates: FishData = {
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

  // Calculate estimated feed amount in grams
  const calculateEstimatedFeedAmount = () => {
    const stage = LIFE_STAGES.find((s) => s.id === currentLifeStage);
    if (!stage) return 0;

    const minTotalWeight = stage.minWeight * fishPopulation;
    const maxTotalWeight = stage.maxWeight * fishPopulation;
    const avgTotalWeight = (minTotalWeight + maxTotalWeight) / 2;
    
    // Calculate feed amount based on percentage of body weight
    const feedAmount = avgTotalWeight * stage.feedPercentage;
    
    return feedAmount;
  };

  // Format the feed amount with appropriate units (g or kg)
  const formatFeedAmount = (amount: number) => {
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(2)} kg`;
    }
    return `${amount.toFixed(2)} g`;
  };

  return (
    <div className="bg-white shadow-md rounded-xl p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
        <FontAwesomeIcon icon={faFish} className="mr-2 text-bangus-teal" />
        Fish Population Management
      </h2>
      
      {/* Improved grid layout with better spacing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5">
        <div>
          <label
            htmlFor="lifeStage"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Current Life Stage:
          </label>
          <select
            id="lifeStage"
            value={currentLifeStage}
            onChange={(e) => updateLifeStage(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-md focus:outline-none focus:border-bangus-cyan focus:ring-1 focus:ring-bangus-cyan transition-colors"
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
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Estimated Population:
          </label>
          <input
            type="number"
            id="population"
            value={fishPopulation}
            onChange={(e) => updatePopulation(parseInt(e.target.value) || 0)}
            min="1"
            className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:border-bangus-cyan focus:ring-1 focus:ring-bangus-cyan transition-colors"
          />
        </div>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
        <div className="flex items-center mb-2">
          <h3 className="text-sm font-medium text-gray-700">
            Recommendations for {getCurrentLifeStageName()}
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
          <div>
            <p className="text-xs text-gray-500 mb-1">Feed Amount</p>
            <p className="text-bangus-teal font-medium">
              {getRecommendedFeedAmount()}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Feed Frequency</p>
            <p className="text-bangus-teal font-medium">
              {getRecommendedFeedFrequency()}
            </p>
          </div>
        </div>
        
        {/* Highlighted feed amount calculation with better visual emphasis */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-col">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Estimated Feed Amount
            </p>
            <div className="flex items-baseline">
              <span className="text-xl font-bold text-bangus-teal">
                {formatFeedAmount(calculateEstimatedFeedAmount())}
              </span>
              <span className="text-xs text-gray-500 ml-2">
                for {fishPopulation} fish
              </span>
            </div>
            <div className="mt-2 bg-white p-2 rounded-md border border-gray-200">
              <p className="text-xs text-gray-700">
                Per feeding session: <span className="font-medium">{formatFeedAmount(calculateEstimatedFeedAmount() / feedingSessions)}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Improved feeding sessions control */}
      <div>
        <label
          htmlFor="feedingSessions"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Feeding Sessions Per Day:
        </label>
        <div className="flex items-center">
          <div className="relative flex-grow">
            <input
              type="number"
              id="feedingSessions"
              value={feedingSessions}
              onChange={(e) => updateFeedingSessions(parseInt(e.target.value) || 1)}
              min="1"
              max="10"
              className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:border-bangus-cyan focus:ring-1 focus:ring-bangus-cyan transition-colors"
            />
            <div className="absolute right-0 inset-y-0 flex items-center pr-3 pointer-events-none">
              <span className="text-xs text-gray-500">sessions</span>
            </div>
          </div>
          <button
            onClick={() => updateFeedingSessions(getRecommendedFeedingSessions())}
            className="ml-3 px-4 py-2 bg-bangus-cyan text-white rounded hover:bg-bangus-teal transition-colors"
            title="Reset to recommended value"
          >
            Reset
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Recommended: {getRecommendedFeedingSessions()} times per day for {getCurrentLifeStageName()}
        </p>
      </div>
    </div>
  );
};

export default Population;
