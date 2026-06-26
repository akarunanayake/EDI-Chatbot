import ChatMessages from "./ChatMessages";
import ChatInputBar from "./ChatInputBar";

const ChatCenterPanel = ({
  user,
  onLogout,
  chatBoxRef,
  messages,
  sessionId,
  showLoginWelcome,
  loadingBot,
  onNewChat,
  pendingFiles,
  setPendingFiles,
  showAttachmentMenu,
  setShowAttachmentMenu,
  handleFileTypeSelect,
  fileInputRef,
  handleFileChange,
  userInput,
  maxHeight,
  handleSend,
}) => {
  return (
    <div className="flex-1 flex flex-col">
      <div className="bg-white border-b px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          GenEDIt
        </h1>
        <div className="flex items-center gap-4">
          {user && <span className="text-sm text-gray-600">Welcome, {user.username}</span>}
          <button
            onClick={onLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>

      <ChatMessages
        chatBoxRef={chatBoxRef}
        messages={messages}
        sessionId={sessionId}
        showLoginWelcome={showLoginWelcome}
        loadingBot={loadingBot}
        onNewChat={onNewChat}
      />

      <ChatInputBar
        sessionId={sessionId}
        pendingFiles={pendingFiles}
        setPendingFiles={setPendingFiles}
        showAttachmentMenu={showAttachmentMenu}
        setShowAttachmentMenu={setShowAttachmentMenu}
        handleFileTypeSelect={handleFileTypeSelect}
        fileInputRef={fileInputRef}
        handleFileChange={handleFileChange}
        userInput={userInput}
        maxHeight={maxHeight}
        handleSend={handleSend}
      />
    </div>
  );
};

export default ChatCenterPanel;
