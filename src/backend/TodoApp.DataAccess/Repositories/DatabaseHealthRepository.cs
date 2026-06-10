using TodoApp.DataAccess.Persistence;
using TodoApp.Interfaces.Repositories;

namespace TodoApp.DataAccess.Repositories;

public class DatabaseHealthRepository(TodoAppDbContext dbContext) : IDatabaseHealthRepository
{
    public Task<bool> CanConnectAsync(CancellationToken cancellationToken)
    {
        return dbContext.Database.CanConnectAsync(cancellationToken);
    }
}
