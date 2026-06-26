const FeedbackModal = ({
  show,
  feedbackProvider,
  setFeedbackProvider,
  feedbackProviderEmail,
  setFeedbackProviderEmail,
  feedbackText,
  setFeedbackText,
  onCancel,
  onSubmit,
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white w-[600px] max-w-full rounded-2xl shadow-2xl p-8">
        <h2 className="text-2xl font-semibold mb-6 text-center">
          Send Feedback
        </h2>

        <input
          type="text"
          placeholder="Your name"
          value={feedbackProvider}
          onChange={(e) => setFeedbackProvider(e.target.value)}
          className="w-full border rounded-lg px-4 py-2 mb-4"
        />
        <input
          type="email"
          placeholder="Your email"
          value={feedbackProviderEmail}
          onChange={(e) => setFeedbackProviderEmail(e.target.value)}
          className="w-full border rounded-lg px-4 py-2 mb-4"
        />
        <textarea
          value={feedbackText}
          onChange={(e) => setFeedbackText(e.target.value)}
          placeholder="Your feedback..."
          className="w-full h-48 border rounded-lg p-4"
        />

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onCancel}
            className="px-5 py-2 rounded-lg bg-gray-300 hover:bg-gray-400"
          >
            Cancel
          </button>

          <button
            onClick={onSubmit}
            className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;
