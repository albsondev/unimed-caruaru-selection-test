using TaskPanel.Api.Domain;
using DomainTaskStatus = TaskPanel.Api.Domain.TaskStatus;

namespace TaskPanel.Api.Application;

public sealed class TaskService
{
    private readonly ITaskRepository _repository;

    public TaskService(ITaskRepository repository)
    {
        _repository = repository;
    }

    public async Task<IReadOnlyCollection<TaskItem>> ListAsync(
        DomainTaskStatus? status,
        CancellationToken cancellationToken = default)
    {
        var tasks = await _repository.FindAllAsync(cancellationToken);

        return tasks
            .Where(task => status is null || task.Status == status)
            .OrderByDescending(task => task.UpdatedAt)
            .ToArray();
    }

    public async Task<TaskItem> CreateAsync(
        string? title,
        CancellationToken cancellationToken = default)
    {
        var now = DateTimeOffset.UtcNow;
        var normalizedTitle = NormalizeTitle(title);

        var task = new TaskItem(
            Guid.NewGuid(),
            normalizedTitle,
            DomainTaskStatus.Pending,
            now,
            now);

        await _repository.SaveAsync(task, cancellationToken);

        return task;
    }

    public async Task<TaskItem> UpdateAsync(
        Guid id,
        string? title,
        string? status,
        CancellationToken cancellationToken = default)
    {
        if (title is null && status is null)
        {
            throw new AppException("At least one field must be provided for update.", StatusCodes.Status400BadRequest);
        }

        var currentTask = await _repository.FindByIdAsync(id, cancellationToken);

        if (currentTask is null)
        {
            throw new AppException("Task not found.", StatusCodes.Status404NotFound);
        }

        var nextTitle = title is null
            ? currentTask.Title
            : NormalizeTitle(title);
        var nextStatus = status is null
            ? currentTask.Status
            : TaskStatusParser.Parse(status);

        var updatedTask = currentTask with
        {
            Title = nextTitle,
            Status = nextStatus,
            UpdatedAt = DateTimeOffset.UtcNow
        };

        await _repository.SaveAsync(updatedTask, cancellationToken);

        return updatedTask;
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var removed = await _repository.DeleteAsync(id, cancellationToken);

        if (!removed)
        {
            throw new AppException("Task not found.", StatusCodes.Status404NotFound);
        }
    }

    private static string NormalizeTitle(string? title)
    {
        var normalizedTitle = string.Join(" ", (title ?? string.Empty)
            .Split(' ', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries));

        if (normalizedTitle.Length < 3)
        {
            throw new AppException("Title must have at least 3 characters.", StatusCodes.Status400BadRequest);
        }

        if (normalizedTitle.Length > 140)
        {
            throw new AppException("Title must have at most 140 characters.", StatusCodes.Status400BadRequest);
        }

        return normalizedTitle;
    }
}
