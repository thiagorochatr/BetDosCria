import { useState } from "react";
import { ChatMessage } from "../interfaces/IChatMessage";
import { formatWalletAddress } from "../tools/formatWalletAddress";
import xmtpLogo from "../assets/logomark.svg";
import xmtpIcon from "../assets/x-mark-white.svg";

interface ChatGameProps {
  messages: ChatMessage[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  conversation: any;
}

export function ChatGame(props: ChatGameProps) {
  const [chatMessage, setChatMessage] = useState<string>("");

  const handleSendMessage = async () => {
    if (!props.conversation) {
      console.log("Conversation not initialized");
      return;
    }
  
    try {
      await props.conversation.send(chatMessage);
      setChatMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">Chat</h3>
        <img src={xmtpLogo} alt="xmtp" className="bg-slate-400 h-6 px-2 py-1 rounded-xl" />
      </div>
      <div className="border rounded p-4 mb-4 max-h-[320px] overflow-y-auto">
        {props.messages.map((msg, index) => (
          <div key={index} className="mb-2">
            <span className="font-bold text-chiliz">
              {formatWalletAddress(msg.senderAddress, 3)}:
            </span>
            {" "}
            <span className="text-slate-50">
              {msg.content}
            </span>
            <span className="text-xs text-slate-600 ml-2">
              {msg.timestamp}
            </span>
          </div>
        ))}
      </div>
      <div className="flex flex-1 items-center justify-between gap-1">
        <input
          type="text"
          value={chatMessage}
          onChange={(e) => setChatMessage(e.target.value)}
          className="h-10 bg-transparent px-2 py-1 flex-grow text-lg shadow-xl placeholder-slate-400 outline-none flex-1 border border-slate-600 rounded"
          placeholder="Type your message..."
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSendMessage();
            }
          }}
        />
        <button
          onClick={handleSendMessage}
          className="flex items-center justify-center gap-1 bg-chiliz h-10 text-slate-50 px-3 text-lg rounded hover:bg-chiliz/90"
        >
          Send
          <img src={xmtpIcon} alt="xmtp" className="h-4" />
        </button>
      </div>

    </div>
  );
}