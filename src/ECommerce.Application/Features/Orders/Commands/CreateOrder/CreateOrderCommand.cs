using ECommerce.Domain.Entities.Payments;
using MediatR;

namespace ECommerce.Application.Features.Orders.CreateOrder
{
    public sealed record CreateOrderCommand(
        int? AddressId = null,
         PaymentMethod? PaymentMethod = null) : IRequest<int>;
}