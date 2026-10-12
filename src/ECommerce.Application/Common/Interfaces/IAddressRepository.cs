using ECommerce.Domain.Entities.Addresses;

namespace ECommerce.Application.Common.Interfaces
{
    public interface IAddressRepository
    {
        Task AddAsync(Address address, CancellationToken cancellationToken = default);
        Task<IReadOnlyList<Address>> GetByCustomerIdAsync(int customerId, CancellationToken cancellationToken = default);
        Task<Address?> GetByIdAsync(int id, int customerId, CancellationToken cancellationToken = default);
        void Remove(Address address);
    }
}