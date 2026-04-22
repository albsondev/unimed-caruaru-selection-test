using System.Text.Json;
using System.Text.Json.Serialization;
using TaskPanel.Api.Application;
using TaskPanel.Api.Domain;

namespace TaskPanel.Api.Infrastructure;

public sealed class FileTaskRepository : ITaskRepository
{
    private readonly SemaphoreSlim _lock = new(1, 1);
    private readonly string _storageFilePath;
    private static readonly JsonSerializerOptions SerializerOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        WriteIndented = true,
        Converters =
        {
            new JsonStringEnumConverter(JsonNamingPolicy.CamelCase)
        }
    };

    public FileTaskRepository(string storageFilePath)
    {
        _storageFilePath = storageFilePath;
    }

    public async Task<IReadOnlyCollection<TaskItem>> FindAllAsync(CancellationToken cancellationToken = default)
    {
        return await ReadTasksAsync(cancellationToken);
    }

    public async Task<TaskItem?> FindByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var tasks = await ReadTasksAsync(cancellationToken);
        return tasks.FirstOrDefault(task => task.Id == id);
    }

    public async Task SaveAsync(TaskItem task, CancellationToken cancellationToken = default)
    {
        await _lock.WaitAsync(cancellationToken);

        try
        {
            var tasks = (await ReadTasksAsync(cancellationToken)).ToList();
            var existingIndex = tasks.FindIndex(currentTask => currentTask.Id == task.Id);

            if (existingIndex >= 0)
            {
                tasks[existingIndex] = task;
            }
            else
            {
                tasks.Add(task);
            }

            await WriteTasksAsync(tasks, cancellationToken);
        }
        finally
        {
            _lock.Release();
        }
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        await _lock.WaitAsync(cancellationToken);

        try
        {
            var tasks = (await ReadTasksAsync(cancellationToken)).ToList();
            var removed = tasks.RemoveAll(task => task.Id == id) > 0;

            if (removed)
            {
                await WriteTasksAsync(tasks, cancellationToken);
            }

            return removed;
        }
        finally
        {
            _lock.Release();
        }
    }

    private async Task<IReadOnlyCollection<TaskItem>> ReadTasksAsync(CancellationToken cancellationToken)
    {
        await EnsureStorageFileExistsAsync(cancellationToken);

        await using var stream = File.Open(_storageFilePath, FileMode.Open, FileAccess.Read, FileShare.ReadWrite);
        var tasks = await JsonSerializer.DeserializeAsync<List<TaskItem>>(stream, SerializerOptions, cancellationToken);
        return tasks ?? [];
    }

    private async Task WriteTasksAsync(IReadOnlyCollection<TaskItem> tasks, CancellationToken cancellationToken)
    {
        await EnsureStorageFileExistsAsync(cancellationToken);

        var tempFilePath = $"{_storageFilePath}.tmp";
        await File.WriteAllTextAsync(
            tempFilePath,
            JsonSerializer.Serialize(tasks, SerializerOptions),
            cancellationToken);

        File.Move(tempFilePath, _storageFilePath, true);
    }

    private async Task EnsureStorageFileExistsAsync(CancellationToken cancellationToken)
    {
        var directory = Path.GetDirectoryName(_storageFilePath)
            ?? throw new AppException("Invalid storage path.", StatusCodes.Status500InternalServerError);

        Directory.CreateDirectory(directory);

        if (!File.Exists(_storageFilePath))
        {
            await File.WriteAllTextAsync(_storageFilePath, "[]", cancellationToken);
        }
    }
}
