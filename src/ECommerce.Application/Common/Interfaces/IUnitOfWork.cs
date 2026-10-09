namespace ECommerce.Application.Common.Interfaces
{
    public interface IUnitOfWork
    {
        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
              
        Task ExecuteInTransactionAsync(
            Func<Task> action,
            CancellationToken cancellationToken = default
        );
    }
}