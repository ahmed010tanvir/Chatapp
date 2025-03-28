import React, { useEffect, useRef, useState } from "react";
import { BsSendFill } from "react-icons/bs";
import { TiAttachmentOutline } from "react-icons/ti";
import useChatContext from "../context/ChatContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import SockJS from "sockjs-client";
import Stomp from "stompjs";
import { baseURL } from "../config/AxiosHelper";
import { getMessages } from "../services/RoomService";
import { timeAgo } from "../config/helper";

const ChatPage = () => {
  const {
    roomId,
    currentUser,
    connected,
    setConnected,
    setRoomId,
    setCurrentUser,
  } = useChatContext();

  const navigate = useNavigate();

  useEffect(() => {
    if (!connected) {
      navigate("/");
    }
  }, [connected, roomId, currentUser, navigate]);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const inputRef = useRef(null);
  const chatBoxRef = useRef(null);
  const [stompClient, setStompClient] = useState(null);
  const [sentMessages, setSentMessages] = useState(new Set()); // Added missing state

  useEffect(() => {
    async function loadMessages() {
      try {
        const messages = await getMessages(roomId);
        setMessages(messages);
      } catch (error) {
        console.error("Failed to load messages:", error);
        toast.error("Failed to load messages.");
      }
    }
    if (roomId) {
      loadMessages();
    }
  }, [roomId]);

  // Scroll to the bottom of the chat box when a new message is added
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scroll({
        top: chatBoxRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  // Connect to WebSocket
  useEffect(() => {
    let client;

    const connectWebSocket = () => {
      const sock = new SockJS(`${baseURL}/chat`);
      client = Stomp.over(sock);

      client.connect(
        {},
        () => {
          setStompClient(client);
          toast.success("Connected to WebSocket");

          // Subscribe only if not already subscribed
          client.subscribe(`/topic/room/${roomId}`, (message) => {
            const newMessage = JSON.parse(message.body);

            // Check if the message is already in the state (to avoid duplicates)
            if (!sentMessages.has(newMessage.content)) {
              setMessages((prev) => [...prev, newMessage]);
            }
          });
        },
        (error) => {
          console.error("WebSocket connection failed. Retrying in 5 seconds...", error);
          setTimeout(connectWebSocket, 5000);
        }
      );
    };

    if (connected && roomId) {
      connectWebSocket();
    }

    return () => {
      if (client) {
        client.disconnect(() => {
          console.log("WebSocket disconnected.");
        });
      }
    };
  }, [connected, roomId, sentMessages]);

  const sendMessage = async () => {
    if (stompClient && connected && input.trim()) {
      const message = {
        sender: currentUser,
        content: input,
        roomId: roomId,
      };

      const tempMessage = {
        sender: currentUser,
        content: input,
        timeStamp: new Date().toISOString(),
      };

      // Prevent sending the same message twice
      if (!sentMessages.has(input)) {
        setSentMessages((prevSentMessages) => new Set(prevSentMessages).add(input));
        setMessages((prevMessages) => [...prevMessages, tempMessage]);

        try {
          stompClient.send(`/app/sendMessage/${roomId}`, {}, JSON.stringify(message)); // Fixed backticks
          setInput("");
        } catch (error) {
          console.error("Failed to send message:", error);
          toast.error("Failed to send message.");
          setMessages((prevMessages) =>
            prevMessages.filter((msg) => msg !== tempMessage)
          );
        }
      }
    }
  };

  //leave room
  function handleLogout() {
    if (stompClient && stompClient.connected) {
      stompClient.disconnect(() => {
        console.log("WebSocket disconnected.");
      });
    } else {
      console.log("WebSocket is not connected or already disconnected.");
    }

    // Reset states
    setConnected(false);
    setRoomId("");
    setCurrentUser("");

    // Navigate to the Join/Create Chat Room page
    navigate("/");
  }

  return (
    <div className="">
      {/* Header */}
      <header className="dark:bg-gray-800 dark:text-white p-6 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">
            Room Name: <span className="text-green-400">{roomId}</span>
          </h1>
        </div>
        <div>
          <h1 className="text-xl font-bold">
            User: <span>{currentUser || "Loading..."}</span>
          </h1>
        </div>
        <div>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Leave Room
          </button>
        </div>
      </header>

      {/* Messages */}
      <main ref={chatBoxRef} className="py-20 px-10 w-2/3 mx-auto h-screen overflow-auto dark:bg-slate-950 " style={{ maxHeight: "calc(100vh - 160px)" }}>
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.sender === currentUser ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`flex items-center gap-3 ${
                message.sender === currentUser ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <img
                className="h-10 w-10 rounded-full"
                src={`https://avatar.iran.liara.run/public/${
                  message.sender === currentUser ? "13" : "1"
                }`}
                alt="Sender Avatar"
              />
              <div className="flex flex-col gap-1">
                <p className="text-sm font-bold text-gray-400">{message.sender}</p>
                <p
                  className={`px-4 py-2 rounded-lg max-w-xs ${
                    message.sender === currentUser
                      ? "bg-blue-500 text-white text-right"
                      : "bg-teal-300 dark:bg-teal-700 text-black dark:text-white text-left"
                  }`}
                >
                  {message.content}
                  <p className="text-xs text-gray-200">{timeAgo(message.timeStamp)}</p>
                </p>
              </div>
            </div>
          </div>
        ))}
      </main>

      {/* Input */}
      <div className="fixed bottom-0 left-0 right-0 px-4 py-3 bg-gray-800 dark:bg-gray-900 border-t border-gray-700 flex items-center">
        <div className="bg-white dark:bg-gray-900 rounded-lg flex-1 p-1 mx-auto shadow-md flex justify-between items-center">
          <input
            value={input}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                sendMessage();
              }
            }}
            onChange={(e) => setInput(e.target.value)}
            type="text"
            placeholder="Type a message..."
            aria-label="Type a message"
            className="w-full bg-transparent border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-gray-800 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
        <div>
          <button className="ml-2 px-2 py-2 bg-orange-500 hover:bg-orange-800 text-white rounded transition">
            <TiAttachmentOutline />
          </button>
          <button
            onClick={sendMessage}
            className="ml-4 px-3 py-3 bg-green-500 hover:bg-blue-600 text-white rounded transition"
          >
            <BsSendFill />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;