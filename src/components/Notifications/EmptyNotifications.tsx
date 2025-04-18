const EmptyNotifications = () => {
  return (
    <div className="py-12 px-4 text-center">
      <div className="text-5xl mb-4">📭</div>
      <p className="text-gray-500 text-sm">No notifications</p>
      <p className="text-gray-400 text-xs mt-2">
        Your notifications will appear here once you've received them.
      </p>
    </div>
  );
};

export default EmptyNotifications;