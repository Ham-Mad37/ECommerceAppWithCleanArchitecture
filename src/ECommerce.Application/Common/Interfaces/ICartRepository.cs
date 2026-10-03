using ECommerce.Domain.Entities.Cart;

namespace ECommerce.Application.Common.Interfaces;
public interface ICartRepository
{
    Task<Cart?> GetCartByCustomerIdAsync(int customerId, CancellationToken cancellationToken = default);
   Task AddAsync(Cart cart, CancellationToken cancellationToken = default);

}