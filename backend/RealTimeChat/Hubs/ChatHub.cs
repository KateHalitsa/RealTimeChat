using System.Text.Json;
using Microsoft.AspNetCore.Connections.Features;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Caching.Distributed;
using RealTimeChat.Models;

namespace RealTimeChat.Hubs;

public interface IChatClient
{
    public Task ReceiveMessage(string userName, string message);
	public Task ReceiveUsers(List<User> users);	
}


public class ChatHub : Hub<IChatClient>
{
	private static readonly IUserList _list = new UserList();
	private static DateTime _userListLastNotificationDate  = DateTime.Now;
	
	/*public ChatHub(IUserList list)
    {
		_list = list;
	}*/

	public async Task SendUserList()
	{
		await Clients.All.ReceiveUsers(_list.GetUsers().ToList());
	}
	public override Task OnConnectedAsync()
	{
		return Task.CompletedTask;
	}
	public async Task JoinChat(UserConnection connection)
	{
		var user=_list.GetUserByName(connection.UserName);
		if (user != null)
		{
			//если юзер закрыт то удалим его из списка по conectionId
			if (user.ExitTime != default(DateTime))
			{
				_list.DeleteUserFromList(user.ConnectionId);
			}
			else // если юзер не закрыт
			{
				if (Context.ConnectionId != user.ConnectionId)
				{
					// Разрываем соединение.
					Context.Abort();

					// Выбрасываем исключение, если нужно
					throw new HubException($"Active user '{connection.UserName}' был принудительно отключен.");
				}
				else {
					return; // наш юзер с нашим ConnectionId: дополнительные действия не нужны
				}
			}

		}

		_list.CreateUser(Context.ConnectionId, connection.UserName);
		Heartbeat();

        var stringConnection = JsonSerializer.Serialize(connection);

        await Clients
			.All 
            .ReceiveMessage("Admin", $"{connection.UserName} присоединился к чату");

		await SendUserList();

	}

    public async Task SendMessage(string message)
    {

		var user = _list.GetUser(Context.ConnectionId);
		if (user != null)
		{
			await Clients.All.ReceiveMessage(user.Name, message);
		}
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
		_list.RemoveUser(Context.ConnectionId);

		var user = _list.GetUser(Context.ConnectionId);
		if (user != null)
		{
			await Clients
				.All
				.ReceiveMessage("Admin", $"{user.Name} покинул чат");
		}

		await SendUserList();

		await base.OnDisconnectedAsync(exception);
    }

	private void Heartbeat()
	{
		var heartbeat = Context.Features.Get<IConnectionHeartbeatFeature>();
		if (heartbeat == null) return;

		heartbeat.OnHeartbeat(state =>
		{
			var (context, connectionId) = ((HttpContext, string))state;
			var clientList = _list;//context.RequestServices.GetService<IUserList>();
			if (clientList != null)
			{
				clientList.LatestPing(connectionId);
				Console.WriteLine($"ConnectionId = {connectionId},{DateTime.Now:dd.MM.yyyy HH:mm:ss}");
			}
		}, (Context.GetHttpContext(), Context.ConnectionId));
	}

	public static async Task CheckDeadConnections(IHubContext<ChatHub> hubContext)
	{
		var now = DateTime.Now;

		foreach (var user in _list.GetUsers())
		{
			var connectionId = user.ConnectionId;
			var lastHeartbeat = user.LatestPingTime;

			// Если прошло больше 30 секунд с последнего heartbeat — отключаем клиента
			if ((user.ExitTime == default(DateTime)) && ((now - lastHeartbeat).TotalSeconds > 30))
			{
				// Завершаем соединение
				await hubContext.Clients.Client(connectionId).SendAsync("ConnectionTimeout", "Вы были отключены из-за неактивности.");

				// Здесь можно прервать соединение с сервера (требует рефлексии или кастомного решения)
				// Например, если у вас есть доступ к IHubContext, можно вызвать Abort через Middleware или др.

				// Помечаем удаленным в списка и логируем
				_list.RemoveUser(connectionId);
				Console.WriteLine($"Connection {connectionId} отключен из-за отсутствия heartbeat.");
			}

			if ((now - lastHeartbeat).TotalMinutes > 10) {
				_list.DeleteUserFromList(connectionId);
			}
		}

		if ((now - _userListLastNotificationDate).TotalSeconds > 60) 
		{
			await hubContext.Clients.All.SendAsync("ReceiveUsers", _list.GetUsers().ToList());
			_userListLastNotificationDate = DateTime.Now;
		}
			
	}
}