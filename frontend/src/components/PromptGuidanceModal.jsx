const PromptGuidanceModal = ({
  show,
  title,
  description,
  context,
  tips,
  draftPrompt,
  setDraftPrompt,
  onCancel,
  onUsePrompt,
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl">
        <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>

        <section>
          <p className="mt-2 text-sm leading-6 text-gray-600">
            {description}
          </p>
        </section>

        <hr className="my-4 border-gray-200" />

        <section>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700">ℹ Context</h3>
          <p className="mt-2 text-sm leading-6 text-gray-600">
            {context}
          </p>
        </section>

        <section className="mt-5">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700">💡 Tips</h3>
          <ul className="mt-2 space-y-2 text-sm text-gray-600">
            {tips.map((tip) => (
              <li key={tip} className="flex gap-2">
                <span className="mt-0.5 text-gray-500">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </section>

        <hr className="my-4 border-gray-200" />

        <section className="mt-5">
          <h3 className="text-sm font-semibold text-gray-700">Draft Prompt (Editable)</h3>
          <textarea
            value={draftPrompt}
            onChange={(e) => setDraftPrompt(e.target.value)}
            className="mt-3 h-36 w-full resize-none rounded-xl border border-gray-300 p-3 text-sm leading-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </section>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onUsePrompt}
            className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Use Prompt
          </button>
        </div>
      </div>
    </div>
  );
};

export default PromptGuidanceModal;
