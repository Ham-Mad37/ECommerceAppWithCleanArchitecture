using ECommerce.Application.Common.Models;
using ECommerce.Domain.Entities.Products;
namespace ECommerce.Application.Common.Interfaces
{
    public interface IProductRepository
    {
        Task AddAsync(Product product, CancellationToken cancellationToken = default);
        Task<Product?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
        Task<IReadOnlyList<Product>> GetPagedAsync(
            ProductFilter filter,
            int pageNumber,
             int pageSize,
              CancellationToken cancellationToken = default);
        Task<int> GetCountAsync(ProductFilter filter,CancellationToken cancellationToken = default);

    }
}