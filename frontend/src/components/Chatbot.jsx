import { useState, useRef , useEffect} from "react";
import { Plus, Send } from "lucide-react";

const Chatbot = () => {
  const [sessionFile, setSessionFile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [sessions, setSessions] = useState([]);
  const userInput = useRef(null);
  const chatBoxRef = useRef(null);
  const hasInitialized = useRef(false);
  const [loadingBot, setLoadingBot] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [showFeedbackPopup, setShowFeedbackPopup] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackProvider, setFeedbackProvider] = useState("");
  const [pendingFile, setPendingFile] = useState(null);
  const removePendingFile = () => setPendingFile(null);
  const [options, setOptions] = useState([]);
  const [updateLessonPlan, setUpdateLessonPlan] = useState(false);
 // const userInput = useRef(null);
  //const chatBoxRef = useRef(null);
  //const hasInitialized = useRef(false);
  const MAX_HEIGHT = 150; // px (~6–7 lines)

  const supportOptions = [
    {
      label: "Integrate EDI principles into my lesson plan",
      value: "1",
    },
    {
      label: "Include better examples or datasets",
      value: "2",
    },
    {
      label: "Design an EDI-integrated assignment",
      value: "3",
    },
    {
      label: "Include reflective questions",
      value: "4",
    },
    {
      label: "Evaluate lesson plan for EDI",
      value: "5",
    },
    {
      label: "Something else",
      value: "6",
    }
  ]

  const lessonPlanUploaded = !!sessionFile;
//Start of a chat session
  const initializeChat = async () => {
    const formData = new FormData();
    
    try {
      const res = await fetch("http://localhost:8000/chatStart", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.session_id) {
        setSessionId(data.session_id);
      }
      appendMessage("bot", data.response);
    } catch (err) {
      appendMessage("bot", "Error initializing chatbot.");
    }
  };

  //Fetch chat sessions to display in chat history
  const fetchSessions = async () => {
    try {
      setLoadingSessions(true);
      const res = await fetch("http://localhost:8000/sessions");
      const data = await res.json();
      setSessions(data);
      setLoadingSessions(false);
    } catch (err) {
      console.error("Failed to fetch sessions", err);
      setLoadingSessions(false);
    }
  };

  //Fetch messges of the chat session selected from chat history
  const fetchMessages = async (id) => {
    try {
      const res = await fetch(`http://localhost:8000/sessionMessages?session_id=${id}`);
      const data = await res.json();
      // Format messages to the frontend style
      const formatted = data.messages.map(m => ({
        sender: m.role === "user" ? "user" : "bot",
        text: m.content,
        file_link: m.file_link
      }));
      setMessages(formatted);
      setSessionId(id);
      setSessionFile(data.file)
    } catch (err) {
      console.error("Failed to fetch session messages", err);
    }
  };


//Trigger at the beginning of the page load
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;
    
    fetchSessions() //Retrive chat sessions for the chat history
    initializeChat(); // Initial session creation on page load
  }, []);

//Append message on the chat window
  const appendMessage = (sender, text) => {
    setMessages((prev) => [...prev, { sender, text}]);
    setTimeout(() => {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }, 100);
  };

  //Trigger when upload a file
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
     if (!file) return;

    setPendingFile(file);

    // allow selecting the same file again later
    e.target.value = "";
    /**const formData = new FormData();
    if (file) {
      setSessionFile(file); // Store for formData use
      appendMessage("user", `📎 Uploaded file: ${file.name}`);
      formData.append("file", file);
    }
    if (sessionId) {
      formData.append("session_id", sessionId);
    } 

    try {
    setLoadingBot(true); //To appear "Thinking" icon
    const endpoint = "http://localhost:8000/fileUpload";

    const res = await fetch(endpoint, {
      method: "POST",
      body: formData,
    });
      const data = await res.json();
      appendMessage("bot", data.response);
      setLoadingBot(false);//To disappear "Thinking" icon
      fetchSessions();
    } catch (err) {
      appendMessage("bot", "Error: Could not connect to chatbot API.");
      setLoadingBot(false);
    }  */

  };

  //Trigger when click send
  const handleSend = async (e) => {
    const input = userInput.current.value.trim();
    const file = pendingFile;
    if (!input && !file) return;

    const formData = new FormData();

    if (file && input) {
      setSessionFile(file); // Store for formData use
      appendMessage("user", `📎 Uploaded file: ${file.name}`);
      appendMessage("user", input);
      formData.append("message", input);
      formData.append("file", file);
    }
    else if (file && !input){
      setSessionFile(file); // Store for formData use
      appendMessage("user", `📎 Uploaded file: ${file.name}`);
      formData.append("file", file);
    }
    else if(input && !file){
      appendMessage("user", input);
      formData.append("message", input);
    } 
     if (sessionId) {
      formData.append("session_id", sessionId);
    } 
    userInput.current.value = "";
    userInput.current.style.height = "auto";
    userInput.current.style.overflowY = "hidden";
    setPendingFile(null);
    // If sessionId exists, it's a follow-up message
   
    /**if (!sessionFile) {
        appendMessage("bot", "Please upload a lesson plan file before starting.");
        return;
    }*/
    

    try {
    setLoadingBot(true);
    const endpoint = "http://localhost:8000/chatContinue";

    const res = await fetch(endpoint, {
      method: "POST",
      body: formData,
    });
      const data = await res.json();
      appendMessage("bot", data.response);
      setLoadingBot(false);
    } catch (err) {
      appendMessage("bot", "Error: Could not connect to chatbot API.");
      setLoadingBot(false);
    }  
  };

  //Trigger when click support option button
  const handleOptionClick = async (opt) => {
    appendMessage("user", `${opt.value}. ${opt.label}`)

    setOptions([])

    const formData = new FormData();
    formData.append("session_id", sessionId);
    formData.append("message", opt.value)

     try {
    setLoadingBot(true);
    const endpoint = "http://localhost:8000/chatContinue";

    const res = await fetch(endpoint, {
      method: "POST",
      body: formData,
    });
      const data = await res.json();
      appendMessage("bot", data.response);
      setLoadingBot(false);
    } catch (err) {
      appendMessage("bot", "Error: Could not connect to chatbot API.");
      setLoadingBot(false);
    }  
  }

  //Trigger when click Update lesson plan
  const handleUpdateLesson = async () => {
    if (!lessonPlanUploaded || !sessionId) return;

    const lastBotMsg = messages.filter(m => m.sender === "bot").pop()?.text;
    const formData = new FormData();
    formData.append("session_id", sessionId);
    formData.append("new_content", lastBotMsg);

    try {
        setLoadingBot(true);
        const res = await fetch("http://localhost:8000/updateLesson", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      appendMessage("bot", data.response);
      appendMessage("bot", data.download_message);
      setLoadingBot(false);
    } catch (err) {
      appendMessage("bot", "Error: Could not connect to chatbot API.");
      setLoadingBot(false);
    } 
  };

  //Initialize a new chat
  const handleNewChat = () => {
    setMessages([])
    setSessionFile(null);
    setSessionId(null);
    if (userInput.current) userInput.current.value = "";
    initializeChat();
  };


  //Trigger when submit a feedback
  const submitFeedback = async () => {
  if (!feedbackText.trim()) return;

  const formData = new FormData();
  formData.append("session_id", sessionId);
  formData.append("feedback", feedbackText);
  formData.append("feedbackProvider", feedbackProvider);

  try {
    const res = await fetch("http://localhost:8000/submitFeedback", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    alert("🙏 Thank you for your feedback!");
    setShowFeedbackPopup(false);
    setFeedbackText("");
    setFeedbackProvider("")
  } catch (err) {
    alert("⚠️ Failed to submit feedback.");
  }
};

return (
    <div className="w-screen h-screen flex bg-gray-50 overflow-hidden">
      {/* LEFT SIDEBAR */}
      <div className="w-[260px] bg-white border-r p-4 flex flex-col">
        <button
          onClick={handleNewChat}
          className="bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
        >
          New Chat
        </button>

        <h2 className="mt-6 mb-3 font-semibold text-gray-700">
          Chat History
        </h2>

        <div className="flex-1 overflow-y-auto space-y-2">
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
                onClick={() => fetchMessages(sess.id)}
                className={`p-3 rounded-lg cursor-pointer border transition ${
                  sess.id === sessionId
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
                  {sess.lesson_preview || sess.summary || "No preview"}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* CENTER CHAT AREA */}
      <div className="flex-1 flex flex-col">
        {/* HEADER */}
        <div className="bg-white border-b px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-800 text-center">
            GenEDIt
          </h1>
        </div>

        {/* CHAT MESSAGES */}
        <div
          ref={chatBoxRef}
          className="flex-1 overflow-y-auto p-6 space-y-4"
        >
          {messages.map((msg, idx) => (
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
                        href={msg.file_link}
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
          ))}

          {loadingBot && (
            <div className="flex justify-start">
              <div className="bg-white border px-4 py-3 rounded-2xl text-sm animate-pulse">
                ✨ Thinking...
              </div>
            </div>
          )}
        </div>

        {/* INPUT AREA */}
        <div className="bg-white border-t p-4">
          <div className="border rounded-xl px-3 py-3 bg-white focus-within:ring-2 focus-within:ring-blue-500">
            {/* Pending file */}
            {pendingFile && (
              <div className="mb-3 flex items-center">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 border text-sm">
                  <span>📎 {pendingFile.name}</span>

                  <button
                    onClick={() => setPendingFile(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-end gap-2">
              {/* Upload */}
              <label className="cursor-pointer p-2">
                <Plus className="w-6 h-6 text-gray-600" />

                <input
                  type="file"
                  accept=".pdf,.docx"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>

              {/* Textarea */}
              <textarea
                ref={userInput}
                rows={1}
                placeholder="Type your message..."
                className="flex-1 resize-none focus:outline-none px-2 py-1"
                onInput={(e) => {
                  const el = e.target;

                  el.style.height = "auto";

                  if (el.scrollHeight <= MAX_HEIGHT) {
                    el.style.height = `${el.scrollHeight}px`;
                    el.style.overflowY = "hidden";
                  } else {
                    el.style.height = `${MAX_HEIGHT}px`;
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

              {/* Send */}
              <button
                onClick={handleSend}
                className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT ACTION PANEL */}
      <div className="w-[320px] bg-white border-l p-4 flex flex-col gap-6 overflow-y-auto">
        {/* Support Options */}
        <div className="border rounded-2xl p-4 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-4">
            Support Options
          </h2>

          <div className="space-y-2">
            {supportOptions.map((opt) => (
              <button
                key={opt.value}
                disabled={!lessonPlanUploaded}
                onClick={() => handleOptionClick(opt)}
                className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition ${
                  lessonPlanUploaded
                    ? "bg-blue-50 hover:bg-blue-100 text-blue-800 border-blue-200"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                {opt.value}. {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="border rounded-2xl p-4 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-4">
            Actions
          </h2>

          <div className="space-y-3">
            <button
              disabled={!lessonPlanUploaded}
              onClick={handleUpdateLesson}
              className={`w-full py-2 rounded-lg text-sm transition ${
                lessonPlanUploaded
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              ✅ Update Lesson Plan
            </button>

            <a
              href={
                lessonPlanUploaded
                  ? `http://localhost:8000/downloadLesson?session_id=${sessionId}`
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
              📥 Download Lesson Plan
            </a>
          </div>
        </div>

        {/* Feedback */}
        <div>
          <button
            onClick={() => setShowFeedbackPopup(true)}
            className="w-full bg-gray-700 hover:bg-gray-800 text-white py-2 rounded-lg"
          >
            Send Feedback
          </button>
        </div>
      </div>

      {/* FEEDBACK POPUP */}
      {showFeedbackPopup && (
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

            <textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Your feedback..."
              className="w-full h-48 border rounded-lg p-4"
            />

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowFeedbackPopup(false)}
                className="px-5 py-2 rounded-lg bg-gray-300 hover:bg-gray-400"
              >
                Cancel
              </button>

              <button
                onClick={submitFeedback}
                className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;

