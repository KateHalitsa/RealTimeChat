using RealTimeChat.Hubs;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddStackExchangeRedisCache(options =>
{
    var connection = builder.Configuration.GetConnectionString("Redis");
    options.Configuration = connection;
});

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:3000")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});
builder.Services.AddSingleton<IUserList, UserList>();
builder.Services.AddSignalR(hubOptions =>
{
	hubOptions.EnableDetailedErrors = true;
	hubOptions.KeepAliveInterval = TimeSpan.FromMinutes(10);
});
builder.Services.AddStackExchangeRedisCache(option =>
{
	option.Configuration = builder.Configuration["redis"];
});

var app = builder.Build();

app.MapHub<ChatHub>("/chat");

app.UseCors();

app.Run();