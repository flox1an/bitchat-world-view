import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { EventStore } from "applesauce-core";
import { EventStoreProvider } from "applesauce-react/providers";
import App from './App.tsx'

// Central event store singleton
const eventStore = new EventStore();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <EventStoreProvider eventStore={eventStore}>
      <App />
    </EventStoreProvider>
  </StrictMode>,
)
