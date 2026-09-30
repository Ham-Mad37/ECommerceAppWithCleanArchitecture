using ECommerce.Domain.Entities.Customers;

namespace ECommerce.Application.Common.Interfaces
{
    public interface ICustomerRepository
    {
        Task<Customer?> GetByIdAsync(int id, CancellationToken cancellationToken = default);

        Task<IReadOnlyCollection<Customer>> GetAllAsync(CancellationToken cancellationToken = default);

        Task<bool> ExistByEmailAsync(string email, CancellationToken cancellationToken);

        Task AddAsync(Customer customer, CancellationToken cancellationToken = default);
    }
}