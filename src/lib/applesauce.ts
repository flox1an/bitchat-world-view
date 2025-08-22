import { EventStore } from "applesauce-core";
import { RelayPool } from "applesauce-relay";

export const eventStore = new EventStore();
export const pool = new RelayPool();

export const RELAYS = [
  "wss://relay.damus.io",
  "wss://nos.lol",
  "wss://relay.primal.net",
  "wss://offchain.pub",
  "wss://nostr21.com",
];

// Helper function to extract tag values from Nostr events
export function getTagValue(ev: any, tag: string): string | undefined {
  return ev?.tags?.find((t: any[]) => t?.[0] === tag)?.[1];
}
