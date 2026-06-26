const ChatSidebar = ({
  onNewChat,
  startingChat,
  loadingSessions,
  error,
  sessions,
  activeSessionId,
  onSelectSession,
}) => {
  const trimToWords = (text, maxWords = 20) => {
    const normalized = (text || "").trim();
    if (!normalized) return "No preview";

    const words = normalized.split(/\s+/);
    if (words.length <= maxWords) return normalized;

    return `${words.slice(0, maxWords).join(" ")}...`;
  };

  return (
    <div className="w-[260px] bg-white border-r p-4 flex flex-col">
      <button
        onClick={onNewChat}
        disabled={startingChat}
        className={`py-2 rounded-md text-white transition ${
          startingChat
            ? "bg-blue-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {startingChat ? "Starting chat..." : "New Chat"}
      </button>

      <h2 className="mt-6 mb-3 font-semibold text-gray-700">
        Chat History
      </h2>

      <div className="flex-1 overflow-y-auto space-y-2">
        {error && (
          <div className="text-xs rounded-md border border-red-200 bg-red-50 text-red-700 px-2 py-1">
            {error}
          </div>
        )}
        {loadingSessions ? (
          <div className="text-sm text-gray-500 animate-pulse">
            Loading sessions...
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-sm text-gray-500">No sessions yet</div>
        ) : (
          sessions.map((sess, idx) => (
            <div
              key={sess.id}
              onClick={() => onSelectSession(sess.id)}
              className={`p-3 rounded-lg cursor-pointer border transition ${
                sess.id === activeSessionId
                  ? "bg-blue-100 border-blue-300"
                  : "bg-white hover:bg-gray-100"
              }`}
            >
              <div className="font-medium text-sm">
                Session {idx + 1}
              </div>

              <div className="text-xs text-gray-500 mt-1">
                {new Date(sess.created_at).toLocaleString()}
              </div>

              <div className="text-xs italic text-gray-600 mt-2">
                {trimToWords(sess.lesson_preview, 20)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;
