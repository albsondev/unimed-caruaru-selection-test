namespace TaskPanel.Api.Domain;

public sealed record TaskItem(
    Guid Id,
    string Title,
    TaskStatus Status,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt);
