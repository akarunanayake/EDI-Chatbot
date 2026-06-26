import { Plus, Send } from "lucide-react";
import { FILE_TYPE_OPTIONS } from "./chatConstants";

const ChatInputBar = ({
  sessionId,
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
  if (!sessionId) return null;

  return (
    <div className="bg-white border-t p-4">
      <div className="border rounded-xl px-3 py-3 bg-white focus-within:ring-2 focus-within:ring-blue-500">
        {pendingFiles.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {pendingFiles.map((entry, idx) => (
              <div key={idx} className="flex items-center gap-2 px-3 py-2 rounded-full bg-gray-100 border text-sm">
                <span>📎 {entry.file.name} ({entry.file_type === "lesson_plan" ? "Lesson Plan" : "Supporting Document"})</span>
                <button
                  type="button"
                  onClick={() => setPendingFiles((prev) => prev.filter((_, i) => i !== idx))}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-end gap-2">
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowAttachmentMenu((prev) => !prev)}
              className="flex items-center gap-2 rounded-full border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm hover:bg-gray-50"
            >
              <Plus className="w-5 h-5 text-gray-600" />
            </button>

            {showAttachmentMenu && (
              <div className="absolute left-0 bottom-full mb-2 w-72 min-w-[240px] rounded-2xl border bg-white shadow-2xl z-50">
                {FILE_TYPE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleFileTypeSelect(option.value)}
                    className="flex items-center gap-3 w-full px-4 py-3 text-left text-sm text-gray-800 hover:bg-gray-100"
                  >
                    <span>{option.icon}</span>
                    <span>Upload {option.label}</span>
                  </button>
                ))}
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,. txt, .xlsx, .csv, .json"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          <textarea
            ref={userInput}
            rows={1}
            placeholder="Type your message..."
            className="flex-1 resize-none focus:outline-none px-2 py-1"
            onInput={(e) => {
              const el = e.target;
              el.style.height = "auto";

              if (el.scrollHeight <= maxHeight) {
                el.style.height = `${el.scrollHeight}px`;
                el.style.overflowY = "hidden";
              } else {
                el.style.height = `${maxHeight}px`;
                el.style.overflowY = "auto";
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />

          <button
            onClick={handleSend}
            className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInputBar;
