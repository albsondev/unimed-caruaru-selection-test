using TaskPanel.Api.Application;
using TaskPanel.Api.Domain;

namespace TaskPanel.Api.Tests;

internal sealed class InMemoryTaskRepository : ITaskRepository
{
    private readonly List<TaskItem> _tasks = [];

    public Task<IReadOnlyCollection<TaskItem>> FindAllAsync(CancellationToken cancellationToken = default)
    {
        return Task.FromResult<IReadOnlyCollection<TaskItem>>(_tasks.ToArray());
    }

    public Task<TaskItem?> FindByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return Task.FromResult(_tasks.FirstOrDefault(task => task.Id == id));
    }

    public Task SaveAsync(TaskItem task, CancellationToken cancellationToken = default)
    {
        var index = _tasks.FindIndex(currentTask => currentTask.Id == task.Id);

        if (index >= 0)
        {
            _tasks[index] = task;
        }
        else
        {
            _tasks.Add(task);
        }

        return Task.CompletedTask;
    }

    public Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return Task.FromResult(_tasks.RemoveAll(task => task.Id == id) > 0);
    }
}
