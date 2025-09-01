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
    private readonly IDistributedCache _cache;
	private readonly IUserList _list;

	public ChatHub(IDistributedCache cache,IUserList list)
    {
        _cache = cache;
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
		/*var user = _list.GetUser(Context.ConnectionId);
		if (user != null)
		{
			user.Name = connection.UserName;
		}*/

		_list.CreateUser(Context.ConnectionId, connection.UserName);
		Heartbeat();

		await Groups.AddToGroupAsync(Context.ConnectionId, connection.ChatRoom);

        var stringConnection = JsonSerializer.Serialize(connection);

        await _cache.SetStringAsync(Context.ConnectionId, stringConnection);

        await Clients
            .Group(connection.ChatRoom)
            .ReceiveMessage("Admin", $"{connection.UserName} присоединился к чату");
    }

    public async Task SendMessage(string message)
    {
        var stringConnection = await _cache.GetAsync(Context.ConnectionId);
		if (stringConnection != null)
		{
			var connection = JsonSerializer.Deserialize<UserConnection>(stringConnection);

			if (connection is not null)
			{
				await Clients
					.Group(connection.ChatRoom)
					.ReceiveMessage(connection.UserName, message);
			}
		}
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
		_list.RemoveUser(Context.ConnectionId);
		var stringConnection = await _cache.GetAsync(Context.ConnectionId);
		if (stringConnection != null)
		{
			var connection = JsonSerializer.Deserialize<UserConnection>(stringConnection);

			if (connection is not null)
			{
				await _cache.RemoveAsync(Context.ConnectionId);
				await Groups.RemoveFromGroupAsync(Context.ConnectionId, connection.ChatRoom);

				await Clients
					.Group(connection.ChatRoom)
					.ReceiveMessage("Admin", $"{connection.UserName} покинул чат");
			}
		}
	
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