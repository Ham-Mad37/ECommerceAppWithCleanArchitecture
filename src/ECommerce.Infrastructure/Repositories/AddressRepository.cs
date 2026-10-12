using ECommerce.Application.Common.Interfaces;
using ECommerce.Domain.Entities.Addresses;
using ECommerce.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Infrastructure.Repositories
{
    public sealed class AddressRepository : IAddressRepository
    {
        private readonly AppDbContext _context;
        public AddressRepository(AppDbContext context)
        {
            _context = context;
        }
        public async Task AddAsync(Address address, CancellationToken cancellationToken = default)
        {
            await _context.Addresses.AddAsync(address, cancellationToken);
        }

        public async Task<IReadOnlyList<Address>> GetByCustomerIdAsync(int customerId, CancellationToken cancellationToken = default)
        {
            return await _context.Addresses.Where(x => x.CustomerId == customerId)
            .OrderByDescending(x => x.IsDefault)
            .ThenByDescending(x => x.CreatedAt)
            .ToListAsync(cancellationToken);
        }

        public async Task<Address?> GetByIdAsync(int id, int customerId, CancellationToken cancellationToken = default)
        {
            return await _context.Addresses.FirstOrDefaultAsync(x => x.Id == id && x.CustomerId == customerId, cancellationToken);
        }

        public void Remove(Address address)
        {
            _context.Addresses.Remove(address);
        }

    }
}