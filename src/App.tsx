import React, { useRef, useState, useMemo } from "react";
import { onlyEvents } from "applesauce-relay/operators";
import { mapEventsToStore, mapEventsToTimeline } from "applesauce-core/observable";
import { useObservableMemo } from "applesauce-react/hooks";
import { map } from "rxjs";
import { eventStore, pool, RELAYS, getTagValue } from "./lib/applesauce";
import MapView from "./pages/MapView";

// Simple type for Nostr events
interface NostrEvent {
  id: string;
  pubkey: string;
  created_at: number;
  content: string;
  tags: string[][];
}

// Type for chatroom
interface Chatroom {
  geohash: string;
  name: string;
  messageCount: number;
}

function formatTime(unix: number) {
  try {
    return new Date(unix * 1000).toLocaleTimeString([], { 
      hour: "2-digit", 
      minute: "2-digit" 
    });
  } catch {
    return "--:--";
  }
}

function ChatLine({ ev, showGeohash }: { ev: NostrEvent; showGeohash: boolean }) {
  const time = formatTime(ev.created_at);
  const nickname = getTagValue(ev, "n") || `${ev.pubkey?.slice(0, 8)}…`;
  const geohash = getTagValue(ev, "g");
  const msg = ev.content ?? "";

  return (
    <div className="whitespace-pre-wrap break-all mb-1">
      <span className="text-gray-400">[{time}]</span>{" "}
      <span className="text-cyan-300">&lt;{nickname}&gt;</span>{" "}
      <span className="text-gray-100">{msg}</span>{" "}
      {showGeohash && geohash && <span className="text-fuchsia-300">#{geohash}</span>}
    </div>
  );
}

export default function App() {
  const [selectedChatroom, setSelectedChatroom] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'chat' | 'map'>('chat');

  // Create a streaming timeline observable for kind 20000 events
  const events = useObservableMemo(
    () =>
      pool
        .subscription(RELAYS, { kinds: [20000] })
        .pipe(
          // Only get events from relay (ignore EOSE)
          onlyEvents(),
          // deduplicate events using the event store
          mapEventsToStore(eventStore),
          // collect all events into a timeline
          mapEventsToTimeline(),
          // Reverse the order so newest messages are at the bottom
          map((t) => [...t].reverse()),
        ),
    [RELAYS],
  );

  // Extract unique chatrooms from events
  const chatrooms = useMemo(() => {
    if (!events) return [];
    
    const roomMap = new Map<string, Chatroom>();
    
    events.forEach((event: NostrEvent) => {
      const geohash = getTagValue(event, "g");
      if (geohash) {
        if (!roomMap.has(geohash)) {
          roomMap.set(geohash, {
            geohash,
            name: `#${geohash}`,
            messageCount: 0
          });
        }
        roomMap.get(geohash)!.messageCount++;
      }
    });
    
    return Array.from(roomMap.values()).sort((a, b) => b.messageCount - a.messageCount);
  }, [events]);

  // Filter events by selected chatroom
  const filteredEvents = useMemo(() => {
    if (!events || !selectedChatroom) return events;
    return events.filter((event: NostrEvent) => getTagValue(event, "g") === selectedChatroom);
  }, [events, selectedChatroom]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const count = filteredEvents?.length ?? 0;

  // Auto-scroll to bottom when new messages arrive, but only if user is near bottom
  React.useEffect(() => {
    const chatContainer = scrollRef.current;
    if (!chatContainer) return;

    const isNearBottom = () => {
      const threshold = 100; // pixels from bottom
      return chatContainer.scrollHeight - chatContainer.scrollTop - chatContainer.clientHeight < threshold;
    };

    // Only auto-scroll if user is near the bottom
    if (isNearBottom()) {
      chatContainer.scrollTo({ 
        top: chatContainer.scrollHeight, 
        behavior: "smooth" 
      });
    }
  }, [count]);

  // Show map view if currentView is 'map'
  if (currentView === 'map') {
    return (
      <MapView
        chatrooms={chatrooms}
        onChatroomSelect={(geohash) => {
          setSelectedChatroom(geohash);
          setCurrentView('chat');
        }}
        onBackToChat={() => {
          setSelectedChatroom(null); // Clear any chatroom filter when going back
          setCurrentView('chat');
        }}
      />
    );
  }

  // Show chat view
  return (
    <div className="min-h-screen bg-black text-sm text-gray-100 font-mono flex relative">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 border-r border-gray-700 flex flex-col h-screen">
        <div className="p-4 border-b border-gray-700 flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold text-green-300">Chatrooms</h2>
            <button
              onClick={() => setCurrentView('map')}
              className="bg-gray-700 hover:bg-gray-600 text-gray-200 px-2 py-1 rounded text-xs transition-colors"
              title="View Map"
            >
              🌍
            </button>
          </div>
          <p className="text-gray-400 text-xs">Click to filter by location</p>
        </div>
        
        <div className="flex-1 overflow-y-auto min-h-0">
          {chatrooms.length === 0 ? (
            <div className="p-4 text-gray-500 text-sm">No chatrooms found yet...</div>
          ) : (
            <div className="p-2">
              {chatrooms.map((room) => (
                <button
                  key={room.geohash}
                  onClick={() => setSelectedChatroom(selectedChatroom === room.geohash ? null : room.geohash)}
                  className={`w-full text-left p-3 rounded mb-2 transition-colors ${
                    selectedChatroom === room.geohash
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-800 text-gray-200 hover:bg-gray-700'
                  }`}
                >
                  <div className="font-mono text-sm">{room.name}</div>
                  <div className="text-xs text-gray-400">{room.messageCount} messages</div>
                </button>
              ))}
            </div>
          )}
        </div>
        
        {selectedChatroom && (
          <div className="p-4 border-t border-gray-700 flex-shrink-0">
            <button
              onClick={() => setSelectedChatroom(null)}
              className="w-full bg-gray-700 text-gray-200 p-2 rounded text-sm hover:bg-gray-600 transition-colors"
            >
              Show All Messages
            </button>
          </div>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-screen">
        <header className="sticky top-0 z-10 bg-black/90 border-b border-white/10 p-3 flex items-center gap-3 flex-shrink-0">
          <div className="font-bold text-green-300">
            {selectedChatroom ? `#${selectedChatroom}` : 'bitchat World View'}
          </div>
          <div className="text-gray-400">Relays: {RELAYS.length}</div>
          <div className="ml-auto flex items-center gap-3">
            <button
              onClick={() => setCurrentView('map')}
              className="bg-gray-700 hover:bg-gray-600 text-gray-200 px-3 py-1 rounded text-sm transition-colors"
            >
              🌍 Map View
            </button>
            <div className="text-gray-500">{count} msgs</div>
          </div>
        </header>

        <main 
          ref={scrollRef} 
          className="flex-1 p-4 pb-24 overflow-y-auto min-h-0"
        >
          {!filteredEvents || filteredEvents.length === 0 ? (
            <div className="text-gray-500">
              {selectedChatroom ? `No messages in #${selectedChatroom} yet...` : 'Waiting for ephemeral events…'}
            </div>
          ) : (
            filteredEvents.map((ev: NostrEvent) => (
              <ChatLine 
                key={ev.id + String(ev.created_at ?? "")} 
                ev={ev} 
                showGeohash={!selectedChatroom}
              />
            ))
          )}
        </main>
      </div>
    </div>
  );
}
