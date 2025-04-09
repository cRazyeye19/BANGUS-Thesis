import type { StatCardProps } from "../../types/dashboard";

const Card = ({
  title,
  value,
  prefix = "",
  status = "optimal",
}: StatCardProps) => {
  const getStatusColor = () => {
    switch (status) {
      case "below":
        return "text-orange-500";
      case "above":
        return "text-red-500";
      case "optimal":
      default:
        return "text-green-500";
    }
  };
  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="flex flex-col">
        <span className="text-sm text-gray-500">{title}</span>
        <div className="flex items-center mt-2">
          <span className={`text-xl font-semibold ${getStatusColor()}`}>
            {typeof value === "number" ? value.toFixed(1) : value}
          </span>
          {prefix && <span className="text-muted text-sm ml-1">{prefix}</span>}
        </div>
      </div>
    </div>
  );
};

export default Card;
