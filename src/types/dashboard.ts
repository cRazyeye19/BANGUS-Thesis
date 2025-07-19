import { IconDefinition } from "@fortawesome/fontawesome-svg-core";

export interface StatCardProps {
  title: string;
  value: string | number;
  prefix?: string;
  status: "optimal" | "below" | "above";
}

export interface CommitProps {
  user: string;
  avatar: string;
  commit: string;
  date: string;
}

export interface WaterQualityReading {
  temperature: number;
  turbidity: number;
  phLevel: number;
  dissolvedOxygen: number;
}

export interface FishFeedingData {
  stage: string;
  population: number;
}

export interface SensorData {
  pH: number;
  oxygenStatus: string;
  temperature: number;
  turbidity: number;
  EC: number;
  TDS: number;
}

export interface SensorReadings {
  timestamp: string | number;
  EC: number;
  TDS: number;
  pH: number;
  temperature: number;
  turbidity: number;
}

export interface NavItemProps {
  to: string
  icon: IconDefinition
  text: string
  currentPath: string
}
