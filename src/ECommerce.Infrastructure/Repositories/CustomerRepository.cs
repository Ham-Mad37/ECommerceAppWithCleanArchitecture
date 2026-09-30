using ECommerce.Application.Common.Interfaces;
using ECommerce.Domain.Entities.Customers;
using ECommerce.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Infrastructure.Repositories
{
    public sealed class CustomerRepository : ICustomerRepository
    {
        private readonly AppDbContext _context;
        public CustomerRepository(AppDbContext context)
        {
            _context = context;
        }
        public async Task AddAsync(Customer customer, CancellationToken cancellationToken = default)
        {
            await _context.Customers.AddAsync(customer, cancellationToken);
        }

        public async Task<bool> ExistByEmailAsync(string email, CancellationToken cancellationToken)
        {
            return await _context.Customers.AnyAsync(x => x.Email == email,cancellationToken);
        }

        public async Task<IReadOnlyCollection<Customer>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            return await _context.Customers.AsNoTracking()
            .OrderBy(x => x.LastName)
            .ThenBy(x => x.FirstName)
            .ToListAsync(cancellationToken);
        }

        public async Task<Customer?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            return await _context.Customers.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        }
    }
}