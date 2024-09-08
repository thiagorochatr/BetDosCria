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

const tabs = ['Details', 'Chat', 'Activity', 'Top Holders'];

const GamePage: React.FC = () => {
  const { contractAddress } = useParams<{ contractAddress: string }>();
  const { web3auth, provider, xmtpClient, isInitialized } = useAuth();
  const [gameInfo, setGameInfo] = useState<GameInfo | null>(null);
  const [betAmount, setBetAmount] = useState<string>("");
  const [betSide, setBetSide] = useState<"A" | "B">("A");
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
        return <div>Details Content</div>;
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

  const handleBet = async () => {
    // Implement betting logic here
    console.log(`Betting ${betAmount} on side ${betSide}`);
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <>
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Game Details</h1>
        <button
          onClick={handleGoBack}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          <FaArrowLeft />
          Go Back
        </button>
      </div>




      {gameInfo && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <img
              src={gameInfo.image}
              alt={gameInfo.name}
              className="w-full rounded-lg shadow-lg"
            />
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-4">{gameInfo.name}</h2>
            <p className="mb-2">Start Date: {gameInfo.startDate}</p>
            <p className="mb-2">End Date: {gameInfo.endDate}</p>
            <p className="mb-2">Total Players: {gameInfo.totalPlayers}</p>
            <p className="mb-4">Jackpot: {gameInfo.jackpot} CHZ</p>

            <div className="mb-4">
              <input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                className="border rounded px-2 py-1 mr-2"
                placeholder="Bet amount"
              />
              <select
                value={betSide}
                onChange={(e) => setBetSide(e.target.value as "A" | "B")}
                className="border rounded px-2 py-1 mr-2"
              >
                <option value="A">Side A</option>
                <option value="B">Side B</option>
              </select>
              <button
                onClick={handleBet}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Place Bet
              </button>
            </div>
          </div>
        </div>
      )}

    </div>

    <div className="max-w-4xl mx-auto p-4">
      <div className="relative">
        <div className="flex space-x-4 border-b">
          {tabs.map((tab, index) => (
            <button
              key={tab}
              ref={(el) => (tabsRef.current[index] = el)}
              className={`py-2 px-4 text-sm font-medium transition-colors duration-300 ${
                activeTab === index ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab(index)}
            >
              {tab}
            </button>
          ))}
        </div>
        <div
          className="absolute bottom-0 h-0.5 bg-blue-600 transition-all duration-300"
          style={indicatorStyle}
        />
      </div>
      <div className="mt-4 transition-all duration-300 ease-in-out">
        {renderTabContent()}
      </div>
    </div>
    
    </>
  );

};

export default GamePage;
