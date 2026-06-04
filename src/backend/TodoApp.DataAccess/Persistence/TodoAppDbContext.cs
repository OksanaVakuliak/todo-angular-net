using Microsoft.EntityFrameworkCore;

namespace TodoApp.DataAccess.Persistence;

public class TodoAppDbContext(DbContextOptions<TodoAppDbContext> options) : DbContext(options)
{
}
