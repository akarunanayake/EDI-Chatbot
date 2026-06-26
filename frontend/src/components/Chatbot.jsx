import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet, apiPostForm } from "../api/client";
import { SUPPORT_PROMPTS } from "./chatConstants";
import ChatSidebar from "./ChatSidebar";
import ChatCenterPanel from "./ChatCenterPanel";
import ChatActionPanel from "./ChatActionPanel";
import FeedbackModal from "./FeedbackModal";

const Chatbot = () => {
  const navigate = useNavigate();
  const [user] = useState(() => {
    if (typeof window === "undefined") return null;
    try {
      const stored = window.localStorage.getItem("edi_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [sessionFile, setSessionFile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [sessions, setSessions] = useState([]);
  const userInput = useRef(null);
  const chatBoxRef = useRef(null);
  const hasInitialized = useRef(false);
  const [loadingBot, setLoadingBot] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [sessionsError, setSessionsError] = useState("");
  const [chatError, setChatError] = useState("");
  const [showFeedbackPopup, setShowFeedbackPopup] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackProvider, setFeedbackProvider] = useState("");
  const [feedbackProviderEmail, setFeedbackProviderEmail] = useState("");
  const [pendingFiles, setPendingFiles] = useState([]);
  const [fileType, setFileType] = useState("lesson_plan");
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [showLoginWelcome, setShowLoginWelcome] = useState(true);
  const [startingChat, setStartingChat] = useState(false);
  const fileInputRef = useRef(null);
  const MAX_HEIGHT = 240;
  const hasUserId = user && user.id !== null && user.id !== undefined;

  const lessonPlanUploaded = !!sessionFile;

  const getErrorMessage = (error, fallback) => {
    if (error instanceof Error && error.message) {
      return error.message;
    }
    return fallback;
  };

//Start of a chat session
  const initializeChat = async () => {
    if (startingChat) return;

    const formData = new FormData();
    if (hasUserId) {
      formData.append("user_id", user.id);
    } else {
      console.log("initializeChat: No user.id found, user:", user);
    }

    try {
      setStartingChat(true);
      setLoadingBot(true);
      setChatError("");
      const data = await apiPostForm("/chatStart", formData);
      if (data.session_id) {
        setSessionId(data.session_id);
        await fetchSessions(false);
      }
      appendMessage("bot", data.response);
    } catch (err) {
      const message = getErrorMessage(err, "Error initializing chatbot.");
      appendMessage("bot", message);
      setChatError(message);
    } finally {
      setStartingChat(false);
      setLoadingBot(false);
    }
  };

  //Fetch chat sessions to display in chat history
  const fetchSessions = async (showLoader = true) => {
    if (showLoader) {
      setLoadingSessions(true);
    }
    try {
      setSessionsError("");
      const base = "/sessions";
      const url = hasUserId ? `${base}?user_id=${encodeURIComponent(user.id)}` : base;
      console.log("Fetching sessions with URL:", url, "user.id:", user?.id, "user:", user);
      const data = await apiGet(url);
      setSessions(data);
    } catch (err) {
      console.error("Failed to fetch sessions", err);
      setSessionsError(getErrorMessage(err, "Failed to load sessions."));
    } finally {
      if (showLoader) {
        setLoadingSessions(false);
      }
    }
  };

  //Fetch messges of the chat session selected from chat history
  const fetchMessages = async (id) => {
    try {
      setChatError("");
      setShowLoginWelcome(false);
      const data = await apiGet(`/sessionMessages?session_id=${encodeURIComponent(id)}`);
      // Format messages to the frontend style
      const formatted = data.messages.map(m => ({
        sender: m.role === "user" ? "user" : "bot",
        text: m.content,
        file_link: m.file_link
      }));
      setMessages(formatted);
      setSessionId(id);
      setSessionFile(data.file);
    } catch (err) {
      console.error("Failed to fetch session messages", err);
      setChatError(getErrorMessage(err, "Failed to load selected chat session."));
    }
  };


//Trigger at the beginning of the page load
  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }

    if (hasInitialized.current) return;
    hasInitialized.current = true;
    
    fetchSessions(); //Retrieve chat sessions for the chat history
    // Do not auto-create a session on load. User should click New Chat or select a session.
  }, [user, navigate]);

//Append message on the chat window
  const appendMessage = (sender, text) => {
    setMessages((prev) => [...prev, { sender, text }]);
    setTimeout(() => {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }, 100);
  };

  //Trigger when upload a file is selected
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    const fileEntries = selectedFiles.map((file) => ({
      file,
      file_type: fileType,
    }));
    setPendingFiles((prev) => [...prev, ...fileEntries]);
    // allow selecting the same files again later
    e.target.value = "";
  };

  const handleFileTypeSelect = (type) => {
    setFileType(type);
    setShowAttachmentMenu(false);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  //Trigger when click send
  const handleSend = async () => {
    const input = userInput.current.value.trim();
    const files = pendingFiles;
    if (!input && files.length === 0) return;

    const formData = new FormData();

    if (files.length > 0 && input) {
      const uploadedLessonPlan = files.find((f) => f.file_type === "lesson_plan")?.file;
      setSessionFile((prev) => uploadedLessonPlan || prev); // Keep current lesson plan when only supporting docs are uploaded
      files.forEach(({ file, file_type }) => {
        appendMessage("user", `📎 Uploaded ${file_type === "lesson_plan" ? "Lesson Plan" : "Supporting Document"}: ${file.name}`);
      });
      appendMessage("user", input);
      const fileTuples = files.map(({ file, file_type }, idx) => [idx, file_type, file.name]);
      files.forEach(({ file }) => {
        formData.append("files", file);
      });
      formData.append("file_tuples", JSON.stringify(fileTuples));
      formData.append("message", input);
    }
    else if (files.length > 0 && !input) {
      const uploadedLessonPlan = files.find((f) => f.file_type === "lesson_plan")?.file;
      setSessionFile((prev) => uploadedLessonPlan || prev);
      const fileTuples = files.map(({ file, file_type }, idx) => [idx, file_type, file.name]);
      files.forEach(({ file, file_type }) => {
        appendMessage("user", `📎 Uploaded ${file_type === "lesson_plan" ? "Lesson Plan" : "Supporting Document"}: ${file.name}`);
        formData.append("files", file);
      });
      formData.append("file_tuples", JSON.stringify(fileTuples));
    }
    else if(input && files.length === 0){
      appendMessage("user", input);
      formData.append("message", input);
    }
    if (sessionId) {
      formData.append("session_id", sessionId);
    }
    userInput.current.value = "";
    userInput.current.style.height = "auto";
    userInput.current.style.overflowY = "hidden";
    setPendingFiles([]);
    setFileType("lesson_plan"); // Reset file type

    setLoadingBot(true);
    try {
      setChatError("");
      const data = await apiPostForm("/chatContinue", formData);
      appendMessage("bot", data.response);
      await fetchSessions(false);
    } catch (err) {
      const message = getErrorMessage(err, "Error: Could not connect to chatbot API.");
      appendMessage("bot", message);
      setChatError(message);
    } finally {
      setLoadingBot(false);
    }
  };

  //Trigger when click support option button - populate textarea with editable template
  const handleOptionClick = (opt) => {
    const template = SUPPORT_PROMPTS[opt.value];
    if (userInput.current) {
      userInput.current.value = template;
      // Adjust textarea height
      userInput.current.style.height = "auto";
      if (userInput.current.scrollHeight <= MAX_HEIGHT) {
        userInput.current.style.height = `${userInput.current.scrollHeight}px`;
        userInput.current.style.overflowY = "hidden";
      } else {
        userInput.current.style.height = `${MAX_HEIGHT}px`;
        userInput.current.style.overflowY = "auto";
      }
      userInput.current.focus();
    }
  };

  //Trigger when click Update lesson plan
  const handleUpdateLesson = async () => {
    if (!lessonPlanUploaded || !sessionId) return;

    const lastBotMsg = messages.filter(m => m.sender === "bot").pop()?.text;
    const formData = new FormData();
    formData.append("session_id", sessionId);
    formData.append("new_content", lastBotMsg);

    setLoadingBot(true);
    try {
      setChatError("");
      const data = await apiPostForm("/updateLesson", formData);
      appendMessage("bot", data.response);
      appendMessage("bot", data.download_message);
      await fetchSessions(false);
    } catch (err) {
      const message = getErrorMessage(err, "Error: Could not connect to chatbot API.");
      appendMessage("bot", message);
      setChatError(message);
    } finally {
      setLoadingBot(false);
    }
  };

  //Initialize a new chat
  const handleNewChat = () => {
    if (startingChat) return;

    setShowLoginWelcome(false);
    setMessages([]);
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
    formData.append("feedbackProviderEmail", feedbackProviderEmail);

    try {
      await apiPostForm("/submitFeedback", formData);
      alert("🙏 Thank you for your feedback!");
      setShowFeedbackPopup(false);
      setFeedbackText("");
      setFeedbackProvider("");
      setFeedbackProviderEmail("");
    } catch (err) {
      alert(`⚠️ ${getErrorMessage(err, "Failed to submit feedback.")}`);
    }
  };

  //Logout handler
  const handleLogout = () => {
    window.localStorage.removeItem("edi_user");
    navigate("/");
  };

  return (
    <div className="w-screen h-screen flex bg-gray-50 overflow-hidden">
      <ChatSidebar
        onNewChat={handleNewChat}
        startingChat={startingChat}
        loadingSessions={loadingSessions}
        error={sessionsError}
        sessions={sessions}
        activeSessionId={sessionId}
        onSelectSession={fetchMessages}
      />

      {chatError && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 rounded-md bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-700">
          {chatError}
        </div>
      )}

      <ChatCenterPanel
        user={user}
        onLogout={handleLogout}
        chatBoxRef={chatBoxRef}
        messages={messages}
        sessionId={sessionId}
        showLoginWelcome={showLoginWelcome}
        loadingBot={loadingBot}
        onNewChat={handleNewChat}
        pendingFiles={pendingFiles}
        setPendingFiles={setPendingFiles}
        showAttachmentMenu={showAttachmentMenu}
        setShowAttachmentMenu={setShowAttachmentMenu}
        handleFileTypeSelect={handleFileTypeSelect}
        fileInputRef={fileInputRef}
        handleFileChange={handleFileChange}
        userInput={userInput}
        maxHeight={MAX_HEIGHT}
        handleSend={handleSend}
      />
      <ChatActionPanel
        sessionId={sessionId}
        lessonPlanUploaded={lessonPlanUploaded}
        handleOptionClick={handleOptionClick}
        handleUpdateLesson={handleUpdateLesson}
        setShowFeedbackPopup={setShowFeedbackPopup}
      />

      <FeedbackModal
        show={showFeedbackPopup}
        feedbackProvider={feedbackProvider}
        setFeedbackProvider={setFeedbackProvider}
        feedbackProviderEmail={feedbackProviderEmail}
        setFeedbackProviderEmail={setFeedbackProviderEmail}
        feedbackText={feedbackText}
        setFeedbackText={setFeedbackText}
        onCancel={() => setShowFeedbackPopup(false)}
        onSubmit={submitFeedback}
      />

    </div>
  );
};

export default Chatbot;

