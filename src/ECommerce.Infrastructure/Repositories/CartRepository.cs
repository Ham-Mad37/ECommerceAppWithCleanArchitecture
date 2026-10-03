using ECommerce.Application.Common.Interfaces;
using ECommerce.Domain.Entities.Cart;
using ECommerce.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Infrastructure.Repositories;
public sealed class CartRepository : ICartRepository
{
    private readonly AppDbContext _context;
    public CartRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(Cart cart, CancellationToken cancellationToken = default)
    {
        await _context.Carts.AddAsync(cart, cancellationToken);
    }

    public async Task<Cart?> GetCartByCustomerIdAsync(int customerId, CancellationToken cancellationToken = default)
    {
        return await _context.Carts.Include(x=>x.Items)
        .ThenInclude(x=>x.Product)
        .FirstOrDefaultAsync(x => x.CustomerId == customerId, cancellationToken);
    }
}