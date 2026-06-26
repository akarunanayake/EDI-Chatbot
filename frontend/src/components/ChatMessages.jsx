import { resolveBackendFileLink } from "../api/client";

const ChatMessages = ({
  chatBoxRef,
  messages,
  sessionId,
  showLoginWelcome,
  loadingBot,
  onNewChat,
}) => {
  return (
    <div
      ref={chatBoxRef}
      className="flex-1 overflow-y-auto p-6 space-y-4"
    >
      {messages.length === 0 && !sessionId && showLoginWelcome ? (
        <div className="w-full h-full flex items-center justify-center">
          <div className="max-w-lg text-center p-8 rounded-2xl bg-white border shadow">
            <h2 className="text-xl font-semibold mb-2">Welcome to GenEDIt</h2>
            <p className="text-gray-600 mb-4">Click "New Chat" to start a fresh conversation, or select a session from the history to resume where you left off.</p>
            <button onClick={onNewChat} className="px-4 py-2 bg-blue-600 text-white rounded-md">New Chat</button>
          </div>
        </div>
      ) : (
        messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${
              msg.sender === "user"
                ? "justify-end"
                : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl whitespace-pre-wrap text-sm shadow-sm ${
                msg.sender === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-white border text-gray-800"
              }`}
            >
              {msg.file_link ? (
                <a
                  href={resolveBackendFileLink(msg.file_link)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-600 underline"
                >
                  {msg.text}
                </a>
              ) : (
                msg.text
              )}
            </div>
          </div>
        ))
      )}

      {loadingBot && (
        <div className="flex justify-start">
          <div className="bg-white border px-4 py-3 rounded-2xl text-sm animate-pulse">
            ✨ Thinking...
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatMessages;
