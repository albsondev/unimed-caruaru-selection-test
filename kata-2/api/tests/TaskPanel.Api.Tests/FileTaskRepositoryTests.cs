using System.Text.Json;
using System.Text.Json.Serialization;
using TaskPanel.Api.Domain;
using TaskPanel.Api.Infrastructure;
using DomainTaskStatus = TaskPanel.Api.Domain.TaskStatus;

namespace TaskPanel.Api.Tests;

public sealed class FileTaskRepositoryTests
{
    [Fact]
    public async Task SaveAsync_ShouldPersistTaskToJsonFile()
    {
        var temporaryDirectory = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString("N"));
        Directory.CreateDirectory(temporaryDirectory);
        var storageFilePath = Path.Combine(temporaryDirectory, "tasks.json");
        var repository = new FileTaskRepository(storageFilePath);

        var task = new TaskItem(
            Guid.NewGuid(),
            "Planejar observabilidade",
            DomainTaskStatus.Pending,
            DateTimeOffset.UtcNow,
            DateTimeOffset.UtcNow);

        await repository.SaveAsync(task);

        var json = await File.ReadAllTextAsync(storageFilePath);
        var savedTasks = JsonSerializer.Deserialize<List<TaskItem>>(json, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            Converters = { new JsonStringEnumConverter(JsonNamingPolicy.CamelCase) }
        });

        Assert.NotNull(savedTasks);
        Assert.Single(savedTasks!);
        Assert.Equal(task.Title, savedTasks[0].Title);
    }
}
