using ECommerce.Application.Common.Interfaces;
using ECommerce.Application.Common.Modles;
using ECommerce.Application.Features.Orders.DTOs;
using ECommerce.Domain.Entities.Orders;
using ECommerce.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Infrastructure.Repositories;

public sealed class OrderRepository : IOrderRepository
{
    private readonly AppDbContext _context;

    public OrderRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(
        Order order,
        CancellationToken cancellationToken = default)
    {
        await _context.Orders.AddAsync(
            order,
            cancellationToken);
    }

    public async Task<Order?> GetByIdAsync(
        int orderId,
        CancellationToken cancellationToken = default)
    {
        return await _context.Orders
            .Include(x => x.Items)
            .Include(x => x.Payment)
            .Include(x => x.ShippingAddress)
            .FirstOrDefaultAsync(
                x => x.Id == orderId,
                cancellationToken);
    }

    public async Task<Order?> GetByCustomerIdAsync(
        int customerId,
        CancellationToken cancellationToken = default)
    {
        return await _context.Orders
            .Include(x => x.Items)
            .Include(x => x.Payment)
            .Include(x => x.ShippingAddress)
            .Where(x => x.CustomerId == customerId)
            .OrderByDescending(x => x.CreatedAt)
            .FirstOrDefaultAsync(
                cancellationToken);
    }

    public async Task<IReadOnlyList<Order>> GetAllByCustomerIdAsync(
        int customerId,
        CancellationToken cancellationToken = default)
    {
        return await _context.Orders
            .AsNoTracking()
            .Include(x => x.Items)
            .Include(x => x.Payment)
            .Include(x => x.ShippingAddress)
            .Where(x => x.CustomerId == customerId)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(
                cancellationToken);
    }

    public async Task<Order?> GetByIdForUpdateAsync(
        int orderId,
        int customerId,
        CancellationToken cancellationToken = default)
    {
        return await _context.Orders
            .Include(x => x.Items)
            .Include(x => x.Payment)
            .Include(x => x.ShippingAddress)
            .FirstOrDefaultAsync(
                x =>
                    x.Id == orderId &&
                    x.CustomerId == customerId,
                cancellationToken);
    }

    public async Task<Order?> GetByIdForAdminAsync(
        int orderId,
        CancellationToken cancellationToken = default)
    {
        return await _context.Orders
            .Include(x => x.Items)
            .Include(x => x.Payment)
            .Include(x => x.ShippingAddress)
            .FirstOrDefaultAsync(
                x => x.Id == orderId,
                cancellationToken);
    }

    public async Task<IReadOnlyList<Order>> GetAllAsync(
        CancellationToken cancellationToken = default)
    {
        return await _context.Orders
            .AsNoTracking()
            .Include(x => x.Items)
            .Include(x => x.Payment)
            .Include(x => x.ShippingAddress)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(
                cancellationToken);
    }

    public async Task<IReadOnlyList<Order>> GetByStatusAsync(
        OrderStatus status,
        CancellationToken cancellationToken = default)
    {
        return await _context.Orders
            .AsNoTracking()
            .Include(x => x.Items)
            .Include(x => x.Payment)
            .Include(x => x.ShippingAddress)
            .Where(x => x.Status == status)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(
                cancellationToken);
    }

    public async Task<PagedResult<OrderListDto>> GetAdminOrdersAsync(int page, int pageSize, string status, int? customerId, DateTime? from, DateTime? to, CancellationToken cancellationToken = default)
    {
        var query = _context.Orders
               .AsNoTracking()
               .AsQueryable();
        // Filter by status
        if (!string.IsNullOrWhiteSpace(status))
        {
            if (Enum.TryParse<OrderStatus>(
                    status,
                    ignoreCase: true,
                    out var parsedStatus))
            {
                query = query.Where(x => x.Status == parsedStatus);
            }
        }
        // Filter by customer
        if (customerId.HasValue)
        {
            query = query.Where(x => x.CustomerId == customerId.Value);
        }
        // Filter by start date
        if (from.HasValue)
        {
            query = query.Where(x => x.CreatedAt >= from.Value);
        }
        // Filter by end date, including the entire specified day
        if (to.HasValue)
        {
            query = query.Where(x => x.CreatedAt < to.Value.Date.AddDays(1));
        }
        // Count filtered orders before pagination
        var totalCount = await query.CountAsync(cancellationToken);

        // Retrieve only the fields needed for the list
        var orders = await query
        .OrderByDescending(o => o.CreatedAt)
        .Skip((page - 1) * pageSize)
        .Take(pageSize)
        .Select(o => new
        {
            o.Id,
            o.CustomerId,
            CustomerName = o.Customer.FirstName + " " + o.Customer.LastName,
            CustomerEmail = o.Customer.Email,
            o.Status,
            o.Total,
            o.CreatedAt,
            o.Payment
        })
         .ToListAsync(cancellationToken);
        // Map the results to the DTO
        var items = orders
            .Select(o => new OrderListDto(
                o.Id,
                o.CustomerId,
                o.CustomerName,
                o.CustomerEmail,
                o.Status.ToString(),
                o.Total,
                o.CreatedAt,
                 o.Payment == null
                    ? null
                    : new PaymentListDto(
                        o.Payment.Method.ToString(),
                        o.Payment.Status.ToString(),
                        o.Payment.Amount,
                        o.Payment.Reference
                    )))
            .ToList();

        return new PagedResult<OrderListDto>(
            items,
            page,
            pageSize,
            totalCount
        );
    }

}
