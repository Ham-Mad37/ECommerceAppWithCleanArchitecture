using ECommerce.Application;
using ECommerce.Application.Common.Interfaces;
using ECommerce.Domain.Entities.Products;
using ECommerce.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
namespace ECommerce.Infrastructure.Repositories
{
    public class ProductRepositories : IProductRepository
    {
        private readonly AppDbContext _context;
        public ProductRepositories(AppDbContext context)
        {
            _context = context;
        }
        public async Task AddAsync(Product product, CancellationToken cancellationToken = default)
        {
            await _context.Products.AddAsync(product, cancellationToken);
        }

        public async Task<Product?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            var product = await _context.Products.FirstOrDefaultAsync(x => x.Id == id,cancellationToken);
            return product;
        }
    }
}