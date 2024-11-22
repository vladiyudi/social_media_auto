export function getConnectionName(connectionId) {
  try {
    const connections = JSON.parse(process.env.NEXT_PUBLIC_CONNECTIONS || '[]');
    const connection = connections.find(conn => 
      Object.values(conn).some(value => value === connectionId)
    );
    return connection ? connection.name_connection : connectionId;
  } catch (error) {
    console.error('Error parsing connections:', error);
    return connectionId;
  }
}
