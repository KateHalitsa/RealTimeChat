namespace RealTimeChat.Hubs
{
	public class User
	{
		public int Id { get; set; }
		public String Name { get; set; }
		public String ConnectionId { get; set; }
		public DateTime EntranceTime { get; }
		public DateTime LatestPingTime { get; set; }
		public DateTime ExitTime { get; internal set; }

		public User(string connectionId, string name)
		{
			ConnectionId = connectionId;
			EntranceTime = DateTime.Now;
			Name = name;
		}

	}
}
