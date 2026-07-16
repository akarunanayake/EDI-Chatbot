import { apiPath } from "../api/client";
import { SUPPORT_OPTIONS } from "./chatConstants";

const ChatActionPanel = ({
  sessionId,
  lessonPlanUploaded,
  handleOptionClick,
  handleUpdateLesson,
  setShowFeedbackPopup,
}) => {
  if (!sessionId) return null;

  return (
    <div className="w-[320px] bg-white border-l p-4 flex flex-col gap-6 overflow-y-auto">
      <div className="border rounded-2xl p-4 shadow-sm">
        <h2 className="font-semibold text-gray-800 mb-4">
          Support Options
        </h2>

        <div className="space-y-2">
          {SUPPORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleOptionClick(opt)}
              className="w-full text-left px-3 py-2 rounded-lg border text-sm transition bg-blue-50 hover:bg-blue-100 text-blue-800 border-blue-200"
            >
              {opt.value}. {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="border rounded-2xl p-4 shadow-sm">
        <h2 className="font-semibold text-gray-800 mb-4">
          Actions
        </h2>

        <div className="space-y-3">
          <div>
            <button
              disabled={!lessonPlanUploaded}
              onClick={handleUpdateLesson}
              className={`w-full py-2 rounded-lg text-sm transition ${
                lessonPlanUploaded
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              ✅ Generate Updated Lesson Plan
            </button>
            <p className="mt-1 text-xs text-gray-500">
              Click to update the lesson plan with latest suggestions.
            </p>
          </div>

          <div>
            <a
              href={
                lessonPlanUploaded
                  ? apiPath(`/downloadLesson?session_id=${encodeURIComponent(sessionId)}`)
                  : undefined
              }
              target="_blank"
              rel="noopener noreferrer"
              className={`block text-center py-2 rounded-lg text-sm transition ${
                lessonPlanUploaded
                  ? "bg-purple-600 hover:bg-purple-700 text-white"
                  : "bg-gray-200 text-gray-400 pointer-events-none"
              }`}
            >
              📥 Download Updated Lesson Plan
            </a>
            <p className="mt-1 text-xs text-gray-500">
              Click to download updated lesson plan.
            </p>
          </div>
        </div>
      </div>

      <div>
        <button
          onClick={() => setShowFeedbackPopup(true)}
          className="w-full bg-gray-700 hover:bg-gray-800 text-white py-2 rounded-lg"
        >
          Send Feedback
        </button>
      </div>
    </div>
  );
};

export default ChatActionPanel;
