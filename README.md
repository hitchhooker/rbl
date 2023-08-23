# Nodes dashboard

## Backend:

The backend's primary responsibility is to interface with the Proxmox API. It
retrieves the required data, refines it, and then broadcasts it as a WebSocket
stream. Here are some notable features and design considerations:

- **Secure Interactions**: Eupnea ensures secure transactions and data fetches
from the Proxmox API, maintaining the integrity and confidentiality of the
data.
- **Optimized Data Processing**: The refinement process filters out noise and
ensures that only the most pertinent information is passed along. This
optimizes bandwidth and ensures faster data transmissions.
- **WebSocket Broadcasting**: Leveraging WebSocket technology, Eupnea
guarantees real-time updates, which is crucial for monitoring systems.

## Frontend:

Once the backend broadcasts the data, the frontend takes charge. Built using
SolidJS and UnoCSS, the frontend is both lightweight and visually appealing:

- **SolidJS Integration**: By harnessing the power of SolidJS, the frontend
boasts reactive and efficient rendering. This ensures swift updates without
taxing system resources.
- **UnoCSS Styling**: UnoCSS, known for its utility-first approach, helps in
crafting an intuitive and clean user interface. The design ethos is simple:
make data visualization both beautiful and understandable.
- **WebSocket Endpoint**: The frontend fetches data in real-time from the
WebSocket endpoint, ensuring users always have access to the most recent data.
