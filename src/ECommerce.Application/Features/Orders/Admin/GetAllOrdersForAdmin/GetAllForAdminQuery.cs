using ECommerce.Application.Common.Modles;
using ECommerce.Application.Features.Orders.DTOs;
using MediatR;

public sealed record GetAllForAdminQuery(
    int Page = 1,
    int PageSize = 20,
    string? Status = null,
    int? CustomerId = null,
    DateTime? From = null,
    DateTime?To = null
) : IRequest<PagedResult<OrderListDto>>;