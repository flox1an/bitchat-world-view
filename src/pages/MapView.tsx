import LeafletMap from "../components/LeafletMap";

interface Chatroom {
  geohash: string;
  name: string;
  messageCount: number;
}

interface MapViewProps {
  chatrooms: Chatroom[];
  onChatroomSelect: (geohash: string) => void;
  onBackToChat: () => void;
}

export default function MapView({
  chatrooms,
  onChatroomSelect,
  onBackToChat,
}: MapViewProps) {
  return (
    <div className="min-h-screen bg-black text-gray-100">
      <header className="sticky top-0 z-10 bg-black/90 border-b border-white/10 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={onBackToChat}
              className="bg-gray-700 hover:bg-gray-600 text-gray-200 px-2 sm:px-4 py-2 rounded transition-colors text-sm sm:text-base"
            >
              ← Back
            </button>
            <h1 className="text-lg sm:text-xl font-bold text-green-300">
              World Map View
            </h1>
          </div>
          <div className="text-gray-400 text-sm sm:text-base">
            {chatrooms.length} active chatrooms
          </div>
        </div>
      </header>

      <main className="p-2 sm:p-6">
        <div className="mb-6">
          <p className="text-gray-300 mb-4">
            Explore chatrooms by geographic location. Each circle represents a
            chatroom where kind 20000 events have been posted. Click on any
            location to filter the chat by that area.
          </p>
        </div>

        <LeafletMap chatrooms={chatrooms} onChatroomClick={onChatroomSelect} />

        <div className="mt-6 sm:mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-gray-900 rounded-lg p-3 sm:p-4">
            <h3 className="text-base sm:text-lg font-bold text-green-300 mb-2">
              About Geohashes
            </h3>
            <p className="text-gray-300 text-xs sm:text-sm">
              Geohashes encode geographic coordinates into short strings. Each
              character adds precision to the location. Chatrooms are created
              based on the geohash precision in kind 20000 events.
            </p>
          </div>

          <div className="bg-gray-900 rounded-lg p-3 sm:p-4">
            <h3 className="text-base sm:text-lg font-bold text-green-300 mb-2">
              Map Legend
            </h3>
            <div className="text-xs sm:text-sm text-gray-300 space-y-1">
              <p>
                • <span className="text-green-400">Green circles</span> = Active
                chatrooms
              </p>
              <p>
                • <span className="text-green-400">Larger circles</span> = More
                messages
              </p>
              <p>
                • <span className="text-green-400">Numbers</span> = Message
                count
              </p>
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-3 sm:p-4">
            <h3 className="text-base sm:text-lg font-bold text-green-300 mb-2">
              Navigation
            </h3>
            <p className="text-gray-300 text-xs sm:text-sm">
              Click any chatroom on the map to filter messages by that location.
              Use the "Back to Chat" button to return to the main chat
              interface.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
