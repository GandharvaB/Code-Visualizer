export const sampleCodes: Record<string, string> = {
  python_bfs: `def bfs(graph, start):
    visited = set()
    queue = [start]
    
    while queue:
        node = queue.pop(0)
        
        if node not in visited:
            print(node)
            visited.add(node)
            
            for neighbor in graph[node]:
                if neighbor not in visited:
                    queue.append(neighbor)
                    
    return visited`,

  javascript_event: `async function fetchAndProcessData(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("HTTP error!");
    }
    const data = await response.json();
    
    if (data.isValid) {
      process(data);
    } else {
      console.warn("Invalid data");
    }
  } catch (err) {
    console.error("Fetch failed", err);
  } finally {
    cleanup();
  }
}`,

  typescript_auth: `export async function authenticate(req: Request): Promise<User | null> {
  const token = req.headers.get("Authorization");
  if (!token) {
    return null;
  }
  
  try {
    const decoded = verifyJWT(token, secret);
    const user = await db.user.findUnique({
      where: { id: decoded.userId } 
    });
    
    if (user && user.isActive) {
      return user;
    }
    return null;
  } catch (e) {
    throw new AuthError("Token validation failed");
  }
}`
};
