using TaskPanel.Api.Application;
using TaskPanel.Api.Domain;
using DomainTaskStatus = TaskPanel.Api.Domain.TaskStatus;

namespace TaskPanel.Api.Tests;

public sealed class TaskServiceTests
{
    [Fact]
    public async Task CreateAsync_ShouldNormalizeTitle_AndDefaultStatusToPending()
    {
        var repository = new InMemoryTaskRepository();
        var service = new TaskService(repository);

        var createdTask = await service.CreateAsync("  Revisar   entrega final  ");

        Assert.Equal("Revisar entrega final", createdTask.Title);
        Assert.Equal(DomainTaskStatus.Pending, createdTask.Status);
    }

    [Fact]
    public async Task UpdateAsync_ShouldApplyStatusChange_WhenTaskExists()
    {
        var repository = new InMemoryTaskRepository();
        var service = new TaskService(repository);
        var createdTask = await service.CreateAsync("Publicar projeto");

        var updatedTask = await service.UpdateAsync(createdTask.Id, null, "completed");

        Assert.Equal(DomainTaskStatus.Completed, updatedTask.Status);
        Assert.True(updatedTask.UpdatedAt >= createdTask.UpdatedAt);
    }

    [Fact]
    public async Task UpdateAsync_ShouldThrow_WhenNoFieldsAreProvided()
    {
        var repository = new InMemoryTaskRepository();
        var service = new TaskService(repository);
        var createdTask = await service.CreateAsync("Preparar backlog");

        var exception = await Assert.ThrowsAsync<AppException>(
            () => service.UpdateAsync(createdTask.Id, null, null));

        Assert.Equal(400, exception.StatusCode);
    }

    [Fact]
    public async Task DeleteAsync_ShouldThrow_WhenTaskDoesNotExist()
    {
        var repository = new InMemoryTaskRepository();
        var service = new TaskService(repository);

        var exception = await Assert.ThrowsAsync<AppException>(
            () => service.DeleteAsync(Guid.NewGuid()));

        Assert.Equal(404, exception.StatusCode);
    }
}
