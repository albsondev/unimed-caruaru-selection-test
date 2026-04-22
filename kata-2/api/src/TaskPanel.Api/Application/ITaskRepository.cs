using TaskPanel.Api.Domain;

namespace TaskPanel.Api.Application;

public interface ITaskRepository
{
    Task<IReadOnlyCollection<TaskItem>> FindAllAsync(CancellationToken cancellationToken = default);

    Task<TaskItem?> FindByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task SaveAsync(TaskItem task, CancellationToken cancellationToken = default);

    Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
