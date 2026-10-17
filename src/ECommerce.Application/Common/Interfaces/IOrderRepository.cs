using ECommerce.Application.Common.Models;
using ECommerce.Application.Common.Modles;
using ECommerce.Application.Features.Orders.DTOs;
using ECommerce.Domain.Entities.Orders;

namespace ECommerce.Application.Common.Interfaces;

public interface IOrderRepository
{
    Task AddAsync(
        Order order,
        CancellationToken cancellationToken = default);

    // Customer
    Task<Order?> GetByIdAsync(
        int orderId,
        CancellationToken cancellationToken = default);

    Task<Order?> GetByCustomerIdAsync(
        int customerId,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Order>> GetAllByCustomerIdAsync(
        int customerId,
        CancellationToken cancellationToken = default);

    Task<Order?> GetByIdForUpdateAsync(
        int orderId,
        int customerId,
        CancellationToken cancellationToken = default);

    // Admin
    Task<Order?> GetByIdForAdminAsync(
        int orderId,
        CancellationToken cancellationToken = default);

    Task<PagedResult<OrderListDto>> GetAdminOrdersAsync(
        int page,
        int pageSize,
        string? status,
        int? customerId,
        DateTime? from,
        DateTime? to,
        CancellationToken cancellationToken = default);
}