export function getConnectionName(connectionId) {
  try {
    const data = JSON.parse(process.env.NEXT_PUBLIC_CONNECTIONS || '{"connections":[]}');
    const connection = data.connections.find(conn => 
      Object.values(conn).some(value => value === connectionId)
    );
    return connection ? connection.name_connection : connectionId;
  } catch (error) {
    console.error('Error parsing connections:', error);
    return connectionId;
  }
}
