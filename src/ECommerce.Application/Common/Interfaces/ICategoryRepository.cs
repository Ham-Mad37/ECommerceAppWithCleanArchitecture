using ECommerce.Domain.Entities.Categories;

namespace ECommerce.Application.Common.Interfaces
{
    public interface ICategoryRepository
    {
        Task<Category> GetByIdAsync(int id, CancellationToken cancellationToken = default);
        Task<IReadOnlyCollection<Category>> GetAllAsync(CancellationToken cancellationToken = default);
        Task<bool> ExistsByNameAsync(string name, CancellationToken cancellationToken = default);
        Task AddAsync(Category category, CancellationToken cancellationToken = default);
    }
}