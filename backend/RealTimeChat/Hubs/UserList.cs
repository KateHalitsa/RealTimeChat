using System.Collections.Concurrent;

namespace RealTimeChat.Hubs
{
	public interface IUserList
	{
		void CreateUser(string connectionId, string name);
		void RemoveUser(string connectionId);
		void LatestPing(string connectionId);

		User GetUser(string connectionId);
		User GetUserByName(string name);

		void DeleteUserFromList(string connectionId);
		IEnumerable<User> GetUsers();
	}
	public class UserList: IUserList
	{
		private ConcurrentDictionary<string, User> _users;
		public UserList()
		{
			_users = new ConcurrentDictionary<string, User>();
		}

		public void CreateUser(string connectionId, string name)
		{
			var user = new User(connectionId, name);

			/*_users.AddOrUpdate(connectionId, user, (key, existingUser) =>
			{
				existingUser.name = name;
				return existingUser;
			});*/
			if (!_users.TryAdd(connectionId, user))
				throw new Exception("Couldn't add new user to the list.");
		}
		public void RemoveUser(string connectionId)
		{
			// I didn't remove the client from the collection for see the exit date
			if (_users.TryGetValue(connectionId, out var user))
				user.ExitTime = DateTime.Now;
		}
		public void LatestPing(string connectionId)
		{
			if (_users.TryGetValue(connectionId, out var user))
				user.LatestPingTime = DateTime.Now;
		}

		public IEnumerable<User> GetUsers() => _users.Values;

		public User GetUser(string connectionId)
		{
			if (_users.TryGetValue(connectionId, out var user))
			{
				return user;
			}
			else
			{
				return null;
			}
		}
		public User GetUserByName(string name)
		{
			return _users.Values.FirstOrDefault(user => user.Name.Equals(name, StringComparison.OrdinalIgnoreCase));
		}

		public void DeleteUserFromList(string connectionId)
		{
			_users.TryRemove(connectionId, out _);
		}
	}
}
