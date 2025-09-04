using Microsoft.AspNetCore.SignalR;

namespace RealTimeChat.Hubs
{
	public class HeartbeatMonitorService : IHostedService, IDisposable
	{
		private readonly IHubContext<ChatHub> _hubContext;
		private Timer? _timer;

		public HeartbeatMonitorService(IHubContext<ChatHub> hubContext)
		{
			_hubContext = hubContext;
		}

		public Task StartAsync(CancellationToken cancellationToken)
		{
			_timer = new Timer(async _ =>
			{
				await ChatHub.CheckDeadConnections(_hubContext);
			}, null, TimeSpan.Zero, TimeSpan.FromSeconds(10)); // Проверяем каждые 10 секунд

			return Task.CompletedTask;
		}

		public Task StopAsync(CancellationToken cancellationToken)
		{
			_timer?.Change(Timeout.Infinite, 0);
			return Task.CompletedTask;
		}

		public void Dispose()
		{
			_timer?.Dispose();
		}
	}

}
