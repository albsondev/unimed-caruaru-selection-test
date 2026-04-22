namespace TaskPanel.Api.Contracts;

public sealed record ErrorEnvelope(ErrorDetails Error)
{
    public ErrorEnvelope(string message)
        : this(new ErrorDetails(message))
    {
    }
}

public sealed record ErrorDetails(string Message);
