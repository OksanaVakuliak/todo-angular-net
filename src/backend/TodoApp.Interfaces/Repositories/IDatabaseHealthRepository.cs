namespace TodoApp.Interfaces.Repositories;

public interface IDatabaseHealthRepository
{
    Task<bool> CanConnectAsync(CancellationToken cancellationToken);
}
