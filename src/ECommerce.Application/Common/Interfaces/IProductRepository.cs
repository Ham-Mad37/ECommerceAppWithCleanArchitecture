using ECommerce.Domain.Entities.Products;
namespace ECommerce.Application.Common.Interfaces
{
    public interface IProductRepository
    {
        Task AddAsync(Product product, CancellationToken cancellationToken = default);
        Task<Product?> GetByIdAsync(int id,CancellationToken cancellationToken=default);
    }
}