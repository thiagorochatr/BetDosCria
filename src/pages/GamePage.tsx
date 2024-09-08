import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useState, useEffect, useRef } from "react";
import { ActivityGame } from "../components/ActivityGame";
import { Activity } from "../interfaces/IActivity";
import { TopHolder } from "../interfaces/ITopHolder";
import { TopHoldersGame } from "../components/TopHoldersGame";
import { GameInfo } from "../interfaces/IGameInfo";
import { ChatMessage } from "../interfaces/IChatMessage";
import { FaArrowLeft } from "react-icons/fa";
import { ChatGame } from "../components/ChatGame";
import { DetailsGame } from "../components/DetailsGame";

const tabs = ['Details', 'Chat', 'Activity', 'Top Holders'];

const GamePage: React.FC = () => {
  const { contractAddress } = useParams<{ contractAddress: string }>();
  const { web3auth, provider, xmtpClient, isInitialized } = useAuth();
  const [gameInfo, setGameInfo] = useState<GameInfo | null>(null);
  const [topHolders, setTopHolders] = useState<TopHolder[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [conversation, setConversation] = useState<any>(null);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const [indicatorStyle, setIndicatorStyle] = useState({});
  console.log(provider);

  useEffect(() => {
    const setIndicator = () => {
      const currentTab = tabsRef.current[activeTab];
      if (currentTab) {
        setIndicatorStyle({
          left: `${currentTab.offsetLeft}px`,
          width: `${currentTab.offsetWidth}px`,
        });
      }
    };

    setIndicator();
    window.addEventListener('resize', setIndicator);
    
    if (isInitialized && web3auth?.connected) {
      fetchGameData();
      initializeConversation();
    }

    return () => window.removeEventListener('resize', setIndicator);

  }, [activeTab, isInitialized, web3auth, contractAddress]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return <DetailsGame gameInfo={gameInfo} />;
      case 1:
        return <ChatGame messages={messages} conversation={conversation} />;
      case 2:
        return <ActivityGame activities={activities} />;
      case 3:
        return <TopHoldersGame topHolders={topHolders} />;
      default:
        return null;
    }
  };


  const fetchGameData = async () => {
    // Mock data - replace with actual contract calls
    setGameInfo({
      name: "Sample Game",
      image: "https://via.placeholder.com/150",
      startDate: "2023-07-01",
      endDate: "2023-07-31",
      totalPlayers: 100,
      jackpot: 1000,
    });

    setTopHolders([
      { address: "0x123...abc", amount: 100 },
      { address: "0x456...def", amount: 90 },
      { address: "0x789...ghi", amount: 80 },
      { address: "0xabc...jkl", amount: 70 },
      { address: "0xdef...mno", amount: 60 },
    ]);

    setActivities([
      {
        address: "0x123...abc",
        action: "Bet",
        amount: 10,
        timestamp: "2023-06-15 10:30:00",
      },
      {
        address: "0x456...def",
        action: "Bet",
        amount: 20,
        timestamp: "2023-06-15 10:35:00",
      },
      {
        address: "0x789...ghi",
        action: "Withdraw",
        amount: 5,
        timestamp: "2023-06-15 10:40:00",
      },
    ]);
  };

  const initializeConversation = async () => {
    if (!xmtpClient) {
      console.log("XMTP client not initialized");
      return;
    }

    try {
      // TODO: get conversation id from contract
      const conv = await xmtpClient.conversations.newConversation(
        "0x3F11b27F323b62B159D2642964fa27C46C841897"
      );
      setConversation(conv);

      // Load existing messages
      const existingMessages = await conv.messages();
      setMessages(
        existingMessages.map((msg) => ({
          senderAddress: msg.senderAddress,
          content: msg.content ?? "",
          timestamp: msg.sent.toLocaleString(),
        }))
      );

      // Listen for new messages
      for await (const message of await conv.streamMessages()) {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            senderAddress: message.senderAddress,
            content: message.content ?? "",
            timestamp: message.sent.toLocaleString(),
          },
        ]);
      }
    } catch (error) {
      console.error("Error initializing conversation:", error);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="container mx-auto px-4 py-8 min-h-full">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Game Details</h1>
        <button
          onClick={handleGoBack}
          className="flex items-center justify-center gap-1 bg-chiliz text-slate-50 px-4 py-2 rounded hover:bg-chiliz/80 text-sm"
        >
          <FaArrowLeft />
          Go Back
        </button>
      </div>

      <div className="mx-auto p-4">
        <div className="relative">
          <div className="flex space-x-4 border-b">
            {tabs.map((tab, index) => (
              <button
                key={tab}
                ref={(el) => (tabsRef.current[index] = el)}
                className={`py-2 px-4 text-sm font-medium transition-colors duration-300 ${
                  activeTab === index ? 'text-chiliz' : 'text-slate-400 hover:text-slate-600'
                }`}
                onClick={() => setActiveTab(index)}
              >
                {tab}
              </button>
            ))}
          </div>
          <div
            className="absolute bottom-0 h-0.5 bg-chiliz transition-all duration-300"
            style={indicatorStyle}
          />
        </div>
        <div className="mt-4 transition-all duration-300 ease-in-out">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );

};

export default GamePage;
