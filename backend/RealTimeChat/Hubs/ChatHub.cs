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
	private readonly IUserList _list;
	
	public ChatHub(IUserList list)
    {
		_list = list;
	}

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
			await Clients
				.All 
				.ReceiveMessage(user.Name/*connection.UserName*/, message);
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
			var clientList = context.RequestServices.GetService<IUserList>();
			if (clientList != null)
			{
				clientList.LatestPing(connectionId);
			}
		}, (Context.GetHttpContext(), Context.ConnectionId));
	}
}