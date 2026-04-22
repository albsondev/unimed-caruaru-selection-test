using System.Text.Json;
using System.Text.Json.Serialization;
using TaskPanel.Api.Application;
using TaskPanel.Api.Contracts;
using TaskPanel.Api.Domain;
using TaskPanel.Api.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    options.SerializerOptions.Converters.Add(new JsonStringEnumConverter(JsonNamingPolicy.CamelCase));
});

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var storageFilePath = Path.GetFullPath(
    Path.Combine(builder.Environment.ContentRootPath, "..", "..", "data", "tasks.json"));

builder.Services.AddSingleton<ITaskRepository>(_ => new FileTaskRepository(storageFilePath));
builder.Services.AddSingleton<TaskService>();

var app = builder.Build();

app.UseCors();

app.Use(async (context, next) =>
{
    try
    {
        await next();
    }
    catch (AppException exception)
    {
        context.Response.StatusCode = exception.StatusCode;
        await context.Response.WriteAsJsonAsync(new ErrorEnvelope(exception.Message));
    }
    catch
    {
        context.Response.StatusCode = StatusCodes.Status500InternalServerError;
        await context.Response.WriteAsJsonAsync(new ErrorEnvelope("Ocorreu um erro interno no servidor."));
    }
});

app.MapGet("/health", () => Results.Ok(new
{
    status = "ok",
    timestamp = DateTimeOffset.UtcNow
}));

app.MapGet("/tasks", async (string? status, TaskService taskService) =>
{
    var parsedStatus = TaskStatusParser.ParseOptional(status);
    var tasks = await taskService.ListAsync(parsedStatus);
    return Results.Ok(new DataEnvelope<IEnumerable<TaskItem>>(tasks));
});

app.MapPost("/tasks", async (CreateTaskRequest request, TaskService taskService) =>
{
    var createdTask = await taskService.CreateAsync(request.Title);
    return Results.Created($"/tasks/{createdTask.Id}", new DataEnvelope<TaskItem>(createdTask));
});

app.MapPatch("/tasks/{id:guid}", async (Guid id, UpdateTaskRequest request, TaskService taskService) =>
{
    var updatedTask = await taskService.UpdateAsync(id, request.Title, request.Status);
    return Results.Ok(new DataEnvelope<TaskItem>(updatedTask));
});

app.MapDelete("/tasks/{id:guid}", async (Guid id, TaskService taskService) =>
{
    await taskService.DeleteAsync(id);
    return Results.NoContent();
});

app.Run();

public partial class Program
{
}
