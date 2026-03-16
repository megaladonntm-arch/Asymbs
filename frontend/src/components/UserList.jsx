export default function UserList({ users, onlineUsers, search, setSearch }) {
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-[#1f1f1f]">
        <input
          placeholder="Search..."
          className="w-full bg-black/40 border border-[#1f1f1f] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent transition"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {users.map((u) => (
          <div key={u.username} className="flex items-center justify-between bg-card border border-[#1f1f1f] rounded-xl px-3 py-2">
            <span className="text-sm">{u.username}</span>
            <span className={`text-xs ${onlineUsers.includes(u.username) ? "text-accent" : "text-gray-500"}`}>
              {onlineUsers.includes(u.username) ? "online" : "offline"}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
