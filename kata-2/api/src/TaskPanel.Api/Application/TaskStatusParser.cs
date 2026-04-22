using TaskPanel.Api.Domain;
using DomainTaskStatus = TaskPanel.Api.Domain.TaskStatus;

namespace TaskPanel.Api.Application;

public static class TaskStatusParser
{
    public static DomainTaskStatus? ParseOptional(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? null : Parse(value);
    }

    public static DomainTaskStatus Parse(string value)
    {
        return value.Trim().ToLowerInvariant() switch
        {
            "pending" => DomainTaskStatus.Pending,
            "completed" => DomainTaskStatus.Completed,
            _ => throw new AppException("O status deve ser 'pending' ou 'completed'.", StatusCodes.Status400BadRequest)
        };
    }
}
