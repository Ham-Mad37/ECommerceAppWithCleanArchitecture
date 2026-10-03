using MediatR;

namespace ECommerce.Application.Features.Carts.Commands.UpdateCartItem
{
    public sealed record UpdateCartItemCommand(
        int ProductId,
        int Quantity
    ) : IRequest;
}