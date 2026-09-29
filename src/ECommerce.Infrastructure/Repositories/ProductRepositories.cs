using ECommerce.Application;
using ECommerce.Application.Common.Interfaces;
using ECommerce.Application.Common.Models;
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

        public async Task<int> GetCountAsync( ProductFilter filter,CancellationToken cancellationToken = default)
        {
            IQueryable<Product> query = _context.Products;
            if (string.IsNullOrWhiteSpace(filter.Search))
            {
                query = query.Where(x => x.Name.Contains(filter.Search));
            }
            if (filter.CategoryId.HasValue)
            {
                query = query.Where(x => x.CategoryId == filter.CategoryId.Value);
            }
            if (filter.IsActive.HasValue)
            {
                query = query.Where(x => x.IsActive == filter.IsActive.Value);
            }
            return await query.CountAsync(cancellationToken);
        }

        public async Task<IReadOnlyList<Product>> GetPagedAsync(ProductFilter filter,int pageNumber, int pageSize, CancellationToken cancellationToken = default)
        {
            IQueryable<Product> query = _context.Products.AsNoTracking();
            //Search
            if (!string.IsNullOrWhiteSpace(filter.Search))
            {
                query = query.Where(x =>
                x.Name.Contains(filter.Search));
            }
            // Category
            if (filter.CategoryId.HasValue)
            {
                query = query.Where(x =>
                    x.CategoryId == filter.CategoryId.Value);
            }
            // Active
            if (filter.IsActive.HasValue)
            {
                query = query.Where(x =>
                    x.IsActive == filter.IsActive.Value);
            }
            // Sorting
            query = filter.SortBy.ToLowerInvariant() switch
            {
                "name" => filter.SortDirection.Equals(
                    "desc",
                    StringComparison.OrdinalIgnoreCase)
                        ? query.OrderByDescending(x => x.Name)
                        : query.OrderBy(x => x.Name),

                "price" => filter.SortDirection.Equals(
                    "desc",
                    StringComparison.OrdinalIgnoreCase)
                        ? query.OrderByDescending(x => x.Price)
                        : query.OrderBy(x => x.Price),

                "stockquantity" => filter.SortDirection.Equals(
                    "desc",
                    StringComparison.OrdinalIgnoreCase)
                        ? query.OrderByDescending(x => x.StockQuantity)
                        : query.OrderBy(x => x.StockQuantity),

                _ => filter.SortDirection.Equals(
                    "desc",
                    StringComparison.OrdinalIgnoreCase)
                        ? query.OrderByDescending(x => x.Id)
                        : query.OrderBy(x => x.Id)
            };

            return await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(cancellationToken);
        }
    }
}